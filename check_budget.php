<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

echo "=== CHECK DATABASE ===\n";

// Check latest nominatif records
echo "\n1. LATEST NOMINATIF RECORDS:\n";
$nominatifs = App\Models\Nominatif::with('rkaDetail')
    ->whereIn('rka_detail_id', [43, 57]) // RKA IDs yang kamu pakai
    ->latest()
    ->take(5)
    ->get(['id', 'rka_detail_id', 'deskripsi_perjalanan_dinas', 'total_pagu', 'status']);

foreach ($nominatifs as $nom) {
    echo "ID: {$nom->id} | RKA: {$nom->rka_detail_id} | Kode: {$nom->rkaDetail->code_rka} | Total: " . number_format($nom->total_pagu, 0, ',', '.') . " | Status: {$nom->status}\n";
}

// Check RKA Details budget status
echo "\n2. RKA DETAILS BUDGET STATUS:\n";
$rkaDetails = App\Models\RkaDetail::whereIn('id', [43, 57])
    ->get(['id', 'code_rka', 'layanan', 'anggaran_layanan', 'anggaran_layanan_used']);

foreach ($rkaDetails as $rka) {
    $available = $rka->anggaran_layanan - $rka->anggaran_layanan_used;
    echo "ID: {$rka->id} | Kode: {$rka->code_rka} | Layanan: {$rka->layanan}\n";
    echo "   Total: " . number_format($rka->anggaran_layanan, 0, ',', '.') . " | Used: " . number_format($rka->anggaran_layanan_used, 0, ',', '.') . " | Available: " . number_format($available, 0, ',', '.') . "\n";
}

echo "\n3. NOMINATIF COUNTS PER RKA:\n";
foreach ($rkaDetails as $rka) {
    $count = App\Models\Nominatif::where('rka_detail_id', $rka->id)->count();
    echo "RKA {$rka->id}: {$count} nominatif records\n";
}