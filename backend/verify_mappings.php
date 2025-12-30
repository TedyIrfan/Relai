<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFIKASI SBM MAPPING DENGAN MasterSBM.md ===\n\n";

// Load MasterSBM.md
$mdPath = dirname(__DIR__) . '/MasterSBM.md';
if (!file_exists($mdPath)) {
    $mdPath = '/var/www/html/MasterSBM.md';
}
$mdContent = file_get_contents($mdPath);

// Get SbmMappingService
$mappingService = app('App\Services\SbmMappingService');

// Parse MasterSBM.md untuk extract kolom
$mdColumns = [];
$currentSection = null;
$lines = explode("\n", $mdContent);

for ($i = 0; $i < count($lines); $i++) {
    $line = trim($lines[$i]);

    if (preg_match('/^###\s+(.+)$/', $line, $m)) {
        $currentSection = trim($m[1]);
        continue;
    }

    if (preg_match('/^\*\*Kolom:\*\*$/', $line)) {
        $cols = [];
        $i++;
        while ($i < count($lines)) {
            $colLine = trim($lines[$i]);
            if (preg_match('/^---$/', $colLine) || preg_match('/^##+/', $colLine)) {
                break;
            }
            if (preg_match('/^-\s+(.+)$/', $colLine, $m)) {
                $col = trim($m[1]);
                if ($col && $col !== '**Kolom:**') {
                    $cols[] = $col;
                }
            }
            $i++;
        }
        if ($currentSection && $cols) {
            $mdColumns[$currentSection] = $cols;
        }
    }
}

echo "MasterSBM.md: " . count($mdColumns) . " sections\n\n";

