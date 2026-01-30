# 🚀 RelAI - Local Production Setup

> **Panduan local production untuk testing sebelum deployment**

---

## 📋 Prerequisite (Wajib!)

✅ **Backend sudah ready** (Laravel 12)
✅ **Frontend sudah build** (React)
✅ **Docker sudah terinstall**
✅ **Project sudah diclone**

---

## 🎯 Apa ini?

**Local Production** = Test production mode di lokal kamu sebelum deploy ke server beneran.

**Kenapa perlu?**
- ✅ Test apakah aplikasi jalan di production mode
- ✅ Cek migration & seeding
- ✅ Test environment variables
- ✅ Debugging sebelum deploy

---

## 📝 Step-by-Step

### 1. Setup Environment File

```bash
# Masuk ke backend directory
cd Relai/backend

# Copy production environment file
cp .env.prod.example .env

# EDIT FILE INI - PENTING!
nano .env  # atau pake VS Code / editor lain
```

**Yang WAJIB di-edit di `.env`:**

```env
# Generate key dengan: php artisan key:generate
APP_KEY=base64:PASTE_GENERATED_KEY_DISINI

# URL aplikasi (lokal untuk testing)
APP_URL=http://localhost

# Database password (bebas, yang penting cocok)
POSTGRES_PASSWORD=relai123
DB_PASSWORD=relai123

# Redis password (optional)
REDIS_PASSWORD=
```

### 2. Generate APP_KEY

**Kalau sudah ada container development jalan:**

```bash
# Masuk ke container development
docker-compose exec app bash

# Generate key
php artisan key:generate

# Copy output-nya, lalu exit
exit
```

**Kalau BELUM ada container sama sekali:**

```bash
# Generate key manual atau copy dari .env.example
# Atau generate online: https://generate-random.org/api-key-generator
```

### 3. Build/Pull Image

```bash
# Di backend directory

# Build image lokal (PERTAMA KALI saja)
docker-compose -f docker-compose.prod.yml build

# ATAU pull dari GHCR (kalau image sudah ada di registry)
docker pull ghcr.io/tedyirfan/relai:latest
```

### 4. Start Containers

```bash
# Di backend directory
docker-compose -f docker-compose.prod.yml up -d

# Cek status
docker-compose -f docker-compose.prod.yml ps
```

**Expected output:**
```
NAME                  STATUS              PORTS
relai-app-prod        Up (healthy)        9000/tcp
relai-nginx-prod      Up                  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
relai-postgres-prod   Up (healthy)        5432/tcp
relai-redis-prod      Up                  6379/tcp
```

### 5. Run Migrations & Seeder

```bash
# Migrate database
docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate --force

# Seed database (opsional - kalau mau dummy data)
docker-compose -f backend/docker-compose.prod.yml exec app php artisan db:seed --force

# Atau fresh migrate + seed (HATI-HATI: hapus semua data yang ada!)
docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate:fresh --seed --force
```

### 6. Akses Application

```
Application: http://localhost
API: http://localhost/api
```

---

## 🔄 Daily Commands

### Start/Stop Containers

```bash
# Start
docker-compose -f backend/docker-compose.prod.yml up -d

# Stop
docker-compose -f backend/docker-compose.prod.yml down

# Restart
docker-compose -f backend/docker-compose.prod.yml restart

# Restart specific service
docker-compose -f backend/docker-compose.prod.yml restart app
docker-compose -f backend/docker-compose.prod.yml restart nginx
```

### View Logs

```bash
# All logs
docker-compose -f backend/docker-compose.prod.yml logs -f

# Specific service logs
docker-compose -f backend/docker-compose.prod.yml logs -f app
docker-compose -f backend/docker-compose.prod.yml logs -f nginx
docker-compose -f backend/docker-compose.prod.yml logs -f postgres

# Last 100 lines
docker-compose -f backend/docker-compose.prod.yml logs --tail=100 app
```

### Run Artisan Commands

```bash
# Migrate
docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate --force

# Seeder
docker-compose -f backend/docker-compose.prod.yml exec app php artisan db:seed --force

# Cache clear
docker-compose -f backend/docker-compose.prod.yml exec app php artisan cache:clear

# Config clear
docker-compose -f backend/docker-compose.prod.yml exec app php artisan config:clear

# Route list
docker-compose -f backend/docker-compose.prod.yml exec app php artisan route:list

# Custom command
docker-compose -f backend/docker-compose.prod.yml exec app php artisan {your-command}
```

### Backup Database

```bash
# Backup database ke file
docker-compose -f backend/docker-compose.prod.yml exec postgres pg_dump -U postgres relai > backup-$(date +%Y%m%d).sql

# Backup dengan timestamp
docker-compose -f backend/docker-compose.prod.yml exec postgres pg_dump -U postgres relai > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Database

```bash
# Restore dari file backup
cat backup-20250130.sql | docker-compose -f backend/docker-compose.prod.yml exec -T postgres psql -U postgres relai
```

### Enter Container Shell

```bash
# Masuk ke app container
docker-compose -f backend/docker-compose.prod.yml exec app bash

