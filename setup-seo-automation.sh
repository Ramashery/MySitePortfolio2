#!/bin/bash

# 🚀 Автоматическая настройка SEO пререндеринга
# Автор: Digital Craft Team
# Версия: 1.0.0

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "🚀 НАСТРОЙКА SEO АВТОМАТИЗАЦИИ"
    echo "=================================="
    echo -e "${NC}"
}

# Проверка зависимостей
check_dependencies() {
    print_info "Проверяю зависимости..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git не установлен. Установите Git и попробуйте снова."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_warning "Node.js не установлен. Устанавливаю..."
        # Здесь можно добавить автоматическую установку Node.js
        print_error "Установите Node.js вручную с https://nodejs.org"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm не установлен. Установите npm и попробуйте снова."
        exit 1
    fi
    
    print_success "Все зависимости проверены"
}

# Создание структуры папок
create_structure() {
    print_info "Создаю структуру папок..."
    
    mkdir -p netlify/functions
    mkdir -p .github/workflows
    
    print_success "Структура папок создана"
}

# Установка зависимостей
install_dependencies() {
    print_info "Устанавливаю зависимости..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Зависимости установлены"
    else
        print_error "package.json не найден"
        exit 1
    fi
}

# Проверка Git репозитория
check_git_repo() {
    print_info "Проверяю Git репозиторий..."
    
    if [ ! -d ".git" ]; then
        print_error "Это не Git репозиторий. Инициализируйте Git и попробуйте снова."
        exit 1
    fi
    
    # Проверяем remote
    if ! git remote get-url origin &> /dev/null; then
        print_warning "Remote origin не настроен. Настройте remote и попробуйте снова."
        print_info "Команда: git remote add origin <URL_ВАШЕГО_РЕПОЗИТОРИЯ>"
        exit 1
    fi
    
    print_success "Git репозиторий проверен"
}

# Создание .gitignore
create_gitignore() {
    print_info "Создаю .gitignore..."
    
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log

# Netlify
.netlify/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
EOF
        print_success ".gitignore создан"
    else
        print_info ".gitignore уже существует"
    fi
}

# Проверка файлов
check_files() {
    print_info "Проверяю наличие необходимых файлов..."
    
    local missing_files=()
    
    if [ ! -f "netlify/functions/renderer.js" ]; then
        missing_files+=("netlify/functions/renderer.js")
    fi
    
    if [ ! -f "netlify.toml" ]; then
        missing_files+=("netlify.toml")
    fi
    
    if [ ! -f "package.json" ]; then
        missing_files+=("package.json")
    fi
    
    if [ ! -f ".github/workflows/auto-deploy-seo.yml" ]; then
        missing_files+=(".github/workflows/auto-deploy-seo.yml")
    fi
    
    if [ ! -f ".github/workflows/quick-seo-update.yml" ]; then
        missing_files+=(".github/workflows/quick-seo-update.yml")
    fi
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_success "Все необходимые файлы найдены"
    else
        print_error "Отсутствуют файлы:"
        for file in "${missing_files[@]}"; do
            print_error "  - $file"
        done
        exit 1
    fi
}

# Настройка Git hooks
setup_git_hooks() {
    print_info "Настраиваю Git hooks..."
    
    # Создаем pre-commit hook для проверки
    mkdir -p .git/hooks
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Проверяю SEO систему перед коммитом..."

# Проверяем наличие ключевых файлов
if [ ! -f "netlify/functions/renderer.js" ]; then
    echo "❌ netlify/functions/renderer.js не найден"
    exit 1
fi

if [ ! -f "netlify.toml" ]; then
    echo "❌ netlify.toml не найден"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json не найден"
    exit 1
fi

echo "✅ SEO система проверена"
EOF
    
    chmod +x .git/hooks/pre-commit
    print_success "Git hooks настроены"
}

# Финальная проверка
final_check() {
    print_info "Выполняю финальную проверку..."
    
    # Проверяем структуру
    if [ -d "netlify/functions" ] && [ -f "netlify/functions/renderer.js" ]; then
        print_success "✅ Netlify Functions настроены"
    else
        print_error "❌ Netlify Functions не настроены"
    fi
    
    # Проверяем GitHub Actions
    if [ -d ".github/workflows" ] && [ -f ".github/workflows/auto-deploy-seo.yml" ]; then
        print_success "✅ GitHub Actions настроены"
    else
        print_error "❌ GitHub Actions не настроены"
    fi
    
    # Проверяем зависимости
    if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
        print_success "✅ Зависимости установлены"
    else
        print_error "❌ Зависимости не установлены"
    fi
    
    print_success "Финальная проверка завершена"
}

# Основная функция
main() {
    print_header
    
    print_info "Начинаю автоматическую настройку SEO системы..."
    
    check_dependencies
    create_structure
    check_git_repo
    create_gitignore
    check_files
    install_dependencies
    setup_git_hooks
    final_check
    
    echo ""
    print_success "🎉 АВТОМАТИЧЕСКАЯ НАСТРОЙКА ЗАВЕРШЕНА!"
    echo ""
    print_info "📋 Следующие шаги:"
    echo "  1. Настройте Firebase Service Account (см. FIREBASE-SETUP.md)"
    echo "  2. Добавьте переменную FIREBASE_SERVICE_ACCOUNT_JSON в Netlify"
    echo "  3. Отправьте изменения в GitHub:"
    echo "     git add ."
    echo "     git commit -m '🚀 Добавлена SEO система'"
    echo "     git push origin main"
    echo ""
    print_info "📱 Для быстрого обновления используйте GitHub Actions"
    print_info "🌐 Сайт будет автоматически обновляться при изменениях"
    
    echo ""
    print_success "🚀 SEO система готова к работе!"
}

# Запуск скрипта
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi