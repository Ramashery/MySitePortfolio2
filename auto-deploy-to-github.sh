#!/bin/bash

# 🚀 АВТОМАТИЧЕСКАЯ ОТПРАВКА В GITHUB
# Автор: Digital Craft Team
# Версия: 2.0.0 - Полная автоматизация

set -e

# Цвета для красивого вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функции для красивого вывода
print_header() {
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "🚀 АВТОМАТИЧЕСКАЯ ОТПРАВКА В GITHUB"
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

# Проверка Git репозитория
check_git_repo() {
    print_step "Проверяю Git репозиторий..."
    
    if [ ! -d ".git" ]; then
        print_error "Это не Git репозиторий!"
        print_info "Инициализирую Git..."
        git init
        print_success "Git инициализирован"
    else
        print_success "Git репозиторий найден"
    fi
    
    # Проверяем remote
    if ! git remote get-url origin &> /dev/null; then
        print_warning "Remote origin не настроен!"
        print_info "Пожалуйста, настройте remote вручную:"
        echo "git remote add origin <URL_ВАШЕГО_РЕПОЗИТОРИЯ>"
        echo ""
        print_info "После настройки запустите скрипт снова!"
        exit 1
    fi
    
    print_success "Remote origin настроен"
}

# Получение текущей ветки
get_current_branch() {
    git branch --show-current
}

# Создание новой ветки
create_feature_branch() {
    local branch_name="update-seo-features"
    local current_branch=$(get_current_branch)
    
    print_step "Создаю новую ветку: $branch_name"
    
    # Проверяем, не находимся ли мы уже в нужной ветке
    if [ "$current_branch" = "$branch_name" ]; then
        print_info "Уже находимся в ветке $branch_name"
        return 0
    fi
    
    # Создаем новую ветку
    git checkout -b "$branch_name"
    print_success "Ветка $branch_name создана и активирована"
}

# Проверка статуса Git
check_git_status() {
    print_step "Проверяю статус Git..."
    
    local status=$(git status --porcelain)
    
    if [ -z "$status" ]; then
        print_warning "Нет изменений для коммита!"
        print_info "Все файлы уже закоммичены"
        return 1
    fi
    
    print_success "Найдены изменения для коммита:"
    echo "$status"
    return 0
}

# Добавление всех изменений
add_all_changes() {
    print_step "Добавляю все изменения в Git..."
    
    git add .
    print_success "Все изменения добавлены в staging area"
}

# Создание коммита
create_commit() {
    local commit_message="🚀 Добавлена автоматическая SEO система с пререндерингом

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

🚀 Готово к автоматическому развертыванию!"
    
    print_step "Создаю коммит с подробным описанием..."
    
    git commit -m "$commit_message"
    print_success "Коммит создан успешно"
}

# Отправка ветки в GitHub
push_to_github() {
    local branch_name="update-seo-features"
    
    print_step "Отправляю ветку $branch_name в GitHub..."
    
    git push origin "$branch_name"
    print_success "Ветка отправлена в GitHub"
}

# Создание Pull Request
create_pull_request() {
    local branch_name="update-seo-features"
    local current_branch=$(get_current_branch)
    
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
    echo ""
    print_info "💡 Или перейдите в GitHub → Pull requests → New pull request"
}

# Проверка результата
verify_result() {
    print_step "Проверяю результат операции..."
    
    local branch_name="update-seo-features"
    local current_branch=$(get_current_branch)
    
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
    print_success "🎉 АВТОМАТИЧЕСКАЯ ОТПРАВКА ЗАВЕРШЕНА!"
    echo ""
    print_info "📋 Следующие шаги:"
    echo "  1. 🔗 Откройте ссылку на Pull Request выше"
    echo "  2. 📝 Нажмите 'Create pull request'"
    echo "  3. ✅ Нажмите 'Merge pull request'"
    echo "  4. 🚀 GitHub Actions автоматически развернет изменения"
    echo ""
    print_info "📱 После мержа:"
    echo "  - Сайт автоматически обновится через 2-5 минут"
    echo "  - SEO система будет работать автоматически"
    echo "  - Изменения будут применяться при каждом push"
    echo ""
    print_info "🔍 Проверить статус:"
    echo "  - GitHub Actions: вкладка Actions в репозитории"
    echo "  - Netlify: панель управления сайтом"
    echo "  - Сайт: обновится автоматически"
}

# Основная функция
main() {
    print_header
    
    print_info "Начинаю автоматическую отправку в GitHub..."
    echo ""
    
    # Выполняем все шаги
    check_git_repo
    create_feature_branch
    check_git_status || {
        print_warning "Нет изменений для отправки!"
        print_info "Все файлы уже закоммичены и отправлены"
        exit 0
    }
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