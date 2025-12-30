<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== VERIFIKASI SBM MAPPING ===\n\n";

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);
$mappingService = app('App\Services\SbmMappingService');

$issues = [];
$verified = 0;
$total = 0;

foreach ($scanReport['files'] as $fileInfo) {
    $category = $fileInfo['category'];
    $filename = $fileInfo['filename'];
    
    if (empty($fileInfo['sheets'][0]['sub_sections'])) {
        // No sub-sections
        $scanCols = $fileInfo['sheets'][0]['columns'] ?? [];
        $mappingCols = $mappingService->getStructure($category)['columns'] ?? [];
        
        $total++;
        if (count($scanCols) !== count($mappingCols)) {
            $issues[] = "$filename: Column count mismatch (scan=" . count($scanCols) . ", mapping=" . count($mappingCols) . ")";
        } else {
            $verified++;
        }
    } else {
        // Has sub-sections
        foreach ($fileInfo['sheets'][0]['sub_sections'] as $sub) {
            $subLabel = $sub['label'];
            $scanCols = $sub['columns'] ?? [];
            
            // Get mapping columns for this sub-section
            $categoryInfo = getCategoryInfo($subLabel, $category);
            $subCategory = $categoryInfo['sub_category'];
            $mappingCols = $mappingService->getStructure($category)['sub_categories'][$subCategory]['columns'] ?? [];
            
            $total++;
            if (count($scanCols) !== count($mappingCols)) {
                $issues[] = "$filename - $subLabel: Column count mismatch (scan=" . count($scanCols) . ", mapping=" . count($mappingCols) . ")";
            } else {
                $verified++;
            }
        }
    }
}

echo "Total sections: $total\n";
echo "Verified: $verified\n";
echo "Issues: " . count($issues) . "\n\n";

if (!empty($issues)) {
    echo "ISSUES:\n";
    foreach ($issues as $issue) {
        echo "  - $issue\n";
    }
} else {
    echo "✅ SEMUA SECTION SUDAH SESUAI!\n";
}

// Helper function to determine sub-category from label
function getCategoryInfo($label, $category) {
    // Section to sub-category mapping
    $sectionMap = [
        // Honorarium 28
        'Uang Harian Perjalanan Dinas Dalam Negeri' => '28.1',
        'Uang Representasi Perjalanan Dinas Dalam Negeri' => '28.2',
        // Honorarium 31
        'Paket Kegiatan Rapat/Pertemuan di Luar Kantor' => '31.1',
        'Uang Harian Kegiatan Rapat/Pertemuan di Luar Kantor' => '31.2',
        // Honorarium 35
        'Sewa Kendaraan Pelaksanaan Kegiatan Insidentil' => '35.1',
        'Sewa Kendaraan Operasional Pejabat' => '35.2',
        'Sewa Kendaraan Operasional Kantor dan/atau Lapangan' => '35.3',
        // Honorarium 36
        'Kendaraan Dinas Pejabat' => '36.1',
        'Kendaraan Pejabat Eselon III sebagai Kepala Kantor, Operasional Kantor dan/atau Lapangan Roda 4 (Empat)' => '36.2',
        'Kendaraan Operasional Bus' => '36.3',
        'Kendaraan Operasional Kantor dan/atau Lapangan Roda 2 (Dua)' => '36.4',
        'Kendaraan Listrik Berbasis Baterai' => '36.5',
        // Honorarium 38
        'Rapat Koordinasi Tingkat Menteri/ ESELON I/SETARA' => '38.1',
        'RAPAT BIASA' => '38.2',
        // Section 5
        'Dari Bahasa Asing ke Bahasa Indonesia atau Sebaliknya' => '5.1',
        'Dari Bahasa Indonesia ke Bahasa Daerah/Bahasa Lokal atau Sebaliknya' => '5.2',
        // Section 6
        'Biaya Hidup dan Biaya Operasional' => '6.1',
        // Section 8
        'Kegiatan Di Dalam Negeri' => '8.1',
        'Kegiatan Di Luar Negeri' => '8.2',
        // Section 9
        'Pengadaan Bahan Makanan untuk Narapidana/Tahanan dan Anak di Lapas/Rutan Kementerian Hukum dan Hak Asasi Manusia' => '9.1',
        'Pengadaan Bahan Makanan untuk Operasi Pasukan/Latihan Pratugas/Latihan Pasukan Lainnya Bagi Anggota Polri/TNI, Dikma/Taruna/Karbol/Kadet Bagi Anggota Polri/TNI, Diklat Lainnya Bagi Kementerian Pertahanan (Kemhan)/Anggota Polri/TNI, Anggota yang Sakit Bagi Kemhan/Anggota Polri/TNI, Tahanan Anggota Polri/TNI, dan Jaga Kawal Bagi Kemhan/Anggota Polri/TNI' => '9.2',
        'Pengadaan Bahan Makanan untuk Pasien Rumah Sakit dan Penyandang Masalah Kesejahteraan Sosial (PMKS)' => '9.3',
        'Pengadaan Bahan Makanan untuk Keluarga Penjaga Menara Suar (PMS), Petugas Pengamatan Laut, Anak Buah Kapal (ABK) Cadangan pada Kapal Negara, ABK Aktif pada Kapal Negara, dan Petugas Stasiun Radio Pantai (SROP) dan Vessel Traffic Information Service (VTIS)' => '9.4',
        'Pengadaan Bahan Makanan untuk Petugas Bengkel dan Galangan Kapal Kenavigasian, Petugas Pabrik Gas Aga untuk Lampu Suar, PMS, dan Kelompok Tenaga Kesehatan Kerja Pelayaran' => '9.5',
        'Pengadaan Bahan Makanan untuk Mahasiswa/Siswa Sipil dan Mahasiswa Militer/Semi Militer di Lingkup Sekolah Kedinasan' => '9.6',
        'Pengadaan Bahan Makanan untuk Rescue Team' => '9.7',
        // Section 13
        'Kendaraan Dinas Pejabat' => '13.1',
        'Kendaraan Dinas Operasional' => '13.2',
        'Operasional dalam Lingkungan Kantor, Roda 6, Roda 6 Khusus Tahanan Kejaksaan, dan Speed Boat' => '13.3',
        'Kendaraan Dinas Operasional Patroli Jalan Raya (PJR)' => '13.4',
        'Operasional Kendaraan Dinas Untuk Pengadaan Dari Sewa' => '13.5',
        'Kendaraan Bermotor Listrik Berbasis Baterai' => '13.6',
        // Section 19
        'ATK, Langgapan Koran/Majalah, Lampu, Pengamanan Sendiri, Kantong Diplomatik, dan Jamuan' => '19.1',
        'Pemeliharaan, Pengadaan Inventaris Kantor, Pakaian Sopir/Satpam, Sewa Kendaraan, dan Konsumsi Rapat' => '19.2',
    ];
    
    $subCategory = $sectionMap[$label] ?? null;
    return ['sub_category' => $subCategory];
}
