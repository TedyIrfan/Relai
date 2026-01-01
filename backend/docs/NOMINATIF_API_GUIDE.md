# Nominatif API Guide - Frontend Documentation

## Base URL
```
http://localhost/api
```

## Authentication
**Catatan:** Nominatif system menggunakan **Manual Token Validation** (bukan Sanctum).

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

Nominatif System menggunakan **4 Tabel Terpisah**:

```
nominatifs_new (Master)
    ↓ 1-to-many
nominatif_detail_rows (Person & Route Data)
    ↓ 1-to-1
nominatif_biaya_rows (Financial Data)

nominatifs_new (Master)
    ↓ 1-to-many
nominatif_evidence (Google Drive Links)
```

### 1. nominatifs_new (Master Table)
Menyimpan data perjalanan dinas secara keseluruhan.

**Fields:**
- `id` - Primary key
- `rka_detail_id` - Foreign key ke RKA
- `user_id` - Foreign key ke user
- `deskripsi_perjalanan_dinas` - Deskripsi perjalanan
- `tanggal_mulai` - Tanggal mulai
- `tanggal_selesai` - Tanggal selesai
- `status` - draft | submitted
- `total_pagu` - Total pagu
- `total_biaya_aktual` - Total biaya aktual
- `total_pagu_trip` - Total pagu trip (calculated)
- `total_aktual_trip` - Total aktual trip (calculated)
- `total_anggaran_berjalan_trip` - Sisa anggaran (calculated)

### 2. nominatif_detail_rows (Person & Route Data)
Menyimpan data per orang per rute perjalanan.

**Fields:**
- `id` - Primary key
- `nominatif_id` - Foreign key ke master
- `person_type` - main | tambahan
- `person_name` - Nama orang
- `row_order` - Urutan
- `asal` - Kota asal
- `tujuan` - Kota tujuan
- `tanggal_pergi` - Tanggal berangkat
- `tanggal_sampai` - Tanggal pulang
- `no` - Nomor urut
- `golongan` - Golongan (ex: IV/e)
- `jabatan` - Jabatan
- `eselon` - Eselon (ex: IIb)

### 3. nominatif_biaya_rows (Financial Data)
Menyimpan rincian biaya per detail row.

**Fields:**
- `id` - Primary key
- `nominatif_detail_row_id` - Foreign key ke detail row
- **Transportasi:**
  - `transport_pesawat_non_pp_pagu`, `transport_pesawat_non_pp_aktual`
  - `transport_taksi_pagu`, `transport_taksi_aktual`
- **Penginapan:**
  - `penginapan_jumlah_malam`
  - `penginapan_pagu_perhari`, `penginapan_aktual_perhari`
  - `penginapan_total_pagu`, `penginapan_total_aktual`
- **Uang Harian (4 tipe):**
  - `uang_harian_meeting_fullboard_*` (jumlah_hari, pagu_perhari, aktual_perhari, total)
  - `uang_harian_meeting_fullday_*` (jumlah_hari, pagu_perhari, aktual_perhari, total)
  - `uang_harian_luar_kota_*` (jumlah_hari, pagu_perhari, aktual_perhari, total)
  - `uang_harian_dalam_kota_*` (jumlah_hari, pagu_perhari, aktual_perhari, total)
- **Representasi (2 tipe):**
  - `representasi_luar_kota_*` (jumlah_hari, pagu_perhari, aktual_perhari, total)
  - `representasi_dalam_kota_*` (jumlah_hari, pagu_perhari, aktual_perhari, total)
- **Total:**
  - `total_pagu_row` - Total pagu per row
  - `total_aktual_row` - Total aktual per row
  - `total_anggaran_berjalan_row` - Sisa anggaran

### 4. nominatif_evidence (Evidence Files)
Menyimpan link Google Drive evidence.

