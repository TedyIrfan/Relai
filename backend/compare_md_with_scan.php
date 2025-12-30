<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== MEMBANDINGKAN MasterSBM.md DENGAN SCAN REPORT ===\n\n";

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

// Data dari MasterSBM.md (hardcoded dari file yang dibaca)
$masterSBM = [
    'honorarium_28' => [
        'file' => 'Honorarium 28',
        'sub_sections' => [
            'Uang Harian Perjalanan Dinas Dalam Negeri' => ['NO', 'PROVINSI', 'SATUAN', 'LUAR KOTA', 'DALAM KOTA LEBIH DARI 8 (DELAPAN) JAM', 'DIKLAT'],
            'Uang Representasi Perjalanan Dinas Dalam Negeri' => ['NO', 'URAIAN', 'SATUAN', 'LUAR KOTA', 'DALAM KOTA LEBIH DARI 8 (DELAPAN) JAM'],
        ],
    ],
    'honorarium_35' => [
        'file' => 'Honorarium 35',
        'sub_sections' => [
            'Sewa Kendaraan Pelaksanaan Kegiatan Insidentil' => ['NO', 'PROVINSI', 'SATUAN', 'RODA 4', 'RODA 6/BUS SEDANG', 'RODA 6/BUS BESAR'],
            'Sewa Kendaraan Operasional Pejabat' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
            'Sewa Kendaraan Operasional Kantor dan/atau Lapangan' => ['NO', 'PROVINSI', 'SATUAN', 'PICK UP', 'MINIBUS', 'DOUBLE GARDAN'],
        ],
    ],
    'honorarium_36' => [
        'file' => 'Honorarium 36',
        'sub_sections' => [
            'Kendaraan Dinas Pejabat' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
            'Kendaraan Pejabat Eselon III sebagai Kepala Kantor, Operasional Kantor dan/atau Lapangan Roda 4 (Empat)' => ['NO', 'PROVINSI', 'SATUAN', 'PICK UP', 'PEJABAT ESELON III/MINIBUS', 'DOUBLE GARDAN'],
            'Kendaraan Operasional Bus' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
            'Kendaraan Operasional Kantor dan/atau Lapangan Roda 2 (Dua)' => ['NO', 'PROVINSI', 'SATUAN', 'OPERASIONAL', 'LAPANGAN'],
            'Kendaraan Listrik Berbasis Baterai' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
        ],
    ],
    'beasiswa' => [
        'file' => '6. SATUAN BIAYA BANTUAN BEASISWA',
        'sub_sections' => [
            'Biaya Hidup dan Biaya Operasional' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
            'Uang Buku dan Referensi' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
        ],
    ],
    'honorarium_narasumber' => [
        'file' => '8. HONORARIUM NARASUMBER',
        'sub_sections' => [
            'Kegiatan Di Dalam Negeri' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
            'Kegiatan Di Luar Negeri' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
        ],
    ],
    'bahan_makanan' => [
        'file' => '9. SATUAN BIAYA PENGADAAN BAHAN MAKANAN',
        'sub_sections' => [
            'Pengadaan Bahan Makanan untuk Narapidana/Tahanan dan Anak di Lapas/Rutan Kementerian Hukum dan Hak Asasi Manusia' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
            'Pengadaan Bahan Makanan untuk Operasi Pasukan/Latihan Pratugas/Latihan Pasukan Lainnya Bagi Anggota Polri/TNI, Dikma/Taruna/Karbol/Kadet Bagi Anggota Polri/TNI, Diklat Lainnya Bagi Kementerian Pertahanan (Kemhan)/Anggota Polri/TNI, Anggota yang Sakit Bagi Kemhan/Anggota Polri/TNI, Tahanan Anggota Polri/TNI, dan Jaga Kawal Bagi Kemhan/Anggota Polri/TNI' => ['NO', 'PROVINSI', 'SATUAN', 'OPERASI PASUKAN/LATIHAN PRA TUGAS/LATIHAN PASUKAN LAINNYA BAGI ANGGOTA POLRI/TNI', 'DIKMA TARUNA/KARBOL/KADET BAGI ANGGOTA POLRI/TNI', 'DIKLAT LAINNYA BAGI KEMHAN/ANGGOTA POLRI/TNI', 'ANGGOTA YANG SAKIT BAGI KEMHAN/ANGGOTA POLRI/TNI', 'TAHANAN ANGGOTA POLRI/TNI', 'JAGA KAWAL BAGI KEMHAN/ANGGOTA POLRI/TNI'],
            'Pengadaan Bahan Makanan untuk Pasien Rumah Sakit dan Penyandang Masalah Kesejahteraan Sosial (PMKS)' => ['NO', 'PROVINSI', 'SATUAN', 'PASIEN RUMAH SAKIT', 'PMKS'],
            'Pengadaan Bahan Makanan untuk Keluarga Penjaga Menara Suar (PMS), Petugas Pengamatan Laut, Anak Buah Kapal (ABK) Cadangan pada Kapal Negara, ABK Aktif pada Kapal Negara, dan Petugas Stasiun Radio Pantai (SROP) dan Vessel Traffic Information Service (VTIS)' => ['NO', 'PROVINSI', 'SATUAN', 'KELUARGA PMS', 'PETUGAS PENGAMATAN LAUT', 'ABK CADANGAN PADA KAPAL NEGARA', 'ABK AKTIF PADA KAPAL NEGARA', 'PETUGAS SROP DAN VTIS'],
            'Pengadaan Bahan Makanan untuk Petugas Bengkel dan Galangan Kapal Kenavigasian, Petugas Pabrik Gas Aga untuk Lampu Suar, PMS, dan Kelompok Tenaga Kesehatan Kerja Pelayaran' => ['NO', 'PROVINSI', 'SATUAN', 'PETUGAS BENGKEL DAN GALANGAN KAPAL KENAVIGASIAN', 'PETUGAS PABRIK GAS AGA UNTUK LAMPU SUAR', 'PMS', 'KELOMPOK TENAGA KESEHATAN KERJA PELAYARAN'],
            'Pengadaan Bahan Makanan untuk Mahasiswa/Siswa Sipil dan Mahasiswa Militer/Semi Militer di Lingkup Sekolah Kedinasan' => ['NO', 'PROVINSI', 'SATUAN', 'MAHASISWA/SISWA SIPIL DI LINGKUP SEKOLAH KEDINASAN', 'MAHASISWA MILITER/SEMI MILITER DI LINGKUP SEKOLAH KEDINASAN'],
            'Pengadaan Bahan Makanan untuk Rescue Team' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
        ],
    ],
];