# Dari dalam container, bisa jalankan command langsung
php artisan migrate
php artisan db:seed
php artisan cache:clear
# dll

# Exit
exit
```

---

## 🐛 Troubleshooting

### Container tidak bisa start

```bash
# Cek logs
docker-compose -f backend/docker-compose.prod.yml logs app

# Cek container status
docker-compose -f backend/docker-compose.prod.yml ps

# Cek semua Docker containers
docker ps -a

# Rebuild dari scratch
docker-compose -f backend/docker-compose.prod.yml down
docker-compose -f backend/docker-compose.prod.yml up -d --force-recreate
```

### Database connection error

```bash
# Cek postgres container running
docker ps | grep postgres

# Cek postgres health
docker-compose -f backend/docker-compose.prod.yml ps

# Restart postgres
docker-compose -f backend/docker-compose.prod.yml restart postgres

# Cek postgres logs
docker-compose -f backend/docker-compose.prod.yml logs postgres
```

### Permission denied storage/logs

```bash
# Fix permission dari dalam container
docker-compose -f backend/docker-compose.prod.yml exec app chown -R www-data:www-data storage bootstrap/cache

# Fix permission dari host (Windows: lewat Docker Desktop settings)
# Linux/Mac:
sudo chown -R www-data:www-data backend/storage backend/bootstrap/cache
sudo chmod -R 775 backend/storage backend/bootstrap/cache
```

### Nginx 502 Bad Gateway

```bash
# Cek app container running
docker ps | grep relai-app-prod

# Cek nginx logs
docker-compose -f backend/docker-compose.prod.yml logs nginx

# Restart nginx
docker-compose -f backend/docker-compose.prod.yml restart nginx

# Restart app
docker-compose -f backend/docker-compose.prod.yml restart app
```

### Port 80 already in use

```bash
# Windows: Cek port yang dipakai
netstat -ano | findstr :80

# Kill process (Windows)
taskkill /PID {PID} /F

# Linux/Mac:
sudo lsof -i :80
sudo kill -9 {PID}

# Atau ubah port di .env
NGINX_PORT=8080
```

### Port 443 already in use

```bash
# Windows: Cek port yang dipakai
netstat -ano | findstr :443

# Kill process (Windows)
taskkill /PID {PID} /F

# Linux/Mac:
sudo lsof -i :443
sudo kill -9 {PID}

# Atau ubah port di .env
NGINX_SSL_PORT=8443
```

### Image pull error (unauthorized)

```bash
# Login ulang ke GHCR
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Cek login success
```

### Out of disk space

```bash
# Cek disk usage
df -h  # Linux/Mac
# Windows: lewat File Explorer

# Clean Docker unused images
docker system prune -a

# Clean volumes (HATI-HATI: akan hapus database!)
docker system prune -a --volumes
```

---

## 📊 Quick Reference

### Quick Start

```bash
cd Relai/backend
cp .env.prod.example .env
nano .env  # EDIT!
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
# Open http://localhost
```

### Common Commands

```bash
# Start/Stop
docker-compose -f backend/docker-compose.prod.yml up -d
docker-compose -f backend/docker-compose.prod.yml down

# Logs
docker-compose -f backend/docker-compose.prod.yml logs -f app

# Migrate/Seed
docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate --force
docker-compose -f backend/docker-compose.prod.yml exec app php artisan db:seed --force

# Cache clear
docker-compose -f backend/docker-compose.prod.yml exec app php artisan cache:clear
```

---

## 💡 Tips

1. **Pastikan port 80 dan 443 available** sebelum start
2. **Backup database** sebelum running fresh migrate
3. **Cek logs** kalau ada error: `docker-compose logs -f`
4. **Hapus containers** kalau mau bersih-bersih: `docker-compose down -v`
5. **Rebuild image** kalau ada perubahan: `docker-compose build`

---

## 🆘 Still Stuck?

Kalau masih ada error:

1. **Cek logs:** `docker-compose -f backend/docker-compose.prod.yml logs -f`
2. **Pastikan Docker running:** `docker ps`
3. **Cek port conflict:** Windows: `netstat -ano | findstr :80` | Linux/Mac: `sudo lsof -i :80`
4. **Restart containers:** `docker-compose -f backend/docker-compose.prod.yml restart`
5. **Rebuild dari scratch:** `docker-compose -f backend/docker-compose.prod.yml down && docker-compose -f backend/docker-compose.prod.yml up -d --force-recreate`

---

## 📚 Related Documentation

- [README.md](./README.md) - Main project documentation
- [README-CICD.md](./README-CICD.md) - CI/CD pipeline documentation
- [backend/docker-compose.prod.yml](./backend/docker-compose.prod.yml) - Production compose file

---

*Last updated: 2026-01-30*
