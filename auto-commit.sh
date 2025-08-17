#!/bin/bash

# 🔄 АВТОМАТИЧЕСКИЕ КОММИТЫ И PUSH
# Автор: Digital Craft Team
# Версия: 1.0.0 - Автоматизация коммитов

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функции для вывода
print_header() {
    echo -e "${PURPLE}"
    echo "=================================================="
    echo "🔄 АВТОМАТИЧЕСКИЕ КОММИТЫ И PUSH"
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

# Проверка Git статуса
check_git_status() {
    print_step "Проверяю Git статус..."
    
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

# Автоматическое определение типа изменений
detect_change_type() {
    print_step "Определяю тип изменений..."
    
    local js_changes=$(git diff --name-only --cached | grep -E '\.js$' | wc -l)
    local html_changes=$(git diff --name-only --cached | grep -E '\.html$' | wc -l)
    local css_changes=$(git diff --name-only --cached | grep -E '\.css$' | wc -l)
    local config_changes=$(git diff --name-only --cached | grep -E '\.(toml|yml|yaml|json)$' | wc -l)
    local workflow_changes=$(git diff --name-only --cached | grep -E 'workflows/' | wc -l)
    
    local change_type="update"
    local emoji="🔄"
    local description="Обновление"
    
    if [ $workflow_changes -gt 0 ]; then
        change_type="workflow"
        emoji="⚙️"
        description="Обновление рабочих процессов"
    elif [ $js_changes -gt 0 ] && [ $html_changes -gt 0 ]; then
        change_type="feature"
        emoji="✨"
        description="Новая функциональность"
    elif [ $js_changes -gt 0 ]; then
        change_type="js"
        emoji="🔧"
        description="Обновление JavaScript"
    elif [ $html_changes -gt 0 ]; then
        change_type="html"
        emoji="📄"
        description="Обновление HTML"
    elif [ $css_changes -gt 0 ]; then
        change_type="css"
        emoji="🎨"
        description="Обновление стилей"
    elif [ $config_changes -gt 0 ]; then
        change_type="config"
        emoji="⚙️"
        description="Обновление конфигурации"
    fi
    
    echo "change_type=$change_type" >> $GITHUB_OUTPUT
    echo "emoji=$emoji" >> $GITHUB_OUTPUT
    echo "description=$description" >> $GITHUB_OUTPUT
    
    print_success "Тип изменений: $description ($emoji)"
}

# Генерация сообщения коммита
generate_commit_message() {
    local change_type="$1"
    local emoji="$2"
    local description="$3"
    
    case $change_type in
        "workflow")
            echo "$emoji $description - Автоматизация и CI/CD"
            ;;
        "feature")
            echo "$emoji $description - Новые возможности и улучшения"
            ;;
        "js")
            echo "$emoji $description - JavaScript функциональность"
            ;;
        "html")
            echo "$emoji $description - HTML структура и контент"
            ;;
        "css")
            echo "$emoji $description - Стили и дизайн"
            ;;
        "config")
            echo "$emoji $description - Конфигурация и настройки"
            ;;
        *)
            echo "$emoji $description - Обновления и улучшения"
            ;;
    esac
}

# Создание коммита
create_commit() {
    local change_type="$1"
    local emoji="$2"
    local description="$3"
    
    print_step "Создаю коммит..."
    
    # Генерируем сообщение
    local commit_message=$(generate_commit_message "$change_type" "$emoji" "$description")
    
    # Добавляем детали
    commit_message="$commit_message

📝 Детали изменений:
$(git diff --name-only --cached | sed 's/^/- /')

⏰ Время: $(date)
🚀 Автоматический коммит"
    
    # Создаем коммит
    git commit -m "$commit_message"
    print_success "Коммит создан: $commit_message"
}

# Автоматический push
auto_push() {
    local current_branch=$(git branch --show-current)
    
    print_step "Отправляю изменения в GitHub..."
    
    # Проверяем, есть ли remote
    if ! git remote get-url origin &> /dev/null; then
        print_error "Remote origin не настроен!"
        print_info "Настройте remote: git remote add origin <URL>"
        return 1
    fi
    
    # Отправляем изменения
    git push origin "$current_branch"
    print_success "Изменения отправлены в GitHub"
}

# Проверка результата
verify_result() {
    print_step "Проверяю результат..."
    
    local current_branch=$(git branch --show-current)
    local last_commit=$(git log -1 --oneline)
    
    print_success "✅ Коммит создан: $last_commit"
    print_success "✅ Ветка: $current_branch"
    
    # Проверяем, что изменения отправлены
    if git ls-remote --heads origin "$current_branch" | grep -q "$current_branch"; then
        print_success "✅ Изменения отправлены в GitHub"
    else
        print_warning "⚠️ Изменения могут быть не отправлены"
    fi
}

# Показ следующих шагов
show_next_steps() {
    echo ""
    print_success "🎉 АВТОМАТИЧЕСКИЙ КОММИТ ЗАВЕРШЕН!"
    echo ""
    print_info "📋 Что произошло:"
    echo "  ✅ Изменения добавлены в Git"
    echo "  ✅ Коммит создан автоматически"
    echo "  ✅ Изменения отправлены в GitHub"
    echo ""
    print_info "🚀 Что будет дальше:"
    echo "  - GitHub Actions автоматически запустится"
    echo "  - Сайт обновится через 2-5 минут"
    echo "  - SEO система будет работать автоматически"
    echo ""
    print_info "🔍 Проверить статус:"
    echo "  - GitHub Actions: вкладка Actions"
    echo "  - Netlify: панель управления"
    echo "  - Сайт: обновится автоматически"
}

# Основная функция
main() {
    print_header
    
    print_info "Начинаю автоматический коммит и push..."
    echo ""
    
    # Проверяем статус
    if ! check_git_status; then
        print_info "Нет изменений для коммита"
        exit 0
    fi
    
    # Добавляем все изменения
    print_step "Добавляю все изменения..."
    git add .
    print_success "Все изменения добавлены"
    
    # Определяем тип изменений
    detect_change_type
    
    # Создаем коммит
    create_commit "$change_type" "$emoji" "$description"
    
    # Отправляем в GitHub
    auto_push
    
    # Проверяем результат
    verify_result
    
    # Показываем следующие шаги
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