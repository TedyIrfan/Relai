# SBM API Guide - Frontend Documentation

> 📖 **Panduan Penggunaan Swagger UI:** Lihat [guides/swagger_usage.md](../guides/swagger_usage.md) untuk cara test API di Swagger.

## Base URL
```
http://localhost/api
```

## Authentication & Security Status

### ⚠️ IMPORTANT - Public Endpoints

**Current Status (Development Mode):**
- SBM API menggunakan **Public endpoints** - TIDAK memerlukan authentication
- Ini sengaja dibuat **PUBLIC** oleh tim untuk kemudahan testing dan development
- Frontend dapat langsung mengakses data SBM tanpa login

**Routes Available:**
| Route | Auth Required | Status |
|-------|---------------|--------|
| `/api/sbm/categories` | ❌ NO | PUBLIC |
| `/api/sbm/{category}` | ❌ NO | PUBLIC |
| `/api/sbm/summary` | ❌ NO | PUBLIC |
| `/api/sbm/filters/options` | ❌ NO | PUBLIC |
| `/api/sbm/filters/{category}` | ❌ NO | PUBLIC |
| `/api/sbm/detail/{id}` | ❌ NO | PUBLIC |

### 🔐 Security Comparison with Other Systems

| Sistem | Development | Production | Status |
|--------|-------------|------------|--------|
| **SBM** | Public | Secure (Sanctum) | ⚠️ PUBLIC sekarang, SECURE routes ready |
| **RKA** | Public | Secure (Sanctum) | ⚠️ PUBLIC sekarang, SECURE routes ready |
| **Nominatif** | Public | Secure (Sanctum) | ⚠️ PUBLIC sekarang, SECURE routes ready |
| **Non-Nominatif** | Secure (Sanctum) | Secure (Sanctum) | ✅ SECURE sekarang |
| **Anggaran** | Secure (Sanctum) | Secure (Sanctum) | ✅ SECURE sekarang |

### 📝 Note
SBM (Master Standar Biaya Masukan) adalah data referensi yang bersifat publik. Untuk production, routes ini tetap bisa dipertahankan sebagai public endpoints karena tidak berisi data sensitif.

### 🔐 Production-Ready Secure Routes

**Secure routes sekarang tersedia untuk production:**

| Environment | Base Route | Auth Required |
|-------------|------------|---------------|
| Development | `/api/sbm/*` | ❌ NO |
| Production | `/api/secure/sbm/*` | ✅ YES (Sanctum) |

**Secure Endpoints Available:**
- `GET /api/secure/sbm/categories` - Get all categories
- `GET /api/secure/sbm/summary` - Get summary statistics
- `GET /api/secure/sbm/filters/options` - Get filter options
- `GET /api/secure/sbm/filters/{category}` - Get filter options by category
- `GET /api/secure/sbm/detail/{id}` - Get single record by ID
- `GET /api/secure/sbm/{category}` - Get data by category

