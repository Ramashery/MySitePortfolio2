// --- НАЧАЛО ОКОНЧАТЕЛЬНОЙ ВЕРСИИ main.js (v5.0 - СТАБИЛЬНАЯ АРХИТЕКТУРА) ---

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
let siteData = null; // Данные будут загружены один раз
const mainContentEl = document.querySelector('main');
const defaultLang = 'en';
const { basePath } = getPathDetails();

// --- ИНИЦИАЛИЗАЦИЯ FIREBASE ---
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase initialization failed:", e);
}
const db = firebase.firestore();
const auth = firebase.auth();

// =================================================================== //
// ==================== ТОЧКА ВХОДА ПРИЛОЖЕНИЯ ======================= //
// =================================================================== //

async function main() {
    console.log("Application starting...");
    try {
        // ШАГ 1: Загружаем все данные сайта один раз
        siteData = await fetchAllSiteData();
        console.log("All site data has been fetched successfully.");

        // ШАГ 2: Устанавливаем все "вечные" обработчики событий
        initEventListeners();

        // ШАГ 3: Запускаем роутер для отрисовки первой страницы
        router();
        
    } catch (error) {
        console.error("CRITICAL: Failed to fetch initial data. Application cannot start.", error);
        render404Page({ error: true });
    } finally {
        // Гарантированно скрываем прелоадер после первой загрузки
        document.getElementById('loader').classList.add('hidden');
        console.log("Application initialized.");
    }
}

// =================================================================== //
// ==================== РОУТЕР И ЛОГИКА НАВИГАЦИИ ==================== //
// =================================================================== //

function router() {
    // Показываем прелоадер при внутренней навигации
    if(siteData) { // Не показываем прелоадер до самой первой загрузки
         document.getElementById('loader').classList.remove('hidden');
    }
    
    const { pathWithoutBase } = getPathDetails();
    console.log(`Routing for path: '${pathWithoutBase}'`);

    const detailPageRegex = /^\/(?:([a-z]{2})\/)?(services|portfolio|blog|contact)\/([a-zA-Z0-9-]+)\/?$/;
    const match = pathWithoutBase.match(detailPageRegex);

    if (match) {
        const [, lang, collection, slug] = match;
        const itemData = siteData[collection]?.find(item => item.urlSlug === slug && item.lang === (lang || defaultLang));
        if (itemData) {
            renderDetailPage(itemData, collection);
        } else {
            console.warn(`No item found for ${collection}/${slug}. Rendering 404.`);
            render404Page();
        }
    } else {
        renderHomePage(siteData.home);
    }
    
    // Скрываем прелоадер после отрисовки
    document.getElementById('loader').classList.add('hidden');
}

function handleNavigation(e) {
    const link = e.target.closest('a');
    if (!link || link.target === '_blank' || link.protocol !== window.location.protocol || link.host !== window.location.host || e.metaKey || e.ctrlKey || e.shiftKey) { return; }
    
    e.preventDefault();
    if (link.href === window.location.href) { return; }

    const { pathWithoutBase } = getPathDetails();
    let targetPath = decodeURI(link.pathname);
    if (targetPath.startsWith(basePath)) targetPath = targetPath.substring(basePath.length);
    if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;

    if (targetPath === pathWithoutBase && link.hash) {
        document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    window.history.pushState({}, '', link.href);
    if (typeof ym === 'function') ym(103413242, 'hit', window.location.href);
    router(); // Просто вызываем роутер
}

// =================================================================== //
// ==================== ФУНКЦИИ ЗАГРУЗКИ И РЕНДЕРИНГА ================= //
// =================================================================== //

async function fetchAllSiteData() {
    const tempSiteData = { home: {}, services: [], portfolio: [], blog: [], contact: [] };
    const collections = ['services', 'portfolio', 'blog', 'contact'];
    const dataPromises = [
        db.collection('home').doc('content').get(),
        ...collections.map(col => db.collection(col).get())
    ];
    const [homeDoc, ...snapshots] = await Promise.all(dataPromises);
    if (homeDoc.exists) tempSiteData.home = processDocData(homeDoc.data());
    collections.forEach((col, index) => {
        tempSiteData[col] = snapshots[index].docs.map(doc => ({ id: doc.id, ...processDocData(doc.data()) }));
    });
    return tempSiteData;
}

function renderHomePage(data) {
    renderSeoTags(data || { seoTitle: 'Digital Craft' });
    mainContentEl.innerHTML = `<section id="hero"></section><section id="services"></section><section id="portfolio"></section><section id="blog"></section><section id="contact"></section>`;
    document.getElementById('site-footer').style.display = 'block';
    renderHero(data);
    renderAllHomeSections();
    applyCustomBackground(data);
    // ЗАПУСК АНИМАЦИЙ ТОЛЬКО ДЛЯ ГЛАВНОЙ
    initHomePageObservers();
    initMobileSliders();
}

function renderDetailPage(itemData, collection) {
    renderSeoTags(itemData);
    const formattedContent = formatContentHtml(itemData.mainContent);
    mainContentEl.innerHTML = `<section><div class="detail-page-header"><h1 class="fade-in-up">${itemData.h1 || ''}</h1>${itemData.price ? `<div class="detail-price fade-in-up">${itemData.price}</div>` : ''}</div><div class="detail-content">${formattedContent}</div></section>`;
    document.getElementById('site-footer').style.display = 'none';
    renderRelatedPosts(collection, itemData.urlSlug, itemData.lang);
    applyCustomBackground(itemData);
    // ЗАПУСК АНИМАЦИЙ ТОЛЬКО ДЛЯ ДЕТАЛЬНОЙ
    initParagraphObservers();
}

function render404Page({ error = false } = {}) {
    document.title = "404 Not Found | Digital Craft";
    mainContentEl.innerHTML = `<section class="detail-page-header" style="text-align:center;"><h1>${error ? 'Error' : '404 - Not Found'}</h1><p>${error ? 'Could not load page. Please try again.' : 'The page you were looking for does not exist.'}</p><a href="${basePath || '/'}">Go back home</a></section>`;
    document.getElementById('site-footer').style.display = 'block';
}

function renderAllHomeSections() {
    renderSection('services', 'Our Services', siteData.services);
    renderSection('portfolio', 'Our Work', siteData.portfolio);
    renderSection('blog', 'Latest Insights', siteData.blog);
    renderSection('contact', 'Get in Touch', siteData.contact);
    initFloatingObservers(); // Эти анимации нужны для карточек в секциях
}

// =================================================================== //
// ==================== ВСЕ ОСТАЛЬНЫЕ ФУНКЦИИ ======================== //
// =================================================================== //

function initEventListeners() { 
    document.body.addEventListener('click', handleNavigation); 
    window.addEventListener('popstate', router);
    // ... остальной код без изменений ...
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { document.querySelectorAll('.cross-fade-slider').forEach(slider => { const activeSlide = slider.querySelector('.item-card.active'); if (activeSlide) { slider.style.height = `${activeSlide.offsetHeight}px`; } }); }, 200); });
    const menuToggle = document.querySelector('.menu-toggle'); 
    const navOverlay = document.querySelector('.nav-overlay'); 
    menuToggle.addEventListener('click', (e) => { e.stopPropagation(); document.body.classList.toggle('nav-is-open'); menuToggle.classList.toggle('is-active'); navOverlay.classList.toggle('is-active'); }); 
    navOverlay.addEventListener('click', (e) => { const link = e.target.closest('a'); if (link || e.target === navOverlay) { document.body.classList.remove('nav-is-open'); menuToggle.classList.remove('is-active'); navOverlay.classList.remove('is-active'); } }); 
    document.getElementById('admin-close-btn').addEventListener('click', (e) => { e.stopPropagation(); document.getElementById('admin-panel').classList.remove('active');}); 
    document.querySelector('.admin-content').addEventListener('click', e => { e.stopPropagation(); const listItem = e.target.closest('.admin-list-item'); if (listItem) { const id = listItem.dataset.id; const key = listItem.dataset.key; const itemData = siteData[key]?.find(i => i.id === id); if (itemData) { const tabContent = listItem.closest('.tab-content'); tabContent.querySelectorAll('.admin-list-item').forEach(el => el.classList.remove('selected')); listItem.classList.add('selected'); const editorContainer = tabContent.querySelector('.admin-item-editor-container'); editorContainer.innerHTML = generateAdminItemFormHTML(itemData, key); } return; } handleAdminActions(e); }); 
    document.querySelector('.admin-tabs').addEventListener('click', e => { e.stopPropagation(); if (e.target.matches('.admin-tab')) { document.querySelectorAll('.admin-tab, .tab-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.querySelector(`.tab-content[data-tab-content="${e.target.dataset.tab}"]`).classList.add('active'); } }); 
    const footer = document.getElementById('site-footer'); 
    footer.innerHTML = `© ${new Date().getFullYear()} Digital Craft. All rights reserved.`; 
    footer.addEventListener('click', handleAdminLogin);
    renderMenu();
    renderAdminPanel();
}

function getPathDetails() {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = isGitHubPages ? window.location.pathname.split('/')[1] || '' : '';
    const basePath = repoName ? `/${repoName}` : '';
    let path = decodeURI(window.location.pathname);
    if (path.startsWith(basePath)) path = path.substring(basePath.length);
    if (!path.startsWith('/')) path = '/' + path;
    if (path.endsWith('/index.html')) path = path.slice(0, -10);
    if (path === '' || path === '/index.html') path = '/';
    return { pathWithoutBase: path, basePath: basePath };
}

function renderSeoTags(data) {
    document.querySelectorAll('meta[name="description"], meta[property^="og:"], script[type="application/ld+json"], link[rel="canonical"]').forEach(el => el.remove());
    document.title = data.seoTitle || "Digital Craft";
    document.documentElement.lang = data.lang || 'en';
    const createMeta = (attr, key, value) => { if (value) { const meta = document.createElement('meta'); meta.setAttribute(attr, key); meta.content = value; document.head.appendChild(meta); } };
    createMeta('name', 'description', data.metaDescription);
    createMeta('property', 'og:title', data.ogTitle || data.seoTitle);
    createMeta('property', 'og:description', data.ogDescription || data.metaDescription);
    const ogImage = data.ogImage || (Array.isArray(data.media) ? data.media.find(url => !/youtube|vimeo/.test(url)) : '') || '';
    if (ogImage) createMeta('property', 'og:image', ogImage);
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.href.split('?')[0].split('#')[0];
    document.head.appendChild(canonical);
    if (data.schemaJsonLd && typeof data.schemaJsonLd === 'object' && Object.keys(data.schemaJsonLd).length > 0) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data.schemaJsonLd, null, 2);
        document.head.appendChild(script);
    }
}

function processDocData(data) {
    if (data && typeof data.schemaJsonLd === 'string' && data.schemaJsonLd.trim().startsWith('{')) { try { data.schemaJsonLd = JSON.parse(data.schemaJsonLd); } catch (e) { console.error('Failed to parse schemaJsonLd', e); data.schemaJsonLd = {}; } }
    return data;
}

function renderMenu() {
    const menuEl = document.querySelector('.nav-menu');
    if (!menuEl) return;
    const { basePath } = getPathDetails();
    const homeUrl = basePath || '/';
    const menuItems = [ { label: 'Home', href: `${homeUrl}` }, { label: 'Services', href: `${homeUrl}#services` }, { label: 'Portfolio', href: `${homeUrl}#portfolio` }, { label: 'Blog', href: `${homeUrl}#blog` }, { label: 'Contact', href: `${homeUrl}#contact` } ];
    menuEl.innerHTML = menuItems.map(item => `<li><a href="${item.href}">${item.label}</a></li>`).join('');
}

function renderHero(data) {
    const heroSection = document.getElementById('hero');
    if (!heroSection || !data) return;
    heroSection.innerHTML = `<h1>${data.h1 || ''}</h1><div class="hero-subtitle-container">${formatContentHtml(data.subtitle)}</div>`;
}

function formatContentHtml(content) {
    if (!content) return '';
    let processedContent = content.replace(/\r\n/g, '\n');
    const blocks = processedContent.split(/\n{2,}/);
    return blocks.map(block => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return '';
        const youtubeRegex = /^https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch?v=|watch\?.*&v=|shorts\/))([a-zA-Z0-9_-]{11}).*$/;
        const imageRegex = /^https?:\/\/[^<>"']+\.(?:jpg|jpeg|png|gif|webp|svg)\s*$/i;
        const youtubeMatch = trimmedBlock.match(youtubeRegex);
        const imageMatch = trimmedBlock.match(imageRegex);
        if (/^<(p|div|h[1-6]|ul|ol|li|blockquote|hr|table|pre)/i.test(trimmedBlock)) { return trimmedBlock; }
        if (youtubeMatch && youtubeMatch[1]) { const videoId = youtubeMatch[1]; return `<div class="embedded-video" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; margin: 1.5em 0; border-radius: 4px; border: 1px solid var(--color-border);"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`; }
        if (imageMatch) { return `<p style="margin: 1.5em 0;"><img src="${trimmedBlock}" alt="Embedded content" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 4px; border: 1px solid var(--color-border);" /></p>`; }
        return `<p>${trimmedBlock.replace(/\n/g, '<br>')}</p>`;
    }).join('');
}

function renderSection(key, title, items) {
    const section = document.getElementById(key);
    if (!section) return;
    const itemsFromDb = items || [];
    if (itemsFromDb.length === 0) { section.innerHTML = ''; return; }
    const desktopItemsHTML = itemsFromDb.map(item => {
        const langPrefix = item.lang && item.lang !== defaultLang ? `/${item.lang}` : '';
        const itemUrl = `${basePath}${langPrefix}/${key}/${item.urlSlug}`;
        return `<a href="${itemUrl}" class="item-card floating-item"><div class="item-card__image" style="background-image: url('${(item.media || []).find(url => !/youtube|vimeo/.test(url)) || ''}')"></div><div class="item-card__content"><h3>${item.title}</h3><div class="card-subtitle">${item.subtitle}</div><p>${item.description}</p></div></a>`
    }).join('');
    const desktopGrid = `<div class="item-grid">${desktopItemsHTML}</div>`;
    const langOrder = ['en', 'ka', 'ua', 'ru'];
    const itemsByLang = {};
    itemsFromDb.forEach(item => { if (!itemsByLang[item.lang]) itemsByLang[item.lang] = []; itemsByLang[item.lang].push(item); });
    const mobileSlidersHTML = langOrder.map(lang => {
        const langItems = itemsByLang[lang]; if (!langItems || langItems.length === 0) return '';
        const slidesHTML = langItems.map((item, index) => {
            const langPrefix = item.lang && item.lang !== defaultLang ? `/${item.lang}` : '';
            const itemUrl = `${basePath}${langPrefix}/${key}/${item.urlSlug}`;
            return `<a href="${itemUrl}" class="item-card ${index === 0 ? 'active' : ''}"><div class="item-card__image" style="background-image: url('${(item.media || []).find(url => !/youtube|vimeo/.test(url)) || ''}')"></div><div class="item-card__content"><h3>${item.title}</h3><div class="card-subtitle">${item.subtitle}</div><p>${item.description}</p></div></a>`
        }).join('');
        const dotsHTML = langItems.length > 1 ? langItems.map((_, index) => `<span class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('') : '';
        return `<div class="language-slider-block"><div class="cross-fade-slider">${slidesHTML}</div><div class="slider-nav">${dotsHTML}</div></div>`;
    }).join('');
    const mobileContainer = `<div class="mobile-sliders-container">${mobileSlidersHTML}</div>`;
    section.innerHTML = `<div class="animated-container"><h2>${title}</h2></div>${desktopGrid}${mobileContainer}`;
}

function renderRelatedPosts(currentCollection, currentSlug, currentLang) {
    const existingSection = document.getElementById('related-posts');
    if (existingSection) existingSection.remove();
    if (!siteData?.services?.length || !siteData?.blog?.length) return;
    const pool = [...siteData.services.map(i => ({ ...i, collection: 'services' })), ...siteData.blog.map(i => ({ ...i, collection: 'blog' }))];
    const relatedItems = pool.filter(item => item.lang === currentLang && !(item.collection === currentCollection && item.urlSlug === currentSlug)).sort(() => 0.5 - Math.random()).slice(0, 3);
    if (relatedItems.length === 0) return;
    const itemsHTML = relatedItems.map(item => {
        const langPrefix = item.lang && item.lang !== defaultLang ? `/${item.lang}` : '';
        const itemUrl = `${basePath}${langPrefix}/${item.collection}/${item.urlSlug}`;
        return `<a href="${itemUrl}" class="item-card floating-item"><div class="item-card__image" style="background-image: url('${(item.media || []).find(url => !/youtube|vimeo/.test(url)) || ''}')"></div><div class="item-card__content"><h3>${item.title}</h3><div class="card-subtitle">${item.subtitle}</div><p>${item.description}</p></div></a>`
    }).join('');
    const relatedSection = document.createElement('section');
    relatedSection.id = 'related-posts';
    relatedSection.innerHTML = `<h2 class="fade-in-up">You Might Also Like</h2><div class="item-grid">${itemsHTML}</div>`;
    mainContentEl.appendChild(relatedSection);
    initFloatingObservers();
    initParagraphObservers();
}

function applyCustomBackground(item = null) {
    const iframe = document.getElementById('custom-background-iframe');
    const dataToUse = item || siteData?.home || {};
    const customCode = dataToUse.backgroundHtml || '';
    if (customCode.trim() !== "") { iframe.style.display = 'block'; iframe.srcdoc = customCode; } else { iframe.style.display = 'none'; iframe.srcdoc = ''; }
}

async function handleAdminLogin() { if (auth.currentUser) { document.getElementById('admin-panel').classList.add('active'); return; } const email = prompt("Enter admin email:"); if (!email) return; const password = prompt("Enter admin password:"); if (!password) return; try { await auth.signInWithEmailAndPassword(email, password); document.getElementById('admin-panel').classList.add('active'); } catch (error) { alert("Login failed."); } }

function renderAdminPanel() { renderAdminHome(); renderAdminSection('services'); renderAdminSection('portfolio'); renderAdminSection('blog'); renderAdminSection('contact'); }
function renderAdminHome() { const container = document.querySelector('.tab-content[data-tab-content="home"]'); if (!container) return; const data = siteData?.home || {}; container.innerHTML = `<div class="admin-section-header"><h2>Home Page Content & SEO</h2></div><div class="admin-item" id="admin-home-item"><div class="admin-item-content"><h4>Visible Content</h4><label for="home-h1">Main Header (H1)</label><input type="text" id="home-h1" value="${data.h1 || ''}" disabled><label for="home-subtitle">Subtitle</label><textarea id="home-subtitle" rows="3" disabled>${data.subtitle || ''}</textarea><h4>Critical SEO</h4><label for="home-lang">Language (e.g., en, ru)</label><input type="text" id="home-lang" value="${data.lang || 'en'}" disabled><label for="home-seoTitle">SEO Title Tag (&lt; 60 chars)</label><input type="text" id="home-seoTitle" value="${data.seoTitle || ''}" disabled><label for="home-metaDescription">Meta Description (&lt; 160 chars)</label><textarea id="home-metaDescription" rows="3" disabled>${data.metaDescription || ''}</textarea><h4>Schema.org for Organization</h4><label>JSON-LD Code</label><textarea id="home-schemaJsonLd" rows="8" disabled>${typeof data.schemaJsonLd === 'object' ? JSON.stringify(data.schemaJsonLd, null, 2) : data.schemaJsonLd || '{}'}</textarea><h4>Social Media Sharing (Open Graph)</h4><label for="home-ogTitle">OG Title</label><input type="text" id="home-ogTitle" value="${data.ogTitle || ''}" disabled><label for="home-ogDescription">OG Description</label><textarea id="home-ogDescription" rows="3" disabled>${data.ogDescription || ''}</textarea><label for="home-ogImage">OG Image URL (1200x630px recommended)</label><input type="text" id="home-ogImage" value="${data.ogImage || ''}" disabled><h4>Custom Background</h4><label for="home-backgroundHtml">Custom Background HTML/JS/CSS (leave empty for default animation)</label><textarea id="home-backgroundHtml" rows="10" disabled>${data.backgroundHtml || ''}</textarea></div><div class="admin-item-actions"><button class="admin-btn edit-btn" data-action="edit-home">Edit</button><button class="admin-btn save-btn" data-action="save-home">Save</button></div></div>`; }
function generateAdminItemFormHTML(item, key) { return `<div class="admin-item" data-id="${item.id}" data-key="${key}"><div class="admin-item-content"><h4>Card Content (On Home Page)</h4><label>Card Title</label><input type="text" class="admin-input-title" value="${item.title || ''}" disabled><label>Card Subtitle / Date</label><input type="text" class="admin-input-subtitle" value="${item.subtitle || ''}" disabled><label>Card Description</label><textarea class="admin-input-description" rows="3" disabled>${item.description || ''}</textarea><h4>Detailed Page Content</h4><label>Language</label><select class="admin-input-lang" disabled><option value="en" ${item.lang === 'en' ? 'selected' : ''}>English (en)</option><option value="ru" ${item.lang === 'ru' ? 'selected' : ''}>Русский (ru)</option><option value="ka" ${item.lang === 'ka' ? 'selected' : ''}>Georgian (ka)</option><option value="ua" ${item.lang === 'ua' ? 'selected' : ''}>Ukrainian (ua)</option></select><label>Page URL Slug</label><input type="text" class="admin-input-urlSlug" value="${item.urlSlug || ''}" disabled><label>Page Main Header (H1)</label><input type="text" class="admin-input-h1" value="${item.h1 || ''}" disabled><label>Price / Budget</label><input type="text" class="admin-input-price" value="${item.price || ''}" disabled><label>Main Page Content (Supports HTML and paragraph breaks)</label><textarea class="admin-input-mainContent" rows="8" disabled>${item.mainContent || ''}</textarea><label>Media (URLs, one per line)</label><textarea class="admin-input-media" rows="4" disabled>${(item.media || []).join('\n')}</textarea><label>Main Image Alt Text</label><input type="text" class="admin-input-mainImageAlt" value="${item.mainImageAlt || ''}" disabled><h4>SEO & Metadata</h4><label>SEO Title Tag</label><input type="text" class="admin-input-seoTitle" value="${item.seoTitle || ''}" disabled><label>Meta Description</label><textarea class="admin-input-metaDescription" rows="3" disabled>${item.metaDescription || ''}</textarea><label>Schema.org JSON-LD</label><textarea class="admin-input-schemaJsonLd" rows="5" disabled>${typeof item.schemaJsonLd === 'object' ? JSON.stringify(item.schemaJsonLd, null, 2) : item.schemaJsonLd || '{}'}</textarea><h4>Social Media Sharing (Open Graph)</h4><label>OG Title (If different from SEO Title)</label><input type="text" class="admin-input-ogTitle" value="${item.ogTitle || ''}" disabled><label>OG Description (If different from Meta Description)</label><textarea class="admin-input-ogDescription" rows="2" disabled>${item.ogDescription || ''}</textarea><label>OG Image URL (1200x630px recommended)</label><input type="text" class="admin-input-ogImage" value="${item.ogImage || ''}" disabled><h4>Custom Background</h4><label>Custom Page Background HTML/JS/CSS</label><textarea class="admin-input-backgroundHtml" rows="6" disabled>${item.backgroundHtml || ''}</textarea></div><div class="admin-item-actions"><button class="admin-btn edit-btn" data-action="edit">Edit</button><button class="admin-btn save-btn" data-action="save">Save</button><button class="admin-btn delete-btn" data-action="delete">Delete</button></div></div>`; }
function renderAdminSection(key) { const container = document.querySelector(`.tab-content[data-tab-content="${key}"]`); if (!container) return; const title = key.charAt(0).toUpperCase() + key.slice(1); const items = siteData ? (siteData[key] || []) : []; const langOrder = ['en', 'ka', 'ru', 'ua']; const langNames = { en: 'English', ka: 'Georgian', ru: 'Russian', ua: 'Ukrainian' }; const groupedItems = {}; items.forEach(item => { const lang = item.lang || defaultLang; if (!groupedItems[lang]) groupedItems[lang] = []; groupedItems[lang].push(item); }); const listsHTML = langOrder.map(lang => { if (!groupedItems[lang] || groupedItems[lang].length === 0) return ''; const itemsListHTML = groupedItems[lang].sort((a, b) => (a.title || '').localeCompare(b.title || '')).map(item => `<li class="admin-list-item" data-id="${item.id}" data-key="${key}">${item.title || 'No Title'}<span class="admin-list-item-slug">(/${item.urlSlug || 'no-slug'})</span></li>`).join(''); return `<div class="admin-lang-group"><h4>${langNames[lang]} (${lang})</h4><ul class="admin-item-list">${itemsListHTML}</ul></div>`; }).join(''); container.innerHTML = `<div class="admin-section-header"><h2>Manage ${title}</h2><button class="admin-btn" data-action="add" data-key="${key}">+ Add New</button></div>${listsHTML}<div class="admin-item-editor-container"></div>`; }
async function handleAdminActions(e) { const target = e.target; const action = target.dataset.action; if (!action) return; const itemEl = target.closest('.admin-item'); const setEditingState = (el, isEditing) => { el.classList.toggle('is-editing', isEditing); el.querySelectorAll('input, textarea, select').forEach(input => input.disabled = !isEditing); }; try { if (action === 'edit-home') { setEditingState(itemEl, true); return; } if (action === 'save-home') { setEditingState(itemEl, false); let schemaValue = itemEl.querySelector('#home-schemaJsonLd').value; try { schemaValue = JSON.parse(schemaValue); } catch(err) { alert("Error: Invalid JSON in Schema field."); return; } const updatedData = { h1: itemEl.querySelector('#home-h1').value, subtitle: itemEl.querySelector('#home-subtitle').value, lang: itemEl.querySelector('#home-lang').value, seoTitle: itemEl.querySelector('#home-seoTitle').value, metaDescription: itemEl.querySelector('#home-metaDescription').value, schemaJsonLd: schemaValue, ogTitle: itemEl.querySelector('#home-ogTitle').value, ogDescription: itemEl.querySelector('#home-ogDescription').value, ogImage: itemEl.querySelector('#home-ogImage').value, backgroundHtml: itemEl.querySelector('#home-backgroundHtml').value, }; await db.collection('home').doc('content').update(updatedData); siteData.home = updatedData; router(); alert('Home page updated!'); return; } const key = target.dataset.key || itemEl.dataset.key; const id = itemEl ? itemEl.dataset.id : null; switch (action) { case 'edit': setEditingState(itemEl, true); break; case 'save': { setEditingState(itemEl, false); let schemaValue = itemEl.querySelector('.admin-input-schemaJsonLd').value; try { schemaValue = JSON.parse(schemaValue); } catch (err) { alert("Error: Invalid JSON in Schema field."); return; } const updatedData = { lang: itemEl.querySelector('.admin-input-lang').value, title: itemEl.querySelector('.admin-input-title').value, subtitle: itemEl.querySelector('.admin-input-subtitle').value, description: itemEl.querySelector('.admin-input-description').value, urlSlug: itemEl.querySelector('.admin-input-urlSlug').value.trim(), h1: itemEl.querySelector('.admin-input-h1').value, price: itemEl.querySelector('.admin-input-price').value, mainContent: itemEl.querySelector('.admin-input-mainContent').value, media: itemEl.querySelector('.admin-input-media').value.split('\n').map(s => s.trim()).filter(Boolean), mainImageAlt: itemEl.querySelector('.admin-input-mainImageAlt').value, seoTitle: itemEl.querySelector('.admin-input-seoTitle').value, metaDescription: itemEl.querySelector('.admin-input-metaDescription').value, schemaJsonLd: schemaValue, ogTitle: itemEl.querySelector('.admin-input-ogTitle').value, ogDescription: itemEl.querySelector('.admin-input-ogDescription').value, ogImage: itemEl.querySelector('.admin-input-ogImage').value, backgroundHtml: itemEl.querySelector('.admin-input-backgroundHtml').value, }; await db.collection(key).doc(id).update(updatedData); siteData = await fetchAllSiteData(); router(); alert('Item saved!'); break; } case 'delete': if (confirm('Are you sure?')) { await db.collection(key).doc(id).delete(); siteData = await fetchAllSiteData(); router(); alert('Item deleted!'); } break; case 'add': const newId = `${key.slice(0, -1)}-${Date.now()}`; const newTitle = 'New Item Title'; const newSlug = newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); const newItemData = { lang: defaultLang, urlSlug: newSlug, title: newTitle, subtitle: 'New Subtitle', description: 'A short description for the card.', h1: newTitle, mainContent: 'Full content...', price: '', media: [], mainImageAlt: '', seoTitle: newTitle, metaDescription: '', schemaJsonLd: {}, backgroundHtml: '', ogImage: '', ogTitle: '', ogDescription: '' }; await db.collection(key).doc(newId).set(newItemData); siteData = await fetchAllSiteData(); renderAdminSection(key); alert('New item added.'); break; } } catch (error) { console.error("Admin action failed:", error); alert("An error occurred."); } }

function initMobileSliders() { document.querySelectorAll('.language-slider-block').forEach(sliderBlock => { const slider = sliderBlock.querySelector('.cross-fade-slider'); if (!slider) return; const slides = slider.querySelectorAll('.item-card'); const nav = sliderBlock.querySelector('.slider-nav'); const dots = nav ? nav.querySelectorAll('.slider-dot') : []; const updateSliderHeight = () => { const activeSlide = slider.querySelector('.item-card.active'); if (activeSlide) { slider.style.height = `${activeSlide.offsetHeight}px`; } }; if (slides.length <= 1) { setTimeout(updateSliderHeight, 100); return; } let currentIndex = 0; let autoSlideInterval; function goToSlide(index) { currentIndex = (index + slides.length) % slides.length; slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex)); if(dots.length > 0) dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex)); updateSliderHeight(); } function stopAutoSlide() { clearInterval(autoSlideInterval); } function startAutoSlide() { stopAutoSlide(); autoSlideInterval = setInterval(() => goToSlide(currentIndex + 1), 5000); } updateSliderHeight(); startAutoSlide(); if(nav) nav.addEventListener('click', e => { if (e.target.matches('.slider-dot')) { stopAutoSlide(); goToSlide(parseInt(e.target.dataset.index)); startAutoSlide(); } }); slider.addEventListener('touchstart', stopAutoSlide, { passive: true }); slider.addEventListener('touchend', startAutoSlide, { passive: true }); }); }
function createFloatingObserver() { return new IntersectionObserver((entries) => { entries.forEach(entry => { const target = entry.target; const isAboveViewport = entry.boundingClientRect.top < 0; if (entry.isIntersecting) { target.classList.add('is-visible'); target.classList.remove('is-above'); } else { target.classList.remove('is-visible'); if (isAboveViewport) { target.classList.add('is-above'); } else { target.classList.remove('is-above'); } } }); }, { threshold: 0, rootMargin: "-50px 0px -50px 0px" }); }
function initParagraphObservers() { const paragraphObserver = createFloatingObserver(); document.querySelectorAll(".detail-content p, .detail-content li, .detail-content div.embedded-video, .detail-content p > img, #related-posts .item-card").forEach(el => { const targetEl = el.tagName === 'IMG' ? el.parentElement : el; if (!targetEl.classList.contains('floating-item')) { targetEl.classList.add('floating-item'); } paragraphObserver.observe(targetEl); }); }
function initFloatingObservers() { const floatingObserver = createFloatingObserver(); document.querySelectorAll(".item-grid .item-card.floating-item").forEach(el => { floatingObserver.observe(el); }); }
function initHomePageObservers() { const homePageObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { const animatedElements = entry.target.id === 'hero' ? entry.target.querySelectorAll('h1, .hero-subtitle-container') : entry.target.querySelectorAll('.animated-container'); animatedElements.forEach((el, index) => { const delay = entry.target.id === 'hero' ? 0.3 + index * 0.2 : 0; el.style.animationDelay = `${delay}s`; el.classList.add('fade-in-up'); }); } }); }, { threshold: 0.1 }); document.querySelectorAll('#hero, #services, #portfolio, #blog, #contact, #related-posts').forEach(section => { if(section) homePageObserver.observe(section); }); }

// Запускаем приложение
main();
// --- КОНЕЦ ОКОНЧАТЕЛЬНОЙ ВЕРСИИ main.js (v5.0 - СТАБИЛЬНАЯ АРХИТЕКТУРА) ---