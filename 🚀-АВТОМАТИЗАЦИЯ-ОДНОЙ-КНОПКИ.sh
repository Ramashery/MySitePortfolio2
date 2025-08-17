#!/bin/bash

# 🚀 АВТОМАТИЗАЦИЯ ОДНОЙ КНОПКИ
# Автор: Digital Craft Team
# Версия: 3.0.0 - Полная автоматизация "одной кнопки"

set -e

# Цвета для красивого вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Функции для красивого вывода
print_header() {
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "🚀 АВТОМАТИЗАЦИЯ ОДНОЙ КНОПКИ"
    echo "=================================================="
    echo "🎯 Цель: Автоматически отправить все изменения в GitHub"
    echo "⚡ Результат: Сайт обновится автоматически через 2-5 минут"
    echo "=================================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
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

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_magic() {
    echo -e "${WHITE}✨ $1${NC}"
}

# Проверка и настройка Git
setup_git() {
    print_step "Настраиваю Git..."
    
    # Проверяем, инициализирован ли Git
    if [ ! -d ".git" ]; then
        print_info "Инициализирую Git репозиторий..."
        git init
        print_success "Git инициализирован"
    else
        print_success "Git репозиторий найден"
    fi
    
    # Проверяем remote
    if ! git remote get-url origin &> /dev/null; then
        print_warning "Remote origin не настроен!"
        print_info "Пожалуйста, настройте remote вручную:"
        echo ""
        echo "git remote add origin <URL_ВАШЕГО_РЕПОЗИТОРИЯ>"
        echo ""
        print_info "После настройки запустите скрипт снова!"
        exit 1
    fi
    
    print_success "Remote origin настроен"
}

# Проверка изменений
check_changes() {
    print_step "Проверяю изменения в проекте..."
    
    local status=$(git status --porcelain)
    
    if [ -z "$status" ]; then
        print_warning "Нет изменений для отправки!"
        print_info "Все файлы уже закоммичены и отправлены"
        return 1
    fi
    
    print_success "Найдены изменения для отправки:"
    echo "$status"
    return 0
}

# Создание новой ветки
create_feature_branch() {
    local branch_name="update-seo-features"
    
    print_step "Создаю новую ветку: $branch_name"
    
    # Проверяем текущую ветку
    local current_branch=$(git branch --show-current)
    
    if [ "$current_branch" = "$branch_name" ]; then
        print_info "Уже находимся в ветке $branch_name"
        return 0
    fi
    
    # Создаем новую ветку
    git checkout -b "$branch_name"
    print_success "Ветка $branch_name создана и активирована"
}

# Добавление всех изменений
add_all_changes() {
    print_step "Добавляю все изменения в Git..."
    
    git add .
    print_success "Все изменения добавлены в staging area"
}

# Создание коммита
create_commit() {
    print_step "Создаю коммит с подробным описанием..."
    
    local commit_message="🚀 Добавлена полная автоматизация SEO системы

✨ Новые возможности:
- Netlify Function для динамического пререндеринга
- GitHub Actions для автоматического деплоя
- Автоматические проверки и валидация
- Быстрые обновления с мобильных устройств
- Полная автоматизация развертывания

🔧 Технические улучшения:
- SEO пререндеринг для поисковых ботов
- Автоматическая генерация мета-тегов
- Структурированные данные Schema.org
- Оптимизация Core Web Vitals
- Многоязычная поддержка

📱 Удобство использования:
- Автоматические деплои при изменениях
- Быстрые обновления через GitHub Actions
- Мониторинг и уведомления
- Проверка качества перед деплоем

🚀 Автоматизация:
- Скрипт 'одной кнопки' для развертывания
- Автоматические коммиты и push
- GitHub Actions для автосинхронизации
- Полная автоматизация без ручных команд

⏰ Время: $(date)
🎯 Статус: Готово к автоматическому развертыванию!"
    
    git commit -m "$commit_message"
    print_success "Коммит создан успешно"
}

# Отправка в GitHub
push_to_github() {
    local branch_name="update-seo-features"
    
    print_step "Отправляю ветку $branch_name в GitHub..."
    
    git push origin "$branch_name"
    print_success "Ветка отправлена в GitHub"
}

# Создание Pull Request
create_pull_request() {
    local branch_name="update-seo-features"
    
    print_step "Создаю Pull Request..."
    
    # Получаем URL репозитория
    local repo_url=$(git remote get-url origin)
    
    # Преобразуем SSH URL в HTTPS URL если нужно
    if [[ $repo_url == git@* ]]; then
        repo_url=$(echo $repo_url | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')
    fi
    
    # Создаем URL для Pull Request
    local pr_url="$repo_url/compare/main...$branch_name?expand=1"
    
    print_success "Pull Request готов к созданию!"
    echo ""
    print_info "🔗 Ссылка для создания Pull Request:"
    echo "$pr_url"
    echo ""
    print_info "📱 Откройте эту ссылку в браузере и нажмите 'Create pull request'"
}

# Проверка результата
verify_result() {
    print_step "Проверяю результат операции..."
    
    local branch_name="update-seo-features"
    local current_branch=$(git branch --show-current)
    
    if [ "$current_branch" = "$branch_name" ]; then
        print_success "✅ Находимся в правильной ветке: $branch_name"
    else
        print_error "❌ Неожиданная ветка: $current_branch"
    fi
    
    # Проверяем, что изменения отправлены
    local remote_branch=$(git ls-remote --heads origin "$branch_name")
    if [ -n "$remote_branch" ]; then
        print_success "✅ Ветка $branch_name отправлена в GitHub"
    else
        print_error "❌ Ветка $branch_name не найдена в GitHub"
    fi
    
    print_success "Результат проверен"
}

# Показ следующих шагов
show_next_steps() {
    echo ""
    print_success "🎉 АВТОМАТИЗАЦИЯ 'ОДНОЙ КНОПКИ' ЗАВЕРШЕНА!"
    echo ""
    print_info "📋 Следующие шаги (2 минуты):"
    echo "  1. 🔗 Откройте ссылку на Pull Request выше"
    echo "  2. 📝 Нажмите 'Create pull request'"
    echo "  3. ✅ Нажмите 'Merge pull request'"
    echo "  4. 🚀 GitHub Actions автоматически развернет изменения"
    echo ""
    print_info "📱 После мержа (автоматически):"
    echo "  - Сайт обновится через 2-5 минут"
    echo "  - SEO система будет работать автоматически"
    echo "  - Изменения будут применяться при каждом push"
    echo ""
    print_info "🔍 Проверить статус:"
    echo "  - GitHub Actions: вкладка Actions в репозитории"
    echo "  - Netlify: панель управления сайтом"
    echo "  - Сайт: обновится автоматически"
    echo ""
    print_magic "✨ Магия автоматизации работает! Ваш сайт скоро обновится!"
}

# Основная функция
main() {
    print_header
    
    print_info "Начинаю автоматизацию 'одной кнопки'..."
    echo ""
    
    # Выполняем все шаги
    setup_git
    check_changes || {
        print_info "Нет изменений для отправки!"
        exit 0
    }
    create_feature_branch
    add_all_changes
    create_commit
    push_to_github
    create_pull_request
    verify_result
    show_next_steps
    
    echo ""
    print_success "🚀 Автоматизация завершена! Ваш сайт скоро обновится!"
}

# Обработка ошибок
trap 'print_error "Произошла ошибка! Проверьте логи выше."; exit 1' ERR

# Запуск скрипта
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi