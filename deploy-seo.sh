#!/bin/bash

# 🚀 Развертывание SEO пререндеринга
# Автор: Digital Craft Team
# Версия: 1.0.0

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции для вывода
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo "=================================="
    echo "🚀 РАЗВЕРТЫВАНИЕ SEO ПРЕРЕНДЕРИНГА"
    echo "=================================="
}

# Проверка Git
check_git() {
    print_step "Проверяю Git репозиторий..."
    
    if [ ! -d ".git" ]; then
        print_warning "Git не инициализирован!"
        git init
        print_success "Git инициализирован"
    else
        print_success "Git репозиторий найден"
    fi
}

# Установка зависимостей
install_deps() {
    print_step "Устанавливаю зависимости..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Зависимости установлены"
    else
        print_warning "package.json не найден"
    fi
}

# Проверка файлов
check_files() {
    print_step "Проверяю файлы..."
    
    local missing_files=()
    
    if [ ! -f "netlify/functions/seo-renderer.js" ]; then
        missing_files+=("netlify/functions/seo-renderer.js")
    fi
    
    if [ ! -f "netlify.toml" ]; then
        missing_files+=("netlify.toml")
    fi
    
    if [ ! -f "package.json" ]; then
        missing_files+=("package.json")
    fi
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_success "Все файлы на месте"
    else
        print_warning "Отсутствуют файлы:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
    fi
}

# Создание коммита
create_commit() {
    print_step "Создаю коммит..."
    
    git add .
    git commit -m "🚀 Добавлен SEO пререндеринг для поисковых ботов" || {
        print_warning "Нет изменений для коммита"
        return 0
    }
    
    print_success "Коммит создан"
}

# Отправка в GitHub
push_to_github() {
    print_step "Отправляю в GitHub..."
    
    if git remote get-url origin &> /dev/null; then
        git push origin main
        print_success "Изменения отправлены в GitHub"
    else
        print_warning "Remote origin не настроен"
        echo "Настройте remote: git remote add origin <URL>"
    fi
}

# Показ следующих шагов
show_next_steps() {
    echo ""
    print_success "🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!"
    echo ""
    echo "📋 Следующие шаги:"
    echo "  1. Настройте Firebase Service Account (см. FIREBASE-SETUP-SEO.md)"
    echo "  2. Добавьте переменную FIREBASE_SERVICE_ACCOUNT_JSON в Netlify"
    echo "  3. Сайт автоматически обновится через 2-5 минут"
    echo ""
    echo "🎯 Результат:"
    echo "  - SEO боты получат готовый HTML"
    echo "  - Обычные пользователи - SPA как раньше"
    echo "  - Автоматическая генерация мета-тегов"
    echo "  - Улучшенное SEO без изменения дизайна"
}

# Основная функция
main() {
    print_header
    
    check_git
    install_deps
    check_files
    create_commit
    push_to_github
    show_next_steps
    
    echo ""
    print_success "🚀 SEO пререндеринг готов к работе!"
}

# Запуск скрипта
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi