// --- НАЧАЛО ОКОНЧАТЕЛЬНОЙ ВЕРСИИ main.js ---

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyAT4dDEIDUtzP60ibjahO06P75Q6h95ZN4",
    authDomain: "razrabotka-b61bc.firebaseapp.com",
    projectId: "razrabotka-b61bc",
    storageBucket: "razrabotka-b61bc.firebasestorage.app",
    messagingSenderId: "394402564794",
    appId: "1:394402564794:web:f610ffb03e655c600c5083"
};

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let siteData = { home: {}, services: [], portfolio: [], blog: [], contact: [] };
const mainContentEl = document.querySelector('main');
const defaultLang = 'en';

// --- ИНИЦИАЛИЗАЦИЯ FIREBASE ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ================================================================================= //
// ================== ЭТАП 1: НЕЗАМЕДЛИТЕЛЬНЫЙ ЗАПУСК ДЛЯ SEO ======================= //
// Этот блок кода выполняется сразу при загрузке скрипта. Его задача - как можно  //
// быстрее показать поисковому роботу контент и правильные мета-теги.             //
// ================================================================================= //

(async function renderInitialPage() {
    try {
        // Определяем, какую страницу запросили
        const repoName = window.location.hostname.includes('github.io') ? window.location.pathname.split('/')[1] || '' : '';
        const basePath = repoName ? `/${repoName}` : '';
        const path = window.location.pathname;
        const pathWithoutBase = path.startsWith(basePath) ? path.substring(basePath.length) || '/' : path;
        const detailPageRegex = /^\/(?:([a-z]{2})\/)?(services|portfolio|blog|contact)\/([a-zA-Z0-9-]+)\/?$/;
        const match = pathWithoutBase.match(detailPageRegex);

        let currentPageData;
        let pageType;

        // Загружаем данные ТОЛЬКО для текущей страницы
        if (match) {
            pageType = 'detail';
            const [, lang, collection, slug] = match;
            const currentLang = lang || defaultLang;
            const querySnapshot = await db.collection(collection).where('urlSlug', '==', slug).where('lang', '==', currentLang).limit(1).get();
            if (!querySnapshot.empty) {
                currentPageData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            }
        } else {
            pageType = 'home';
            const homeDoc = await db.collection('home').doc('content').get();
            if (homeDoc.exists) {
                currentPageData = homeDoc.data();
            }
        }

        if (currentPageData) {
            // Вставляем SEO-теги и базовый HTML
            renderSeoTags(currentPageData);
            if (pageType === 'home') renderHomePageContent(currentPageData);
            if (pageType === 'detail') renderDetailPageContent(currentPageData);
            applyCustomBackground(currentPageData);
        } else {
            // Если ничего не найдено, показываем 404
            render404Page();
        }

    } catch (error) {
        console.error("Initial page render failed:", error);
        render404Page({ error: true });
    } finally {
        // После того как робот увидел контент, "оживляем" страницу для пользователя
        hydratePageAndLoadRestOfData();
        document.getElementById('loader').classList.add('hidden');
    }
})();


// ================================================================================= //
// ============ ЭТАП 2: "ОЖИВЛЕНИЕ" СТРАНИЦЫ И ФОНОВАЯ ЗАГРУЗКА =================== //
// Эти функции запускаются после Этапа 1. Они добавляют интерактивность и          //
// загружают все остальные данные сайта в фоне для быстрой навигации.             //
// ================================================================================= //

function hydratePageAndLoadRestOfData() {
    console.log("Hydrating page and loading rest of the data in background...");

    // Прикрепляем все обработчики событий
    initStaticEventListeners();
    initMobileSliders();
    initFloatingObservers();
    initHomePageObservers();

    // Отрисовываем интерактивные элементы
    renderMenu();
    renderAdminPanel();

    // Запускаем фоновую загрузку всех данных для будущих переходов
    loadAllSiteData();
}

async function loadAllSiteData() {
    try {
        const collections = ['services', 'portfolio', 'blog', 'contact'];
        const dataPromises = [
            db.collection('home').doc('content').get(),
            ...collections.map(col => db.collection(col).get())
        ];
        const [homeDoc, ...snapshots] = await Promise.all(dataPromises);

        if (homeDoc.exists) siteData.home = processDocData(homeDoc.data());
        collections.forEach((col, index) => {
            siteData[col] = snapshots[index].docs.map(doc => ({ id: doc.id, ...processDocData(doc.data()) }));
        });
        console.log("All site data loaded and cached for navigation.", siteData);
        // После загрузки данных можно обновить админ-панель
        renderAdminPanel();
    } catch (error) {
        console.error("Error loading full site data:", error);
    }
}

// ================================================================================= //
// ========================= ФУНКЦИИ РЕНДЕРИНГА И УТИЛИТЫ ========================== //
// Здесь находятся все ваши вспомогательные функции, которые рисуют контент,       //
// управляют админкой и т.д. Большинство из них остаются без изменений.           //
// ================================================================================= //

// --- УЛУЧШЕННАЯ ФУНКЦИЯ РЕНДЕРИНГА SEO-ТЕГОВ ---
function renderSeoTags(data) {
    document.querySelectorAll('meta[name="description"], meta[property^="og:"], script[type="application/ld+json"], link[rel="canonical"]').forEach(el => el.remove());

    document.title = data.seoTitle || "Digital Craft";
    document.documentElement.lang = data.lang || 'en';

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
    const ogImage = data.ogImage || (Array.isArray(data.media) ? data.media.find(url => !/youtube|vimeo/.test(url)) : '') || '';
    if (ogImage) createMeta('property', 'og:image', ogImage);

    // САМОЕ ВАЖНОЕ ДЛЯ SEO: Правильная каноническая ссылка
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    // Используем текущий URL, так как мы больше не делаем редиректов
    canonical.href = window.location.href.split('?')[0].split('#')[0];
    document.head.appendChild(canonical);

    if (data.schemaJsonLd && typeof data.schemaJsonLd === 'object' && Object.keys(data.schemaJsonLd).length > 0) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data.schemaJsonLd);
        document.head.appendChild(script);
    }
}

function processDocData(data) {
    if (data && typeof data.schemaJsonLd === 'string' && data.schemaJsonLd.trim().startsWith('{')) {
        try { data.schemaJsonLd = JSON.parse(data.schemaJsonLd); } catch (e) { data.schemaJsonLd = {}; }
    }
    return data;
}

// --- Функции для рендеринга контента ---
function renderHomePageContent(data) {
    mainContentEl.innerHTML = `
        <section id="hero" class="hero"></section>
        <section id="services"></section>
        <section id="portfolio"></section>
        <section id="blog"></section>
        <section id="contact"></section>
    `;
    document.getElementById('site-footer').style.display = 'block';
    renderHero(data);
    // Остальные секции будут заполнены после полной загрузки данных
}

function renderDetailPageContent(data, collection) {
    const formattedContent = formatContentHtml(data.mainContent);
    mainContentEl.innerHTML = `
        <section>
            <div class="detail-page-header">
                <h1 class="fade-in-up" style="animation-delay: 0.5s;">${data.h1 || ''}</h1>
                ${data.price ? `<div class="detail-price fade-in-up" style="animation-delay: 0.7s;">${data.price}</div>` : ''}
            </div>
            <div class="detail-content">${formattedContent}</div>
        </section>`;
    document.getElementById('site-footer').style.display = 'none';
    // Связанные посты будут добавлены позже
}

function render404Page({ error = false } = {}) {
    document.title = "404 Not Found | Digital Craft";
    mainContentEl.innerHTML = `<section class="detail-page-header" style="text-align:center;">
        <h1>${error ? 'Error' : '404 - Not Found'}</h1>
        <p>${error ? 'Could not load page data. Please try again later.' : 'The page you were looking for does not exist.'}</p>
        <a href="/">Go back home</a>
    </section>`;
    document.getElementById('site-footer').style.display = 'block';
}

// --- НАВИГАЦИЯ ПОСЛЕ ПЕРВОЙ ЗАГРУЗКИ ---
async function navigateTo(path) {
    if (typeof ym === 'function') { ym(103413242, 'hit', path); }
    window.history.pushState({}, '', path);
    window.scrollTo(0, 0);

    const repoName = window.location.hostname.includes('github.io') ? window.location.pathname.split('/')[1] || '' : '';
    const basePath = repoName ? `/${repoName}` : '';
    const pathWithoutBase = path.startsWith(basePath) ? path.substring(basePath.length) || '/' : path;
    const detailPageRegex = /^\/(?:([a-z]{2})\/)?(services|portfolio|blog|contact)\/([a-zA-Z0-9-]+)\/?$/;
    const match = pathWithoutBase.match(detailPageRegex);

    if (match) {
        const [, lang, collection, slug] = match;
        const item = siteData[collection]?.find(d => d.urlSlug === slug && d.lang === (lang || defaultLang));
        if (item) {
            renderSeoTags(item);
            renderDetailPageContent(item, collection);
            renderRelatedPosts(collection, slug, lang || defaultLang); // Теперь можем отрисовать связанные посты
            applyCustomBackground(item);
        } else {
            render404Page();
        }
    } else {
        renderSeoTags(siteData.home);
        renderHomePageContent(siteData.home);
        // Теперь отрисовываем все секции, т.к. данные уже есть
        renderSection('services', 'Our Services', siteData.services);
        renderSection('portfolio', 'Our Work', siteData.portfolio);
        renderSection('blog', 'Latest Insights', siteData.blog);
        renderSection('contact', 'Get in Touch', siteData.contact);
        applyCustomBackground(siteData.home);
    }
    // Пере-инициализируем анимации и слайдеры для новой страницы
    initMobileSliders();
    initFloatingObservers();
    initHomePageObservers();
    initParagraphObservers();
}


