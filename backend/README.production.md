# RelAI - Production Deployment Guide

## 🚀 Docker Production Setup

This guide helps you deploy RelAI application in production using Docker.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git installed
- Terminal access to server

## 🏗 Architecture

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Nginx   │   │   Laravel     │   │ PostgreSQL   │   │   Redis    │   │   pgAdmin   │
│  (Port 8080)│   │ (Port 9000) │   │ (Port 5432) │   │ (Port 6379) │   │ (Port 5050) │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

## 🔧 Setup Instructions

### 1. Environment Configuration

Copy and configure environment file:

```bash
cp .env.prod.example .env
```

Edit `.env` and set:
- `APP_KEY`: Generate new key with `php artisan key:generate --show`
- Database passwords
- External access ports if needed

### 2. Build and Deploy

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Or build specific service
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Database Migrations

```bash
# Run migrations inside container
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Seed data if needed
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed
```

### 4. Production Optimizations

```bash
# Clear and cache routes
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan route:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
```

## 🌐 Access Points

After deployment, access your application at:

- **Main Application**: `http://your-server-ip:8080`
- **API Documentation**: `http://your-server-ip:8080/api/documentation`
- **Database Admin**: `http://your-server-ip:5050`

## 🗂️ Services Overview

### Laravel App (Port 8080)
- Main application server
- Handles HTTP requests
- Serves API endpoints
- Includes production optimizations

### Nginx (Port 8080)
- Reverse proxy server
- Static file serving
- Load balancing ready
- SSL termination point

### PostgreSQL (Port 5432)
- Database server
- Persistent data storage
- Health checks enabled

### Redis (Port 6379)
- Caching layer
- Session storage
- Queue driver

### pgAdmin (Port 5050)
- Database administration
- Web-based management
- Import/export tools

## 🔒 Security Features

- Nginx security headers
- Docker network isolation
- Environment variable isolation
- No exposed database ports to host (except pgAdmin)

## 📝 Monitoring

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service health
docker-compose -f docker-compose.prod.yml ps

# Monitor resource usage
docker stats
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app php artisan tinker --execute="DB::connection()->getPdo();"
   ```

2. **Permission Issues**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data storage bootstrap/cache
   ```

3. **Performance Issues**
   ```bash
   # Increase PHP memory limit
   docker-compose -f docker-compose.prod.yml exec app php -r "ini_get('memory_limit')"

   # Check nginx connection
   docker-compose -f docker-compose.prod.yml exec nginx nginx -t
   ```

## 🚀 Scaling Options

For high-availability deployment:

```bash
# Multiple app instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Load balancer (advanced)
# Add HAProxy or Nginx Load Balancer
```

## 📞 Support

For deployment issues or questions:
1. Check logs: `docker-compose logs`
2. Verify network: `docker network ls`
3. Check ports: `netstat -tlnp`
4. Resource monitoring: `docker stats`