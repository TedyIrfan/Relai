# 🚀 RelAI - Setup Guide untuk Developer

> **Panduan cepat untuk temen-temen developer yang mau pull & run project ini**

---

## 📋 Mode Apa yang Mau Dipakai?

```
┌─────────────────────────────────────────────────────────────────┐
│                     PILIH MODE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1️⃣  DEVELOPMENT MODE (untuk coding)                            │
│     • Hot-reload enabled                                          │
│     • Debug mode on                                               │
│     • Port 8000                                                   │
│     • Command: docker-compose up                                 │
│                                                                   │
│  2️⃣  PRODUCTION MODE (untuk deploy)                              │
│     • Optimized build                                             │
│     • Debug mode off                                              │
│     • Port 80/443                                                 │
│     • Command: docker-compose -f backend/docker-compose.prod.yml  │
│     • Pull image dari GHCR (GA USAH BUILD!)                      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ DEVELOPMENT MODE

**Untuk:** Temen-temen developer yang mau coding/mengembangkan

### Prerequisites

```bash
# Install Docker Desktop
# Download: https://www.docker.com/products/docker-desktop/

# Atau install Docker + Docker Compose di Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Step-by-Step

#### 1. Clone Repository

```bash
git clone https://github.com/TedyIrfan/Relai.git
cd Relai
```

#### 2. Setup Environment File

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit sesuai kebutuhan (optional, default sudah work)
# nano backend/.env
```

#### 3. Start Containers (Build Pertama Kali)

```bash
# Build & start semua containers
docker-compose up -d --build

# Tunggu sampai selesai... (±5-10 menit pertama kali)
```

#### 4. Run Migrations & Seeder

```bash
# Migrate database
docker-compose exec app php artisan migrate

# Seed database (dummy data)
docker-compose exec app php artisan db:seed
```

#### 5. Install Frontend Dependencies (Opsional - kalau mau coding frontend)

```bash
# Install frontend dependencies
cd frontend
npm install

# Run dev server (hot-reload)
npm run dev
```

#### 6. Access Application

```
Frontend: http://localhost:8000
Backend API: http://localhost:8000/api
PgAdmin: http://localhost:5050
  Email: admin@relai.com
  Password: admin123
```

### Daily Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f app

# Enter app container (shell)
docker-compose exec app bash

# Run artisan command
docker-compose exec app php artisan {command}

# Run tests
docker-compose exec app php artisan test

# Clear cache
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
```

### Troubleshooting Development

#### Port sudah dipakai?

```bash
# Cek port yang dipakai
# Windows
netstat -ano | findstr :8000

# Mac/Linux
lsof -i :8000

# Kill process
# Windows: taskkill /PID {PID} /F
# Mac/Linux: kill -9 {PID}
```

#### Database connection error?

```bash
# Restart postgres container
docker-compose restart postgres

# Cek postgres logs
docker-compose logs postgres
```

---

## 2️⃣ PRODUCTION MODE

**Untuk:** Deploy ke server/VPS

### Step-by-Step

#### 1. Clone Repository

```bash
git clone https://github.com/TedyIrfan/Relai.git
cd Relai
```

#### 2. Setup Environment File

```bash
# Copy production environment file
cp backend/.env.prod.example backend/.env

# EDIT WAJIB - sesuaikan dengan environment kamu
nano backend/.env

# Yang wajib di-edit:
# - APP_KEY: Generate dengan 'php artisan key:generate'
# - APP_URL: Domain atau IP server
# - DB_PASSWORD: Password database yang kuat
# - REDIS_PASSWORD: Password Redis
```

#### 3. Pull Image dari GHCR (GA USAH BUILD!)

```bash
# Login ke GitHub Container Registry
# Buat Personal Access Token dulu di GitHub:
# Settings → Developer settings → Personal access tokens → Tokens (classic)
# Scope: read:packages

echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull image (GA USAH BUILD, image sudah ready!)
docker pull ghcr.io/tedyirfan/relai:latest
```

#### 4. Start Production Containers

```bash
# Masuk ke backend directory
cd backend

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be healthy
docker-compose -f docker-compose.prod.yml ps
```

#### 5. Run Migrations & Seeder

```bash
# Migrate database
docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate --force

# Seed database (optional - untuk production sebaiknya hati-hati)
docker-compose -f backend/docker-compose.prod.yml exec app php artisan db:seed --force

# Atau combine migrate + seed
docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate:fresh --seed --force
```

#### 6. Access Application

```
Application: http://your-server-ip atau http://your-domain.com
API: http://your-server-ip/api atau http://your-domain.com/api
```

### Daily Commands (Production)

