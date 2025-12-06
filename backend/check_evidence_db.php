<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

// Check current evidence data in database
echo "🔍 CHECKING EVIDENCE DATA IN DATABASE\n";
echo "=====================================\n\n";

// Get all evidence records
$evidenceRecords = \App\Models\NominatifEvidence::with('detailRow')->get();

echo "📊 Total Evidence Records: " . $evidenceRecords->count() . "\n\n";

foreach ($evidenceRecords as $evidence) {
    echo "📄 Evidence ID: {$evidence->id}\n";
    echo "   Nominatif ID: {$evidence->nominatif_id}\n";
    echo "   Detail Row ID: {$evidence->nominatif_detail_row_id}\n";
    echo "   Person Name: " . ($evidence->detailRow->person_name ?? 'N/A') . "\n";
    echo "   Row Order: " . ($evidence->detailRow->row_order ?? 'N/A') . "\n";
    echo "   Keterangan: {$evidence->keterangan}\n";
    echo "   Evidence Link: {$evidence->evidence_link}\n";
    echo "   Evidence Name: {$evidence->evidence_name}\n";
    echo "   Created: {$evidence->created_at}\n";
    echo "   Updated: {$evidence->updated_at}\n";
    echo "   ----------------------------------------\n";
}

echo "\n✅ Database check completed!\n";