**Fields:**
- `id` - Primary key
- `nominatif_id` - Foreign key ke master
- `nominatif_detail_row_id` - Foreign key ke detail row (opsional)
- `evidence_link` - Google Drive URL
- `evidence_name` - Nama file
- `keterangan` - Keterangan
- `user_id` - Foreign key ke user

---

## Endpoints

### I. Master (nominatifs-new)

#### 1. Get All Nominatifs
```http
GET /api/nominatifs-new
Authorization: Bearer {token}
```

Query Parameters:
- `status` (optional) - Filter by status: draft | submitted
- `page` (optional) - Page number

Response:
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "rka_detail_id": 5,
        "user_id": 1,
        "deskripsi_perjalanan_dinas": "Perjalanan Dinas Jakarta",
        "tanggal_mulai": "2025-01-15",
        "tanggal_selesai": "2025-01-17",
        "status": "draft",
        "total_pagu_trip": "5000000.00",
        "total_aktual_trip": "4500000.00",
        "rka_detail": { "code_rka": "524111", "layanan": "..." },
        "user": { "id": 1, "name": "Eselon 1 User" },
        "detail_rows": [ ... ]
      }
    ],
    "total": 2
  }
}
```

#### 2. Get Nominatif by ID
```http
GET /api/nominatifs-new/{id}
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "deskripsi_perjalanan_dinas": "Perjalanan Dinas Jakarta",
    "detail_rows": [ ... ],
    "summary": {
      "total_person": 2,
      "total_pagu": "5000000.00",
      "total_aktual": "4500000.00"
    }
  }
}
```

#### 3. Create Nominatif
```http
POST /api/nominatifs-new
Authorization: Bearer {token}
Content-Type: application/json

{
  "rka_detail_id": 5,
  "deskripsi_perjalanan_dinas": "Perjalanan Dinas Test",
  "tanggal_mulai": "2025-01-15",
  "tanggal_selesai": "2025-01-17"
}
```

Response:
```json
{
  "success": true,
  "message": "Nominatif created successfully",
  "data": {
    "id": 1,
    "status": "draft",
    "total_pagu_trip": "0.00"
  }
}
```

#### 4. Update Nominatif
```http
PUT /api/nominatifs-new/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "deskripsi_perjalanan_dinas": "Updated deskripsi"
}
```

Response:
```json
{
  "success": true,
  "message": "Nominatif updated successfully",
  "data": { ... }
}
```

#### 5. Delete Nominatif
```http
DELETE /api/nominatifs-new/{id}
Authorization: Bearer {token}
```

**Catatan:** Hanya nominatif dengan status `draft` yang bisa dihapus.

Response:
```json
{
  "success": true,
  "message": "Nominatif deleted successfully"
}
```

#### 6. Submit Nominatif
```http
POST /api/nominatifs-new/{id}/submit
Authorization: Bearer {token}
```

**Catatan:**
- Minimal harus punya 1 detail row
- Status berubah dari `draft` ke `submitted`
- Anggaran akan dicatat

Response:
```json
{
  "success": true,
  "message": "Nominatif submitted successfully",
  "data": {
    "status": "submitted",
    "total_pagu_trip": "5000000.00"
  }
}
```

#### 7. Search Nominatifs
```http
GET /api/nominatifs-new/search?q={keyword}
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "data": [ ... ],
    "query": "Jakarta"
  }
}
```

#### 8. Get Statistics
```http
GET /api/nominatifs-new/statistics
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "total_nominatifs": 10,
    "draft_nominatifs": 5,
    "submitted_nominatifs": 5,
    "total_pagu": "50000000.00",
    "total_biaya_aktual": "45000000.00"
  }
}
```

---

### II. Detail Rows

#### 1. Get All Detail Rows
```http
GET /api/nominatifs/{nominatifId}/details
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nominatif_id": 1,
      "person_name": "Ahmad Yani",
      "asal": "Jakarta",
      "tujuan": "Bandung",
      "biaya_row": { ... },
      "evidence": [ ... ]
    }
  ]
}
```

#### 2. Create Detail Row
```http
POST /api/nominatifs/{nominatifId}/details
Authorization: Bearer {token}
Content-Type: application/json