```bash
# Start containers
docker-compose -f backend/docker-compose.prod.yml up -d

# Stop containers
docker-compose -f backend/docker-compose.prod.yml down

# View logs
docker-compose -f backend/docker-compose.prod.yml logs -f app

# Restart app container
docker-compose -f backend/docker-compose.prod.yml restart app

# Enter app container
docker-compose -f backend/docker-compose.prod.yml exec app bash

# Update to latest image
docker pull ghcr.io/tedyirfan/relai:latest
docker-compose -f backend/docker-compose.prod.yml up -d

# Backup database
docker-compose -f backend/docker-compose.prod.yml exec postgres pg_dump -U postgres relai > backup.sql
```

---

## 🔄 Update Project

### Development Mode

```bash
# Pull latest changes
git pull origin main

# Rebuild containers (kalau ada perubahan di Dockerfile atau dependencies)
docker-compose up -d --build

# Install baru dependencies (kalau composer/package.json berubah)
docker-compose exec app composer install
cd frontend && npm install
```

### Production Mode

```bash
# Pull latest changes
git pull origin main

# Pull latest image
docker pull ghcr.io/tedyirfan/relai:latest

# Restart dengan image baru
docker-compose -f backend/docker-compose.prod.yml up -d

# Run migrations (kalau ada schema changes)
docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate --force
```

---

## 📝 Perbedaan Command: Sail vs Docker Compose

| Task | Laravel Sail (Dulu) | Docker Compose (Sekarang: Dev) | Docker Compose (Sekarang: Prod) |
|------|---------------------|--------------------------------|----------------------------------|
| Start | `./vendor/bin/sail up` | `docker-compose up -d` | `docker-compose -f backend/docker-compose.prod.yml up -d` |
| Stop | `./vendor/bin/sail down` | `docker-compose down` | `docker-compose -f backend/docker-compose.prod.yml down` |
| Artisan | `sail artisan` | `docker-compose exec app php artisan` | `docker-compose -f backend/docker-compose.prod.yml exec app php artisan` |
| Migrate | `sail artisan migrate` | `docker-compose exec app php artisan migrate` | `docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate` |
| Seed | `sail artisan db:seed` | `docker-compose exec app php artisan db:seed` | `docker-compose -f backend/docker-compose.prod.yml exec app php artisan db:seed` |
| Composer | `sail composer install` | `docker-compose exec app composer install` | `docker-compose -f backend/docker-compose.prod.yml exec app composer install` |
| Test | `sail artisan test` | `docker-compose exec app php artisan test` | `docker-compose -f backend/docker-compose.prod.yml exec app php artisan test` |

---

## 🔑 Generate APP_KEY untuk Production

```bash
# Masuk ke container
docker-compose -f backend/docker-compose.prod.yml exec app bash

# Generate key
php artisan key:generate

# Copy generated key dan paste ke backend/.env
# Contoh output: base64:abcdefghijklmnopqrstuvwxyz1234567890

# Exit container
exit
```

---

## 🐛 Troubleshooting Common Issues

### Container tidak bisa start

```bash
# Cek logs
docker-compose logs app
# atau production
docker-compose -f backend/docker-compose.prod.yml logs app

# Cek semua container status
docker ps -a

# Rebuild dari scratch
docker-compose down -v
docker-compose up -d --build
```

### Database connection refused

```bash
# Cek postgres running
docker ps | grep postgres

# Cek postgres health
docker-compose ps

# Restart postgres
docker-compose restart postgres
```

### Permission denied storage/logs

```bash
# Fix permission
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache

# Atau set permission dari host
sudo chmod -R 775 backend/storage backend/bootstrap/cache
```

### Nginx 502 Bad Gateway

```bash
# Cek app container running
docker ps | grep app

# Cek nginx logs
docker-compose logs nginx

# Restart nginx
docker-compose restart nginx
```

---

## 📚 Quick Reference

### Development Quick Start

```bash
git clone https://github.com/TedyIrfan/Relai.git && cd Relai
cp backend/.env.example backend/.env
docker-compose up -d --build
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
# Open http://localhost:8000
```

### Production Quick Start

```bash
git clone https://github.com/TedyIrfan/Relai.git && cd Relai
cp backend/.env.prod.example backend/.env
# EDIT backend/.env dulu!
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin
docker pull ghcr.io/tedyirfan/relai:latest
cd backend && docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
```

---

## 💡 Tips

1. **Development mode** pakai port 8000, biar ga bentrok dengan production port 80
2. **Selalu pull image baru** sebelum deploy di production (jangan build sendiri)
3. **Backup database** sebelum running migrations di production
4. **Cek logs** kalau ada error: `docker-compose logs -f {service-name}`
5. **PgAdmin** available untuk manage database via GUI di development mode

---

## 🆘 Butuh Bantuan?

Kalau masih ada error:
1. Cek logs: `docker-compose logs -f`
2. Pastikan Docker running: `docker ps`
3. Cek port conflict: `lsof -i :{port}` atau `netstat -ano | findstr :{port}`
4. Rebuild containers: `docker-compose down && docker-compose up -d --build`

---

*Last updated: 2026-01-30*
