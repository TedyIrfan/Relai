@echo off
REM ============================================
REM RelAI - Development Helper Script
REM ============================================
REM
REM Usage:
REM   dev.bat            - Start all containers
REM   dev.bat stop       - Stop all containers
REM   dev.bat restart    - Restart all containers
REM   dev.bat logs       - View logs
REM   dev.bat migrate    - Run migrations
REM   dev.bat seed       - Run seeder
REM   dev.bat artisan    - Run artisan command
REM   dev bash           - Enter app container
REM   dev test           - Run tests
REM   dev fresh          - Fresh migrate + seed
REM   dev build          - Rebuild containers
REM ============================================

SETLOCAL EnableDelayedExpansion

IF "%1"=="" GOTO start
IF "%1"=="start" GOTO start
IF "%1"=="stop" GOTO stop
IF "%1"=="restart" GOTO restart
IF "%1"=="logs" GOTO logs
IF "%1"=="migrate" GOTO migrate
IF "%1"=="seed" GOTO seed
IF "%1"=="artisan" GOTO artisan
IF "%1"=="bash" GOTO bash
IF "%1"=="test" GOTO test
IF "%1"=="fresh" GOTO fresh
IF "%1"=="build" GOTO build
IF "%1"=="status" GOTO status
IF "%1"=="help" GOTO help
GOTO help

:start
echo ========================================
echo Starting RelAI Development Containers
echo ========================================
docker-compose up -d
GOTO end

:stop
echo ========================================
echo Stopping RelAI Containers
echo ========================================
docker-compose down
GOTO end

:restart
echo ========================================
echo Restarting RelAI Containers
echo ========================================
docker-compose restart
GOTO end

:logs
echo ========================================
echo Following logs (Ctrl+C to exit)
echo ========================================
docker-compose logs -f
GOTO end

:migrate
echo ========================================
echo Running Migrations
echo ========================================
docker-compose exec app php artisan migrate
GOTO end

:seed
echo ========================================
echo Running Database Seeder
echo ========================================
docker-compose exec app php artisan db:seed
GOTO end

:artisan
IF "%2"=="" (
    echo Usage: dev.bat artisan [command]
    echo Example: dev.bat artisan route:list
    GOTO end
)
docker-compose exec app php artisan %2 %3 %4 %5 %6 %7 %8 %9
GOTO end

:bash
echo ========================================
echo Entering App Container
echo ========================================
echo Type 'exit' to return to Windows
echo ========================================
docker-compose exec app bash
GOTO end

:test
echo ========================================
echo Running Tests
echo ========================================
docker-compose exec app php artisan test
GOTO end

:fresh
echo ========================================
echo Fresh Migration + Seed
echo ========================================
echo This will wipe all data! Are you sure? (Y/N)
set /p confirm=
IF /I "%confirm%" NEQ "Y" GOTO end
docker-compose exec app php artisan migrate:fresh --seed
GOTO end

:build
echo ========================================
echo Rebuilding Containers
echo ========================================
docker-compose down
docker-compose up -d --build
GOTO end

:status
echo ========================================
echo Container Status
echo ========================================
docker-compose ps
GOTO end

:help
echo ========================================
echo RelAI Development Helper
echo ========================================
echo.
echo Usage: dev.bat [command]
echo.
echo Commands:
echo   start       - Start all containers
echo   stop        - Stop all containers
echo   restart     - Restart all containers
echo   logs        - View logs
echo   migrate     - Run migrations
echo   seed        - Run database seeder
echo   artisan     - Run artisan command
echo   bash        - Enter app container shell
echo   test        - Run tests
echo   fresh       - Fresh migrate + seed (WARNING: wipes data!)
echo   build       - Rebuild containers
echo   status      - Show container status
echo   help        - Show this help
echo.
echo Examples:
echo   dev.bat                  - Start containers
echo   dev.bat migrate          - Run migrations
echo   dev.bat seed             - Run seeder
echo   dev.bat artisan route:list
echo   dev.bat bash             - Enter container shell
echo.

:end
ENDLOCAL
