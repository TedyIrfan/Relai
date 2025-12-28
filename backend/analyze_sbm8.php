<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$parser = app(App\Services\SbmParserService::class);

echo "Parsing SBM 8..." . PHP_EOL;

$result = $parser->parseAll();

// Find SBM 8 data
$sbm8Data = [];
foreach ($result['data'] as $row) {
    if ($row['category'] === 'honorarium_narasumber') {
        $data = json_decode($row['data'], true);
        $sbm8Data[] = [
            'no' => $data['no'] ?? '',
            'uraian' => $data['uraian'] ?? '',
            'satuan' => $data['satuan'] ?? '',
            'besaran' => $data['besaran'] ?? '',
            'currency' => $row['currency'] ?? '',
        ];
    }
}

echo PHP_EOL . "=== SBM 8 Data (" . count($sbm8Data) . " rows) ===" . PHP_EOL;
foreach ($sbm8Data as $i => $row) {
    echo sprintf("%d. [%s] [%s] [%s] [%s] (currency: %s)",
        $i + 1,
        $row['no'],
        $row['uraian'],
        $row['satuan'],
        $row['besaran'],
        $row['currency']
    ) . PHP_EOL;
}

// Check skipped rows
echo PHP_EOL . "=== Skipped Rows ===" . PHP_EOL;
foreach ($result['file_stats'] ?? $result['fileStats'] ?? [] as $file) {
    if ($file['category'] === 'honorarium_narasumber') {
        echo "Skipped: " . $file['skipped'] . PHP_EOL;
        foreach ($file['skipped_rows'] ?? [] as $skip) {
            echo sprintf("  Row %d: %s", $skip['row_number'], $skip['reason']) . PHP_EOL;
        }
        break;
    }
}
