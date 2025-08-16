// SEO Checker - инструмент для проверки SEO состояния сайта
// Запускайте в консоли браузера на любой странице сайта

class SEOChecker {
    constructor() {
        this.results = {
            meta: {},
            structured: {},
            performance: {},
            accessibility: {},
            recommendations: []
        };
    }

    // Проверка основных мета-тегов
    checkMetaTags() {
        const meta = {};
        
        // Title
        meta.title = document.title;
        meta.titleLength = document.title.length;
        meta.titleOptimal = document.title.length >= 30 && document.title.length <= 60;
        
        // Description
        const description = document.querySelector('meta[name="description"]');
        meta.description = description ? description.content : 'Отсутствует';
        meta.descriptionLength = meta.description.length;
        meta.descriptionOptimal = meta.description.length >= 120 && meta.description.length <= 160;
        
        // Keywords
        const keywords = document.querySelector('meta[name="keywords"]');
        meta.keywords = keywords ? keywords.content : 'Отсутствует';
        
        // Author
        const author = document.querySelector('meta[name="author"]');
        meta.author = author ? author.content : 'Отсутствует';
        
        // Robots
        const robots = document.querySelector('meta[name="robots"]');
        meta.robots = robots ? robots.content : 'Отсутствует';
        
        // Canonical
        const canonical = document.querySelector('link[rel="canonical"]');
        meta.canonical = canonical ? canonical.href : 'Отсутствует';
        
        this.results.meta = meta;
        return meta;
    }

    // Проверка Open Graph тегов
    checkOpenGraph() {
        const og = {};
        const ogTags = document.querySelectorAll('meta[property^="og:"]');
        
        ogTags.forEach(tag => {
            const property = tag.getAttribute('property');
            const content = tag.content;
            og[property] = content;
        });
        
        // Проверяем обязательные OG теги
        og.hasTitle = !!og['og:title'];
        og.hasDescription = !!og['og:description'];
        og.hasType = !!og['og:type'];
        og.hasUrl = !!og['og:url'];
        og.hasImage = !!og['og:image'];
        
        this.results.openGraph = og;
        return og;
    }

    // Проверка Twitter Card тегов
    checkTwitterCard() {
        const twitter = {};
        const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
        
        twitterTags.forEach(tag => {
            const name = tag.getAttribute('name');
            const content = tag.content;
            twitter[name] = content;
        });
        
        // Проверяем обязательные Twitter теги
        twitter.hasCard = !!twitter['twitter:card'];
        twitter.hasTitle = !!twitter['twitter:title'];
        twitter.hasDescription = !!twitter['twitter:description'];
        twitter.hasImage = !!twitter['twitter:image'];
        
        this.results.twitter = twitter;
        return twitter;
    }

    // Проверка структурированных данных
    checkStructuredData() {
        const structured = {};
        const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
        
        structured.count = schemaScripts.length;
        structured.schemas = [];
        
        schemaScripts.forEach((script, index) => {
            try {
                const data = JSON.parse(script.textContent);
                structured.schemas.push({
                    index,
                    type: data['@type'],
                    valid: true
                });
            } catch (e) {
                structured.schemas.push({
                    index,
                    type: 'Unknown',
                    valid: false,
                    error: e.message
                });
            }
        });
        
        this.results.structured = structured;
        return structured;
    }

    // Проверка заголовков
    checkHeadings() {
        const headings = {};
        const h1s = document.querySelectorAll('h1');
        const h2s = document.querySelectorAll('h2');
        const h3s = document.querySelectorAll('h3');
        const h4s = document.querySelectorAll('h4');
        const h5s = document.querySelectorAll('h5');
        const h6s = document.querySelectorAll('h6');
        
        headings.h1 = h1s.length;
        headings.h2 = h2s.length;
        headings.h3 = h3s.length;
        headings.h4 = h4s.length;
        headings.h5 = h5s.length;
        headings.h6 = h6s.length;
        
        // Проверяем правильность иерархии
        headings.h1Optimal = h1s.length === 1; // Должен быть только один H1
        headings.hierarchy = this.checkHeadingHierarchy();
        
        this.results.headings = headings;
        return headings;
    }

