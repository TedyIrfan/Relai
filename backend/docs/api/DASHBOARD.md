# Dashboard API Guide - Frontend Documentation

> 📖 **Panduan Penggunaan Swagger UI:** Lihat [guides/swagger_usage.md](../guides/swagger_usage.md) untuk cara test API di Swagger.

## Base URL
```
http://localhost/api
```

## Authentication & Security Status

### ⚠️ IMPORTANT - Public Endpoints (Development)

**Current Status (Development Mode):**
- Dashboard API menggunakan **Public endpoints** - TIDAK memerlukan authentication
- Ini sengaja dibuat **PUBLIC** oleh tim untuk kemudahan testing dan development
- Frontend dapat langsung mengakses tanpa login

**Routes Available:**

| Environment | Route | Auth Required | Status |
|-------------|-------|---------------|--------|
| **Development** | `/api/dashboard` | ❌ NO | PUBLIC (Sekarang dipakai) |
| **Development** | `/api/dashboard/{tahun}` | ❌ NO | PUBLIC (Sekarang dipakai) |
| **Development** | `/api/dashboard/kpi` | ❌ NO | PUBLIC (Sekarang dipakai) |
| **Development** | `/api/dashboard/charts` | ❌ NO | PUBLIC (Sekarang dipakai) |
| **Development** | `/api/kategori/{tahun}` | ❌ NO | PUBLIC (Sekarang dipakai) |
| **Production** | `/api/secure/dashboard/*` | ✅ YES (Sanctum) | SECURE (Untuk production nanti) |
| **Production** | `/api/secure/kategori/*` | ✅ YES (Sanctum) | SECURE (Untuk production nanti) |

### 🔐 Security Comparison with Other Systems

| Sistem | Development | Production | Status |
|--------|-------------|------------|--------|
| **Dashboard** | Public | Secure (Sanctum) | ⚠️ PUBLIC sekarang, SECURE routes ready |
| **RKA** | Public | Secure (Sanctum) | ⚠️ PUBLIC sekarang, SECURE routes ready |
| **SBM** | Public | Secure (Sanctum) | ⚠️ PUBLIC sekarang, SECURE routes ready |
| **Nominatif** | Public | Secure (Sanctum) | ⚠️ PUBLIC sekarang, SECURE routes ready |
| **Non-Nominatif** | Secure (Sanctum) | Secure (Sanctum) | ✅ SECURE sekarang |
| **Anggaran** | Secure (Sanctum) | Secure (Sanctum) | ✅ SECURE sekarang |

### 📝 Migration to Production

**Untuk Production (nanti saat deploy):**
1. Frontend harus implementasi login
2. Simpan Bearer token dari login response
3. Kirim token di header: `Authorization: Bearer {token}`
4. Ganti ke `/api/secure/dashboard/*` endpoints

