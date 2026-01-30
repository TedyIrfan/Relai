#!/bin/bash
# ============================================
# RelAI - Development Helper Script
# ============================================
#
# Usage:
#   ./dev.sh            - Start all containers
#   ./dev.sh stop       - Stop all containers
#   ./dev.sh restart    - Restart all containers
#   ./dev.sh logs       - View logs
#   ./dev.sh migrate    - Run migrations
#   ./dev.sh seed       - Run seeder
#   ./dev.sh artisan    - Run artisan command
#   ./dev.sh bash       - Enter app container
#   ./dev.sh test       - Run tests
#   ./dev.sh fresh      - Fresh migrate + seed
#   ./dev.sh build      - Rebuild containers
# ============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Command functions
start() {
    print_header "Starting RelAI Development Containers"
    check_docker
    docker-compose up -d
    print_success "Containers started!"
    echo ""
    echo "Frontend: http://localhost:8000"
    echo "PgAdmin: http://localhost:5050"
}

stop() {
    print_header "Stopping RelAI Containers"
    docker-compose down
    print_success "Containers stopped!"
}

restart() {
    print_header "Restarting RelAI Containers"
    check_docker
    docker-compose restart
    print_success "Containers restarted!"
}

logs() {
    print_header "Following logs (Ctrl+C to exit)"
    docker-compose logs -f
}

migrate() {
    print_header "Running Migrations"
    docker-compose exec app php artisan migrate
}

seed() {
    print_header "Running Database Seeder"
    docker-compose exec app php artisan db:seed
}

artisan() {
    if [ -z "$2" ]; then
        print_error "Usage: ./dev.sh artisan [command]"
        echo "Example: ./dev.sh artisan route:list"
        exit 1
    fi
    docker-compose exec app php artisan "${@:2}"
}

bash() {
    print_header "Entering App Container"
    echo "Type 'exit' to return to host"
    docker-compose exec app bash
}

test() {
    print_header "Running Tests"
    docker-compose exec app php artisan test
}

fresh() {
    print_header "Fresh Migration + Seed"
    print_warning "This will wipe all data!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose exec app php artisan migrate:fresh --seed
    else
        print_warning "Aborted."
    fi
}

build() {
    print_header "Rebuilding Containers"
    docker-compose down
    docker-compose up -d --build
    print_success "Containers rebuilt!"
}

status() {
    print_header "Container Status"
    docker-compose ps
}

help() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}RelAI Development Helper${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all containers"
    echo "  stop        - Stop all containers"
    echo "  restart     - Restart all containers"
    echo "  logs        - View logs"
    echo "  migrate     - Run migrations"
    echo "  seed        - Run database seeder"
    echo "  artisan     - Run artisan command"
    echo "  bash        - Enter app container shell"
    echo "  test        - Run tests"
    echo "  fresh       - Fresh migrate + seed (WARNING: wipes data!)"
    echo "  build       - Rebuild containers"
    echo "  status      - Show container status"
    echo "  help        - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh                  - Start containers"
    echo "  ./dev.sh migrate          - Run migrations"
    echo "  ./dev.sh seed             - Run seeder"
    echo "  ./dev.sh artisan route:list"
    echo "  ./dev.sh bash             - Enter container shell"
    echo ""
}

# Main command router
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    migrate)
        migrate
        ;;
    seed)
        seed
        ;;
    artisan)
        artisan "$@"
        ;;
    bash)
        bash
        ;;
    test)
        test
        ;;
    fresh)
        fresh
        ;;
    build)
        build
        ;;
    status)
        status
        ;;
    help|--help|-h)
        help
        ;;
    "")
        start
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac
