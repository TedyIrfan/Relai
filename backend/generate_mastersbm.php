<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== GENERATE MasterSBM.md FROM SCAN REPORT ===\n\n";

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

// Mapping untuk section numbering
$sectionMapping = [
    'honorarium_28' => ['Honorarium 28', 'SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI'],
    'honorarium_29' => ['Honorarium 29', 'SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI'],
    'honorarium_30' => ['Honorarium 30', 'SATUAN BIAYA PENGINAPAN PERJALANAN DINAS DALAM NEGERI'],
    'honorarium_31' => ['Honorarium 31', 'SATUAN BIAYA RAPAT/PERTEMUAN DI LUAR KANTOR'],
    'honorarium_32' => ['Honorarium 32', 'SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE WAY)'],
    'honorarium_33' => ['Honorarium 33', 'SATUAN BIAYA OPERASIONAL KHUSUS KEPALA PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI'],
    'honorarium_34' => ['Honorarium 34', 'SATUAN BIAYA MAKANAN PENAMBAH DAYA TAHAN TUBUH'],
    'honorarium_35' => ['Honorarium 35', 'SATUAN BIAYA SEWA KENDARAAN'],
    'honorarium_36' => ['Honorarium 36', 'SATUAN BIAYA PENGADAAN KENDARAAN DINAS'],
    'honorarium_37' => ['Honorarium 37', 'SATUAN BIAYA PENGADAAN PAKAIAN DINAS'],
    'honorarium_38' => ['Honorarium 38', 'SATUAN BIAYA KONSUMSI RAPAT/PERTEMUAN'],
    'honorarium_39' => ['Honorarium 39', 'SATUAN BIAYA KONSUMSI KEGIATAN PENDIDIKAN DAN PELATIHAN (DIKLAT)'],
    'transportasi_provinsi' => ['1', 'SATUAN BIAYA TRANSPORTASI DARAT DARI IBUKOTA PROVINSI KE KABUPATEN/KOTA DALAM PROVINSI YANG SAMA (ONE WAY)'],
    'transportasi_dki' => ['2', 'SATUAN BIAYA TRANSPORTASI DARI DKI JAKARTA KE KABUPATEN/KOTA SEKITAR (ONE WAY)'],
    'transportasi_kabupaten' => ['3', 'SATUAN BIAYA TRANSPOR KEGIATAN DALAM KABUPATEN/KOTA PERGI PULANG (PP)'],
    'pemeliharaan_sarana_kantor' => ['4', 'SATUAN BIAYA PEMELIHARAAN SARANA KANTOR'],
    'penerjemahan_pengetikan' => ['5', 'SATUAN BIAYA PENERJEMAHAN DAN PENGETIKAN'],
    'beasiswa' => ['6', 'SATUAN BIAYA BANTUAN BEASISWA PROGRAM GELAR/NONGELAR DALAM NEGERI'],
    'sewa_fotokopi' => ['7', 'SATUAN BIAYA SEWA MESIN FOTOKOPI'],
    'honorarium_narasumber' => ['8', 'HONORARIUM NARASUMBER/PAKAR/PRAKTISI/PROFESIONAL'],
    'bahan_makanan' => ['9', 'SATUAN BIAYA PENGADAAN BAHAN MAKANAN'],
    'konsumsi_tahanan' => ['10', 'SATUAN BIAYA KONSUMSI TAHANAN/DETENI/ABK NONJUSTISIA'],
    'keperluan_perkantoran' => ['11', 'SATUAN BIAYA KEPERLUAN SEHARI-HARI PERKANTORAN DI DALAM NEGERI'],
    'penggantian_inventaris' => ['12', 'SATUAN BIAYA PENGGANTIAN INVENTARIS LAMA DAN/ATAU PEMBELIAN INVENTARIS UNTUK PEGAWAI BARU'],
    'pemeliharaan_kendaraan' => ['13', 'SATUAN BIAYA PEMELIHARAAN DAN OPERASIONAL KENDARAAN DINAS'],
    'pemeliharaan_gedung' => ['14', 'SATUAN BIAYA PEMELIHARAAN GEDUNG/BANGUNAN DALAM NEGERI'],
    'sewa_gedung' => ['15', 'SATUAN BIAYA SEWA GEDUNG PERTEMUAN'],
    'transportasi_terminal' => ['16', 'SATUAN BIAYA TRANSPORTASI DARI DAN/ATAU KE TERMINAL BUS/STASIUN/BANDARA/PELABUHAN DALAM RANGKA PERJALANAN DINAS DALAM NEGERI'],
    'tiket_pesawat_dalam_negeri' => ['17', 'SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS DALAM NEGERI PERGI PULANG (PP)'],
    'tiket_pesawat_luar_negeri' => ['18', 'SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP)'],
    'perwakilan_ri' => ['19', 'SATUAN BIAYA PENYELENGGARAAN PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI'],
];