**Contoh untuk Production:**
```javascript
// Frontend untuk production
const token = localStorage.getItem('token');

fetch('http://localhost/api/secure/dashboard/2025', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## System Architecture

Dashboard System menggunakan **2 Tabel**:

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

### 2. kategori_anggarans (Breakdown per Kategori)
Menyimpan breakdown anggaran per kategori per tahun.

**Fields:**
- `id` - Primary key
- `tahun` - Tahun anggaran
- `nama_kategori` - Nama kategori (Kategori A, B, C)
- `kode` - Kode kategori (KA, KB, KC)
- `total_anggaran_kategori` - Pagu per kategori
- `anggaran_berjalan_kategori` - Realisasi per kategori
- `sp2d_kategori` - SP2D per kategori
- `sisa_anggaran_kategori` - Auto-calculated

---

## Endpoints

### 1. Get Dashboard Data (Default Year)
```http
GET /api/dashboard
```

Response:
```json
{
  "success": true,
  "data": {
    "tahun": 2025,
    "totalAnggaran": "4012497127395.00",
    "anggaranBerjalan": "0.00",
    "anggaranSP2D": "0.00",
    "sisaAnggaran": 4012497127395,
    "kategori": [
      {
        "nama": "Kategori A",
        "anggaran": "3432039625.00",
        "berjalan": 0,
        "sp2d": 0,
        "sisa": 3432039625,
        "percentage": 0
      }
    ]
  },
  "message": "Dashboard data retrieved successfully from kategori_anggarans table - Updated with Anggaran Berjalan"
}
```

### 2. Get Dashboard Data by Year
```http
GET /api/dashboard/{tahun}
```

**Contoh:**
```http
GET /api/dashboard/2025
```

Response: sama seperti endpoint di atas

### 3. Get KPI Metrics
```http
GET /api/dashboard/kpi
```

Response:
```json
{
  "success": true,
  "data": {
    "tahun": 2025,
    "totalAnggaran": 4012497127395,
    "anggaranTerpakai": 0,
    "anggaranSP2D": 0,
    "sisaAnggaran": 4012497127395
  },
  "message": "KPI data retrieved successfully"
}
```

### 4. Get Chart Data
```http
GET /api/dashboard/charts?tahun=2025
```

Query Parameters:
- `tahun` (optional) - Tahun anggaran, default: 2025

Response:
```json
{
  "success": true,
  "data": {
    "tahun": "2025",
    "kategori": [
      {
        "nama": "Kategori A",
        "anggaran": "3432039625.00",
        "berjalan": 0,
        "sp2d": 0,
        "sisa": 3432039625,
        "persentaseTerpakai": 0
      }
    ]
  },
  "message": "Chart data retrieved successfully from Master RKA"
}
```

### 5. Get Kategori by Tahun
```http
GET /api/kategori/{tahun}
```

**Contoh:**
```http
GET /api/kategori/2025
```

Response:
```json
{
  "success": true,
  "data": {
    "tahun": "2025",
    "kategori": [
      {
        "nama": "Kategori A",
        "total": "3432039625.00",
        "terpakai": null,
        "sp2d": "0.00",
        "sisa": 3432039625,
        "percentage": 0
      }
    ]
  },
  "message": "Kategori data retrieved successfully"
}
```

### 6. Update Anggaran Terpakai
```http
POST /api/kategori/{tahun}/{kategori}/update-terpakai
```

**Request Body:**
```json
{
  "jumlah": 500000000,
  "type": "add"
}
```

**Parameters:**
- `jumlah` (required) - Jumlah anggaran terpakai
- `type` (optional) - "add" atau "subtract", default: "add"

**Contoh:**
```http
POST /api/kategori/2025/KA/update-terpakai
{
  "jumlah": 500000000,
  "type": "add"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "kategori": "KA",
    "tahun": "2025",
    "jumlah_updated": 500000000,
    "type": "add",
    "new_terpakai": 500000000,
    "new_sisa": 2932039625
  },
  "message": "Anggaran terpakai berhasil diupdate"
}
```

### 7. Update SP2D
```http
POST /api/kategori/{tahun}/{kategori}/update-sp2d
```

**Request Body:**
```json
{
  "jumlah": 300000000,
  "type": "add"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "kategori": "KA",
    "tahun": "2025",
    "jumlah_updated": 300000000,
    "type": "add",
    "new_sp2d": 300000000
  },
  "message": "SP2D berhasil diupdate"
}
```

### 8. Sync Main Anggaran
```http
POST /api/kategori/{tahun}/sync
```

**Deskripsi:** Sinkronisasi data anggaran utama dari data kategori

Response:
```json
{
  "success": true,
  "data": {
    "tahun": "2025",
    "total_anggaran": "4012497127395.00",
    "anggaran_terpakai": "500000000.00",
    "sp2d": "300000000.00",
    "sisa_anggaran": 3512497127395
  },
  "message": "Main anggaran berhasil disync dari kategori data"
}
```

---

## Error Codes

| Code | Message | Solusi |
|------|---------|---------|
| 404 | Not Found | Data tidak ditemukan |
| 500 | Server Error | Error server |

---

## Integration with Other Systems

### Nominatif & Non-Nominatif
Setiap kali kegiatan Nominatif atau Non-Nominatif di-**submit**, anggaran akan terupdate:
- `anggaran_berjalan` bertambah sesuai total biaya kegiatan
- `sp2d` bertambah jika SP2D cair
- `sisa_anggaran` otomatis berkurang

### Dashboard Frontend
Dashboard dapat mengambil data untuk:
- Chart penggunaan anggaran
- Progress bar (realisasi vs pagu)
- Alert jika mendekati batas anggaran
- Summary keuangan tahunan

---

## Production-Ready Secure Routes

**Secure routes sekarang tersedia untuk production:**

| Environment | Base Route | Auth Required |
|-------------|------------|---------------|
| Development | `/api/dashboard/*` | ❌ NO |
| Production | `/api/secure/dashboard/*` | ✅ YES (Sanctum) |

**Secure Endpoints Available (9 routes total):**
- `GET /api/secure/dashboard` - Get dashboard data (default year)
- `GET /api/secure/dashboard/{tahun}` - Get dashboard data by year
- `GET /api/secure/dashboard/kpi` - Get KPI metrics
- `GET /api/secure/dashboard/charts` - Get chart data
- `GET /api/secure/kategori/{tahun}` - Get kategori by year
- `POST /api/secure/kategori/{tahun}/{kategori}/update-terpakai` - Update anggaran terpakai
- `POST /api/secure/kategori/{tahun}/{kategori}/update-sp2d` - Update SP2D
- `POST /api/secure/kategori/{tahun}/sync` - Sync main anggaran

---

## Notes

1. **Auto-Calculated Fields:** `sisa_anggaran` dihitung otomatis (total_anggaran - anggaran_berjalan)
2. **Real-time Updates:** Dashboard data dihitung real-time dari RKA Details
3. **Budget Monitoring:** Berguna untuk dashboard monitoring dan budget control
4. **Kategori Breakdown:** A/B/C atau KA/KB/KC
