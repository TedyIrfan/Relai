# 🚀 RelAI - Environment Setup Guide

> **Panduan lengkap setup Development dan Production environment**

---

## 📋 Prerequisites (Wajib!)

✅ **Docker sudah terinstall**
✅ **Git sudah terinstall**
✅ **VS Code atau code editor lain**
✅ **Project sudah diclone**

---

## 🎯 Pilih Mode

| Mode            | Untuk                   | Hot Reload | Debug | Port        |
| --------------- | ----------------------- | ---------- | ----- | ----------- |
| **Development** | Coding, testing, debug  | ✅         | ✅    | 5174 / 8000 |
| **Production**  | Deployment, demo client | ❌         | ❌    | 80          |

---

## 🔧 Development Mode Setup

Untuk **coding, testing, dan debugging** dengan hot-reload.

### 1. Clone Project

```bash
git clone https://github.com/TedyIrfan/Relai.git
cd Relai
```

### 2. Setup Backend Environment

```bash
cd backend

# Copy development env template
cp .env.dev.example .env

# Edit jika perlu (biasanya tidak perlu untuk local dev)
nano .env  # optional
```

**Default .env untuk development:**

```env
APP_ENV=local
APP_DEBUG=true
DB_DATABASE=relai_backend
DB_USERNAME=sail
DB_PASSWORD=password
```

### 3. Start Development Containers

```bash
# Dari root directory
# Build dulu (WAJIB! untuk install Redis extension)
docker compose build

# Start containers
docker compose up -d

# Cek status
docker compose ps
```

**Expected output:**

```
NAME                  STATUS          PORTS
relai-app-dev         Up              9000/tcp
relai-nginx-dev       Up              0.0.0.0:8000->80/tcp
relai-postgres-dev    Up (healthy)    0.0.0.0:5433->5432/tcp
relai-redis-dev       Up              0.0.0.0:6379->6379/tcp
relai-pgadmin-dev     Up              0.0.0.0:5050->80/tcp
relai-portainer-dev   Up              0.0.0.0:9443->9443/tcp
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend akan jalan di:** `http://localhost:5173` atau `5174`

### 5. Run Migrations & Seeder

```bash
# Dari root directory
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
```

### 6. Akses Application

| Service      | URL                        |
| ------------ | -------------------------- |
| Frontend     | http://localhost:5174      |
| Backend API  | http://localhost:8000/api  |
| Swagger Docs | http://localhost:8000/docs |
| PgAdmin      | http://localhost:5050      |
| Portainer    | http://localhost:9443      |

### 7. Login Credentials

```
Username: eselon1
Password: eselon1

Atau:
admin / admin123
staff / staff123
```

---

## 🚀 Production Mode Setup

Untuk **deployment, demo client, atau simulasi production**.

### 1. Clone Project

```bash
git clone https://github.com/TedyIrfan/Relai.git
cd Relai
```

### 2. Build Frontend (WAJIB!)

```bash
cd frontend

# Install dependencies (pertama kali)
npm install

# Build untuk production
npm run build
```

**Output:** Folder `dist/` akan dibuat berisi static files.

### 3. Setup Backend Environment

```bash
cd ../backend

# Copy production env template
cp .env.prod.example .env

# EDIT FILE INI - WAJIB!
nano .env  # atau VS Code
```

**Yang WAJIB di-edit di `.env`:**

```env
# Generate key dengan: php artisan key:generate
APP_KEY=base64:PASTE_GENERATED_KEY_DISINI

# URL aplikasi
APP_URL=http://localhost

# Database credentials (sesuaikan!)
POSTGRES_DB=relai
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE

DB_DATABASE=relai
DB_USERNAME=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE

# Redis password (optional)
REDIS_PASSWORD=
```

### 4. Generate APP_KEY

**Cara 1 - Kalau ada dev container jalan:**

```bash
# Masuk ke container dev
docker compose exec app bash

# Generate key
php artisan key:generate

# Copy output-nya, lalu exit
exit
```

**Cara 2 - Kalau belum ada container:**

```bash
# Start container production dulu
docker-compose -f docker-compose.prod.yml up -d

# Generate key
docker-compose -f docker-compose.prod.yml exec app php artisan key:generate

# Copy output-nya ke .env
```

### 5. Start Production Containers

```bash
cd backend

# Build dulu
docker-compose -f docker-compose.prod.yml build

# Start production dengan admin tools (Portainer, PgAdmin)
docker-compose -f docker-compose.prod.yml --profile admin up -d

# Cek status
docker-compose -f docker-compose.prod.yml ps
```

**Expected output:**

```
NAME                  STATUS              PORTS
relai-app-prod        Up (healthy)        9000/tcp
relai-nginx-prod      Up                  0.0.0.0:80->80/tcp
relai-postgres-prod   Up (healthy)        5432/tcp
relai-redis-prod      Up                  6379/tcp
relai-portainer-prod  Up                  0.0.0.0:9000->9000/tcp, 0.0.0.0:9443->9443/tcp
```

