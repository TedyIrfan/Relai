# 🚀 RelAI

Sistem manajemen anggaran dan perjalanan dinas berbasis web dengan Laravel 12 dan React. Aplikasi ini membantu mengelola RKA (Rencana Kerja dan Anggaran), Nominatif perjalanan dinas, dan pengeluaran non-nominatif dengan interface modern yang user-friendly.

<!-- TODO: Add screenshot of dashboard -->
<!-- TODO: Add screenshot of nominatif list -->
<!-- TODO: Add screenshot of nominatif edit form -->

---

## ✨ Features

### 🔐 Authentication & Authorization

**Backend:**
- Laravel Sanctum token-based authentication
- Multi-user authentication system
- Session management dengan token expiration
- Protected API endpoints dengan middleware
- Role-based access control (Eselon I, II, III, IV)

**Frontend:**
- Login page dengan modern gradient UI design
- Auto-redirect setelah login
- Protected routes dengan AuthContext
- Session timeout handling
- Logout functionality

---

### 📊 Dashboard System

**Backend:**
- Real PostgreSQL integration dengan multi-year data (2023-2026)
- KPI cards dengan progress bars
- Total anggaran calculation dari Master RKA
- Anggaran berjalan & SP2D tracking
- Data grouping per kategori (A, B, C)

**Frontend:**
- Modern auto-layout sidebar (w-16 ↔ w-56) dengan hamburger toggle
- Header dengan year selector dropdown (2023-2026)
- User profile dropdown dengan logout
- KPI cards dengan real-time updates:
  - Total Anggaran
  - Anggaran Berjalan
  - Anggaran SP2D
  - Sisa Anggaran
- Lucide icons dengan smooth animations
- Fully responsive design

**By User:**
- Dashboard menampilkan data sesuai user login
- Filter data per tahun yang dipilih
- Real-time updates saat ada perubahan data

---

### 🗄️ Master RKA Management

**Backend:**
- RKA (Rencana Kerja dan Anggaran) CRUD system
- Code RKA structure (5.01.01.001 format)
- Automatic budget calculations:
  - `anggaran_tersisa` = total_pagu - anggaran_berjalan
  - `anggaran_sp2d` tracking
- Category system (A, B, C)
- Multi-year support (2023-2026)

**Frontend:**
- Master RKA list page dengan 12 columns:
  - Code RKA
  - Kode Lengkap
  - Arti Kode
  - Layanan
  - Total Pagu
  - Anggaran Berjalan
  - Anggaran SP2D
  - Anggaran Tersisa
  - Kategori
  - Tahun
  - Status
  - Aksi
- Search functionality (code, layanan, arti kode)
- Category filter (A, B, C)
- Pagination untuk data besar
- Detail view dengan expandable rows
- Create/Edit form dengan validation

---

### 📝 Nominatif Perjalanan Dinas

**Backend:**
- Nominatif system dengan 4 separated tables:
  - `nominatifs_new` - Main data (deskripsi, tanggal, status)
  - `nominatif_detail_rows` - Detail rows (person data)
  - `nominatif_biaya_rows` - Biaya breakdown (21 calculated fields)
  - `nominatif_evidence` - Evidence dengan Google Drive links
- Auto-sync RKA budget system
- Manual calculation system (21 fields)
- File upload system untuk evidence
- Status workflow: Draft → Submitted → Rejected

**Frontend:**
- **List Page:** Table dengan 12 columns
  - Deskripsi Perjalanan Dinas
  - Tanggal Pergi - Sampai
  - Code RKA
  - Layanan
  - Total Pagu
  - Total Aktual
  - Anggaran Berjalan
  - Status
  - Aksi (Edit, Delete, Submit)

- **Create Form:**
  - Deskripsi input
  - Date range picker
  - RKA dropdown dengan search & category filter
  - Required field markers (*)

- **Edit Form (Two-Step Flow):**
  - Step 1: Edit deskripsi, tanggal, RKA (locked)
  - Step 2: NominatifPage untuk edit detail rows

- **Excel-like Table (NominatifPage):**
  - 18 columns horizontal table (2600px width)
  - Fully editable cells:
    - Text: Nama Lengkap, Golongan, Jabatan, Eselon
    - Dropdown: Asal, Tujuan
    - Date: Tanggal Pergi, Tanggal Sampai
    - Currency: Semua biaya fields
    - File Upload: Evidence links
  - Dynamic row management (unlimited main/tambahan rows)
  - Real-time calculations dengan Indonesian currency formatting
  - Auto-sort by nama
  - Required field validation