//
// ================================================================================= //
// ==================== ВСЕ ОСТАЛЬНЫЕ ВАШИ ФУНКЦИИ БЕЗ ИЗМЕНЕНИЙ =================== //
// Просто скопируйте сюда все остальные функции из вашего старого main.js,          //
// такие как:                                                                      //
// - formatContentHtml                                                             //
// - renderRelatedPosts                                                            //
// - renderMenu                                                                    //
// - renderHero                                                                    //
// - renderSection                                                                 //
// - renderAdminPanel и все связанные с админкой функции                           //
// - handleAdminActions                                                            //
// - generateAdminItemFormHTML                                                     //
// - initMobileSliders                                                             //
// - все функции-обсерверы (createFloatingObserver, initParagraphObservers, etc.)   //
// - handleAdminLogin                                                              //
// - handleNavigation (немного изменить)                                           //
// - initStaticEventListeners                                                      //
// - applyCustomBackground                                                         //
// ================================================================================= //
//

// --- ПРИМЕР ИЗМЕНЕННОЙ ФУНКЦИИ НАВИГАЦИИ ---
function handleNavigation(e) {
    const link = e.target.closest('a');
    // Проверяем, что это внутренняя ссылка
    if (!link || link.target === '_blank' || link.protocol !== window.location.protocol || link.host !== window.location.host || e.metaKey || e.ctrlKey || e.shiftKey) {
        return;
    }
    e.preventDefault();

    // Если ссылка та же, ничего не делаем
    if (link.href === window.location.href) {
        return;
    }
    
    // Если это якорная ссылка на той же странице
    if (link.pathname === window.location.pathname && link.hash) {
         const element = document.querySelector(link.hash);
         if (element) {
             element.scrollIntoView({ behavior: 'smooth' });
         }
         return;
    }

    navigateTo(link.href);
};

// Вставьте сюда остальные ваши функции...
// ...
// ...
// ... (я не буду их дублировать, чтобы ответ не был слишком длинным,
//      просто скопируйте их из вашего оригинального файла)


// ПРИМЕЧАНИЕ: Я оставлю здесь заглушки для самых важных функций,
// чтобы вы не забыли их вставить. Замените их своим кодом.

function renderRelatedPosts(currentCollection, currentSlug, currentLang) { /* ВАШ КОД ЗДЕСЬ */ }
function renderMenu() { /* ВАШ КОД ЗДЕСЬ */ }
function renderHero(data) { const heroSection = document.getElementById('hero'); if (!heroSection || !data) return; heroSection.innerHTML = `<h1>${data.h1 || ''}</h1><div class="hero-subtitle-container">${formatContentHtml(data.subtitle)}</div>`; }
function renderSection(key, title, items) { /* ВАШ КОД ЗДЕСЬ */ }
function renderAdminPanel() { /* ВАШ КОД ЗДЕСЬ */ }
function handleAdminActions(e) { /* ВАШ КОД ЗДЕСЬ */ }
function initMobileSliders() { /* ВАШ КОД ЗДЕСЬ */ }
function initFloatingObservers() { /* ВАШ КОД ЗДЕСЬ */ }
function initParagraphObservers() { /* ВАШ КОД ЗДЕСЬ */ }
function initHomePageObservers() { /* ВАШ КОД ЗДЕСЬ */ }
function handleAdminLogin() { /* ВАШ КОД ЗДЕСЬ */ }
function initStaticEventListeners() { /* ВАШ КОД ЗДЕСЬ */ }
function applyCustomBackground(item = null) { /* ВАШ КОД ЗДЕСЯ */ }
function formatContentHtml(content) { /* ВАШ КОД ЗДЕСЬ */ }

// --- КОНЕЦ ОКОНЧАТЕЛЬНОЙ ВЕРСИИ main.js ---