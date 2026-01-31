User klik: Entry Nominatif
  │
  ├─> HALAMAN ENTRY NOMINATIF (Single Page Form)
  │
  ├─> SECTION 1: Deskripsi Tugas Dinas
  │   │
  │   ├─ User ketik deskripsi (textarea):
  │   │   └─ "Rapat koordinasi dengan Pemda Jabar
  │   │      terkait proyek infrastruktur jalan tol
  │   │      dan pembahasan APBD 2025"
  │   │
  │   └─ Required untuk Submit (tidak wajib untuk Save)
  │
  ├─> SECTION 2: Kode Anggaran RKA
  │   │
  │   ├─ User pilih dari dropdown:
  │   │   └─ "524111 - Belanja Perjalanan Dinas Biasa"
  │   │
  │   └─ Required untuk Submit
  │
  ├─> SECTION 3: Perjalanan
  │   │
  │   ├─ Asal (Display/Fixed):
  │   │   └─ "Jakarta"
  │   │
  │   ├─ Tujuan (Text Input):
  │   │   └─ User ketik: "Bandung"
  │   │
  │   ├─ Tanggal Pergi (Date Picker):
  │   │   └─ User pilih: 10/01/2025
  │   │
  │   ├─ Tanggal Pulang (Date Picker):
  │   │   └─ User pilih: 12/01/2025
  │   │
  │   └─ System AUTO CALCULATE:
  │       └─ Lama Dinas = 3 hari
  │
  ├─> SECTION 4: Transportasi Berangkat
  │   │
  │   ├─ Jenis Transportasi (Text Input):
  │   │   └─ User ketik: "Pesawat"
  │   │
  │   ├─ Pagu Transportasi:
  │   │   └─ User input: Rp 1.500.000
  │   │
  │   ├─ Pagu Taksi ke Bandara:
  │   │   └─ User input: Rp 100.000
  │   │
  │   └─ Subtotal Berangkat = Rp 1.600.000 (auto)
  │
  ├─> SECTION 5: Transportasi Pulang
  │   │
  │   ├─ Jenis Transportasi (Text Input):
  │   │   └─ User ketik: "Kereta"
  │   │
  │   ├─ Pagu Transportasi:
  │   │   └─ User input: Rp 200.000
  │   │
  │   ├─ Pagu Taksi dari Stasiun:
  │   │   └─ User input: Rp 80.000
  │   │
  │   └─ Subtotal Pulang = Rp 280.000 (auto)
  │
  ├─> SECTION 6: Penginapan
  │   │
  │   ├─ User centang checkbox:
  │   │   └─ ☑ Ya, menginap
  │   │
  │   └─ IF checked:
  │       │
  │       ├─ Jumlah Malam (Number Input - User bisa ubah):
  │       │   ├─ Default suggestion: 1 malam
  │       │   └─ User bisa input: 1, 2, 3, dst...
  │       │
  │       ├─ Pagu per Malam:
  │       │   └─ User input: Rp 800.000
  │       │
  │       └─ Total Penginapan (Auto):
  │           └─ 1 × 800.000 = Rp 800.000
  │
  ├─> SECTION 7: Uang Harian
  │   │
  │   ├─ Jumlah Hari (Auto dari lama dinas):
  │   │   └─ Display: 3 hari
  │   │
  │   ├─ Pagu per Hari:
  │   │   └─ User input: Rp 600.000
  │   │
  │   └─ Total Uang Harian (Auto):
  │       └─ 3 × 600.000 = Rp 1.800.000
  │
  ├─> SECTION 8: Uang Representasi
  │   │
  │   ├─ Jumlah Hari (Auto dari lama dinas):
  │   │   └─ Display: 3 hari
  │   │
  │   ├─ Pagu per Hari:
  │   │   └─ User input: Rp 150.000
  │   │
  │   └─ Total Uang Representasi (Auto):
  │       └─ 3 × 150.000 = Rp 450.000
  │
  ├─> RINGKASAN TOTAL PAGU
  │   │
  │   ├─ Transportasi Berangkat: Rp 1.600.000
  │   ├─ Transportasi Pulang: Rp 280.000
  │   ├─ Penginapan: Rp 800.000
  │   ├─ Uang Harian: Rp 1.800.000
  │   └─ Uang Representasi: Rp 450.000
  │   │
  │   └─> TOTAL PAGU: Rp 4.930.000
  │
  ├─> USER PILIH AKSI:
  │   │
  │   ├─> TOMBOL 1: [SAVE / Simpan Draft]
  │   │   │
  │   │   ├─> Klik SAVE
  │   │   │   │
  │   │   │   ├─> Validasi ringan (tidak strict):
  │   │   │   │   └─ Minimal ada beberapa field terisi
  │   │   │   │
  │   │   │   ├─> Loading...
  │   │   │   │
  │   │   │   ├─> POST /api/nominatifs/save
  │   │   │   │
  │   │   │   ├─> Backend:
  │   │   │   │   ├─ Simpan nominatif
  │   │   │   │   ├─ Status: "draft"
  │   │   │   │   ├─ Budget: LOCK (locked_budget += 4.930.000)
  │   │   │   │   └─ Return nominatif_id
  │   │   │   │
  │   │   │   ├─> Success response
  │   │   │   │
  │   │   │   ├─> Toast: "✓ Draft berhasil disimpan"
  │   │   │   │
  │   │   │   ├─> Form masih EDITABLE
  │   │   │   │   ├─ Semua field masih bisa diubah
  │   │   │   │   ├─ User bisa ubah data
  │   │   │   │   └─ User bisa klik SAVE lagi (update draft)
  │   │   │   │
  │   │   │   └─> Tombol tetap muncul:
  │   │   │       ├─ [SAVE] - untuk update draft
  │   │   │       └─ [SUBMIT] - untuk finalisasi
  │   │   │
  │   │   └─> User bisa:
  │   │       ├─ Edit data lagi → klik SAVE (update)
  │   │       ├─ Keluar halaman (draft tersimpan)
  │   │       └─ Balik lagi nanti untuk lanjutkan
  │   │
  │   └─> TOMBOL 2: [SUBMIT / Submit Final]
  │       │
  │       ├─> Klik SUBMIT
  │       │   │
  │       │   ├─> Validasi KETAT (semua field wajib):
  │       │   │   ├─ Deskripsi terisi?
  │       │   │   ├─ Kode anggaran terpilih?
  │       │   │   ├─ Tujuan, tanggal valid?
  │       │   │   ├─ Semua transportasi terisi?
  │       │   │   ├─ Uang harian & representasi terisi?
  │       │   │   └─ Total pagu > 0?
  │       │   │
  │       │   ├─> IF Validasi GAGAL:
  │       │   │   └─> Show error message
  │       │   │       └─> User perbaiki → bisa SAVE dulu atau langsung SUBMIT lagi
  │       │   │
  │       │   └─> IF Validasi LOLOS:
  │       │       │
  │       │       ├─> Confirm Dialog:
  │       │       │   │
  │       │       │   └─> "⚠️ Konfirmasi Submit
  │       │       │       
  │       │       │       Setelah submit, data TIDAK bisa diedit lagi.
  │       │       │       
  │       │       │       Total Pagu: Rp 4.930.000
  │       │       │       
  │       │       │       Apakah Anda yakin?
  │       │       │       
  │       │       │       [Batal]  [Ya, Submit]"
  │       │       │
  │       │       ├─> User klik [Ya, Submit]
  │       │       │   │
  │       │       │   ├─> Loading...
  │       │       │   │
  │       │       │   ├─> POST /api/nominatifs/submit
  │       │       │   │   (atau PUT jika sebelumnya sudah di-save)
  │       │       │   │
  │       │       │   ├─> Backend:
  │       │       │   │   │
  │       │       │   │   ├─ IF sebelumnya draft:
  │       │       │   │   │   └─ Update nominatif existing
  │       │       │   │   │
  │       │       │   │   ├─ IF belum pernah save:
  │       │       │   │   │   ├─ Create nominatif baru
  │       │       │   │   │   └─ Lock budget
  │       │       │   │   │
  │       │       │   │   ├─ Update status: "submitted" atau "pending"
  │       │       │   │   ├─ Set flag: is_editable = false
  │       │       │   │   └─ Budget: tetap locked
  │       │       │   │
  │       │       │   ├─> Success response
  │       │       │   │
  │       │       │   ├─> Toast: "✓ Nominatif berhasil disubmit!"
  │       │       │   │
  │       │       │   └─> Redirect ke:
  │       │       │       └─ List Nominatif / Entry Realisasi
  │       │       │
  │       │       └─> User klik [Batal]
  │       │           └─> Kembali ke form (tetap editable)
  │       │
  │       └─> SETELAH SUBMIT:
  │           ├─ Data LOCKED (tidak bisa edit)
  │           ├─ Nominatif masuk list dengan status "submitted"
  │           └─ Budget tetap ter-lock sampai finalisasi di Entry Realisasi
  │
  └─> SELESAI