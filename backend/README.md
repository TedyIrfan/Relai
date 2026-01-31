# RELAI Backend

> 📚 Full documentation: [`docs/`](./docs/)

---

## 📊 System Status

| System            | Dev (Public)    | Prod (Secure)   | Status                                                                                 |
| ----------------- | --------------- | --------------- | -------------------------------------------------------------------------------------- |
| **SBM**           | ✅ 6 endpoints  | ✅ 6 endpoints  | Public endpoints siap dipakai untuk development. Secure routes ready untuk production. |
| **RKA**           | ✅ 3 endpoints  | ✅ 3 endpoints  | Public endpoints siap dipakai untuk development. Secure routes ready untuk production. |
| **Nominatif**     | ✅ 29 endpoints | ✅ 29 endpoints | Public endpoints siap dipakai untuk development. Secure routes ready untuk production. |
| **Non-Nominatif** | 🔒              | ✅ 6 endpoints  | Sudah aman dengan Sanctum authentication sejak awal.                                   |
| **Anggaran**      | 🔒              | ✅ 5 endpoints  | Sudah aman dengan Sanctum authentication sejak awal.                                   |
| **Dashboard**     | ✅ 8 endpoints  | ✅ 8 endpoints  | Public endpoints siap dipakai untuk development. Secure routes ready untuk production. |

**Legend**: ✅ Public | 🔒 Sanctum Auth

---

## ⚡ Quick Start

**Requirements:** Docker Desktop + Ubuntu WSL2

```bash
# Start backend
./vendor/bin/sail up -d

# Migrate + Seed
./vendor/bin/sail artisan migrate:fresh --seed

# Stop
./vendor/bin/sail down
```

**Access:**

-   API: http://localhost/api
-   Swagger: http://localhost/api/documentation
-   PgAdmin: http://localhost:5050

---

## 📚 API Documentation

| System            | Public | Secure | Documentation                                 |
| ----------------- | ------ | ------ | --------------------------------------------- |
| **SBM**           | 6      | 6      | [SBM.md](docs/api/SBM.md)                     |
| **Nominatif**     | 29     | 29     | [NOMINATIF.md](docs/api/NOMINATIF.md)         |
| **Non-Nominatif** | -      | 6      | [NON_NOMINATIF.md](docs/api/NON_NOMINATIF.md) |
| **Anggaran**      | -      | 5      | [ANGGARAN.md](docs/api/ANGGARAN.md)           |
| **RKA**           | 3      | 3      | [RKA.md](docs/api/RKA.md)                     |
| **Dashboard**     | 8      | 8      | [DASHBOARD.md](docs/api/DASHBOARD.md)         |

**Guides:** [Swagger Usage](docs/guides/swagger_usage.md) | [SQL Queries](docs/database/sql_queries.md)

---

## 🔐 Authentication

```bash
# Login
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"eselon1","password":"eselon1"}'
```

**Response:**

```json
{
    "message": "Login successful",
    "token": "1|your_token_here",
    "user": { "id": 1, "name": "Eselon 1 User" }
}
```

**Use Token:** `Authorization: Bearer {token}`

**Routes:**

-   Development: `/api/*` (public)
-   Production: `/api/secure/*` (Sanctum)

---

## 🛠️ Technology Stack

**Backend Framework:** Laravel 12 | PostgreSQL 15 | Laravel Sanctum | L5-Swagger

**Development Environment:** Docker + Laravel Sail + Ubuntu WSL2

---

## 📖 Swagger Documentation

**Access:** http://localhost/api/documentation

**Authorization:**

1. Click "Authorize" button (🔓)
2. Enter: `Bearer {token}`
3. Click "Authorize" → "Close"
4. Test secure endpoints

**Regenerate:**

```bash
php artisan l5-swagger:generate
```

---

---

[Full Project README](../README.md)
