              const admin = require('firebase-admin');

// Инициализация Firebase Admin SDK
let db;
try {
  // Проверяем, не был ли Firebase уже инициализирован
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Список SEO ботов
const SEARCH_BOTS = [
  'Googlebot', 'bingbot', 'Slurp', 'DuckDuckBot', 'YandexBot',
  'facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp',
  'TelegramBot', 'Discordbot', 'Slackbot', 'SkypeUriPreview', 'Validator'
];

// Проверка, является ли запрос от бота
function isSearchBot(userAgent) {
  if (!userAgent) return false;
  return SEARCH_BOTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

// Разбор URL для извлечения параметров
function parseURL(pathname) {
  if (pathname === '/' || pathname === '') {
    return { type: 'home', lang: 'en', collection: null, slug: null };
  }
  const langMatch = pathname.match(/^\/([a-z]{2})\/?$/);
  if (langMatch) {
    return { type: 'home', lang: langMatch[1], collection: null, slug: null };
  }
  const detailMatch = pathname.match(/^\/([a-z]{2})\/([a-z]+)\/([a-zA-Z0-9-]+)\/?$/);
  if (detailMatch) {
    return { type: 'detail', lang: detailMatch[1], collection: detailMatch[2], slug: detailMatch[3] };
  }
  return { type: 'unknown' };
}

// *** НОВАЯ ФУНКЦИЯ для загрузки данных коллекции ***
async function getCollectionData(collectionName, lang, limit = 3) {
  try {
    const snapshot = await db.collection(collectionName)
                              .where('lang', '==', lang)
                              .limit(limit)
                              .get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    return [];
  }
}

// Получение данных из Firestore (обновлено)
async function getPageData(urlInfo) {
  try {
    if (urlInfo.type === 'home') {
      const homeDoc = await db.collection('home').doc('content').get();
      if (!homeDoc.exists) return null;
      
      const homeData = homeDoc.data();
      // Загружаем данные для секций на главной странице
      homeData.services = await getCollectionData('services', urlInfo.lang);
      homeData.portfolio = await getCollectionData('portfolio', urlInfo.lang);
      homeData.blog = await getCollectionData('blog', urlInfo.lang);

      return { type: 'home', data: homeData, lang: urlInfo.lang };

    } else if (urlInfo.type === 'detail') {
      const snapshot = await db.collection(urlInfo.collection)
                               .where('urlSlug', '==', urlInfo.slug)
                               .where('lang', '==', urlInfo.lang)
                               .limit(1)
                               .get();
      if (!snapshot.empty) {
        return { type: 'detail', data: snapshot.docs[0].data(), collection: urlInfo.collection, lang: urlInfo.lang };
      }
    }
    return null;
  } catch (error) {
    console.error('Firestore query error:', error);
    return null;
  }
}

// Генерация HTML для страницы
function generateHTML(pageInfo, baseURL) {
    const { data, lang } = pageInfo;
    const baseMeta = {
        title: data.seoTitle || data.title || data.h1 || 'Digital Craft',
        description: data.metaDescription || data.description || data.subtitle || 'Professional web development services',
        keywords: data.keywords || 'web development, SEO services, Tbilisi, Georgia',
        author: 'Digital Craft',
        ogType: data.ogType || 'website',
        ogImage: data.ogImage || (data.media && data.media[0]) || `${baseURL}/og-image.jpg`,
        canonical: baseURL + (data.canonicalUrl || ''),
        lang: lang || 'en'
    };

    const structuredData = generateStructuredData(pageInfo, baseURL);

    return `<!DOCTYPE html>
<html lang="${baseMeta.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${baseMeta.title}</title>
    <meta name="description" content="${baseMeta.description}">
    <meta name="keywords" content="${baseMeta.keywords}">
    <meta name="author" content="${baseMeta.author}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="${baseMeta.canonical}">
    <meta property="og:type" content="${baseMeta.ogType}">
    <meta property="og:title" content="${baseMeta.title}">
    <meta property="og:description" content="${baseMeta.description}">
    <meta property="og:url" content="${baseMeta.canonical}">
    <meta property="og:site_name" content="Digital Craft">
    <meta property="og:locale" content="${baseMeta.lang}_${baseMeta.lang.toUpperCase()}">
    <meta property="og:image" content="${baseMeta.ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${baseMeta.title}">
    <meta name="twitter:description" content="${baseMeta.description}">
    <meta name="twitter:image" content="${baseMeta.ogImage}">
    <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>
    <link rel="stylesheet" href="/styles.css">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
</head>
<body>
    <header>
        <nav>
            <div class="logo">Digital Craft</div>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/#services">Services</a></li>
                <li><a href="/#portfolio">Portfolio</a></li>
                <li><a href="/#blog">Blog</a></li>
                <li><a href="/#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>${generateMainContent(pageInfo)}</main>
    <footer><p>&copy; 2025 Digital Craft. All rights reserved.</p></footer>
    <script src="/main.js" type="module"></script>
</body>
</html>`;
}

// Генерация основного контента (обновлено)
function generateMainContent(pageInfo) {
  const { type, data, lang } = pageInfo;
  
  if (type === 'home') {
    return `
        <section class="hero">
            <h1>${data.h1 || 'Web Development & SEO Services'}</h1>
            ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
        </section>
        
        <section id="services">
            <h2>Our Services</h2>
            <div class="services-grid">
                ${(data.services || []).map(item => `
                  <a href="/${lang}/services/${item.urlSlug}">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                  </a>
                `).join('')}
            </div>
        </section>
        
        <section id="portfolio">
            <h2>Our Work</h2>
            <div class="portfolio-grid">
                ${(data.portfolio || []).map(item => `
                  <a href="/${lang}/portfolio/${item.urlSlug}">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                  </a>
                `).join('')}
            </div>
        </section>
        
        <section id="blog">
            <h2>Latest Insights</h2>
            <div class="blog-grid">
                ${(data.blog || []).map(item => `
                  <a href="/${lang}/blog/${item.urlSlug}">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                  </a>
                `).join('')}
            </div>
        </section>
        
        <section id="contact">
            <h2>Get in Touch</h2>
        </section>
    `;
  } else if (type === 'detail') {
    return `<article class="detail-page">
            <header class="page-header">
                <h1>${data.h1 || data.title || 'Page Title'}</h1>
            </header>
            <div class="page-content">${formatContent(data.mainContent || data.description || '')}</div>
        </article>`;
  }
  
  return '<p>Content not found</p>';
}

// Остальные функции без изменений...
function formatContent(content) { /*...*/ }
function generateStructuredData(pageInfo, baseURL) { /*...*/ }

// Основная функция
exports.handler = async (event, context) => {
    // ... остальной код основной функции остается без изменений ...
};