**Contoh untuk Production:**
```javascript
// Frontend untuk production
const token = localStorage.getItem('token');

fetch('http://localhost/api/secure/sbm/categories', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## SBM Endpoints

### 1. Get All Categories
```http
GET /api/sbm/categories
```

Response (urutan sesuai MasterSBM):
```json
{
  "success": true,
  "data": [
    // HONORARIUM 28-39
    { "category": "honorarium_28", "source_file": "Honorarium 28...", "total_records": 41 },
    { "category": "honorarium_29", "source_file": "Honorarium 29...", "total_records": 97 },
    { "category": "honorarium_30", "source_file": "Honorarium 30...", "total_records": 38 },
    { "category": "honorarium_31", "source_file": "Honorarium 31...", "total_records": 116 },
    { "category": "honorarium_32", "source_file": "Honorarium 32...", "total_records": 132 },
    { "category": "honorarium_33", "source_file": "Honorarium 33...", "total_records": 133 },
    { "category": "honorarium_34", "source_file": "Honorarium 34...", "total_records": 38 },
    { "category": "honorarium_35", "source_file": "Honorarium 35...", "total_records": 38 },
    { "category": "honorarium_36", "source_file": "Honorarium 36...", "total_records": 38 },
    { "category": "honorarium_37", "source_file": "Honorarium 37...", "total_records": 38 },
    { "category": "honorarium_38", "source_file": "Honorarium 38...", "total_records": 38 },
    { "category": "honorarium_39", "source_file": "Honorarium 39...", "total_records": 97 },

    // SECTION 1-19
    { "category": "transportasi_provinsi", "source_file": "1. SATUAN BIAYA...", "total_records": 34 },
    { "category": "transportasi_dki", "source_file": "2. SATUAN BIAYA...", "total_records": 46 },
    { "category": "transportasi_kabupaten", "source_file": "3. SATUAN BIAYA...", "total_records": 514 },
    { "category": "pemeliharaan_sarana_kantor", "source_file": "4. SATUAN BIAYA...", "total_records": 10 },
    { "category": "penerjemahan_pengetikan", "source_file": "5. SATUAN BIAYA...", "total_records": 16 },
    { "category": "beasiswa", "source_file": "6. SATUAN BIAYA...", "total_records": 6 },
    { "category": "sewa_fotokopi", "source_file": "7. SATUAN BIAYA...", "total_records": 10 },
    { "category": "honorarium_narasumber", "source_file": "8. HONORARIUM...", "total_records": 4 },
    { "category": "bahan_makanan", "source_file": "9. SATUAN BIAYA...", "total_records": 266 },
    { "category": "konsumsi_tahanan", "source_file": "10. SATUAN BIAYA...", "total_records": 38 },
    { "category": "keperluan_perkantoran", "source_file": "11. SATUAN BIAYA...", "total_records": 38 },
    { "category": "penggantian_inventaris", "source_file": "12. SATUAN BIAYA...", "total_records": 38 },
    { "category": "pemeliharaan_kendaraan", "source_file": "13. SATUAN BIAYA...", "total_records": 239 },
    { "category": "pemeliharaan_gedung", "source_file": "14. SATUAN BIAYA...", "total_records": 38 },
    { "category": "sewa_gedung", "source_file": "15. SATUAN BIAYA...", "total_records": 38 },
    { "category": "transportasi_terminal", "source_file": "16. SATUAN BIAYA...", "total_records": 38 },
    { "category": "tiket_pesawat_dalam_negeri", "source_file": "17. SATUAN BIAYA...", "total_records": 316 },
    { "category": "tiket_pesawat_luar_negeri", "source_file": "18. SATUAN BIAYA...", "total_records": 134 },
    { "category": "perwakilan_ri", "source_file": "19. SATUAN BIAYA...", "total_records": 28 }
  ]
}
```

---

### 2. Get Data by Category
```http
GET /api/sbm/{category}
```

**Contoh:**
```http
GET /api/sbm/transportasi_provinsi
GET /api/sbm/honorarium_28
GET /api/sbm/bahan_makanan
```

#### Query Parameters (Optional):

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search keyword | `search=Jakarta` |
| `provinsi` | string | Filter by provinsi | `provinsi=DKI Jakarta` |
| `grouping` | string | Filter by grouping | `grouping=Group A` |
| `sub_category` | string | Filter by sub-category | `sub_category=28.1` |
| `sort_by` | string | Sort field | `sort_by=besaran` |
| `order` | string | Sort order (asc/desc) | `order=desc` |
| `per_page` | integer | Items per page (max 100) | `per_page=20` |
| `page` | integer | Page number | `page=2` |

**Contoh dengan Filter:**
```http
GET /api/sbm/transportasi_provinsi?search=Jakarta&sort_by=besaran&order=desc&per_page=20
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": "transportasi_provinsi",
      "source_file": "SECTION 1.xlsx",
      "no": "1",
      "ibukota_provinsi": "DKI Jakarta",
      "kabupaten_kota_tujuan": "Bandung",
      "satuan": "perjalanan",
      "besaran": 1500000,
      "besaran_formatted": "Rp 1.500.000"
    }
  ],
  "meta": {
    "category": "transportasi_provinsi",
    "total": 34,
    "per_page": 20,
    "current_page": 1,
    "last_page": 2
  }
}
```

---

### 3. Get Filter Options
```http
GET /api/sbm/filters/options
```

Response:
```json
{
  "success": true,
  "data": {
    "categories": ["honorarium_28", "honorarium_29", ...],
    "provinces": ["DKI Jakarta", "Jawa Barat", ...],
    "groupings": ["Group A", "Group B", ...]
  }
}
```

---

### 4. Get Summary Statistics
```http
GET /api/sbm/summary
```

Response:
```json
{
  "success": true,
  "data": {
    "total_records": 2405,
    "total_categories": 31,
    "by_category": {
      "honorarium_28": 41,
      "honorarium_29": 97,
      ...
    }
  }
}
```

---

### 5. Get Single Record by ID
```http
GET /api/sbm/detail/{id}
```

**Contoh:**
```http
GET /api/sbm/detail/1
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": "transportasi_provinsi",
    "no": "1",
    "besaran": 1500000,
    "besaran_formatted": "Rp 1.500.000",
    ...
  }
}
```

---

## Daftar Lengkap Kategori (Urutan Sesuai MasterSBM)

### Honorarium 28-39
| No | Category | Deskripsi |
|----|----------|-----------|
| 1 | `honorarium_28` | Uang Harian & Representasi Dalam Negeri |
| 2 | `honorarium_29` | Uang Harian Luar Negeri |
| 3 | `honorarium_30` | Penginapan Dalam Negeri |
| 4 | `honorarium_31` | Rapat/Pertemuan di Luar Kantor |
| 5 | `honorarium_32` | Tiket Pindah Luar Negeri |
| 6 | `honorarium_33` | Operasional Kepala Perwakilan RI |
| 7 | `honorarium_34` | Makanan Penambah Daya Tahan Tubuh |
| 8 | `honorarium_35` | Sewa Kendaraan |
| 9 | `honorarium_36` | Pengadaan Kendaraan Dinas |
| 10 | `honorarium_37` | Pengadaan Pakaian Dinas |
| 11 | `honorarium_38` | Konsumsi Rapat/Pertemuan |
| 12 | `honorarium_39` | Konsumsi Diklat |

### Section 1-19
| No | Category | Deskripsi |
|----|----------|-----------|
| 13 | `transportasi_provinsi` | Transportasi Darat Provinsi (Section 1) |
| 14 | `transportasi_dki` | Transportasi DKI Jakarta (Section 2) |
| 15 | `transportasi_kabupaten` | Transportasi Kabupaten/Kota (Section 3) |
| 16 | `pemeliharaan_sarana_kantor` | Pemeliharaan Sarana Kantor (Section 4) |
| 17 | `penerjemahan_pengetikan` | Penerjemahan & Pengetikan (Section 5) |
| 18 | `beasiswa` | Beasiswa (Section 6) |
| 19 | `sewa_fotokopi` | Sewa Fotokopi (Section 7) |
| 20 | `honorarium_narasumber` | Honorarium Narasumber (Section 8) |
| 21 | `bahan_makanan` | Bahan Makanan (Section 9) |
| 22 | `konsumsi_tahanan` | Konsumsi Tahanan (Section 10) |
| 23 | `keperluan_perkantoran` | Keperluan Perkantoran (Section 11) |
| 24 | `penggantian_inventaris` | Penggantian Inventaris (Section 12) |
| 25 | `pemeliharaan_kendaraan` | Pemeliharaan Kendaraan (Section 13) |
| 26 | `pemeliharaan_gedung` | Pemeliharaan Gedung (Section 14) |
| 27 | `sewa_gedung` | Sewa Gedung (Section 15) |
| 28 | `transportasi_terminal` | Transportasi Terminal (Section 16) |
| 29 | `tiket_pesawat_dalam_negeri` | Tiket Pesawat Dalam Negeri (Section 17) |
| 30 | `tiket_pesawat_luar_negeri` | Tiket Pesawat Luar Negeri (Section 18) |
| 31 | `perwakilan_ri` | Perwakilan RI Luar Negeri (Section 19) |

---

## Contoh Implementasi Frontend (JavaScript)

### 1. Login & Get Token
```javascript
async function login() {
  const response = await fetch('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'eselon1',
      password: 'eselon1'
    })
  });

  const data = await response.json();
  return data.token; // Simpan token ini
}