    // Проверка иерархии заголовков
    checkHeadingHierarchy() {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        let currentLevel = 0;
        let errors = [];
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level > currentLevel + 1) {
                errors.push(`Пропущен заголовок уровня ${currentLevel + 1} перед ${heading.tagName}`);
            }
            
            currentLevel = level;
        });
        
        return errors;
    }

    // Проверка изображений
    checkImages() {
        const images = {};
        const imgTags = document.querySelectorAll('img');
        
        images.count = imgTags.length;
        images.withAlt = 0;
        images.withAltText = 0;
        images.withoutAlt = 0;
        
        imgTags.forEach(img => {
            if (img.alt) {
                images.withAlt++;
                if (img.alt.trim().length > 0) {
                    images.withAltText++;
                }
            } else {
                images.withoutAlt++;
            }
        });
        
        images.altPercentage = Math.round((images.withAlt / images.count) * 100);
        
        this.results.images = images;
        return images;
    }

    // Проверка ссылок
    checkLinks() {
        const links = {};
        const linkTags = document.querySelectorAll('a');
        
        links.count = linkTags.length;
        links.internal = 0;
        links.external = 0;
        links.withTitle = 0;
        links.withoutTitle = 0;
        
        linkTags.forEach(link => {
            if (link.href.startsWith(window.location.origin) || link.href.startsWith('/')) {
                links.internal++;
            } else {
                links.external++;
            }
            
            if (link.title) {
                links.withTitle++;
            } else {
                links.withoutTitle++;
            }
        });
        
        this.results.links = links;
        return links;
    }

    // Проверка производительности
    checkPerformance() {
        const performance = {};
        
        if ('performance' in window) {
            const perf = window.performance;
            const navigation = perf.getEntriesByType('navigation')[0];
            
            if (navigation) {
                performance.loadTime = Math.round(navigation.loadEventEnd - navigation.loadEventStart);
                performance.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
                performance.firstPaint = Math.round(perf.getEntriesByType('paint')[0]?.startTime || 0);
            }
        }
        
        this.results.performance = performance;
        return performance;
    }

    // Генерация рекомендаций
    generateRecommendations() {
        const recommendations = [];
        
        // Мета-теги
        if (!this.results.meta.titleOptimal) {
            recommendations.push('Оптимизируйте длину title (рекомендуется 30-60 символов)');
        }
        
        if (!this.results.meta.descriptionOptimal) {
            recommendations.push('Оптимизируйте длину description (рекомендуется 120-160 символов)');
        }
        
        if (!this.results.meta.keywords) {
            recommendations.push('Добавьте meta keywords');
        }
        
        // Open Graph
        if (!this.results.openGraph.hasImage) {
            recommendations.push('Добавьте og:image для лучшего отображения в соцсетях');
        }
        
        // Twitter Card
        if (!this.results.twitter.hasCard) {
            recommendations.push('Добавьте twitter:card для Twitter');
        }
        
        // Структурированные данные
        if (this.results.structured.count === 0) {
            recommendations.push('Добавьте структурированные данные (Schema.org)');
        }
        
        // Заголовки
        if (!this.results.headings.h1Optimal) {
            recommendations.push('На странице должен быть только один H1 заголовок');
        }
        
        if (this.results.headings.hierarchy.length > 0) {
            recommendations.push('Исправьте иерархию заголовков: ' + this.results.headings.hierarchy.join(', '));
        }
        
        // Изображения
        if (this.results.images.altPercentage < 100) {
            recommendations.push('Добавьте alt атрибуты для всех изображений');
        }
        
        // Ссылки
        if (this.results.links.withoutTitle > 0) {
            recommendations.push('Добавьте title атрибуты для ссылок');
        }
        
        this.results.recommendations = recommendations;
        return recommendations;
    }

    // Полная проверка
    runFullCheck() {
        console.log('🔍 Запуск полной SEO проверки...');
        
        this.checkMetaTags();
        this.checkOpenGraph();
        this.checkTwitterCard();
        this.checkStructuredData();
        this.checkHeadings();
        this.checkImages();
        this.checkLinks();
        this.checkPerformance();
        this.generateRecommendations();
        
        this.displayResults();
        return this.results;
    }

    // Отображение результатов
    displayResults() {
        console.log('\n📊 РЕЗУЛЬТАТЫ SEO ПРОВЕРКИ');
        console.log('=====================================');
        
        // Мета-теги
        console.log('\n📝 МЕТА-ТЕГИ:');
        console.log(`Title: "${this.results.meta.title}" (${this.results.meta.titleLength} символов) - ${this.results.meta.titleOptimal ? '✅' : '❌'}`);
        console.log(`Description: "${this.results.meta.description}" (${this.results.meta.descriptionLength} символов) - ${this.results.meta.descriptionOptimal ? '✅' : '❌'}`);
        console.log(`Keywords: ${this.results.meta.keywords !== 'Отсутствует' ? '✅' : '❌'}`);
        console.log(`Author: ${this.results.meta.author !== 'Отсутствует' ? '✅' : '❌'}`);
        console.log(`Canonical: ${this.results.meta.canonical !== 'Отсутствует' ? '✅' : '❌'}`);
        
        // Open Graph
        console.log('\n🌐 OPEN GRAPH:');
        console.log(`Title: ${this.results.openGraph.hasTitle ? '✅' : '❌'}`);
        console.log(`Description: ${this.results.openGraph.hasDescription ? '✅' : '❌'}`);
        console.log(`Type: ${this.results.openGraph.hasType ? '✅' : '❌'}`);
        console.log(`URL: ${this.results.openGraph.hasUrl ? '✅' : '❌'}`);
        console.log(`Image: ${this.results.openGraph.hasImage ? '✅' : '❌'}`);
        
        // Twitter Card
        console.log('\n🐦 TWITTER CARD:');
        console.log(`Card: ${this.results.twitter.hasCard ? '✅' : '❌'}`);
        console.log(`Title: ${this.results.twitter.hasTitle ? '✅' : '❌'}`);
        console.log(`Description: ${this.results.twitter.hasDescription ? '✅' : '❌'}`);
        console.log(`Image: ${this.results.twitter.hasImage ? '✅' : '❌'}`);
        
        // Структурированные данные
        console.log('\n🏗️ СТРУКТУРИРОВАННЫЕ ДАННЫЕ:');
        console.log(`Количество схем: ${this.results.structured.count}`);
        this.results.structured.schemas.forEach((schema, index) => {
            console.log(`  ${index + 1}. ${schema.type} - ${schema.valid ? '✅' : '❌'}`);
        });
        
        // Заголовки
        console.log('\n📋 ЗАГОЛОВКИ:');
        console.log(`H1: ${this.results.headings.h1} ${this.results.headings.h1Optimal ? '✅' : '❌'}`);
        console.log(`H2: ${this.results.headings.h2}`);
        console.log(`H3: ${this.results.headings.h3}`);
        console.log(`H4: ${this.results.headings.h4}`);
        console.log(`H5: ${this.results.headings.h5}`);
        console.log(`H6: ${this.results.headings.h6}`);
        
        // Изображения
        console.log('\n🖼️ ИЗОБРАЖЕНИЯ:');
        console.log(`Всего: ${this.results.images.count}`);
        console.log(`С alt: ${this.results.images.withAltText} (${this.results.images.altPercentage}%)`);
        
        // Ссылки
        console.log('\n🔗 ССЫЛКИ:');
        console.log(`Всего: ${this.results.links.count}`);
        console.log(`Внутренние: ${this.results.links.internal}`);
        console.log(`Внешние: ${this.results.links.external}`);
        console.log(`С title: ${this.results.links.withTitle}`);
        
        // Рекомендации
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 РЕКОМЕНДАЦИИ:');
            this.results.recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
        } else {
            console.log('\n🎉 Все отлично! Рекомендаций нет.');
        }
        
        console.log('\n=====================================');
        console.log('SEO проверка завершена!');
    }
}

// Создаем глобальный экземпляр
window.seoChecker = new SEOChecker();

// Автоматический запуск при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 SEO Checker загружен! Используйте seoChecker.runFullCheck() для проверки.');
    });
} else {
    console.log('🚀 SEO Checker загружен! Используйте seoChecker.runFullCheck() для проверки.');
}

// Экспортируем для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOChecker;
}