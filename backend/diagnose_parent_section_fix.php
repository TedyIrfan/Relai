<?php
require __DIR__ . '/vendor/autoload.php';

$mapping = new App\Services\SbmMappingService();
$parser = new App\Services\SbmParserService($mapping);

// Use reflection to get the private method
$reflection = new ReflectionClass($parser);
$method = $reflection->getMethod('getSubCategoryFromSectionLabel');
$method->setAccessible(true);

echo "=== DIAGNOSIS: SCAN LABEL vs PARSER MAPPING ===\n\n";

// Test mapping untuk H35
echo "=== H35 ===\n";
echo "Scan report: 'Sewa  Kendaraan  Operasional  Pejabat' (double spaces)\n";
echo "Parser expects: 'Sewa Kendaraan Operasional Pejabat' (single space)\n";
$result35_single = $method->invoke($parser, 'Sewa Kendaraan Operasional Pejabat', 'honorarium_35');
$result35_double = $method->invoke($parser, 'Sewa  Kendaraan  Operasional  Pejabat', 'honorarium_35');
echo "  Match with single space: " . ($result35_single['parent_section'] ?? 'NULL') . "\n";
echo "  Match with double space: " . ($result35_double['parent_section'] ?? 'NULL') . " ❌\n\n";

// Test mapping untuk H36
echo "=== H36 ===\n";
echo "Scan report: 'Kendaraan  Dinas  Pejabat' (double spaces)\n";
echo "Parser expects: 'Kendaraan Dinas Pejabat' (single space)\n";
$result36_single = $method->invoke($parser, 'Kendaraan Dinas Pejabat', 'honorarium_36');
$result36_double = $method->invoke($parser, 'Kendaraan  Dinas  Pejabat', 'honorarium_36');
echo "  Match with single space: " . ($result36_single['parent_section'] ?? 'NULL') . "\n";
echo "  Match with double space: " . ($result36_double['parent_section'] ?? 'NULL') . " ❌\n\n";

// Test mapping untuk beasiswa
echo "=== BEASISWA (No 6) ===\n";
echo "Scan report: 'Uang  Buku  dan  Referensi' (double spaces)\n";
echo "Parser expects: 'Uang Buku dan Referensi' (single space)\n";
$result6_single = $method->invoke($parser, 'Uang Buku dan Referensi', 'beasiswa');
$result6_double = $method->invoke($parser, 'Uang  Buku  dan  Referensi', 'beasiswa');
echo "  Match with single space: " . ($result6_single['parent_section'] ?? 'NULL') . "\n";
echo "  Match with double space: " . ($result6_double['parent_section'] ?? 'NULL') . " ❌\n\n";

// Test mapping untuk narasumber
echo "=== NARASUMBER (No 8) ===\n";
echo "Scan report: 'Kegiatan  Di  Luar  Negeri' (double spaces)\n";
echo "Parser expects: 'Kegiatan Di Luar Negeri' (single space)\n";
$result8_single = $method->invoke($parser, 'Kegiatan Di Luar Negeri', 'honorarium_narasumber');
$result8_double = $method->invoke($parser, 'Kegiatan  Di  Luar  Negeri', 'honorarium_narasumber');
echo "  Match with single space: " . ($result8_single['parent_section'] ?? 'NULL') . "\n";
echo "  Match with double space: " . ($result8_double['parent_section'] ?? 'NULL') . " ❌\n\n";

echo "=== ROOT CAUSE ===\n";
echo "Scan report section labels masih memiliki multiple spaces!\n";
echo "Normalisasi di scanner TIDAK BEKERJA untuk semua cases.\n";
echo "Parser mapping hanya punya single space, jadi TIDAK MATCH!\n";
echo "Hasil: parent_section jadi NULL untuk semua yang double spaces.\n";