**By Status:**
- **Draft**: Bisa diedit & dihapus
- **Submitted**: Tidak bisa diubah (read-only)
- **Rejected**: Bisa diedit & dihapus

---

### 💰 Non-Nominatif System

**Backend:**
- Simple expense management untuk non-perjalanan dinas
- 4 fields input: Deskripsi, Tanggal, Dana Anggaran, Pilih RKA
- Evidence opsional (Google Drive link)
- Auto RKA budget updates:
  - Draft: `anggaran_berjalan += dana_anggaran`
  - Submit: `anggaran_sp2d += dana_anggaran`, `anggaran_berjalan -= dana_anggaran`
- Status validation (draft, submitted, rejected)

**Frontend:**
- **List Page:** Table dengan 7 columns
  - Code RKA
  - Layanan
  - Deskripsi Kegiatan
  - Dana Anggaran
  - Tanggal
  - Status
  - Aksi

- **Create Form:**
  - Deskripsi Kegiatan input
  - Date picker
  - Dana Anggaran input dengan currency formatting
  - RKA dropdown dengan search
  - Evidence link (opsional)
  - Save Draft / Submit buttons

- **Edit Form:**
  - Auto-load existing data
  - Simpan Draft / Submit buttons
  - Hanya draft status yang bisa diedit


---

### 🔗 Evidence Management

**Backend:**
- Google Drive link support dengan preview:
  - Google Docs, Sheets, Slides, Forms
  - Preview URL generation
  - Thumbnail URL generation
  - Document type detection
- Evidence auto-update description system:
  - Format: "evidence X punya [nama_lengkap]"
  - Auto-update saat nama person berubah
- Null evidence validation (opsional)

**Frontend:**
- Evidence link input dengan URL validation
- Preview popup untuk Google Drive files
- Evidence numbering per detail row
- Auto-generate keterangan evidence

---

### 🔄 Budget Tracking & Sync

**Backend:**
- Real-time budget calculation
- Auto-sync antara Nominatif dan RKA
- Budget validation (prevent negative values)
- Transaction handling untuk data consistency
- 21 calculated fields untuk biaya breakdown:
  - Transport (taksi, bus, tiket pesawat, taksi pergi-pulang)
  - Penginapan (hotel per malam)
  - Uang Harian (per hari)
  - Representation (biaya representasi)
  - Dll

**Frontend:**
- Real-time currency formatting (Rp 1.234.567)
- Budget warning jika melebihi available
- Auto-calculation totals di table
- Progress bars untuk budget usage
- Color-coded status (green = aman, yellow = warning, red = over)

---

### 🎨 UI/UX Features

**General:**
- Modern gradient design
- Lucide React icons
- Smooth animations & transitions
- Responsive design (mobile, tablet, desktop)
- Dark/Light mode ready (infrastructure)

**Components:**
- Auto-layout sidebar dengan hamburger toggle
- Year selector dropdown
- User profile dropdown
- Confirmation dialogs (modern, no native alert)
- Loading states & spinners
- Toast notifications (auto-dismiss)
- Currency formatting (Indonesian)
- Date formatting (DD Month YYYY)
- Search boxes dengan icons
- Category filters
- Pagination
- Sortable columns
- Action buttons dengan icons

**Forms:**
- Required field markers (*)
- Validation messages
- Disabled states
- Loading states
- Error handling
- Success notifications

**Tables:**
- Horizontal scroll untuk table lebar
- Fixed headers
- Sortable columns
- Expandable rows
- Action buttons di setiap row
- Status badges dengan colors
- Empty states
- Loading states

---

### 🛠️ Technical Features

**Backend:**
- RESTful API architecture
- Laravel Sanctum authentication
- PostgreSQL database
- Eloquent ORM
- Migration system
- Seeders untuk dummy data
- Request validation
- Error handling
- CORS configuration
- Transaction handling

**Frontend:**
- React 18 dengan Vite
- Tailwind CSS v4
- React Context untuk state management
- Axios untuk API calls
- React Router untuk navigation
- Protected routes
- Error boundaries
- Hot module replacement (HMR)

