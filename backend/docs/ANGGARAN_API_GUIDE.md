# Anggaran API Guide - Frontend Documentation

## Base URL
```
http://localhost/api
```

## Authentication
**Catatan:** Anggaran system menggunakan **Laravel Sanctum** Bearer token.

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

Anggaran System menggunakan **2 Tabel**:

### 1. anggarans (Master Anggaran Tahunan)
Menyimpan data anggaran per tahun.

**Fields:**
- `id` - Primary key
- `tahun` - Tahun anggaran (unique)
- `total_anggaran` - Total pagu anggaran
- `anggaran_berjalan` - Realisasi anggaran yang terpakai
- `sp2d` - Surat Perintah Pencairan Dana (dana yang cair)
- `sisa_anggaran` - Auto-calculated (total_anggaran - anggaran_berjalan)
- `keterangan` - Keterangan tambahan
- `created_at` - Timestamp created
- `updated_at` - Timestamp updated

### 2. kategori_anggarans (Breakdown per Kategori)
Menyimpan breakdown anggaran per kategori per tahun.

**Fields:**
- `id` - Primary key
- `tahun` - Tahun anggaran
- `nama_kategori` - Nama kategori (Kategori A, B, C, dst)
- `total_anggaran_kategori` - Pagu per kategori
- `anggaran_berjalan_kategori` - Realisasi per kategori
- `sp2d_kategori` - SP2D per kategori
- `sisa_anggaran_kategori` - Auto-calculated
- `keterangan` - Keterangan tambahan
- `created_at` - Timestamp created
- `updated_at` - Timestamp updated

---

## Endpoints

### 1. Get All Anggarans
```http
GET /api/anggarans
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tahun": 2025,
      "total_anggaran": "4012497127395.00",
      "anggaran_berjalan": "0.00",
      "sp2d": "0.00",
      "sisa_anggaran": 4012497127395,
      "keterangan": "Data tahun 2025 - 4.012.497.127.395",
      "created_at": "2025-12-30T19:36:41.000000Z",
      "updated_at": "2025-12-30T19:36:42.000000Z"
    }
  ]
}
```

### 2. Get Anggaran by ID
```http
GET /api/anggarans/{id}
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tahun": 2025,
    "total_anggaran": "4012497127395.00",
    "anggaran_berjalan": "0.00",
    "sp2d": "0.00",
    "sisa_anggaran": 4012497127395,
    "keterangan": "Data tahun 2025",
    "created_at": "2025-12-30T19:36:41.000000Z",
    "updated_at": "2025-12-30T19:36:42.000000Z"
  }
}
```

### 3. Create Anggaran
```http
POST /api/anggarans
Authorization: Bearer {token}
Content-Type: application/json

{
  "tahun": 2026,
  "total_anggaran": 5000000000,
  "anggaran_berjalan": 0,
  "sp2d": 0,
  "keterangan": "Anggaran tahun 2026"
}
```

**Validasi:**
- `tahun` - required, integer, unique
- `total_anggaran` - required, numeric, min: 0
- `anggaran_berjalan` - optional, numeric, min: 0, default: 0
- `sp2d` - optional, numeric, min: 0, default: 0
- `keterangan` - optional, string, max: 500

Response:
```json
{
  "success": true,
  "message": "Anggaran created successfully",
  "data": {
    "id": 2,
    "tahun": 2026,
    "total_anggaran": "5000000000.00",
    "anggaran_berjalan": "0.00",
    "sp2d": "0.00",
    "keterangan": "Anggaran tahun 2026",
    "updated_at": "2026-01-01T15:22:36.000000Z",
    "created_at": "2026-01-01T15:22:36.000000Z"
  }
}
```

### 4. Update Anggaran
```http
PUT /api/anggarans/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "total_anggaran": 5500000000,
  "anggaran_berjalan": 500000000,
  "sp2d": 300000000,
  "keterangan": "Updated anggaran tahun 2026"
}
```

**Catatan:** Hanya update field yang dikirim.

Response:
```json
{
  "success": true,
  "message": "Anggaran updated successfully",
  "data": {
    "id": 2,
    "tahun": 2026,
    "total_anggaran": "5500000000.00",
    "anggaran_berjalan": "500000000.00",
    "sp2d": "300000000.00",
    "sisa_anggaran": 5000000000,
    "keterangan": "Updated anggaran tahun 2026",
    "created_at": "2026-01-01T15:22:36.000000Z",
    "updated_at": "2026-01-01T15:30:00.000000Z"
  }
}
```

### 5. Delete Anggaran
```http
DELETE /api/anggarans/{id}
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "message": "Anggaran deleted successfully"
}
```

---

## Error Codes

