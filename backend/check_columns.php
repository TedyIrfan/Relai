<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$scanReport = json_decode(file_get_contents(__DIR__ . '/storage/sbm_scan_report.json'), true);

// Expected columns from MasterSBM.md
$expectedColumns = [
    'honorarium_28' => [
        '28.1' => ['NO', 'PROVINSI', 'SATUAN', 'LUAR KOTA', 'DALAM KOTA LEBIH DARI 8 (DELAPAN) JAM', 'DIKLAT'],
        '28.2' => ['NO', 'URAIAN', 'SATUAN', 'LUAR KOTA', 'DALAM KOTA LEBIH DARI 8 (DELAPAN) JAM'],
    ],
    'honorarium_29' => ['NO', 'NEGARA', 'SATUAN', 'GOLONGAN A', 'GOLONGAN B', 'GOLONGAN C', 'GOLONGAN D'],
    'honorarium_30' => ['NO', 'PROVINSI', 'SATUAN', 'TARIF HOTEL PEJABAT NEGARA/PEJABAT ESELON I', 'TARIF HOTEL PEJABAT NEGARA LAINNYA/PEJABAT ESELON II', 'TARIF HOTEL PEJABAT ESELON III/GOLONGAN IV', 'TARIF HOTEL PEJABAT ESELON IV/GOLONGAN III/II/I'],
    'honorarium_31' => [
        '31.1' => ['NO', 'PROVINSI', 'SATUAN', 'HALFDAY', 'FULLDAY', 'FULLBOARD'], // 3 golongan sama kolom
        '31.2' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
    ],
    'honorarium_32' => ['NO', 'PERWAKILAN', 'SATUAN', 'JAKARTA - PERWAKILAN Published', 'JAKARTA - PERWAKILAN Business', 'JAKARTA - PERWAKILAN First', 'PERWAKILAN - JAKARTA Published', 'PERWAKILAN - JAKARTA Business', 'PERWAKILAN - JAKARTA First'],
    'honorarium_33' => ['NO', 'PERWAKILAN RI', 'SATUAN', 'BESARAN'],
    'honorarium_34' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
    'honorarium_35' => [
        '35.1' => ['NO', 'PROVINSI', 'SATUAN', 'RODA 4', 'RODA 6/BUS SEDANG', 'RODA 6/BUS BESAR'],
        '35.2' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
        '35.3' => ['NO', 'PROVINSI', 'SATUAN', 'PICK UP', 'MINIBUS', 'DOUBLE GARDAN'],
    ],
    'honorarium_36' => [
        '36.1' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
        '36.2' => ['NO', 'PROVINSI', 'SATUAN', 'PICK UP', 'PEJABAT ESELON III/MINIBUS', 'DOUBLE GARDAN'],
        '36.3' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
        '36.4' => ['NO', 'PROVINSI', 'SATUAN', 'OPERASIONAL', 'LAPANGAN'], // EXCLUDE
        '36.5' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'], // EXCLUDE
    ],
    'honorarium_37' => ['NO', 'PROVINSI', 'SATUAN', 'PAKAIAN DINAS DOKTER', 'PAKAIAN DINAS PEGAWAI/PERAWAT', 'PAKAIAN SERAGAM MAHASISWA/TARUNA', 'PAKAIAN KERJA PENGEMUDI/PETUGAS KEBERSIHAN/PRAMUBAKTI', 'PAKAIAN KERJA SATPAM'],
    'honorarium_38' => [
        '38.1' => ['NO', 'PROVINSI', 'SATUAN', 'MAKAN', 'KUDAPAN (SNACK)'],
        '38.2' => ['NO', 'PROVINSI', 'SATUAN', 'MAKAN', 'KUDAPAN (SNACK)'],
    ],
    'honorarium_39' => ['NO', 'PROVINSI', 'SATUAN', 'MAKAN', 'KUDAPAN (SNACK)'],
    'transportasi_provinsi' => ['NO', 'IBUKOTA PROVINSI', 'KABUPATEN/KOTA TUJUAN', 'SATUAN', 'BESARAN'],
    'transportasi_dki' => ['NO', 'IBUKOTA PROVINSI', 'KABUPATEN/KOTA TUJUAN', 'SATUAN', 'BESARAN'],
    'transportasi_kabupaten' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
    'pemeliharaan_sarana_kantor' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
    'penerjemahan_pengetikan' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
    'beasiswa' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
    'sewa_fotokopi' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
    'honorarium_narasumber' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
    'bahan_makanan' => [
        '9.1' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
        '9.2' => ['NO', 'PROVINSI', 'SATUAN', 'OPERASI PASUKAN/LATIHAN PRA TUGAS/LATIHAN PASUKAN LAINNYA BAGI ANGGOTA POLRI/TNI', 'DIKMA TARUNA/KARBOL/KADET BAGI ANGGOTA POLRI/TNI', 'DIKLAT LAINNYA BAGI KEMHAN/ANGGOTA POLRI/TNI', 'ANGGOTA YANG SAKIT BAGI KEMHAN/ANGGOTA POLRI/TNI', 'TAHANAN ANGGOTA POLRI/TNI', 'JAGA KAWAL BAGI KEMHAN/ANGGOTA POLRI/TNI'], // EXCLUDE
        '9.3' => ['NO', 'PROVINSI', 'SATUAN', 'PASIEN RUMAH SAKIT', 'PMKS'],
        '9.4' => ['NO', 'PROVINSI', 'SATUAN', 'KELUARGA PMS', 'PETUGAS PENGAMATAN LAUT', 'ABK CADANGAN PADA KAPAL NEGARA', 'ABK AKTIF PADA KAPAL NEGARA', 'PETUGAS SROP DAN VTIS'],
        '9.5' => ['NO', 'PROVINSI', 'SATUAN', 'PETUGAS BENGKEL DAN GALANGAN KAPAL KENAVIGASIAN', 'PETUGAS PABRIK GAS AGA UNTUK LAMPU SUAR', 'PMS'],
        '9.6' => ['NO', 'PROVINSI', 'SATUAN', 'MAHASISWA/SISWA SIPIL DI LINGKUP SEKOLAH KEDINASAN', 'MAHASISWA MILITER/SEMI MILITER DI LINGKUP SEKOLAH KEDINASAN'],
        '9.7' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
    ],
    'konsumsi_tahanan' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
    'keperluan_perkantoran' => ['NO', 'PROVINSI', 'MEMILIKI SAMPAI DENGAN 40 PEGAWAI (SATUAN)', 'MEMILIKI SAMPAI DENGAN 40 PEGAWAI (BESARAN)', 'MEMILIKI LEBIH DARI 40 PEGAWAI (SATUAN)', 'MEMILIKI LEBIH DARI 40 PEGAWAI (BESARAN)'],
    'penggantian_inventaris' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
    'pemeliharaan_kendaraan' => [
        '13.1' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
        '13.2' => ['NO', 'PROVINSI', 'SATUAN', 'RODA EMPAT', 'DOUBLE GARDAN', 'RODA DUA'],
        '13.3' => ['NO', 'URAIAN', 'SATUAN', 'BESARAN'],
        '13.4' => ['NO', 'PROVINSI', 'SATUAN', 'PJR RODA EMPAT', 'PJR RODA DUA (≤ 250 CC)', 'PJR RODA DUA (≥ 750 CC)'],
    ],
    'pemeliharaan_gedung' => ['NO', 'PROVINSI', 'SATUAN', 'GEDUNG BERTINGKAT', 'GEDUNG TIDAK BERTINGKAT', 'HALAMAN GEDUNG/BANGUNAN KANTOR'],
    'sewa_gedung' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
    'transportasi_terminal' => ['NO', 'PROVINSI', 'SATUAN', 'BESARAN'],
    'tiket_pesawat_dalam_negeri' => ['NO', 'KOTA ASAL', 'KOTA TUJUAN', 'SATUAN BIAYA TIKET BISNIS', 'SATUAN BIAYA TIKET EKONOMI'],
    'tiket_pesawat_luar_negeri' => ['NO', 'KOTA', 'BESARAN EKSEKUTIF', 'BESARAN BISNIS', 'BESARAN EKONOMI'],
    'perwakilan_ri' => [
        '19.1' => ['NO', 'KOTA', 'ATK (OT)', 'LANGGANAN KORAN/MAJALAH (EKSEMPLAR/BULAN)', 'LAMPU (BUAH)', 'PENGAMANAN SENDIRI (OB)', 'KANTONG DIPLOMATIK (KG)', 'JAMUAN (OH)'],
        '19.2' => ['NO', 'KOTA', 'PEMELIHARAAN KENDARAAN DINAS (UNIT/TAHUN)', 'PEMELIHARAAN GEDUNG (M2/TAHUN)', 'PEMELIHARAAN HALAMAN (M2/TAHUN)', 'PENGADAAN INVENTARIS KANTOR (OT)', 'PAKAIAN SOPIR/SATPAM (STEL)', 'SEWA KENDARAAN SEDAN (HARI)', 'SEWA KENDARAAN BUS (HARI)', 'SEWA KENDARAAN MOBIL BOX (HARI)', 'KONSUMSI RAPAT (OK)'],
    ],
];

echo "==========================================" . PHP_EOL;
echo "  COLUMN VALIDATION REPORT" . PHP_EOL;
echo "==========================================" . PHP_EOL . PHP_EOL;

$mismatches = [];
$matches = [];

foreach ($scanReport['files'] as $file) {
    $category = $file['category'];
    $filename = $file['filename'];

    if (!isset($expectedColumns[$category])) {
        echo "⚠️  Category '$category' not in expected columns mapping" . PHP_EOL;
        continue;
    }

    $expected = $expectedColumns[$category];

    foreach ($file['sheets'] as $sheet) {
        // Check if has sub_sections
        if (!empty($sheet['sub_sections'])) {
            foreach ($sheet['sub_sections'] as $subSection) {
                $label = $subSection['label'];
                $actualColumns = $subSection['columns'];

                // Normalize column names for comparison
                $actualNormalized = array_map(function($col) {
                    return strtoupper(trim($col));
                }, $actualColumns);

                // Find expected columns for this sub-section
                $expectedCols = null;
                if (is_array($expected) && isset($expected[$label])) {
                    $expectedCols = $expected[$label];
                } else if (is_array($expected) && !is_numeric(key($expected))) {
                    // Has sub-sections, try to find matching label
                    $found = false;
                    foreach ($expected as $key => $cols) {
                        // Skip if cols is array (nested structure)
                        if (!is_array($cols) && (strpos($label, $key) !== false || strpos($key, $label) !== false)) {
                            $expectedCols = $cols;
                            $found = true;
                            break;
                        }
                    }
                    if (!$found) {
                        // Use first non-array value
                        foreach ($expected as $key => $cols) {
                            if (!is_array($cols)) {
                                $expectedCols = $cols;
                                break;
                            }
                        }
                    }
                } else {
                    $expectedCols = $expected;
                }

                // Ensure expectedCols is array
                if (!is_array($expectedCols)) {
                    $expectedCols = [$expectedCols];
                }

                // Flatten if nested
                $flatExpectedCols = [];
                foreach ($expectedCols as $col) {
                    if (is_array($col)) {
                        $flatExpectedCols = array_merge($flatExpectedCols, $col);
                    } else {
                        $flatExpectedCols[] = $col;
                    }
                }
                $expectedCols = $flatExpectedCols;

                $expectedNormalized = array_map(function($col) {
                    return strtoupper(trim($col));
                }, $expectedCols);

                // Compare
                $missingExpected = array_diff($expectedNormalized, $actualNormalized);
                $extraActual = array_diff($actualNormalized, $expectedNormalized);

                if (empty($missingExpected) && empty($extraActual)) {
                    $matches[] = "$category - $label";
                } else {
                    $mismatches[] = [
                        'category' => $category,
                        'filename' => $filename,
                        'section' => $label,
                        'expected' => $expectedNormalized,
                        'actual' => $actualNormalized,
                        'missing' => $missingExpected,
                        'extra' => $extraActual,
                    ];
                }
            }
        } else {
            // No sub_sections, check sheet columns
            $actualColumns = $sheet['columns'];
            $actualNormalized = array_map(function($col) {
                return strtoupper(trim($col));
            }, $actualColumns);

            // Get expected columns
            if (is_array($expected) && !is_numeric(key($expected))) {
                // Has sub-sections, use first non-array value
                $expectedCols = null;
                foreach ($expected as $key => $cols) {
                    if (!is_array($cols)) {
                        $expectedCols = $cols;
                        break;
                    }
                }
                if ($expectedCols === null) {
                    $expectedCols = $expected;
                }
            } else {
                $expectedCols = $expected;
            }

            // Ensure expectedCols is array
            if (!is_array($expectedCols)) {
                $expectedCols = [$expectedCols];
            }

            // Flatten if nested
            $flatExpectedCols = [];
            foreach ($expectedCols as $col) {
                if (is_array($col)) {
                    $flatExpectedCols = array_merge($flatExpectedCols, $col);
                } else {
                    $flatExpectedCols[] = $col;
                }
            }
            $expectedCols = $flatExpectedCols;

            $expectedNormalized = array_map(function($col) {
                return strtoupper(trim($col));
            }, $expectedCols);

            $missingExpected = array_diff($expectedNormalized, $actualNormalized);
            $extraActual = array_diff($actualNormalized, $expectedNormalized);

            if (empty($missingExpected) && empty($extraActual)) {
                $matches[] = "$category";
            } else {
                $mismatches[] = [
                    'category' => $category,
                    'filename' => $filename,
                    'section' => 'Main',
                    'expected' => $expectedNormalized,
                    'actual' => $actualNormalized,
                    'missing' => $missingExpected,
                    'extra' => $extraActual,
                ];
            }
        }
    }
}