{
  "person_name": "Ahmad Yani",
  "asal": "Jakarta",
  "tujuan": "Bandung",
  "tanggal_pergi": "2025-01-15",
  "tanggal_sampai": "2025-01-17",
  "golongan": "IV/e",
  "jabatan": "Kepala Bagian",
  "eselon": "IIb"
}
```

**Catatan:** Biaya row akan otomatis dibuat saat detail row dibuat.

Response:
```json
{
  "success": true,
  "message": "Detail row created successfully",
  "data": {
    "id": 1,
    "biaya_row": { ... }
  }
}
```

#### 3. Update Detail Row
```http
PUT /api/nominatifs/{nominatifId}/details/{rowId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "person_name": "Updated Name",
  "jabatan": "Kepala Divisi"
}
```

Response:
```json
{
  "success": true,
  "message": "Detail row updated successfully"
}
```

#### 4. Delete Detail Row
```http
DELETE /api/nominatifs/{nominatifId}/details/{rowId}
Authorization: Bearer {token}
```

**Catatan:** Biaya row akan otomatis terhapus (cascade).

#### 5. Validate Draft Data
```http
POST /api/nominatifs/{nominatifId}/details/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "details": [
    {
      "person_name": "Test",
      "asal": "JKT",
      "tujuan": "BDG"
    }
  ],
  "biaya": [
    {
      "transport_pesawat_non_pp_pagu": 1500000
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "message": "Validation successful",
  "validated_rows": [ ... ]
}
```

#### 6. Execute Draft
```http
POST /api/nominatifs/{nominatifId}/details/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "details": [ ... ],
  "biaya": [ ... ]
}
```

#### 7. Bulk Create Detail Rows
```http
POST /api/nominatifs/{nominatifId}/details/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "rows": [
    { "person_name": "Person 1", "asal": "JKT", "tujuan": "BDG" },
    { "person_name": "Person 2", "asal": "BDG", "tujuan": "JKT" }
  ]
}
```

#### 8. Bulk Update Detail Rows
```http
PUT /api/nominatifs/{nominatifId}/details/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "rows": [
    { "id": 1, "person_name": "Updated 1" },
    { "id": 2, "person_name": "Updated 2" }
  ]
}
```

---

### III. Biaya Rows

#### 1. Get Biaya Row
```http
GET /api/nominatifs/details/{detailRowId}/biaya
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nominatif_detail_row_id": 1,
    "transport_pesawat_non_pp_pagu": "1500000.00",
    "transport_pesawat_non_pp_aktual": "1350000.00",
    "total_pagu_row": "1500000.00",
    "total_aktual_row": "1350000.00"
  }
}
```

#### 2. Update Biaya Row
```http
PUT /api/nominatifs/details/{detailRowId}/biaya/{biayaId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "transport_pesawat_non_pp_pagu": 2000000,
  "transport_pesawat_non_pp_aktual": 1800000,
  "penginapan_jumlah_malam": 2
}
```

**Catatan:** Total akan otomatis dihitung.

Response:
```json
{
  "success": true,
  "message": "Biaya row updated successfully",
  "data": {
    "total_pagu_row": "2000000.00",
    "total_aktual_row": "1800000.00"
  }
}
```

#### 3. Update Biaya Row (Simplified)
```http
PUT /api/nominatifs/details/{detailRowId}/biaya/{biayaId}/simplified
Authorization: Bearer {token}
```

---

### IV. Evidence

#### 1. Get All Evidence
```http
GET /api/nominatifs/{nominatifId}/evidence
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nominatif_id": 1,
      "evidence_link": "https://drive.google.com/file/d/ABC123/view",
      "evidence_name": "Tiket Pesawat.pdf",
      "keterangan": "Tiket PP"
    }
  ]
}
```

#### 2. Get All Evidence (With File Info)
```http
GET /api/nominatifs/{nominatifId}/evidence/all
Authorization: Bearer {token}
```

Response includes `file_info`:
```json
{
  "file_info": {
    "type": "pdf",
    "format": "PDF",
    "category": "Document",
    "previewable": true
  }
}
```

#### 3. Get Evidence by ID
```http
GET /api/nominatifs/{nominatifId}/evidence/{evidenceId}
Authorization: Bearer {token}
```

#### 4. Create Evidence (via Detail Row)
```http
POST /api/nominatifs/{nominatifId}/details/{detailRowId}/evidence
Authorization: Bearer {token}
Content-Type: application/json