### 6. Run Migrations & Seeder

```bash
# Migrate database
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Seed database (opsional - untuk dummy data)
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force

# Atau fresh migrate + seed (HATI-HATI: hapus semua data!)
docker-compose -f docker-compose.prod.yml exec app php artisan migrate:fresh --seed --force
```

### 7. Akses Application

| Service                          | URL                    |
| -------------------------------- | ---------------------- |
| Application (Frontend + Backend) | http://localhost       |
| API                              | http://localhost/api   |
| Swagger Docs                     | http://localhost/docs  |
| Portainer                        | https://localhost:9443 |
| PgAdmin                          | http://localhost:5050  |

---

## 🔄 Switching Modes

### Development → Production

```bash
# 1. Stop development
docker compose down

# 2. Build frontend (jika belum)
cd frontend && npm run build && cd ..

# 3. Switch env file
cd backend
cp .env.prod.example .env
# Edit .env dengan production values!

# 4. Start production
docker-compose -f docker-compose.prod.yml --profile admin up -d

# 5. Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
```

### Production → Development

```bash
# 1. Stop production
docker-compose -f backend/docker-compose.prod.yml down

# 2. Switch env file
cd backend
cp .env.dev.example .env
# Edit .env dengan development values!

# 3. Start development
docker compose up -d

# 4. Start frontend
cd ../frontend && npm run dev
```

---

## 📊 Quick Reference

### Development vs Production

|                | Development            | Production                                                |
| -------------- | ---------------------- | --------------------------------------------------------- |
| **Command**    | `docker compose up`    | `docker-compose -f backend/docker-compose.prod.yml up -d` |
| **Frontend**   | `npm run dev`          | Built (`npm run build`)                                   |
| **Port**       | 5174 / 8000            | 80                                                        |
| **Hot Reload** | ✅ Yes                 | ❌ No                                                     |
| **Debug Mode** | ✅ ON                  | ❌ OFF                                                    |
| **Database**   | `relai_backend`        | `relai`                                                   |
| **DB User**    | `sail`                 | `postgres`                                                |
| **Env File**   | `.env.dev.example`     | `.env.prod.example`                                       |
| **Terminal**   | 2 (backend + frontend) | 1                                                         |
| **Edit Code**  | Real-time              | Rebuild needed                                            |

### Commands Reference

**Development:**

```bash
# Start
docker compose build
docker compose up -d
cd frontend && npm run dev

# Stop
docker compose down

# Logs
docker compose logs -f app

# Migrate
docker compose exec app php artisan migrate
```

**Production:**

```bash
# Start
docker-compose -f backend/docker-compose.prod.yml build
docker-compose -f backend/docker-compose.prod.yml --profile admin up -d

# Stop
docker-compose -f backend/docker-compose.prod.yml down

# Logs
docker-compose -f backend/docker-compose.prod.yml logs -f app

# Migrate
docker-compose -f backend/docker-compose.prod.yml exec app php artisan migrate --force
```

---

## 🐛 Troubleshooting

### Port already in use

**Development (port 8000):**

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID {PID} /F

# Linux/Mac
sudo lsof -i :8000
sudo kill -9 {PID}
```

**Production (port 80):**

```bash
# Windows
netstat -ano | findstr :80
taskkill /PID {PID} /F

# Linux/Mac
sudo lsof -i :80
sudo kill -9 {PID}
```

### Frontend build error

```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Database connection error

**Development:**

```bash
docker compose restart postgres
```

**Production:**

```bash
docker-compose -f backend/docker-compose.prod.yml restart postgres
```

### CORS error (Development only)

Pastikan di `frontend/src/services/api.js`:

```javascript
"http://localhost:8000/api"; // Port 8000, bukan 80
```

Dan di `backend/config/cors.php`:

```php
'allowed_origins' => ['http://localhost:5173', 'http://localhost:5174']
```

---

## 💡 Tips

1. **Pakai Development Mode** untuk coding dan testing
2. **Pakai Production Mode** untuk demo ke client atau pre-deployment testing
3. **Build frontend** setiap kali ada perubahan sebelum switch ke production
4. **Backup database** sebelum running `migrate:fresh`
5. **Cek logs** kalau ada error: `docker compose logs -f`
6. **Gunakan Portainer** untuk monitoring GUI: http://localhost:9443

---

## 📚 Related Documentation

| Dokumentasi                              | Deskripsi                    |
| ---------------------------------------- | ---------------------------- |
| [README.md](./README.md)                 | Main project documentation   |
| [README-CICD.md](./README-CICD.md)       | CI/CD pipeline documentation |
| [backend/README.md](./backend/README.md) | Backend API documentation    |

---

_Last updated: 2026-01-31_