$mismatches = [];
$allOk = true;

foreach ($masterSBM as $category => $expected) {
    // Find in scan report
    $scanFile = null;
    foreach ($scanReport['files'] as $f) {
        if ($f['category'] === $category) {
            $scanFile = $f;
            break;
        }
    }

    if (!$scanFile) {
        $mismatches[] = "❌ {$expected['file']}: Tidak ditemukan di scan report!";
        $allOk = false;
        continue;
    }

    echo "📄 Checking: {$expected['file']} ({$category})\n";

    // Get sub-sections from scan
    $scanSubSections = [];
    if (!empty($scanFile['sheets'][0]['sub_sections'])) {
        foreach ($scanFile['sheets'][0]['sub_sections'] as $sub) {
            // Normalize label (remove extra spaces)
            $label = preg_replace('/\s+/', ' ', trim($sub['label']));
            $scanSubSections[$label] = $sub['columns'];
        }
    }

    // Compare
    foreach ($expected['sub_sections'] as $sectionLabel => $expectedCols) {
        $normalizedLabel = preg_replace('/\s+/', ' ', trim($sectionLabel));

        if (!isset($scanSubSections[$normalizedLabel])) {
            // Try partial match
            $found = false;
            foreach (array_keys($scanSubSections) as $scanLabel) {
                if (strpos($scanLabel, substr($normalizedLabel, 0, 50)) !== false ||
                    strpos($normalizedLabel, substr($scanLabel, 0, 50)) !== false) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $mismatches[] = "❌ {$expected['file']}: Section '$normalizedLabel' tidak ditemukan di scan!";
                $allOk = false;
            }
        } else {
            $scanCols = $scanSubSections[$normalizedLabel];
            // Normalize columns for comparison
            $expectedColsNormalized = array_map(fn($c) => preg_replace('/\s+/', ' ', trim($c)), $expectedCols);
            $scanColsNormalized = array_map(fn($c) => preg_replace('/\s+/', ' ', trim($c)), $scanCols);

            // Compare column count
            if (count($expectedColsNormalized) !== count($scanColsNormalized)) {
                $mismatches[] = "⚠️  {$expected['file']} - $normalizedLabel: Jumlah kolom beda (MD: " . count($expectedColsNormalized) . ", Scan: " . count($scanColsNormalized) . ")";
                $allOk = false;
            } else {
                echo "   ✅ $normalizedLabel (" . count($expectedColsNormalized) . " kolom)\n";
            }
        }
    }
    echo "\n";
}

// Summary
echo str_repeat("=", 60) . "\n";
if ($allOk && empty($mismatches)) {
    echo "✅ SEMUA COCOK! MasterSBM.md sesuai dengan scan report.\n";
} else {
    echo "⚠️  DITEMUKAN PERBEDAAN:\n\n";
    foreach ($mismatches as $mismatch) {
        echo "$mismatch\n";
    }
}
