<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST INSERT SECTION 9.2 DATA ===\n\n";

$testRow = [
    'category' => 'bahan_makanan',
    'sub_category' => null,
    'parent_section' => '9.2 Pengadaan Bahan Makanan untuk Operasi Pasukan/Latihan Pratugas/Latihan Pasukan Lainnya Bagi Anggota Polri/TNI, Dikma/Taruna/Karbol/Kadet Bagi Anggota Polri/TNI, Diklat Lainnya Bagi Kementerian Pertahanan (Kemhan)/Anggota Polri/TNI, Anggota yang Sakit Bagi Kemhan/Anggota Polri/TNI, Tahanan Anggota Polri/TNI, dan Jaga Kawal Bagi Kemhan/Anggota Polri/TNI',
    'grouping_label' => null,
    'sbm_number' => 9,
    'source_file' => '9. SATUAN BIAYA PENGADAAN BAHAN MAKANAN.xlsx',
    'display_order' => 9,
    'data' => '{"no":"01","provinsi":"A C E H","satuan":"OH","operasi_pasukan_latihan_pra_tugas_latihan_pasukan_lainnya_bagi_anggota_polri_tni":"83000","dikma_taruna_karbol_kadet_bagi_anggota_polri_tni":"83000","diklat_lainnya_bagi_kemhan_anggota_polri_tni":"87000","anggota_yang_sakit_bagi_kemhan_anggota_polri_tni":"32000","tahanan_anggota_polri_tni":"33000","jaga_kawal_bagi_kemhan_anggota_polri_tni":"70000","_detected_currency":"IDR"}',
    'currency' => 'IDR',
];

echo "Test row data:\n";
foreach ($testRow as $key => $val) {
    $display = is_null($val) ? 'NULL' : "'$val'";
    if (strlen($display) > 60) {
        $display = substr($display, 0, 57) . '...';
    }
    echo "  $key: $display\n";
}

echo "\nAttempting insert...\n";

try {
    DB::table('sbm_details')->insert($testRow);
    echo "✓ INSERT SUCCESSFUL!\n";
    $id = DB::getPdo()->lastInsertId();
    echo "Inserted ID: $id\n";

    // Verify
    $row = DB::table('sbm_details')->where('id', $id)->first();
    echo "\nVerified row in database:\n";
    echo "  parent_section: " . substr($row->parent_section ?? 'NULL', 0, 50) . "...\n";

    // Clean up
    DB::table('sbm_details')->where('id', $id)->delete();
    echo "\n✓ Test row deleted.\n";

} catch (\Exception $e) {
    echo "✗ INSERT FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nError code: " . $e->getCode() . "\n";
}
