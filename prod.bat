@echo off
REM ============================================
REM RelAI - Production Helper Script
REM ============================================
REM
REM Usage:
REM   prod.bat start         - Start production containers
REM   prod.bat stop          - Stop production containers
REM   prod.bat restart       - Restart production containers
REM   prod.bat logs          - View logs
REM   prod.bat migrate       - Run migrations
REM   prod.bat seed          - Run seeder
REM   prod.bat update        - Pull latest image & restart
REM   prod.bat backup        - Backup database
REM   prod.bat status        - Show container status
REM   prod.bat artisan       - Run artisan command
REM   prod.bat bash          - Enter app container
REM ============================================

SETLOCAL EnableDelayedExpansion

IF "%1"=="" GOTO help
IF "%1"=="start" GOTO start
IF "%1"=="stop" GOTO stop
IF "%1"=="restart" GOTO restart
IF "%1"=="logs" GOTO logs
IF "%1"=="migrate" GOTO migrate
IF "%1"=="seed" GOTO seed
IF "%1"=="update" GOTO update
IF "%1"=="backup" GOTO backup
IF "%1"=="status" GOTO status
IF "%1"=="artisan" GOTO artisan
IF "%1"=="bash" GOTO bash
IF "%1"=="help" GOTO help
GOTO help

:start
echo ========================================
echo Starting RelAI Production Containers
echo ========================================
cd backend
docker-compose -f docker-compose.prod.yml up -d
cd ..
GOTO end

:stop
echo ========================================
echo Stopping RelAI Production Containers
echo ========================================
cd backend
docker-compose -f docker-compose.prod.yml down
cd ..
GOTO end

:restart
echo ========================================
echo Restarting RelAI Production Containers
echo ========================================
cd backend
docker-compose -f docker-compose.prod.yml restart
cd ..
GOTO end

:logs
echo ========================================
echo Following logs (Ctrl+C to exit)
echo ========================================
cd backend
docker-compose -f docker-compose.prod.yml logs -f
cd ..
GOTO end

:migrate
echo ========================================
echo Running Migrations
echo ========================================
cd backend
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
cd ..
GOTO end

:seed
echo ========================================
echo Running Database Seeder
echo ========================================
echo WARNING: This will seed production data!
echo Are you sure? (Y/N)
set /p confirm=
IF /I NOT "%confirm%"=="Y" GOTO end
cd backend
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
cd ..
GOTO end

:artisan
IF "%2"=="" (
    echo Usage: prod.bat artisan [command]
    echo Example: prod.bat artisan route:list
    GOTO end
)
cd backend
docker-compose -f docker-compose.prod.yml exec app php artisan %2 %3 %4 %5 %6 %7 %8 %9
cd ..
GOTO end

:bash
echo ========================================
echo Entering Production App Container
echo ========================================
echo Type 'exit' to return to Windows
echo ========================================
cd backend
docker-compose -f docker-compose.prod.yml exec app bash
cd ..
GOTO end

:update
echo ========================================
echo Updating to Latest Image
echo ========================================
echo Pulling latest image from GHCR...
docker pull ghcr.io/tedyirfan/relai:latest
echo Restarting containers with new image...
cd backend
docker-compose -f docker-compose.prod.yml up -d
cd ..
echo Done! Running migrations...
cd backend
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
cd ..
echo Update complete!
GOTO end

:backup
echo ========================================
echo Backing Up Database
echo ========================================
set backup_file=relai-backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%.sql
set backup_file=%backup_file: =0%
cd backend
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres relai > %backup_file%
cd ..
echo Backup saved to: %backup_file%
GOTO end

:status
echo ========================================
echo Production Container Status
echo ========================================
cd backend
docker-compose -f docker-compose.prod.yml ps
cd ..
GOTO end

:help
echo ========================================
echo RelAI Production Helper
echo ========================================
echo.
echo Usage: prod.bat [command]
echo.
echo Commands:
echo   start       - Start production containers
echo   stop        - Stop production containers
echo   restart     - Restart production containers
echo   logs        - View logs
echo   migrate     - Run migrations
echo   seed        - Run database seeder (WARNING!)
echo   update      - Pull latest image & restart
echo   backup      - Backup database
echo   status      - Show container status
echo   artisan     - Run artisan command
echo   bash        - Enter app container shell
echo   help        - Show this help
echo.
echo Examples:
echo   prod.bat start              - Start production
echo   prod.bat migrate            - Run migrations
echo   prod.bat update             - Update to latest image
echo   prod.bat backup             - Backup database
echo   prod.bat artisan cache:clear
echo.

:end
ENDLOCAL
