# Non-Nominatif API Guide - Frontend Documentation

> 📖 **Panduan Penggunaan Swagger UI:** Lihat [guides/swagger_usage.md](../guides/swagger_usage.md) untuk cara test API di Swagger.

## Base URL
```
http://localhost/api
```

## Authentication & Security Status

### 🔐 SECURE Endpoints (Laravel Sanctum)

**Current Status:**
- Non-Nominatif API menggunakan **Secure endpoints** - MEMERLUKAN authentication
- Dilindungi dengan **Laravel Sanctum** Bearer token
- Frontend HARUS login terlebih dahulu sebelum mengakses

**Routes Available:**
| Route | Auth Required | Status |
|-------|---------------|--------|
| `/api/non-nominatifs` | ✅ YES (Sanctum) | SECURE |
| `/api/non-nominatifs/{id}` | ✅ YES (Sanctum) | SECURE |
| `/api/non-nominatifs` (POST) | ✅ YES (Sanctum) | SECURE |
| `/api/non-nominatifs/{id}` (PUT) | ✅ YES (Sanctum) | SECURE |
| `/api/non-nominatifs/{id}` (DELETE) | ✅ YES (Sanctum) | SECURE |
| `/api/non-nominatifs/{id}/submit` | ✅ YES (Sanctum) | SECURE |

### 🔐 Security Comparison with Other Systems

| Sistem | Development | Status |
|--------|-------------|--------|
| **Non-Nominatif** | Secure (Sanctum) | ✅ SECURE sekarang |
| **Anggaran** | Secure (Sanctum) | ✅ SECURE sekarang |
| **SBM** | Public | ⚠️ PUBLIC |
| **RKA** | Public | ⚠️ PUBLIC |
| **Nominatif** | Public | ⚠️ PUBLIC |

### 📝 Note
Non-Nominatif berisi data pengeluaran keuangan, oleh karena itu sistem ini sudah diamankan dengan Sanctum authentication sejak awal development.

---

## Authentication
**Catatan:** Non-Nominatif system menggunakan **Laravel Sanctum** Bearer token.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "eselon1",
  "password": "eselon1"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "1|your_token_here",
  "user": {
    "id": 1,
    "name": "Eselon 1 User",
    "email": "eselon1@relai.gov.id",
    "username": "eselon1"
  }
}
```

Untuk request selanjutnya, tambahkan header:
```
Authorization: Bearer 1|your_token_here
```

---

## System Architecture

Non-Nominatif System menggunakan **1 Tabel**:

**non_nominatifs** - Menyimpan data kegiatan non-perjalanan dinas

**Fields:**
- `id` - Primary key
- `rka_detail_id` - Foreign key ke RKA
- `user_id` - Foreign key ke user
- `deskripsi_kegiatan` - Deskripsi kegiatan
- `tanggal` - Tanggal kegiatan
- `total_anggaran_terpakai` - Total anggaran yang dipakai
- `evidence_link` - Link Google Drive (opsional)
- `status` - draft | submitted

---

## Endpoints

### 1. Get All Non-Nominatifs
```http
GET /api/non-nominatifs
Authorization: Bearer {token}
```

Query Parameters:
- `status` (optional) - Filter by status: draft | submitted

Response:
```json
{
  "data": [
    {
      "id": 1,
      "rka_detail_id": 5,
      "user_id": 1,
      "deskripsi_kegiatan": "Pembelian ATK",
      "tanggal": "2025-01-15",
      "total_anggaran_terpakai": "500000.00",
      "evidence_link": "https://drive.google.com/file/d/ABC123/view",
      "status": "draft",
      "rka_detail": {
        "id": 5,
        "code_rka": "524111",
        "layanan": "ATK",
        "anggaran_layanan_available": "99900000.00"
      },
      "user": {
        "id": 1,
        "name": "Eselon 1 User"
      }
    }
  ]
}
```

### 2. Get Non-Nominatif by ID
```http
GET /api/non-nominatifs/{id}
Authorization: Bearer {token}
```

Response:
```json
{
  "message": "Non-nominatif retrieved successfully",
  "data": {
    "id": 1,
    "deskripsi_kegiatan": "Pembelian ATK",
    "tanggal": "2025-01-15",
    "total_anggaran_terpakai": "500000.00",
    "evidence_link": "https://drive.google.com/file/d/ABC123/view",
    "status": "draft",
    "rka_detail": { ... },
    "user": { ... }
  }
}
```

### 3. Create Non-Nominatif
```http
POST /api/non-nominatifs
Authorization: Bearer {token}
Content-Type: application/json