| Code | Message | Solusi |
|------|---------|---------|
| 401 | Unauthorized | Token tidak valid atau expired |
| 404 | Not Found | Anggaran tidak ditemukan |
| 422 | Validation Error | Input tidak valid, cek field yang required |
| 500 | Server Error | Error server |

**Contoh Error Response:**
```json
{
  "success": false,
  "message": "The tahun has already been taken.",
  "errors": {
    "tahun": ["The tahun has already been taken."]
  }
}
```

---

## Use Cases

### Flow 1: Create dan Monitor Anggaran Tahunan

1. **Create Anggaran**
   ```http
   POST /api/anggarans
   {
     "tahun": 2026,
     "total_anggaran": 5000000000,
     "keterangan": "Anggaran tahun 2026"
   }
   ```

2. **Update Realisasi**
   ```http
   PUT /api/anggarans/2
   {
     "anggaran_berjalan": 750000000,
     "sp2d": 500000000
   }
   ```

3. **Monitor Sisa Anggaran**
   ```http
   GET /api/anggarans/2
   ```
   `sisa_anggaran` akan otomatis dihitung: 5000000000 - 750000000 = 4250000000

### Flow 2: Budget Control

1. **Cek sisa anggaran sebelum spending**
   ```http
   GET /api/anggarans/1
   ```

2. **Jika `anggaran_berjalan` < `total_anggaran`, spending boleh dilanjutkan**

3. **Update `anggaran_berjalan` setelah spending**
   ```http
   PUT /api/anggarans/1
   {
     "anggaran_berjalan": 850000000
   }
   ```

---

## Notes

1. **Sanctum Auth:** Menggunakan Laravel Sanctum untuk authentication
2. **Auto-Calculated Field:** `sisa_anggaran` dihitung otomatis (total_anggaran - anggaran_berjalan)
3. **Unique Tahun:** Setiap tahun hanya boleh ada 1 record anggaran
4. **Decimal Format:** Semua angka dalam format decimal(15,2) - max 999 triliun
5. **Budget Monitoring:** Berguna untuk dashboard monitoring dan budget control

---

## Integration with Other Systems

### Nominatif & Non-Nominatif
Setiap kali kegiatan Nominatif atau Non-Nominatif di-**submit**, anggaran akan terupdate:
- `anggaran_berjalan` bertambah sesuai total biaya kegiatan
- `sp2d` bertambah jika SP2D cair
- `sisa_anggaran` otomatis berkurang

### Dashboard
Dashboard dapat mengambil data anggaran untuk:
- Chart penggunaan anggaran
- Progress bar (realisasi vs pagu)
- Alert jika mendekati batas anggaran
- Summary keuangan tahunan

---

## Field Reference

### anggarans
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | integer | Auto | - | Primary key |
| tahun | integer | Yes | - | Tahun anggaran (unique) |
| total_anggaran | decimal(15,2) | Yes | 0 | Pagu anggaran |
| anggaran_berjalan | decimal(15,2) | No | 0 | Realisasi anggaran |
| sp2d | decimal(15,2) | No | 0 | Dana yang cair |
| sisa_anggaran | decimal(15,2) | Auto | calc | Sisa anggaran (calculated) |
| keterangan | text | No | null | Keterangan |
| created_at | timestamp | Auto | now | Created timestamp |
| updated_at | timestamp | Auto | now | Updated timestamp |

### kategori_anggarans
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | integer | Auto | - | Primary key |
| tahun | integer | Yes | - | Tahun anggaran |
| nama_kategori | string(50) | Yes | - | Nama kategori |
| total_anggaran_kategori | decimal(15,2) | No | 0 | Pagu per kategori |
| anggaran_berjalan_kategori | decimal(15,2) | No | 0 | Realisasi per kategori |
| sp2d_kategori | decimal(15,2) | No | 0 | SP2D per kategori |
| sisa_anggaran_kategori | decimal(15,2) | Auto | calc | Sisa per kategori |
| keterangan | text | No | null | Keterangan |
| created_at | timestamp | Auto | now | Created timestamp |
| updated_at | timestamp | Auto | now | Updated timestamp |

---

## Example Calculation

**Contoh:**
```
Tahun 2025:
- total_anggaran: Rp 4.012.497.127.395
- anggaran_berjalan: Rp 500.000.000
- sp2d: Rp 300.000.000

Maka:
- sisa_anggaran = 4.012.497.127.395 - 500.000.000 = Rp 3.512.497.127.395
- Persentase terpakai = 500.000.000 / 4.012.497.127.395 = 0.01% (1%)
- Persentase SP2D = 300.000.000 / 500.000.000 = 60% (dari yang terpakai)
```
