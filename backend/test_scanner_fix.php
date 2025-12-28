<?php
require __DIR__ . '/vendor/autoload.php';

use App\Services\SbmMappingService;
use App\Services\SbmScannerService;
use PhpOffice\PhpSpreadsheet\IOFactory;

echo "=== TEST SCANNER FIX FOR GROUPING LABELS ===\n\n";

// Initialize services
$mapping = new SbmMappingService();
$scanner = new SbmScannerService();

// Test H35 file
$file35 = 'storage/imports/Master_SBM/Honorarium 35 SATUAN BIAYA SEWA KENDARAAN.xlsx';
$category35 = 'honorarium_35';

echo "Testing: $file35\n";
echo "Category: $category35\n\n";

try {
    $spreadsheet = IOFactory::load($file35);
    $sheet = $spreadsheet->getSheetByName('Honorarium35');

    $scanResult = $scanner->scanSheet($sheet, 'Honorarium35', $category35);

    echo "=== SCAN RESULT ===\n";
    echo "Has sections: " . ($scanResult['has_sections'] ? 'Yes' : 'No') . "\n";
    echo "Sub-sections: " . count($scanResult['sub_sections']) . "\n\n";

    foreach ($scanResult['sub_sections'] as $idx => $section) {
        echo "Sub-section " . ($idx + 1) . ": " . $section['label'] . "\n";
        echo "  Data range: rows " . $section['data_start_row'] . " to " . $section['data_end_row'] . "\n";

        // Check if PEJABAT ESELON II is in sample data
        $found = false;
        foreach ($section['sample_data'] as $sample) {
            foreach ($sample as $col => $val) {
                if (stripos($val, 'PEJABAT ESELON II') !== false) {
                    $found = true;
                    echo "  ✅ FOUND IN SAMPLE DATA: $col = '$val'\n";
                    break;
                }
            }
        }

        if (!$found) {
            echo "  Checking raw Excel rows around expected location...\n";
            // For sub-section 2 (Sewa Kendaraan Operasional Pejabat), check rows 45-50
            if ($idx === 1) {
                for ($r = 45; $r <= 50; $r++) {
                    $rowTexts = [];
                    for ($c = 1; $c <= 4; $c++) {
                        $val = trim($sheet->getCell([$c, $r])->getFormattedValue());
                        if ($val !== '' && $val !== '-') {
                            $rowTexts[] = $val;
                        }
                    }
                    if (!empty($rowTexts)) {
                        $rowStr = implode(' | ', $rowTexts);
                        if (stripos($rowStr, 'PEJABAT ESELON') !== false) {
                            echo "  Row $r: $rowStr ⭐\n";
                        }
                    }
                }
            }
        }
        echo "\n";
    }

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n=== COMPLETE ===\n";
