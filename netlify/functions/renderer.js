const admin = require('firebase-admin');

// Инициализация Firebase Admin SDK
let db;
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Список SEO ботов
const SEARCH_BOTS = [
  'Googlebot', 'bingbot', 'Slurp', 'DuckDuckBot', 'YandexBot',
  'facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp',
  'TelegramBot', 'Discordbot', 'Slackbot', 'SkypeUriPreview'
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
  // Главная страница
  if (pathname === '/' || pathname === '') {
    return { type: 'home', lang: null, collection: null, slug: null };
  }

  // Языковая версия главной страницы
  const langMatch = pathname.match(/^\/([a-z]{2})\/?$/);
  if (langMatch) {
    return { type: 'home', lang: langMatch[1], collection: null, slug: null };
  }

  // Детальные страницы: /lang/collection/slug
  const detailMatch = pathname.match(/^\/([a-z]{2})\/([a-z]+)\/([a-zA-Z0-9-]+)\/?$/);
  if (detailMatch) {
    return { 
      type: 'detail', 
      lang: detailMatch[1], 
      collection: detailMatch[2], 
      slug: detailMatch[3] 
    };
  }

  // Детальные страницы без языка: /collection/slug
  const detailNoLangMatch = pathname.match(/^\/([a-z]+)\/([a-zA-Z0-9-]+)\/?$/);
  if (detailNoLangMatch) {
    return { 
      type: 'detail', 
      lang: null, 
      collection: detailNoLangMatch[1], 
      slug: detailNoLangMatch[2] 
    };
  }

  return { type: 'unknown', lang: null, collection: null, slug: null };
}

