// --- НАЧАЛО ФАЙЛА loader.js ---

async function loadAndRenderPage() {
    // --- КОНФИГУРАЦИЯ FIREBASE (дублируем, чтобы работало автономно) ---
    const firebaseConfig = {
      apiKey: "AIzaSyAT4dDEIDUtzP60ibjahO06P75Q6h95ZN4",
      authDomain: "razrabotka-b61bc.firebaseapp.com",
      projectId: "razrabotka-b61bc",
      storageBucket: "razrabotka-b61bc.firebasestorage.app",
      messagingSenderId: "394402564794",
      appId: "1:394402564794:web:f610ffb03e655c600c5083"
    };

    // Проверяем, инициализирован ли Firebase, чтобы избежать ошибок
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // --- ОПРЕДЕЛЕНИЕ ПУТИ ---
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = isGitHubPages ? window.location.pathname.split('/')[1] || '' : '';
    const basePath = isGitHubPages && repoName ? `/${repoName}` : '';
    
    let path = window.location.pathname;
    // Очищаем путь от базового пути репозитория для чистого анализа
    if (path.startsWith(basePath)) {
        path = path.substring(basePath.length);
    }

    const detailPageRegex = /^\/(?:([a-z]{2})\/)?(services|portfolio|blog|contact)\/([a-zA-Z0-9-]+)\/?$/;
    const match = path.match(detailPageRegex);

    let pageData;
    let pageType;

    // --- ЗАГРУЗКА ДАННЫХ ИЗ FIREBASE ---
    try {
        if (match) {
            // Это внутренняя страница
            pageType = 'detail';
            const [, lang, collection, slug] = match;
            const currentLang = lang || 'en';
            
            const querySnapshot = await db.collection(collection).where('urlSlug', '==', slug).where('lang', '==', currentLang).limit(1).get();
            
            if (!querySnapshot.empty) {
                pageData = querySnapshot.docs[0].data();
            } else {
                pageType = '404'; // Не нашли, показываем 404
            }
        } else {
            // Это главная страница
            pageType = 'home';
            const homeDoc = await db.collection('home').doc('content').get();
            if (homeDoc.exists) {
                pageData = homeDoc.data();
            }
        }
    } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        pageType = 'error';
    }

    // --- РЕНДЕРИНГ МЕТА-ТЕГОВ И КОНТЕНТА ---
    // Эта функция будет вызвана до загрузки основного main.js
    renderInitialContent(pageData, pageType);
}

function renderInitialContent(data, type) {
    const loaderEl = document.getElementById('loader');
    const mainEl = document.querySelector('main');
    const noscriptEl = document.querySelector('noscript');

    // Очищаем noscript, чтобы он не мешал
    if (noscriptEl) noscriptEl.innerHTML = '';

    if (type === '404' || type === 'error' || !data) {
        document.title = "404 Not Found | Digital Craft";
        mainEl.innerHTML = `<section><h1>404 - Page Not Found</h1><p>The page you were looking for could not be found.</p><a href="/">Go Home</a></section>`;
        if (loaderEl) loaderEl.classList.add('hidden');
        return;
    }

    // 1. Рендеринг SEO-тегов в <head>
    document.title = data.seoTitle || "Digital Craft";
    document.documentElement.lang = data.lang || 'en';
    
    // Удаляем старые теги, если они есть
    document.querySelectorAll('meta[name="description"], meta[property^="og:"], link[rel="canonical"]').forEach(el => el.remove());

    const createMeta = (attr, key, value) => {
        if (value) {
            const meta = document.createElement('meta');
            meta.setAttribute(attr, key);
            meta.content = value;
            document.head.appendChild(meta);
        }
    };
    
    createMeta('name', 'description', data.metaDescription);
    createMeta('property', 'og:title', data.ogTitle || data.seoTitle);
    createMeta('property', 'og:description', data.ogDescription || data.metaDescription);
    
    const ogImage = data.ogImage || (Array.isArray(data.media) ? data.media[0] : '');
    if (ogImage) createMeta('property', 'og:image', ogImage);

    // 2. Установка ПРАВИЛЬНОЙ канонической ссылки
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = window.location.href; // Текущий URL - и есть канонический
    document.head.appendChild(canonicalLink);

    // 3. Рендеринг минимального контента в <body>
    let initialHTML = '';
    if (type === 'home') {
        initialHTML = `
            <section id="hero" class="hero">
                <h1>${data.h1 || ''}</h1>
                <div class="hero-subtitle-container"><p>${data.subtitle || ''}</p></div>
            </section>
            <section id="services"></section>
            <section id="portfolio"></section>
            <section id="blog"></section>
            <section id="contact"></section>
        `;
    } else if (type === 'detail') {
        // Простой рендер основного контента для скорости
        const contentHTML = (data.mainContent || '').replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
        initialHTML = `
             <section>
                <div class="detail-page-header"><h1>${data.h1 || ''}</h1></div>
                <div class="detail-content"><p>${contentHTML}</p></div>
            </section>
        `;
    }
    mainEl.innerHTML = initialHTML;

    // Запускаем основной скрипт приложения, когда минимальный контент готов
    const mainScript = document.createElement('script');
    mainScript.type = 'module';
    mainScript.src = 'main.js'; // Убедитесь, что путь правильный
    document.body.appendChild(mainScript);
    
    const metrikaScript = document.createElement('script');
    metrikaScript.src = 'metrika.js';
    metrikaScript.defer = true;
    document.body.appendChild(metrikaScript);
}


// Запускаем весь процесс
loadAndRenderPage();


// --- КОНЕЦ ФАЙЛА loader.js ---