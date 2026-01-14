# RKA API Guide - Frontend Documentation

> 📖 **Panduan Penggunaan Swagger UI:** Lihat [guides/swagger_usage.md](../guides/swagger_usage.md) untuk cara test API di Swagger.

## Base URL
```
http://localhost/api
```

## Authentication & Security Status

### ⚠️ IMPORTANT - Development vs Production

**Current Status (Development Mode):**
- RKA API menggunakan **Public endpoints** - TIDAK memerlukan authentication
- Ini sengaja dibuat **PUBLIC** oleh tim untuk kemudahan testing dan development
- Frontend dapat langsung mengakses tanpa login

**Routes Available:**

| Environment | Route | Auth Required | Status |
|-------------|-------|---------------|--------|
| **Development** | `/api/rka-details` | ❌ NO | PUBLIC (Sekarang dipakai) |
| **Development** | `/api/rka-details/kategori` | ❌ NO | PUBLIC (Sekarang dipakai) |
| **Development** | `/api/rka-details/import` | ❌ NO | PUBLIC (Sekarang dipakai) |
| **Production** | `/api/secure/rka-details` | ✅ YES (Sanctum) | SECURE (Untuk production nanti) |
| **Production** | `/api/secure/rka-details/kategori` | ✅ YES (Sanctum) | SECURE (Untuk production nanti) |
| **Production** | `/api/secure/rka-details/import` | ✅ YES (Sanctum) | SECURE (Untuk production nanti) |

### 🔐 Security Comparison with Other Systems

| Sistem | Development | Production | Status |
|--------|-------------|------------|--------|
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
4. Ganti ke `/api/secure/rka-details` endpoints
5. Deprecate `/api/rka-details` public routes

**Contoh untuk Production:**
```javascript
// Frontend untuk production
const token = localStorage.getItem('token');

fetch('http://localhost/api/secure/rka-details', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## System Architecture

RKA (Rencana Kerja dan Anggaran) System menggunakan **1 Tabel Utama**:

### rka_details (Master Data RKA)
Menyimpan data Rencana Kerja dan Anggaran per layanan/kegiatan.

**Fields (23 fields):**
- `id` - Primary key
- `programDukunganManajemen` - Program dukungan manajemen
- `kodeProgram` - Kode program
- `layananUmum` - Layanan umum
- `kodeLayanan1` - Kode layanan 1
- `kodeLayanan2` - Kode layanan 2
- `layananTataUsaha` - Layanan tata usaha
- `kategoriAnggaran` - Kategori anggaran (A/B/C)
- `codeRka` - Kode RKA
- `layanan` - Nama layanan
- `wilayah` - Wilayah
- `artiKode` - Arti kode
- `sisaPemakaianAnggaran` - Sisa pemakaian anggaran (%)
- `status` - Status (OK/Aktif/etc)
- `anggaranPerjalanan` - Anggaran perjalanan
- `anggaranLayanan` - Anggaran layanan
- `anggaranLayananUsed` - Anggaran layanan terpakai (legacy)
- `anggaranLayananAvailable` - Anggaran layanan tersedia (computed)
- `sp2d` - SP2D (legacy)
- `anggaran_berjalan` - Anggaran berjalan (new tracking)
- `anggaran_sp2d` - SP2D (new tracking)
- `anggaran_tersisa` - Anggaran tersisa (computed)
- `sbm` - Master SBM kategori

**Relationships:**
- `kategoriAnggaran` - BelongsTo KategoriAnggaran
- `nominatifs` - HasMany NominatifNew

---

## Endpoints

### 1. Get All RKA Details
```http
GET /api/rka-details
```

**Query Parameters (Optional):**
- `search` - Search by layanan, code_rka, wilayah, or arti_kode
- `kategori` - Filter by kategori (KA/KB/KC or A/B/C)

**Contoh:**
```http
GET /api/rka-details
GET /api/rka-details?search=Jakarta
GET /api/rka-details?kategori=A
GET /api/rka-details?search=Perjalanan&kategori=KA
```

Response:
```json
[
  {
    "id": 1,
    "programDukunganManajemen": "132",
    "kodeProgram": "1 WA",
    "layananUmum": "7394",
    "kodeLayanan1": "EBA",
    "kodeLayanan2": "962",
    "layananTataUsaha": "053",
    "kategoriAnggaran": "A",
    "codeRka": "524111",
    "layanan": "Satuan Biaya Tiket Pesawat Perjalanan Dinas Dalam Negeri",
    "wilayah": "JAWA",
    "artiKode": "Belanja Perjalanan Dinas Biasa",
    "sisaPemakaianAnggaran": 91,
    "status": "OK",
    "anggaranPerjalanan": "4107000.00",
    "anggaranLayanan": "373737000.00",
    "anggaranLayananUsed": 0,
    "anggaranLayananAvailable": 373737000,
    "sp2d": 0,
    "anggaran_berjalan": 0,
    "anggaran_sp2d": 0,
    "anggaran_tersisa": 373737000,
    "sbm": "SBM"
  }
]
```

---

### 2. Get Kategori List
```http
GET /api/rka-details/kategori
```

Response:
```json
[
  {
    "id": 1,
    "tahun": 2025,
    "nama_kategori": "Kategori A",
    "kode": "A",
    "total_anggaran_kategori": "2000000000.00",
    "anggaran_berjalan_kategori": "500000000.00",
    "sp2d_kategori": "300000000.00",
    "keterangan": "Kategori anggaran A",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z",
    "sisa_anggaran_kategori": 1500000000.00
  },
  {
    "id": 2,
    "kode": "B",
    "nama_kategori": "Kategori B",
    ...
  },
  {
    "id": 3,
    "kode": "C",
    "nama_kategori": "Kategori C",
    ...
  }
]
```

---

### 3. Import RKA Details from Excel
```http
POST /api/rka-details/import
Content-Type: multipart/form-data
```

**Request:**
```
excel_file: [file]
```

**Catatan Penting:**
- ⚠️ **Endpoint ini SUDAH TIDAK DIPAKAI LAGI**
- ⚠️ Endpoint ini dulu pernah dipakai untuk import data dari Excel file
- ⚠️ Sekarang data RKA di-import menggunakan **Seeder (MasterRKASeeder)**
- ⚠️ Endpoint ini hanya disimpan untuk legacy purposes

**Cara Import RKA Sekarang:**
```bash
# Gunakan seeder untuk import data RKA
php artisan db:seed --class=MasterRKASeeder
```

**Seeder akan:**
- Membaca Excel file dari `storage/imports/Master_RKA/RKA final.xlsx`
- Import data ke database
- Create/Update records berdasarkan `code_rka` + `layanan` + `kategori`

Response (jika tetap dipanggil):
```json
{
  "success": true,
  "message": "Data berhasil diimport! 65 data diproses.",
  "imported_count": 65,
  "errors": []
}
```

---

## Error Codes

| Code | Message | Solusi |
|------|---------|---------|
| 422 | Validation Error | Input tidak valid, cek file Excel |
| 500 | Server Error | Error server |

---

## Use Cases

### Flow 1: Menampilkan List RKA di Frontend

1. **Get semua RKA**
   ```http
   GET /api/rka-details
   ```

2. **Render di tabel/grid**
   - Tampilkan `layanan`, `codeRka`, `wilayah`, `anggaranLayanan`
   - Format anggaran dengan "Rp" dan thousand separator

### Flow 2: Search & Filter RKA

1. **Cari RKA berdasarkan keyword**
   ```http
   GET /api/rka-details?search=Jakarta
   ```

2. **Filter berdasarkan kategori**
   ```http
   GET /api/rka-details?kategori=A
   ```

3. **Combine search + filter**
   ```http
   GET /api/rka-details?search=Perjalanan&kategori=KA
   ```

### Flow 3: Pilih RKA untuk Nominatif/Non-Nominatif

1. **Get list RKA**
   ```http
   GET /api/rka-details?kategori=A
   ```

2. **User pilih RKA dari dropdown**
   - Simpan `rka_detail_id` yang dipilih

3. **Create Nominatif/Non-Nominatif**
   ```http
   POST /api/nominatifs-new
   {
     "rka_detail_id": 5,
     ...
   }
   ```

### Flow 4: Monitoring Anggaran RKA

1. **Get RKA dengan anggaran info**
   ```http
   GET /api/rka-details/{id}
   ```

2. **Cek budget tracking:**
   - `anggaranLayanan` - Total anggaran
   - `anggaran_berjalan` - Yang terpakai
   - `anggaran_sp2d` - Yang sudah cair (SP2D)
   - `anggaran_tersisa` - Sisa anggaran

3. **Display di dashboard:**
   - Progress bar (berjalan / total)
   - Alert jika `anggaran_tersisa` < 20%

---

## Integration with Other Systems

### Nominatif & Non-Nominatif
Setiap kegiatan Nominatif atau Non-Nominatif **harus** memilih `rka_detail_id`:
- `rka_detail_id` = Foreign key ke `rka_details` table
- Dipakai untuk tracking anggaran per layanan
- Mengupdate `anggaran_berjalan` dan `anggaran_sp2d` di RKA

### Master SBM
Field `sbm` di RKA merujuk ke kategori di Master SBM:
- `perwakilan_ri` - Perwakilan RI
- `tiket_pesawat_dalam_negeri` - Tiket pesawat
- dll (31 kategori SBM)

---

## Field Reference

### rka_details (23 fields)
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| programDukunganManajemen | string | Program dukungan manajemen |
| kodeProgram | string | Kode program |
| layananUmum | string | Layanan umum |
| kodeLayanan1 | string | Kode layanan 1 |
| kodeLayanan2 | string | Kode layanan 2 |
| layananTataUsaha | string | Layanan tata usaha |
| kategoriAnggaran | string | Kategori A/B/C |
| codeRka | string | Kode RKA |
| layanan | text | Nama layanan |
| wilayah | string | Wilayah |
| artiKode | string | Arti kode |
| sisaPemakaianAnggaran | decimal | Sisa pemakaian anggaran (%) |
| status | string | Status |
| anggaranPerjalanan | decimal(15,2) | Anggaran perjalanan |
| anggaranLayanan | decimal(15,2) | Anggaran layanan |
| anggaranLayananUsed | decimal(15,2) | Anggaran terpakai (legacy) |
| anggaranLayananAvailable | decimal(15,2) | Anggaran tersedia (computed) |
| sp2d | decimal(15,2) | SP2D (legacy) |
| anggaran_berjalan | decimal(15,2) | Anggaran berjalan (new) |
| anggaran_sp2d | decimal(15,2) | SP2D (new) |
| anggaran_tersisa | integer | Sisa anggaran (computed) |
| sbm | string | Master SBM kategori |

### Computed Fields
- `anggaranLayananAvailable` = anggaranLayanan - anggaranLayananUsed
- `anggaran_tersisa` = anggaranLayanan - anggaran_berjalan - anggaran_sp2d

---

## Notes

1. **Public vs Protected:**
   - Development: Gunakan `/api/rka-details` (public)
   - Production: Gunakan `/api/secure/rka-details` ( Sanctum auth)

2. **Kategori Mapping:**
   - Frontend: A/B/C
   - Backend: KA/KB/KC
   - Controller auto-convert A → KA, B → KB, C → KC

3. **Import Data:**
   - **JANGAN gunakan POST /api/rka-details/import** (sudah deprecated)
   - **GUNAKAN Seeder:** `php artisan db:seed --class=MasterRKASeeder`
   - Excel file location: `storage/imports/Master_RKA/RKA final.xlsx`

4. **Budget Tracking:**
   - Gunakan `anggaran_berjalan` dan `anggaran_sp2d` (new system)
   - Field `anggaranLayananUsed` dan `sp2d` adalah legacy

---

## Example Calculation

**Contoh RKA:**
```
anggaranLayanan: Rp 373.737.000
anggaran_berjalan: Rp 0
anggaran_sp2d: Rp 0

anggaran_tersisa = 373.737.000 - 0 - 0 = Rp 373.737.000
```

**Setelah ada kegiatan Nominatif:**
```
anggaranLayanan: Rp 373.737.000
anggaran_berjalan: Rp 50.000.000 (tambah Rp 50jt)
anggaran_sp2d: Rp 0

anggaran_tersisa = 373.737.000 - 50.000.000 - 0 = Rp 323.737.000
```

**Setelah SP2D cair:**
```
anggaranLayanan: Rp 373.737.000
anggaran_berjalan: Rp 30.000.000 (berkurang karena pindah ke SP2D)
anggaran_sp2d: Rp 20.000.000 (bertambah)

anggaran_tersisa = 373.737.000 - 30.000.000 - 20.000.000 = Rp 323.737.000
```