// Mapping dari section ke category
$sectionToCategory = [
    'Uang Harian Perjalanan Dinas Dalam Negeri' => 'honorarium_28',
    'Uang Representasi Perjalanan Dinas Dalam Negeri' => 'honorarium_28',
    'SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI' => 'honorarium_29',
    'SATUAN BIAYA PENGINAPAN PERJALANAN DINAS DALAM NEGERI' => 'honorarium_30',
    'Paket Kegiatan Rapat/Pertemuan di Luar Kantor' => 'honorarium_31',
    'Uang Harian Kegiatan Rapat/Pertemuan di Luar Kantor' => 'honorarium_31',
    'SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE WAY)' => 'honorarium_32',
    'SATUAN BIAYA OPERASIONAL KHUSUS KEPALA PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI' => 'honorarium_33',
    'SATUAN BIAYA MAKANAN PENAMBAH DAYA TAHAN TUBUH' => 'honorarium_34',
    'Sewa Kendaraan Pelaksanaan Kegiatan Insidentil' => 'honorarium_35',
    'Sewa Kendaraan Operasional Pejabat' => 'honorarium_35',
    'Sewa Kendaraan Operasional Kantor dan/atau Lapangan' => 'honorarium_35',
    'Kendaraan Dinas Pejabat' => 'honorarium_36',
    'Kendaraan Pejabat Eselon III sebagai Kepala Kantor, Operasional Kantor dan/atau Lapangan Roda 4 (Empat)' => 'honorarium_36',
    'Kendaraan Operasional Bus' => 'honorarium_36',
    'Kendaraan Operasional Kantor dan/atau Lapangan Roda 2 (Dua)' => 'honorarium_36',
    'Kendaraan Listrik Berbasis Baterai' => 'honorarium_36',
    'SATUAN BIAYA PENGADAAN PAKAIAN DINAS' => 'honorarium_37',
    'RAPAT KOORDINASI TINGKAT MENTERI/ ESELON I/SETARA' => 'honorarium_38',
    'RAPAT BIASA' => 'honorarium_38',
    'SATUAN BIAYA KONSUMSI KEGIATAN PENDIDIKAN DAN PELATIHAN (DIKLAT)' => 'honorarium_39',
    'SATUAN BIAYA TRANSPORTASI DARAT DARI IBUKOTA PROVINSI KE KABUPATEN/KOTA DALAM PROVINSI YANG SAMA (ONE WAY)' => 'transportasi_provinsi',
    'SATUAN BIAYA TRANSPORTASI DARI DKI JAKARTA KE KABUPATEN/KOTA SEKITAR (ONE WAY)' => 'transportasi_dki',
    'SATUAN BIAYA TRANSPOR KEGIATAN DALAM KABUPATEN/KOTA PERGI PULANG (PP)' => 'transportasi_kabupaten',
    'SATUAN BIAYA PEMELIHARAAN SARANA KANTOR' => 'pemeliharaan_sarana_kantor',
    'Dari Bahasa Asing ke Bahasa Indonesia atau Sebaliknya' => 'penerjemahan_pengetikan',
    'Dari Bahasa Indonesia ke Bahasa Daerah/Bahasa Lokal atau Sebaliknya' => 'penerjemahan_pengetikan',
    'Biaya Hidup dan Biaya Operasional' => 'beasiswa',
    'SATUAN BIAYA SEWA MESIN FOTOKOPI' => 'sewa_fotokopi',
    'Kegiatan Di Dalam Negeri' => 'honorarium_narasumber',
    'Kegiatan Di Luar Negeri' => 'honorarium_narasumber',
    'Pengadaan Bahan Makanan untuk Narapidana/Tahanan dan Anak di Lapas/Rutan Kementerian Hukum dan Hak Asasi Manusia' => 'bahan_makanan',
    'Pengadaan Bahan Makanan untuk Operasi Pasukan/Latihan Pratugas/Latihan Pasukan Lainnya Bagi Anggota Polri/TNI, Dikma/Taruna/Karbol/Kadet Bagi Anggota Polri/TNI, Diklat Lainnya Bagi Kementerian Pertahanan (Kemhan)/Anggota Polri/TNI, Anggota yang Sakit Bagi Kemhan/Anggota Polri/TNI, Tahanan Anggota Polri/TNI, dan Jaga Kawal Bagi Kemhan/Anggota Polri/TNI' => 'bahan_makanan',
    'Pengadaan Bahan Makanan untuk Pasien Rumah Sakit dan Penyandang Masalah Kesejahteraan Sosial (PMKS)' => 'bahan_makanan',
    'Pengadaan Bahan Makanan untuk Keluarga Penjaga Menara Suar (PMS), Petugas Pengamatan Laut, Anak Buah Kapal (ABK) Cadangan pada Kapal Negara, ABK Aktif pada Kapal Negara, dan Petugas Stasiun Radio Pantai (SROP) dan Vessel Traffic Information Service (VTIS)' => 'bahan_makanan',
    'Pengadaan Bahan Makanan untuk Petugas Bengkel dan Galangan Kapal Kenavigasian, Petugas Pabrik Gas Aga untuk Lampu Suar, PMS, dan Kelompok Tenaga Kesehatan Kerja Pelayaran' => 'bahan_makanan',
    'Pengadaan Bahan Makanan untuk Mahasiswa/Siswa Sipil dan Mahasiswa Militer/Semi Militer di Lingkup Sekolah Kedinasan' => 'bahan_makanan',
    'Pengadaan Bahan Makanan untuk Rescue Team' => 'bahan_makanan',
    'SATUAN BIAYA KONSUMSI TAHANAN/DETENI/ABK NONJUSTISIA' => 'konsumsi_tahanan',
    'SATUAN BIAYA KEPERLUAN SEHARI-HARI PERKANTORAN DI DALAM NEGERI' => 'keperluan_perkantoran',
    'SATUAN BIAYA PENGGANTIAN INVENTARIS LAMA DAN/ATAU PEMBELIAN INVENTARIS UNTUK PEGAWAI BARU' => 'penggantian_inventaris',
    'Kendaraan Dinas Pejabat' => 'pemeliharaan_kendaraan',
    'Kendaraan Dinas Operasional' => 'pemeliharaan_kendaraan',
    'Operasional dalam Lingkungan Kantor, Roda 6, Roda 6 Khusus Tahanan Kejaksaan, dan Speed Boat' => 'pemeliharaan_kendaraan',
    'Kendaraan Dinas Operasional Patroli Jalan Raya (PJR)' => 'pemeliharaan_kendaraan',
    'Operasional Kendaraan Dinas Untuk Pengadaan Dari Sewa' => 'pemeliharaan_kendaraan',
    'Kendaraan Bermotor Listrik Berbasis Baterai' => 'pemeliharaan_kendaraan',
    'SATUAN BIAYA PEMELIHARAAN GEDUNG/BANGUNAN DALAM NEGERI' => 'pemeliharaan_gedung',
    'SATUAN BIAYA SEWA GEDUNG PERTEMUAN' => 'sewa_gedung',
    'SATUAN BIAYA TRANSPORTASI DARI DAN/ATAU KE TERMINAL BUS/STASIUN/BANDARA/PELABUHAN DALAM RANGKA PERJALANAN DINAS DALAM NEGERI' => 'transportasi_terminal',
    'SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS DALAM NEGERI PERGI PULANG (PP)' => 'tiket_pesawat_dalam_negeri',
    'SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP)' => 'tiket_pesawat_luar_negeri',
    'ATK, Langganan Koran/Majalah, Lampu, Pengamanan Sendiri, Kantong Diplomatik, dan Jamuan' => 'perwakilan_ri',
    'Pemeliharaan, Pengadaan Inventaris Kantor, Pakaian Sopir/Satpam, Sewa Kendaraan, dan Konsumsi Rapat' => 'perwakilan_ri',
];