{
  "evidence_link": "https://drive.google.com/file/d/XYZ789/view",
  "evidence_name": "Hotel.pdf",
  "keterangan": "Bukti penginapan"
}
```

Response:
```json
{
  "success": true,
  "message": "Evidence uploaded successfully",
  "data": {
    "id": 1,
    "evidence_link": "https://drive.google.com/file/d/XYZ789/view"
  }
}
```

#### 5. Update Evidence
```http
PUT /api/nominatifs/{nominatifId}/evidence/{evidenceId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "keterangan": "Updated keterangan"
}
```

#### 6. Delete Evidence
```http
DELETE /api/nominatifs/{nominatifId}/evidence/{evidenceId}
Authorization: Bearer {token}
```

**Catatan:** Hanya menghapus record dari database. File Google Drive TIDAK dihapus.

---

## Error Codes

| Code | Message | Solusi |
|------|---------|---------|
| 401 | Unauthorized | Token tidak valid atau expired |
| 403 | Forbidden | Anda tidak punya akses ke data ini |
| 404 | Not Found | Data tidak ditemukan |
| 422 | Validation Error | Input tidak valid |
| 500 | Server Error | Error server |

---

## Use Cases

### Flow 1: Create Perjalanan Dinas

1. **Create Nominatif**
   ```http
   POST /api/nominatifs-new
   { "rka_detail_id": 5, "deskripsi_perjalanan_dinas": "...", ... }
   ```

2. **Add Detail Rows** (untuk setiap peserta)
   ```http
   POST /api/nominatifs/1/details
   { "person_name": "Ahmad", "asal": "JKT", "tujuan": "BDG", ... }
   ```

3. **Update Biaya** (untuk setiap detail row)
   ```http
   PUT /api/nominatifs/details/1/biaya/1
   { "transport_pesawat_non_pp_pagu": 1500000, ... }
   ```

4. **Upload Evidence** (optional)
   ```http
   POST /api/nominatifs/1/details/1/evidence
   { "evidence_link": "https://drive.google.com/...", ... }
   ```

5. **Submit Nominatif**
   ```http
   POST /api/nominatifs-new/1/submit
   ```

### Flow 2: Bulk Create Detail Rows

1. **Bulk Create**
   ```http
   POST /api/nominatifs/1/details/bulk
   {
     "rows": [
       { "person_name": "Person 1", ... },
       { "person_name": "Person 2", ... },
       { "person_name": "Person 3", ... }
     ]
   }
   ```

2. **Update Masing-masing Biaya**
   ```http
   PUT /api/nominatifs/details/1/biaya/1
   PUT /api/nominatifs/details/2/biaya/2
   PUT /api/nominatifs/details/3/biaya/3
   ```

---

## Notes

1. **Token Validation:** Menggunakan manual validation, bukan Sanctum
2. **Status Draft vs Submitted:** Hanya draft yang bisa dihapus/diedit
3. **Google Drive Links:** Evidence hanya menyimpan link, tidak ada file di server
4. **Auto Calculations:** Total pagu/aktual dihitung otomatis dari biaya rows
5. **Cascade Delete:** Detail row → Biaya row otomatis terhapus
