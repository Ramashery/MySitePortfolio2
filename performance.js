// Performance optimization and Core Web Vitals improvements

// Lazy loading для изображений
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Preload критических ресурсов
function preloadCriticalResources() {
    const criticalResources = [
        '/styles.css',
        '/main.js'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
}

// Оптимизация загрузки шрифтов
function optimizeFontLoading() {
    if ('fonts' in document) {
        // Preload шрифты
        const font = new FontFace('Inter', 'url(https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap)');
        font.load().then(() => {
            document.fonts.add(font);
        });
    }
}

// Оптимизация Core Web Vitals
function optimizeCoreWebVitals() {
    // LCP (Largest Contentful Paint) optimization
    let lcpElement = null;
    let lcpValue = 0;

    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            if (entry.identifier === 'largest-contentful-paint') {
                lcpValue = entry.startTime;
                lcpElement = entry.element;
                
                // Если LCP больше 2.5 секунд, показываем предупреждение
                if (lcpValue > 2500) {
                    console.warn('LCP is too slow:', lcpValue + 'ms');
                }
            }
        });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay) optimization
    let firstInputTime = 0;
    let firstInputDelay = 0;

    const inputObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            if (entry.processingStart > 0) {
                firstInputDelay = entry.processingStart - entry.startTime;
                firstInputTime = entry.startTime;
                
                // Если FID больше 100ms, показываем предупреждение
                if (firstInputDelay > 100) {
                    console.warn('FID is too slow:', firstInputDelay + 'ms');
                }
            }
        });
    });

    inputObserver.observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift) optimization
    let clsValue = 0;
    let clsEntries = [];

    const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
                clsEntries.push(entry);
            }
        }
        
        // Если CLS больше 0.1, показываем предупреждение
        if (clsValue > 0.1) {
            console.warn('CLS is too high:', clsValue);
        }
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
}

// Оптимизация загрузки изображений
function optimizeImageLoading() {
    // Добавляем loading="lazy" для всех изображений
    document.querySelectorAll('img').forEach(img => {
        if (!img.loading) {
            img.loading = 'lazy';
        }
        
        // Добавляем атрибуты для лучшего SEO
        if (!img.alt) {
            img.alt = 'Digital Craft content';
        }
    });
}

// Оптимизация загрузки CSS
function optimizeCSSLoading() {
    // Критический CSS уже встроен в HTML
    // Асинхронная загрузка основного CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles.css';
    link.media = 'print';
    link.onload = () => {
        link.media = 'all';
    };
    document.head.appendChild(link);
}

// Оптимизация загрузки JavaScript
function optimizeJavaScriptLoading() {
    // Основной скрипт уже загружается с type="module"
    // Добавляем preload для критических скриптов
    const script = document.createElement('link');
    script.rel = 'preload';
    script.href = '/main.js';
    script.as = 'script';
    document.head.appendChild(script);
}

// Инициализация всех оптимизаций
function initPerformanceOptimizations() {
    // Запускаем оптимизации после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLazyLoading();
            optimizeCoreWebVitals();
            optimizeImageLoading();
        });
    } else {
        initLazyLoading();
        optimizeCoreWebVitals();
        optimizeImageLoading();
    }

    // Запускаем оптимизации после полной загрузки страницы
    window.addEventListener('load', () => {
        preloadCriticalResources();
        optimizeFontLoading();
        optimizeCSSLoading();
        optimizeJavaScriptLoading();
    });
}

// Запускаем оптимизации
initPerformanceOptimizations();

// Экспортируем функции для использования в других модулях
window.performanceOptimizations = {
    initLazyLoading,
    optimizeCoreWebVitals,
    optimizeImageLoading,
    preloadCriticalResources
};