**DevOps:**
- Docker containerization
- Docker Compose untuk orchestration
- GitHub Actions CI/CD:
  - Automated testing (PHPUnit)
  - Automated building (Frontend & Docker)
  - Automated deployment package creation
- GitHub Container Registry (GHCR)
- Production-ready Dockerfiles

---

### 📊 Data Management

**Backend:**
- PostgreSQL 15 dengan generated columns
- PgAdmin 4 untuk database management
- Migration system dengan rollback
- Foreign key relationships
- Indexes untuk performance
- Timestamps untuk audit

**Frontend:**
- Real-time data fetching
- Optimistic updates
- Cache management
- Error retry logic
- Loading states
- Pagination

---

### 🔍 Search & Filter

**Backend:**
- Search API dengan query parameters
- Filter by category, status, year
- Sorting by multiple fields
- Pagination support

**Frontend:**
- Search boxes dengan icons
- Real-time search saat mengetik
- Category dropdown filters
- Date range filters
- Status filters
- Clear filter buttons

---

### 📤 Export & Reporting (Future)

**Planned Features:**
- PDF export untuk nominatif
- Excel export untuk data tables
- Custom report generation
- Chart visualization (Recharts)

---

## 🛠️ Tech Stack

### Backend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Laravel | 12 |
| Database | PostgreSQL | 15 |
| ORM | Eloquent | - |
| Authentication | Laravel Sanctum | - |
| API | RESTful | - |
| Containerization | Docker | - |
| Web Server | Nginx | - |
| Cache | Redis | 7 |

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18 |
| Build Tool | Vite | - |
| Styling | Tailwind CSS | v4 |
| Icons | Lucide React | - |
| State Management | React Context | - |
| HTTP Client | Axios | - |
| Routing | React Router | - |

### Development Tools

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database Management | PgAdmin 4 | PostgreSQL GUI |
| CI/CD | GitHub Actions | Automated pipeline |
| Container Registry | GHCR | Docker images |
| Version Control | Git | Source control |
| Hot Reload | Vite HMR | Development |

---

## 📋 Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- **Docker Desktop** (Windows/Mac) atau **Docker + Docker Compose** (Linux)
- **Git** untuk clone repository
- **Code Editor** (VS Code recommended)

---

## 🚀 Quick Start

### Development Mode (Untuk Coding)

```bash
# 1. Clone repository
git clone https://github.com/TedyIrfan/Relai.git
cd Relai

# 2. Start development containers
docker-compose up -d

# 3. Run migrations & seeder
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed

# 4. Install frontend dependencies
cd frontend
npm install

# 5. Start frontend dev server
npm run dev

# 6. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/api
# PgAdmin: http://localhost:5050

# Login credentials:
# Username: eselon1
# Password: eselon1
```

### Production Mode (Untuk Deployment)

```bash
# 1. Clone repository
git clone https://github.com/TedyIrfan/Relai.git
cd Relai

# 2. Setup environment file
cd backend
cp .env.prod.example .env
nano .env  # EDIT sesuai environment

# 3. Start production containers
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations & seeder
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force

# 5. Access application
# Application: http://localhost
# API: http://localhost/api
```

**Untuk dokumentasi deployment lengkap, lihat [SETUP.md](./SETUP.md)**

---

## 📖 Documentation

| Dokumentasi | Deskripsi |
|-------------|-----------|
| [SETUP.md](./SETUP.md) | Panduan local production setup |
| [README-CICD.md](./README-CICD.md) | CI/CD pipeline documentation |
| [CHANGELOG.md](./CHANGELOG.md) | History perkembangan project |

---

## 🎯 Project Status

### ✅ Completed (100%)

- Authentication & Authorization System
- Dashboard dengan Real-time Data
- Master RKA Management
- Nominatif Perjalanan Dinas System
- Non-Nominatif System
- Evidence Management dengan Google Drive
- Budget Tracking & Auto-sync
- CI/CD Pipeline

### 🔧 In Progress

- Chart visualization (Recharts integration)
- Advanced filtering & search

### 📋 Planned

- PDF/Excel export features
- User role management improvements
- Audit trail system
- Advanced reporting

---

## 🔐 Default Credentials

```
Username: eselon1
Password: eselon1
```

---


*Last updated: January 30, 2026*