$md = "# Master Standar Biaya Masukan (SBM)\n\n";
$md .= "## Daftar Isi\n\n";

// Generate TOC
foreach ($scanReport['files'] as $f) {
    $cat = $f['category'];
    if (isset($sectionMapping[$cat])) {
        list($num, $name) = $sectionMapping[$cat];
        $anchor = strtolower(str_replace([' ', '/', '(', ')'], '-', $name));
        $md .= "- [$num. $name](#$anchor)\n";
    }
}

$md .= "\n---\n\n";

// Generate content
foreach ($scanReport['files'] as $f) {
    $cat = $f['category'];
    if (!isset($sectionMapping[$cat])) {
        continue;
    }
    list($num, $name) = $sectionMapping[$cat];
    $anchor = strtolower(str_replace([' ', '/', '(', ')'], '-', $name));

    $md .= "## $num. $name\n\n";

    $sheet = $f['sheets'][0];

    if (!empty($sheet['sub_sections'])) {
        $subCount = 1;
        foreach ($sheet['sub_sections'] as $sub) {
            $label = $sub['label'];
            $cols = $sub['columns'];

            // Generate sub-section number
            if (preg_match('/^Honorarium (\d+)/', $name, $m)) {
                $honNum = $m[1];
                $md .= "### Honorarium $honNum.$subCount " . $label . "\n\n";
            } elseif (preg_match('/^(\d+)\./', $num, $m)) {
                $mainNum = $m[1];
                $md .= "### $mainNum.$subCount " . $label . "\n\n";
            } else {
                $md .= "### " . $label . "\n\n";
            }

            $md .= "**Kolom:**\n\n";
            foreach ($cols as $col) {
                $md .= "- " . $col . "\n";
            }
            $md .= "\n---\n\n";
            $subCount++;
        }
    } else {
        // No sub-sections
        $cols = $sheet['columns'];
        $md .= "**Kolom:**\n\n";
        foreach ($cols as $col) {
            $md .= "- " . $col . "\n";
        }
        $md .= "\n---\n\n";
    }
}

// Add currency note
$md .= "\n**Catatan:** Dokumen ini merupakan referensi struktur data Standar Biaya Masukan (SBM) untuk keperluan perencanaan anggaran dan pelaporan keuangan negara.\n\n";
$md .= "**Mata Uang:**\n\n";
$md .= "File berikut menggunakan mata uang DOLLAR (USD):\n";
$md .= "1. Honorarium 29\n";
$md .= "2. Honorarium 32\n";
$md .= "3. Honorarium 33\n";
$md .= "4. 19.1 ATK, Langgapan Koran/Majalah, Lampu, Pengamanan Sendiri, Kantong Diplomatik, dan Jamuan\n";
$md .= "5. 19.2 Pemeliharaan, Pengadaan Inventaris Kantor, Pakaian Sopir/Satpam, Sewa Kendaraan, dan Konsumsi Rapat\n";
$md .= "6. SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP)\n\n";
$md .= "File lainnya menggunakan Rupiah.\n";

// Write to file
$mdPath = dirname(__DIR__) . '/MasterSBM.md';
file_put_contents($mdPath, $md);

echo "✅ MasterSBM.md berhasil di-generate!\n";
echo "File: $mdPath\n";
echo "Total sections: " . count($scanReport['files']) . "\n";
