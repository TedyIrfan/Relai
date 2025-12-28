<?php
// Generate MasterSBM.md from sbm_scan_report.json

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

// Helper to create slug
function createSlug($text) {
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    $text = trim($text, '-');
    return $text;
}

// Helper to get display name
function getDisplayName($filename) {
    $mapping = [
        'Honorarium 28 SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI.xlsx' => 'Honorarium 28',
        'Honorarium 29 SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI.xlsx' => 'Honorarium 29',
        'Honorarium 30 PENGINAPAN DINAS DALAM NEGERI.xlsx' => 'Honorarium 30',
        'Honorarium 31 SATUAN BIAYA RAPAT atau PERTEMUAN DI LUAR KANTOR.xlsx' => 'Honorarium 31',
        'Honorarium 32 SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE  WAY ).xlsx' => 'Honorarium 32',
        'Honorarium 33 SATUAN BIAYA OPERASIONAL KHUSUS KEPALA PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI.xlsx' => 'Honorarium 33',
        'Honorarium 34 SATUAN BIAYA MAKANAN PENAMBAH DAYA TAHAN TUBUH.xlsx' => 'Honorarium 34',
        'Honorarium 35 SATUAN BIAYA SEWA KENDARAAN.xlsx' => 'Honorarium 35',
        'Honorarium 36 SATUAN BIAYA PENGADAAN KENDARAAN DINAS.xlsx' => 'Honorarium 36',
        'Honorarium 37 SATUAN BIAYA PENGADAAN PAKAIAN DINAS.xlsx' => 'Honorarium 37',
        'Honorarium 38 SATUAN BIAYA KONSUMSI RAPAT atau PERTEMUAN.xlsx' => 'Honorarium 38',
        'Honorarium 39 SATUAN BIAYA KONSUMSI KEGIATAN PENDIDIKAN DAN PELATIHAN (DIKLAT).xlsx' => 'Honorarium 39',
        '1. SATUAN BIAYA TRANSPORTASI DARAT DARI IBUKOTA PROVINSI KE KABUPATEN atau KOTA DALAM PROVINSI YANG SAMA (ONE  WAY ).xlsx' => '1. Transportasi Provinsi',
        '2. SATUAN BIAYA TRANSPORTASI DARI DKI JAKARTA KE KABUPATEN atau KOTA SEKITAR (ONE WAY  ).xlsx' => '2. Transportasi DKI',
        '3. SATUAN BIAYA TRANSPOR KEGIATAN DALAM KABUPATENKOTA PERGI PULANG (PP).xlsx' => '3. Transportasi Kabupaten',
        '4. SATUAN BIAYA PEMELIHARAAN SARANA KANTOR.xlsx' => '4. Pemeliharaan Sarana Kantor',
        '5. SATUAN BIAYA PENERJEMAHAN DAN PENGETIKAN.xlsx' => '5. Penerjemahan dan Pengetikan',
        '6. SATUAN BIAYA BANTUAN BEASISWA PROGRAM GELARNONGELAR DALAM NEGERI.xlsx' => '6. Beasiswa',
        '7. SATUAN BIAYA SEWA MESIN FOTOKOPI.xlsx' => '7. Sewa Mesin Fotokopi',
        '8. HONORARARIUM NARASUMBER PAKAR PRAKTISI PROFESIONAL.xlsx' => '8. Honorarium Narasumber',
        '9. SATUAN BIAYA PENGADAAN BAHAN MAKANAN.xlsx' => '9. Bahan Makanan',
        '10. SATUAN BIAYA KONSUMSI TAHANAN DETENIABK NONJUSTISIA.xlsx' => '10. Konsumsi Tahanan',
        '11. SATUAN BIAYA KEPERLUAN SEHARI-HARI PERKANTORAN DI DALAM NEGERI.xlsx' => '11. Keperluan Perkantoran',
        '12. SATUAN BIAYA PENGGANTIAN INVENTARIS LAMA DAN ATAU PEMBELIAN INVENTARIS UNTUK PEGAWAI BARU.xlsx' => '12. Penggantian Inventaris',
        '13. SATUAN BIAYA PEMELIHARAAN DAN OPERASIONAL KENDARAAN DINAS.xlsx' => '13. Pemeliharaan Kendaraan Dinas',
        '14. SATUAN BIAYA PEMELIHARAAN GEDUNG BANGUNGAN DALAM NEGERI.xlsx' => '14. Pemeliharaan Gedung/Bangunan',
        '15. SATUAN BIAYA SEWA GEDUNG PERTEMUAN.xlsx' => '15. Sewa Gedung Pertemuan',
        '16. SATUAN BIAYA TRANSPORTASI DARI DANATAU KE TERMINAL BUS STASIUN BANDARA PELABUHAN DALAM RANGKA PERJALANAN DINAS DALAM NEGERI.xlsx' => '16. Transportasi Terminal',
        '17. SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS DALAM NEGERI PERGI PULANG  (PP).xlsx' => '17. Tiket Pesawat Dalam Negeri',
        '18. SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP).xlsx' => '18. Tiket Pesawat Luar Negeri',
        '19. SATUAN BIAYA PENYELENGGARAAN PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI.xlsx' => '19. Perwakilan RI Luar Negeri',
    ];
    return $mapping[$filename] ?? $filename;
}

