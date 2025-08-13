// --- КОНФИГУРАЦИЯ FIREBASE (здесь не нужна, т.к. firebase уже инициализирован в HTML)
const db = firebase.firestore();
const auth = firebase.auth();

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let siteData = {};
const defaultLang = 'en';

// --- ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ ---
async function loadData() {
    // ... (Скопируйте сюда вашу функцию loadData)
}

// --- ФУНКЦИИ ОТОБРАЖЕНИЯ АДМИН-ПАНЕЛИ ---
function renderAdminHome() {
    // ... (Скопируйте сюда вашу функцию renderAdminHome из indexKey24.html)
}

function generateAdminItemFormHTML(item, key) {
    // ... (Скопируйте сюда вашу функцию generateAdminItemFormHTML из indexKey24.html)
}

function renderAdminSection(key) {
    // ... (Скопируйте сюда вашу функцию renderAdminSection из indexKey24.html)
}

function renderAdminPanel() {
    // Заполняем разметку, которая была пустой в admin.html
    const adminTabs = document.querySelector('.admin-tabs');
    const adminContent = document.querySelector('.admin-content');
    
    adminTabs.innerHTML = `
        <li class="admin-tab active" data-tab="home">Home Page</li>
        <li class="admin-tab" data-tab="services">Services</li>
        <li class="admin-tab" data-tab="portfolio">Portfolio</li>
        <li class="admin-tab" data-tab="blog">Blog</li>
        <li class="admin-tab" data-tab="contact">Contact</li>
    `;

    adminContent.innerHTML += `
        <div class="tab-content active" data-tab-content="home"></div>
        <div class="tab-content" data-tab-content="services"></div>
        <div class="tab-content" data-tab-content="portfolio"></div>
        <div class="tab-content" data-tab-content="blog"></div>
        <div class="tab-content" data-tab-content="contact"></div>
    `;

    // Вызываем рендер для каждой секции
    renderAdminHome();
    renderAdminSection('services');
    renderAdminSection('portfolio');
    renderAdminSection('blog');
    renderAdminSection('contact');
}

// --- ОБРАБОТЧИКИ ДЕЙСТВИЙ АДМИНА ---
async function handleAdminActions(e) {
    // ... (Скопируйте сюда вашу функцию handleAdminActions из indexKey24.html)
}

// --- ЛОГИКА АУТЕНТИФИКАЦИИ ---
function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.querySelector('.admin-container').style.display = 'flex';
}

function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.querySelector('.admin-container').style.display = 'none';
}

async function initializeAdminApp() {
    siteData = await loadData();
    renderAdminPanel();
    
    // Навешиваем все обработчики событий для админки
    document.querySelector('.admin-tabs').addEventListener('click', (e) => { /* ... */ });
    document.querySelector('.admin-content').addEventListener('click', handleAdminActions);
    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

    showAdminPanel();
}

// Следим за состоянием логина
auth.onAuthStateChanged(user => {
    if (user) {
        initializeAdminApp();
    } else {
        showLoginScreen();
    }
});

// Обработчик для формы входа
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged сам переключит на админ-панель
    } catch (error) {
        console.error("Admin login failed:", error.message);
        errorEl.textContent = "Login failed. Check email/password.";
    }
});