$issues = [];
$verified = 0;

foreach ($mdColumns as $mdSection => $mdCols) {
    // Strip Honorarium prefix for matching
    $sectionLabel = $mdSection;

    if (preg_match('/^Honorarium\s+\d+\.\d+\s+(.+)$/', $mdSection, $m)) {
        $sectionLabel = $m[1];
    } elseif (preg_match('/^Honorarium\s+\d+\s+(.+)$/', $mdSection, $m)) {
        $sectionLabel = $m[1];
    } elseif (preg_match('/^\d+\.\d+\s+(.+)$/', $mdSection, $m)) {
        $sectionLabel = $m[1];
    } elseif (preg_match('/^\d+\s+(.+)$/', $mdSection, $m)) {
        $sectionLabel = $m[1];
    }

    $category = $sectionToCategory[$sectionLabel] ?? null;

    if (!$category) {
        $issues[] = "[WARNING] Could not determine category for: $mdSection (label: $sectionLabel)";
        continue;
    }

    // Get column mapping from SbmMappingService
    try {
        $structure = $mappingService->getStructure($category);
        $columnMapping = $structure['column_mapping'] ?? [];

        // Normalize MD columns
        $normalizedMDCols = [];
        foreach ($mdCols as $col) {
            $normalized = preg_replace('/\s*\([^)]*\)$/', '', $col);
            $normalized = trim($normalized);
            $normalizedMDCols[] = $normalized;
        }

        // Check if all MD columns are mapped
        $unmapped = [];
        foreach ($normalizedMDCols as $mdCol) {
            if (!isset($columnMapping[$mdCol])) {
                $unmapped[] = $mdCol;
            }
        }

        if (!empty($unmapped)) {
            $issues[] = "[ISSUE] $mdSection (category: $category)\n  Unmapped columns: " . implode(', ', $unmapped);
        } else {
            $verified++;
        }
    } catch (Exception $e) {
        $issues[] = "[ERROR] $mdSection - " . $e->getMessage();
    }
}

echo str_repeat("=", 80) . "\n";
echo "HASIL VERIFIKASI:\n";
echo str_repeat("=", 80) . "\n\n";

echo "Verified: $verified sections\n";
echo "Issues: " . count($issues) . "\n\n";

if (!empty($issues)) {
    foreach ($issues as $issue) {
        echo $issue . "\n\n";
    }
} else {
    echo "SEMUA KOLOM SUDAH TER-MAPPING DENGAN BENAR!\n\n";
}