const token = await login();
```

### 2. Get All Categories
```javascript
async function getCategories() {
  const response = await fetch('http://localhost/api/sbm/categories', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return data.data; // Array 31 kategori
}
```

### 3. Get Data dengan Filter
```javascript
async function getSbmData(category, filters = {}) {
  const params = new URLSearchParams(filters);

  const response = await fetch(`http://localhost/api/sbm/${category}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return data;
}

// Contoh penggunaan:
const result = await getSbmData('transportasi_provinsi', {
  search: 'Jakarta',
  sort_by: 'besaran',
  order: 'desc',
  per_page: 20
});
```

### 4. Pagination
```javascript
async function getPage(category, page = 1) {
  const response = await fetch(
    `http://localhost/api/sbm/${category}?page=${page}&per_page=20`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data = await response.json();
  console.log('Page:', data.meta.current_page);
  console.log('Total pages:', data.meta.last_page);
  console.log('Data:', data.data);
  return data;
}
```

---

## Error Handling

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```
**Solusi:** Cek token, mungkin sudah expired. Login ulang.

### 404 Not Found
```json
{
  "success": false,
  "message": "Category not found"
}
```
**Solusi:** Cek nama category, pastikan sesuai daftar di atas.

---

## Catatan Penting

1. **Mata Uang**:
   - 6 kategori pakai **USD**: `honorarium_29`, `honorarium_32`, `honorarium_33`, `tiket_pesawat_luar_negeri`, `perwakilan_ri` (section 19.1 & 19.2)
   - Sisanya pakai **Rupiah**

2. **Struktur Data**: Setiap kategori punya kolom berbeda. Lihat `MasterSBM.md` untuk detail kolom tiap kategori.

3. **Pagination**: Default 15 items per page, max 100.

4. **Search**: Mencari di kolom `uraian`, `provinsi`, `keterangan` (case insensitive).

---

## Swagger UI

Untuk testing interaktif:
```
http://localhost/api/documentation
```

Cari tag **SBM** untuk semua endpoint.
