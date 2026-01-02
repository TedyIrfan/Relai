# Panduan Penggunaan Swagger UI

## Apa itu Swagger UI?

Swagger UI adalah interface dokumentasi API yang interaktif. Dengan Swagger, Anda bisa:
- Melihat semua endpoint yang tersedia
- Melihat format request dan response
- Test API langsung dari browser

## Akses Swagger UI

```
http://localhost/api/documentation
```

---

## Jenis Routes

### Public Routes (Development)
Routes yang TIDAK memerlukan authentication. Bisa langsung di-test.

Contoh:
- `/api/sbm/categories`
- `/api/nominatifs-new`
- `/api/rka-details`
- `/api/dashboard`

### Secure Routes (Production)
Routes yang MEMERLUKAN authentication. Perlu login dan bearer token.

Contoh:
- `/api/secure/sbm/categories`
- `/api/secure/nominatifs-new`
- `/api/secure/rka-details`
- `/api/secure/dashboard`

---

## Cara Test Public Routes

1. Buka Swagger UI: `http://localhost/api/documentation`
2. Cari endpoint yang ingin di-test (misal: `GET /api/dashboard/kpi`)
3. Klik tombol **"Try it out"**
4. Klik tombol **"Execute"**
5. Lihat response di bagian "Response body"

✅ Selesai! Anda akan melihat data response.

---

## Cara Test Secure Routes

### Step 1: Login untuk Dapatkan Token

**Option A: Via Swagger**
1. Cari endpoint: `POST /api/auth/login`
2. Klik "Try it out" → "Execute"
3. Copy token dari response

**Option B: Via Curl/Bash**
```bash
curl -X POST "http://localhost/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"eselon1","password":"eselon1"}'
```

Response:
```json
{
  "message": "Login successful",
  "token": "6|your_token_here",
  "user": {...}
}
```

Copy token tersebut.

### Step 2: Authorize di Swagger UI

1. Di bagian atas Swagger UI, klik tombol **🔓 Authorize**
2. Akan muncul popup "Available authorizations"
3. Masukkan token dengan format:
   ```
   Bearer 6|your_token_here
   ```
   Ganti `6|your_token_here` dengan token yang Anda dapatkan dari login.
4. Klik tombol **"Authorize"**
5. Klik **"Close"**

Setelah ini, semua request akan otomatis menyertakan bearer token.

### Step 3: Test Secure Routes

1. Cari endpoint secure yang ingin di-test (misal: `GET /api/secure/dashboard/kpi`)
2. Klik **"Try it out"** → **"Execute"**
3. Lihat response

✅ Selesai! Anda akan melihat data response.

---

## Tips & Tricks

### Tip 1: Cek Status Authorization
Setelah authorize, Anda akan melihat icon gembok terbuka 🔓 di sebelah nama "Authorized".
Jika belum authorize, icon gembok tertutup 🔒.

### Tip 2: Logout/Revoke Token
Jika ingin menghapus token:
- Klik tombol **🔓 Authorize**
- Klik **"Logout"**
- Token akan dihapus dari sesi Swagger

### Tip 3: Token Expired
Jika mendapat error `401 Unauthorized`:
- Token mungkin sudah expired
- Login ulang untuk dapat token baru
- Authorize ulang di Swagger

### Tip 4: Download Response
Di bagian response, Anda bisa:
- Klik tombol **"Download"** untuk download response sebagai file
- Klik tombol links di "Responses" untuk melihat berbagai response codes (200, 401, 404, dll)

---

## Troubleshooting

### Error: 401 Unauthorized
**Penyebab:** Testing secure routes TANPA authorize
**Solusi:** Authorize dulu dengan token (lihat Step 2 di atas)

### Error: 404 Not Found
**Penyebab:** Endpoint tidak ditemukan
**Solusi:** Cek kembali URL endpoint, pastikan parameter path benar

### Error: 422 Validation Error
**Penyebab:** Input tidak valid
**Solusi:** Cek request body, pastikan semua field required diisi dengan format yang benar

### Error: 500 Server Error
**Penyebab:** Error di server
**Solusi:** Cek Laravel logs: `backend/storage/logs/laravel.log`

---

## Contoh Lengkap Penggunaan

### Contoh 1: Test Public Route (Dashboard KPI)

```
1. Buka http://localhost/api/documentation
2. Cari "Dashboard" tag
3. Cari "GET /api/dashboard/kpi"
4. Klik "Try it out" → "Execute"
5. Response muncul:
{
  "success": true,
  "data": {
    "tahun": 2025,
    "totalAnggaran": 4012497127395,
    ...
  }
}
```

### Contoh 2: Test Secure Route (SBM Categories)

```
1. Login dulu:
   POST /api/auth/login
   Body: {"username":"eselon1","password":"eselon1"}
   Copy token: "6|abc123..."

2. Authorize:
   Klik 🔓 Authorize
   Masukkan: "Bearer 6|abc123..."
   Klik Authorize → Close

3. Test secure route:
   Cari "GET /api/secure/sbm/categories"
   Klik "Try it out" → "Execute"
   Response muncul:
{
  "success": true,
  "data": [...]
}
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Buka Swagger | `http://localhost/api/documentation` |
| Login | `POST /api/auth/login` |
| Authorize | Klik 🔓 → Masukkan `Bearer {token}` → Authorize |
| Test Public | Try it out → Execute |
| Test Secure | Authorize dulu → Try it out → Execute |
| Logout | Klik 🔓 → Logout |

---

## Catatan Penting

1. **Token bersifat sementara** - Token bisa expire, gunakan login ulang kalau error 401
2. **Token unik per user** - Setiap user mendapat token berbeda
3. **Environment matters** - Pastikan backend sudah berjalan (`php artisan serve`)
4. **Cache** - Kalau endpoint tidak muncul, coba refresh browser atau clear cache

---

## Butuh Bantuan?

Jika ada masalah dengan Swagger atau API:
1. Cek dokumentasi API spesifik di folder `api/`
2. Cek Laravel logs: `backend/storage/logs/laravel.log`
3. Pastikan backend berjalan: `php artisan serve`
4. Cek routes: `php artisan route:list`

---

**Last Updated:** 2026-01-02
**Version:** 1.0