echo "✅ MATCHES (" . count($matches) . " categories):" . PHP_EOL;
foreach ($matches as $m) {
    echo "  ✓ $m" . PHP_EOL;
}

echo PHP_EOL . "❌ MISMATCHES (" . count($mismatches) . " issues):" . PHP_EOL . PHP_EOL;

foreach ($mismatches as $i => $issue) {
    echo "[" . ($i + 1) . "] {$issue['category']}" . PHP_EOL;
    echo "    File: {$issue['filename']}" . PHP_EOL;
    echo "    Section: {$issue['section']}" . PHP_EOL;

    if (!empty($issue['missing'])) {
        echo "    Missing columns: " . implode(', ', $issue['missing']) . PHP_EOL;
    }

    if (!empty($issue['extra'])) {
        echo "    Extra columns: " . implode(', ', $issue['extra']) . PHP_EOL;
    }

    echo "    Expected: " . implode(', ', $issue['expected']) . PHP_EOL;
    echo "    Actual:   " . implode(', ', $issue['actual']) . PHP_EOL;
    echo PHP_EOL;
}

echo "==========================================" . PHP_EOL;
echo "  SUMMARY" . PHP_EOL;
echo "==========================================" . PHP_EOL;
echo "Total Categories: " . (count($matches) + count($mismatches)) . PHP_EOL;
echo "✅ Match: " . count($matches) . PHP_EOL;
echo "❌ Mismatch: " . count($mismatches) . PHP_EOL;

if (count($mismatches) === 0) {
    echo PHP_EOL . "🎉 ALL COLUMNS MATCH MasterSBM.md!" . PHP_EOL;
} else {
    echo PHP_EOL . "⚠️  Some columns don't match. Please review." . PHP_EOL;
}
