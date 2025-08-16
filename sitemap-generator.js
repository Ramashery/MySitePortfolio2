// Dynamic sitemap generator based on Firebase data
// This script can be used to generate a comprehensive sitemap

// Firebase configuration (same as in main.js)
const firebaseConfig = {
    apiKey: "AIzaSyAT4dDEIDUtzP60ibjahO06P75Q6h95ZN4",
    authDomain: "razrabotka-b61bc.firebaseapp.com",
    projectId: "razrabotka-b61bc",
    storageBucket: "razrabotka-b61bc.firebasestorage.app",
    messagingSenderId: "394402564794",
    appId: "1:394402564794:web:f610ffb03e655c600c5083"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to generate sitemap XML
function generateSitemapXML(urls) {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetStart = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
    const urlsetEnd = '</urlset>';
    
    const urlEntries = urls.map(url => {
        let urlEntry = `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>`;
        
        // Add hreflang if multiple languages exist
        if (url.hreflang && url.hreflang.length > 0) {
            url.hreflang.forEach(href => {
                urlEntry += `\n    <xhtml:link rel="alternate" hreflang="${href.lang}" href="${href.href}"/>`;
            });
        }
        
        urlEntry += '\n  </url>';
        return urlEntry;
    }).join('\n');
    
    return `${xmlHeader}\n${urlsetStart}\n${urlEntries}\n${urlsetEnd}`;
}

// Function to fetch all data and generate sitemap
async function generateDynamicSitemap() {
    try {
        const urls = [];
        const baseUrl = 'https://digital-craft-tbilisi.netlify.app';
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Add main pages
        urls.push({
            loc: baseUrl,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '1.0',
            hreflang: [
                { lang: 'en', href: `${baseUrl}/en/` },
                { lang: 'ka', href: `${baseUrl}/ka/` },
                { lang: 'ua', href: `${baseUrl}/ua/` },
                { lang: 'ru', href: `${baseUrl}/ru/` }
            ]
        });
        
        // Add language-specific home pages
        ['en', 'ka', 'ua', 'ru'].forEach(lang => {
            urls.push({
                loc: `${baseUrl}/${lang}/`,
                lastmod: currentDate,
                changefreq: 'weekly',
                priority: '0.9',
                hreflang: [
                    { lang: 'en', href: `${baseUrl}/en/` },
                    { lang: 'ka', href: `${baseUrl}/ka/` },
                    { lang: 'ua', href: `${baseUrl}/ua/` },
                    { lang: 'ru', href: `${baseUrl}/ru/` }
                ]
            });
        });
        
        // Add section anchors
        ['services', 'portfolio', 'blog', 'contact'].forEach(section => {
            urls.push({
                loc: `${baseUrl}/#${section}`,
                lastmod: currentDate,
                changefreq: 'monthly',
                priority: '0.8'
            });
        });
        
        // Fetch services from Firebase
        const servicesSnapshot = await db.collection('services').get();
        servicesSnapshot.forEach(doc => {
            const service = doc.data();
            if (service.urlSlug && service.lang) {
                urls.push({
                    loc: `${baseUrl}/${service.lang}/services/${service.urlSlug}`,
                    lastmod: service.dateModified || currentDate,
                    changefreq: 'monthly',
                    priority: '0.7',
                    hreflang: [
                        { lang: service.lang, href: `${baseUrl}/${service.lang}/services/${service.urlSlug}` }
                    ]
                });
            }
        });
        
        // Fetch portfolio items from Firebase
        const portfolioSnapshot = await db.collection('portfolio').get();
        portfolioSnapshot.forEach(doc => {
            const portfolio = doc.data();
            if (portfolio.urlSlug && portfolio.lang) {
                urls.push({
                    loc: `${baseUrl}/${portfolio.lang}/portfolio/${portfolio.urlSlug}`,
                    lastmod: portfolio.dateModified || currentDate,
                    changefreq: 'monthly',
                    priority: '0.7',
                    hreflang: [
                        { lang: portfolio.lang, href: `${baseUrl}/${portfolio.lang}/portfolio/${portfolio.urlSlug}` }
                    ]
                });
            }
        });
        
        // Fetch blog posts from Firebase
        const blogSnapshot = await db.collection('blog').get();
        blogSnapshot.forEach(doc => {
            const blog = doc.data();
            if (blog.urlSlug && blog.lang) {
                urls.push({
                    loc: `${baseUrl}/${blog.lang}/blog/${blog.urlSlug}`,
                    lastmod: blog.dateModified || blog.datePublished || currentDate,
                    changefreq: 'weekly',
                    priority: '0.6',
                    hreflang: [
                        { lang: blog.lang, href: `${baseUrl}/${blog.lang}/blog/${blog.urlSlug}` }
                    ]
                });
            }
        });
        
        // Generate XML
        const sitemapXML = generateSitemapXML(urls);
        
        // Return the XML string
        return sitemapXML;
        
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return null;
    }
}

// Function to download sitemap
function downloadSitemap(xmlContent, filename = 'sitemap.xml') {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Export functions for use in other scripts
window.sitemapGenerator = {
    generateDynamicSitemap,
    downloadSitemap,
    generateSitemapXML
};

// Auto-generate sitemap if this script is loaded in admin panel
if (window.location.pathname.includes('admin')) {
    // Generate sitemap when admin panel loads
    window.addEventListener('load', async () => {
        const sitemap = await generateDynamicSitemap();
        if (sitemap) {
            console.log('Dynamic sitemap generated successfully');
            // You can save this to a file or send to server
        }
    });
}