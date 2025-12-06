<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

// Check nominatif ID 2
$nominatif = \App\Models\NominatifNew::find(2);

if ($nominatif) {
    echo "✅ Nominatif ID 2 DITEMUKAN:\n";
    echo "   ID: " . $nominatif->id . "\n";
    echo "   Status: " . $nominatif->status . "\n";
    echo "   Deskripsi: " . $nominatif->deskripsi_perjalanan_dinas . "\n";
    echo "   User ID: " . $nominatif->user_id . "\n";
    echo "   Created: " . $nominatif->created_at . "\n";
    echo "   Updated: " . $nominatif->updated_at . "\n";

    // Check related detail rows
    $detailRows = \App\Models\NominatifDetailRow::where('nominatif_id', 2)->get();
    echo "   Detail Rows Count: " . $detailRows->count() . "\n";

    // Check related evidence
    $evidence = \App\Models\NominatifEvidence::where('nominatif_id', 2)->get();
    echo "   Evidence Count: " . $evidence->count() . "\n";

} else {
    echo "❌ Nominatif ID 2 TIDAK DITEMUKAN\n";
}

// Also show all nominatifs for comparison
echo "\n📋 SEMUA NOMINATIF:\n";
$allNominatifs = \App\Models\NominatifNew::all();
foreach ($allNominatifs as $nom) {
    echo "   ID: {$nom->id} | Status: {$nom->status} | Deskripsi: {$nom->deskripsi_perjalanan_dinas}\n";
}