// Получение данных из Firestore
async function getPageData(urlInfo) {
  try {
    if (urlInfo.type === 'home') {
      // Главная страница
      const homeDoc = await db.collection('home').doc('content').get();
      if (homeDoc.exists) {
        return {
          type: 'home',
          data: homeDoc.data(),
          lang: urlInfo.lang || 'en'
        };
      }
    } else if (urlInfo.type === 'detail') {
      // Детальная страница
      const collection = urlInfo.collection;
      const query = db.collection(collection)
        .where('urlSlug', '==', urlInfo.slug);
      
      if (urlInfo.lang) {
        query.where('lang', '==', urlInfo.lang);
      }
      
      const snapshot = await query.get();
      if (!snapshot.empty) {
        return {
          type: 'detail',
          data: snapshot.docs[0].data(),
          collection: collection,
          lang: urlInfo.lang || snapshot.docs[0].data().lang
        };
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
  const { type, data, lang, collection } = pageInfo;
  
  // Базовые мета-теги
  const baseMeta = {
    title: data.seoTitle || data.title || data.h1 || 'Digital Craft',
    description: data.metaDescription || data.description || data.subtitle || 'Professional web development services',
    keywords: data.keywords || 'web development, SEO services, Tbilisi, Georgia',
    author: data.author || 'Digital Craft',
    ogType: data.ogType || 'website',
    ogImage: data.ogImage || data.media?.[0] || '',
    canonical: baseURL + (data.canonicalUrl || ''),
    lang: lang || 'en'
  };

  // Структурированные данные
  const structuredData = generateStructuredData(pageInfo, baseURL);

  // HTML шаблон
  return `<!DOCTYPE html>
<html lang="${baseMeta.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${baseMeta.title}</title>
    <meta name="description" content="${baseMeta.description}">
    <meta name="keywords" content="${baseMeta.keywords}">
    <meta name="author" content="${baseMeta.author}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${baseMeta.canonical}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="${baseMeta.ogType}">
    <meta property="og:title" content="${baseMeta.title}">
    <meta property="og:description" content="${baseMeta.description}">
    <meta property="og:url" content="${baseMeta.canonical}">
    <meta property="og:site_name" content="Digital Craft">
    <meta property="og:locale" content="${baseMeta.lang}_${baseMeta.lang.toUpperCase()}">
    ${baseMeta.ogImage ? `<meta property="og:image" content="${baseMeta.ogImage}">` : ''}
    ${baseMeta.ogImage ? `<meta property="og:image:width" content="1200">` : ''}
    ${baseMeta.ogImage ? `<meta property="og:image:height" content="630">` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${baseMeta.title}">
    <meta name="twitter:description" content="${baseMeta.description}">
    ${baseMeta.ogImage ? `<meta name="twitter:image" content="${baseMeta.ogImage}">` : ''}
    
    <!-- Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
    </script>
    
    <!-- Styles -->
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
    
    <main>
        ${generateMainContent(pageInfo)}
    </main>
    
    <footer>
        <p>&copy; 2025 Digital Craft. All rights reserved.</p>
    </footer>
    
    <!-- Scripts -->
    <script src="/main.js" type="module"></script>
</body>
</html>`;
}

// Генерация основного контента
function generateMainContent(pageInfo) {
  const { type, data } = pageInfo;
  
  if (type === 'home') {
    return `
        <section class="hero">
            <h1>${data.h1 || 'Web Development & SEO Services'}</h1>
            ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
        </section>
        
        <section id="services">
            <h2>Our Services</h2>
            <div class="services-grid">
                <!-- Services will be loaded dynamically -->
            </div>
        </section>
        
        <section id="portfolio">
            <h2>Our Work</h2>
            <div class="portfolio-grid">
                <!-- Portfolio will be loaded dynamically -->
            </div>
        </section>
        
        <section id="blog">
            <h2>Latest Insights</h2>
            <div class="blog-grid">
                <!-- Blog posts will be loaded dynamically -->
            </div>
        </section>
        
        <section id="contact">
            <h2>Get in Touch</h2>
            <div class="contact-form">
                <!-- Contact form will be loaded dynamically -->
            </div>
        </section>
    `;
  } else if (type === 'detail') {
    return `
        <article class="detail-page">
            <header class="page-header">
                <h1>${data.h1 || data.title || 'Page Title'}</h1>
                ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
                ${data.price ? `<div class="price">${data.price}</div>` : ''}
            </header>
            
            <div class="page-content">
                ${formatContent(data.mainContent || data.description || '')}
            </div>
            
            ${data.media && data.media.length > 0 ? `
            <div class="page-media">
                ${data.media.map(url => {
                    if (url.includes('youtube') || url.includes('vimeo')) {
                        return `<div class="video-embed">${url}</div>`;
                    } else {
                        return `<img src="${url}" alt="Page media" loading="lazy">`;
                    }
                }).join('')}
            </div>
            ` : ''}
        </article>
    `;
  }
  
  return '<p>Content not found</p>';
}

// Форматирование контента
function formatContent(content) {
  if (!content) return '';
  
  // Простое форматирование текста
  return content
    .split('\n\n')
    .map(paragraph => `<p>${paragraph.trim()}</p>`)
    .join('');
}

// Генерация структурированных данных
function generateStructuredData(pageInfo, baseURL) {
  const { type, data, collection } = pageInfo;
  
  if (type === 'home') {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Digital Craft",
      "url": baseURL,
      "description": data.metaDescription || data.description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Tbilisi",
        "addressCountry": "GE"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service"
      }
    };
  } else if (type === 'detail') {
    if (collection === 'services') {
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": data.title || data.h1,
        "description": data.metaDescription || data.description,
        "provider": {
          "@type": "Organization",
          "name": "Digital Craft"
        }
      };
    } else if (collection === 'blog') {
      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.title || data.h1,
        "description": data.metaDescription || data.description,
        "author": {
          "@type": "Organization",
          "name": "Digital Craft"
        }
      };
    }
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.title || data.h1 || "Digital Craft"
  };
}

// Основная функция
exports.handler = async (event, context) => {
  try {
    // Проверяем, является ли запрос от бота
    const userAgent = event.headers['user-agent'] || event.headers['User-Agent'];
    if (!isSearchBot(userAgent)) {
      // Не бот - передаем управление дальше
      return {
        statusCode: 200,
        body: 'Not a bot, passing through'
      };
    }

    // Проверяем инициализацию Firebase
    if (!db) {
      console.error('Firebase not initialized');
      return {
        statusCode: 500,
        body: 'Server configuration error'
      };
    }

    // Разбираем URL
    const urlInfo = parseURL(event.path);
    if (urlInfo.type === 'unknown') {
      return {
        statusCode: 404,
        body: 'Page not found'
      };
    }

    // Получаем данные из Firestore
    const pageData = await getPageData(urlInfo);
    if (!pageData) {
      return {
        statusCode: 404,
        body: 'Content not found'
      };
    }

    // Генерируем HTML
    const baseURL = `https://${event.headers.host}`;
    const html = generateHTML(pageData, baseURL);

    // Возвращаем HTML для бота
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600'
      },
      body: html
    };

  } catch (error) {
    console.error('Renderer function error:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
};