// Helper to get category number
function getCategoryNumber($category) {
    $mapping = [
        'honorarium_28' => 28,
        'honorarium_29' => 29,
        'honorarium_30' => 30,
        'honorarium_31' => 31,
        'honorarium_32' => 32,
        'honorarium_33' => 33,
        'honorarium_34' => 34,
        'honorarium_35' => 35,
        'honorarium_36' => 36,
        'honorarium_37' => 37,
        'honorarium_38' => 38,
        'honorarium_39' => 39,
        'transportasi_provinsi' => 1,
        'transportasi_dki' => 2,
        'transportasi_kabupaten' => 3,
        'pemeliharaan_sarana_kantor' => 4,
        'penerjemahan_pengetikan' => 5,
        'beasiswa' => 6,
        'sewa_fotokopi' => 7,
        'honorarium_narasumber' => 8,
        'bahan_makanan' => 9,
        'konsumsi_tahanan' => 10,
        'keperluan_perkantoran' => 11,
        'penggantian_inventaris' => 12,
        'pemeliharaan_kendaraan' => 13,
        'pemeliharaan_gedung' => 14,
        'sewa_gedung' => 15,
        'transportasi_terminal' => 16,
        'tiket_pesawat_dalam_negeri' => 17,
        'tiket_pesawat_luar_negeri' => 18,
        'perwakilan_ri' => 19,
    ];
    return $mapping[$category] ?? '';
}

$output = "# Master Standar Biaya Masukan (SBM)\n\n";
$output .= "## Daftar Isi\n\n";

// Generate table of contents
$tocLinks = [];
$subSectionCounter = [];

foreach ($scanReport['files'] as $file) {
    if ($file['status'] === 'success') {
        $displayName = getDisplayName($file['filename']);
        $slug = createSlug($displayName);
        $category = $file['category'];
        $categoryNum = getCategoryNumber($category);

        foreach ($file['sheets'] as $sheet) {
            if (!empty($sheet['sub_sections'])) {
                $subCounter = isset($subSectionCounter[$category]) ? $subSectionCounter[$category] + 1 : 1;
                $subSectionCounter[$category] = count($sheet['sub_sections']);

                foreach ($sheet['sub_sections'] as $idx => $sub) {
                    $subNum = $idx + 1;
                    $subSectionNum = $categoryNum . '.' . $subNum;
                    $subLabel = $sub['label'];
                    $subSlug = createSlug($subSectionNum . ' ' . $subLabel);
                    $tocLinks[] = "- [$displayName $subSectionNum $subLabel](#$subSlug)";
                }
            } else {
                $tocLinks[] = "- [$displayName](#$slug)";
            }
        }
    }
}

$output .= implode("\n", $tocLinks) . "\n\n";

$output .= "---\n\n";

// Generate detail sections
$subSectionCounter = [];

foreach ($scanReport['files'] as $file) {
    if ($file['status'] === 'success') {
        $displayName = getDisplayName($file['filename']);
        $category = $file['category'];
        $categoryNum = getCategoryNumber($category);

        foreach ($file['sheets'] as $sheet) {
            if (!empty($sheet['sub_sections'])) {
                foreach ($sheet['sub_sections'] as $idx => $sub) {
                    $subNum = $idx + 1;
                    $subSectionNum = $categoryNum . '.' . $subNum;
                    $subLabel = $sub['label'];
                    $subSlug = createSlug($subSectionNum . ' ' . $subLabel);

                    $output .= "## $displayName $subSectionNum $subLabel\n\n";
                    $output .= "**Kolom:**\n\n";
                    foreach ($sub['columns'] as $col) {
                        $output .= "- " . strtoupper($col) . "\n";
                    }
                    $output .= "\n---\n\n";
                }
            } else {
                // Single section (no sub-sections)
                $slug = createSlug($displayName);
                $output .= "## $displayName\n\n";
                $output .= "**Kolom:**\n\n";
                foreach ($sheet['columns'] as $col) {
                    $output .= "- " . strtoupper($col) . "\n";
                }
                $output .= "\n---\n\n";
            }
        }
    }
}

// Add notes at the end
$output .= "\n**Catatan:** Dokumen ini di-generate otomatis dari file Excel SBM. Struktur data mengikuti apa yang ada di file Excel.\n";

file_put_contents('MasterSBM.md', $output);

echo "✅ MasterSBM.md has been generated successfully!\n";
echo "📄 File: " . realpath('MasterSBM.md') . "\n";
echo "📊 Total sections processed: " . count($tocLinks) . "\n";