{
  "rka_detail_id": 5,
  "deskripsi_kegiatan": "Pembelian ATK Bulan Januari",
  "tanggal": "2025-01-15",
  "total_anggaran_terpakai": 500000,
  "evidence_link": "https://drive.google.com/file/d/XYZ789/view",
  "status": "draft"
}
```

**Validasi:**
- `rka_detail_id` - required, exists in rka_details
- `deskripsi_kegiatan` - required, string
- `tanggal` - required, date format: Y-m-d
- `total_anggaran_terpakai` - required, numeric
- `evidence_link` - optional, url (max: 1000 chars)

Response:
```json
{
  "message": "Non-nominatif created successfully",
  "data": {
    "id": 1,
    "deskripsi_kegiatan": "Pembelian ATK Bulan Januari",
    "status": "draft"
  }
}
```

### 4. Update Non-Nominatif
```http
PUT /api/non-nominatifs/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "deskripsi_kegiatan": "Updated deskripsi",
  "total_anggaran_terpakai": 750000,
  "evidence_link": "https://drive.google.com/file/d/NEW123/view"
}
```

Response:
```json
{
  "message": "Non-nominatif updated successfully",
  "data": {
    "id": 1,
    "deskripsi_kegiatan": "Updated deskripsi",
    "total_anggaran_terpakai": "750000.00",
    "rka_detail": { ... },
    "user": { ... }
  }
}
```

### 5. Delete Non-Nominatif
```http
DELETE /api/non-nominatifs/{id}
Authorization: Bearer {token}
```

**Catatan:** Hanya non-nominatif dengan status `draft` yang bisa dihapus.

Response:
```json
{
  "message": "Non-nominatif deleted successfully"
}
```

### 6. Submit Non-Nominatif
```http
POST /api/non-nominatifs/{id}/submit
Authorization: Bearer {token}
```

**Catatan:**
- Status berubah dari `draft` ke `submitted`
- Anggaran akan dicatat di RKA
- SP2D akan bertambah

Response:
```json
{
  "message": "Non-nominatif submitted successfully",
  "data": {
    "id": 1,
    "status": "submitted",
    "rka_detail": {
      "anggaran_layanan_used": "500000.00",
      "anggaran_sp2d": "500000.00"
    }
  }
}
```

---

## Error Codes

| Code | Message | Solusi |
|------|---------|---------|
| 401 | Unauthorized | Token tidak valid atau expired |
| 403 | Forbidden | Anda tidak punya akses ke data ini |
| 404 | Not Found | Data tidak ditemukan |
| 422 | Validation Error | Input tidak valid, cek field yang required |
| 500 | Server Error | Error server |

**Contoh Error Response:**
```json
{
  "message": "The selected rka detail id is invalid.",
  "errors": {
    "rka_detail_id": ["The selected rka detail id is invalid."]
  }
}
```

---

## Use Cases

### Flow 1: Create Kegiatan ATK

1. **Create Non-Nominatif**
   ```http
   POST /api/non-nominatifs
   {
     "rka_detail_id": 5,
     "deskripsi_kegiatan": "Pembelian ATK",
     "tanggal": "2025-01-15",
     "total_anggaran_terpakai": 500000,
     "evidence_link": "https://drive.google.com/...",
     "status": "draft"
   }
   ```

2. **Upload Evidence** (optional, via update)
   ```http
   PUT /api/non-nominatifs/1
   {
     "evidence_link": "https://drive.google.com/file/d/ABC/view"
   }
   ```

3. **Submit**
   ```http
   POST /api/non-nominatifs/1/submit
   ```

### Flow 2: Edit Draft Kegiatan

1. **Update Data**
   ```http
   PUT /api/non-nominatifs/1
   {
     "total_anggaran_terpakai": 750000
   }
   ```

2. **Submit**
   ```http
   POST /api/non-nominatifs/1/submit
   ```

---

## Notes

1. **Sanctum Auth:** Menggunakan Laravel Sanctum, bukan manual token validation
2. **Status Draft vs Submitted:** Hanya draft yang bisa dihapus/diedit
3. **Google Drive Links:** Evidence hanya menyimpan link, file tidak di server
4. **RKA Validation:** `rka_detail_id` harus valid dan exists
5. **Anggaran Tracking:** Saat submit, anggaran akan dicatat ke RKA

---

## Comparison with Nominatif System

| Item | Nominatif | Non-Nominatif |
|------|-----------|--------------|
| **Tabel** | 4 tabel (terpisah) | 1 tabel |
| **Auth** | Manual token | Sanctum |
| **Complexity** | Tinggi (detail rows, biaya) | Rendah (direct) |
| **Use Case** | Perjalanan dinas | Kegiatan lain |
| **Evidence** | Per detail row | 1 per kegiatan |
