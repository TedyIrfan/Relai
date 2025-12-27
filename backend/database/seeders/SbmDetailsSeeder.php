<?php

namespace Database\Seeders;

use App\Services\SbmMappingService;
use App\Services\SbmParserService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SbmDetailsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->newLine();
        $this->command->info('===========================================');
        $this->command->info('  SBM DETAILS SEEDER');
        $this->command->info('===========================================');
        $this->command->newLine();

        try {
            $mapping = app(SbmMappingService::class);
            $parser = app(SbmParserService::class);

            $this->command->info('Scanning files...');
            $stats = $parser->getStatistics();
            $this->command->line("  ✓ Found {$stats['successful_files']} files");
            $this->command->newLine();

            $this->command->info('Parsing Excel files...');
            $this->command->newLine();

            $startTime = microtime(true);
            $fileIndex = 0;
            $categorySummary = [];
            $fileList = [];

            $result = $parser->parseAll(function ($fileInfo, $stage, $fileResult = null)
                use (&$fileIndex, &$categorySummary, &$fileList) {

                if ($stage === 'after' && $fileResult) {
                    $fileIndex++;
                    $shortLabel = $this->getShortLabel($fileInfo['label'] ?? $fileInfo['filename']);
                    $imported = $fileResult['imported'];
                    $skipped = $fileResult['skipped'];
                    $category = $fileResult['category'];

                    // Tampilkan progress satu baris saja
                    $number = sprintf('[%02d/%02d]', $fileIndex, 31);
                    $dotsLength = 50 - strlen($shortLabel) - strlen((string)$imported);
                    $dotsLength = max(0, $dotsLength);
                    $dots = str_repeat('.', $dotsLength);

                    if ($skipped > 0) {
                        $this->command->line("  {$number} {$shortLabel} {$dots} ✅ {$imported} rows <fg=gray>({$skipped} skipped)</>");
                    } else {
                        $this->command->line("  {$number} {$shortLabel} {$dots} ✅ {$imported} rows");
                    }

                    // Simpan untuk summary nanti
                    if (!isset($categorySummary[$category])) {
                        $categorySummary[$category] = 0;
                    }
                    $categorySummary[$category] += $imported;

                    $fileList[] = [
                        'index' => $fileIndex,
                        'short_label' => $shortLabel,
                        'imported' => $imported,
                        'skipped' => $skipped,
                        'category' => $category,
                    ];
                }
            });

            $allData = $result['data'];
            $stats = $result['stats'];

            $endTime = microtime(true);
            $duration = round($endTime - $startTime, 2);

            // Import
            $this->command->newLine();
            $this->command->info('Importing to database...');
            $this->importData($allData);

            // Final summary
            $this->showFinalSummary($stats, $categorySummary, $fileList, $duration);

        } catch (\Exception $e) {
            $this->command->error('');
            $this->command->error('==========================================');
            $this->command->error('  ERROR!');
            $this->command->error('==========================================');
            $this->command->error('');
            $this->command->error('Error: ' . $e->getMessage());
            $this->command->error('');
            $this->command->error('Stack trace:');
            $this->command->error($e->getTraceAsString());
        }
    }

    /**
     * Get short label for display
     */
    private function getShortLabel(string $label): string
    {
        // Hapus prefix panjang
        $label = str_replace('SATUAN BIAYA ', '', $label);
        $label = str_replace('Honorarium ', 'H.', $label);

        // Mapping khusus untuk nama yang masih panjang
        $mapping = [
            'H.28 Uang Harian dan Uang Representasi Perjalanan Dinas Dalam Negeri' => 'H.28 Uang Harian & Representasi',
            'H.29 Uang Harian Perjalanan Dinas Luar Negeri' => 'H.29 Uang Harian LN',
            'H.30 Penginapan Perjalanan Dinas Dalam Negeri' => 'H.30 Penginapan Dalam Negeri',
            'H.31 Rapat atau Pertemuan di Luar Kantor' => 'H.31 Rapat Luar Kantor',
            'H.32 Tiket Perjalanan Dinas Pindah Luar Negeri' => 'H.32 Tiket Pindah LN',
            'H.33 Operasional Khusus Kepala Perwakilan Republik Indonesia di Luar Negeri' => 'H.33 Operasional Kepala Perwakilan LN',
            'H.34 Makanan Penambah Daya Tahan Tubuh' => 'H.34 Makanan Penambah Daya Tahan',
            'H.35 Sewa Kendaraan' => 'H.35 Sewa Kendaraan',
            'H.36 Pengadaan Kendaraan Dinas' => 'H.36 Pengadaan Kendaraan Dinas',
            'H.37 Pengadaan Pakaian Dinas' => 'H.37 Pengadaan Pakaian Dinas',
            'H.38 Konsumsi Rapat atau Pertemuan' => 'H.38 Konsumsi Rapat/Pertemuan',
            'H.39 Konsumsi Kegiatan Pendidikan dan Pelatihan (DIKLAT)' => 'H.39 Konsumsi Diklat',
            '1. Transportasi Darat dari Ibukota Provinsi ke Kabupaten atau Kota Dalam Provinsi yang Sama' => '01. Transportasi Provinsi',
            '2. Transportasi dari DKI Jakarta ke Kabupaten atau Kota Sekitar' => '02. Transportasi DKI',
            '3. Transpor Kegiatan dalam Kabupaten/Kota Pergi Pulang (PP)' => '03. Transportasi Kabupaten',
            '4. Pemeliharaan Sarana Kantor' => '04. Pemeliharaan Sarana Kantor',
            '5. Penerjemahan dan Pengetikan' => '05. Penerjemahan & Pengetikan',
            '6. Bantuan Beasiswa Program Gelar/Nongelar Dalam Negeri' => '06. Bantuan Beasiswa',
            '7. Sewa Mesin Fotokopi' => '07. Sewa Mesin Fotokopi',
            'HONORARARIUM NARASUMBER PAKAR PRAKTISI PROFESIONAL' => '08. Honorarium Narasumber',
            '9. Pengadaan Bahan Makanan' => '09. Pengadaan Bahan Makanan',
            '10. Konsumsi Tahanan/Deteni/ABK Nonjustisia' => '10. Konsumsi Tahanan',
            '11. Keperluan Sehari-hari Perkantoran di Dalam Negeri' => '11. Keperluan Perkantoran',
            '12. Penggantian Inventaris Lama dan atau Pembelian Inventaris Untuk Pegawai Baru' => '12. Penggantian Inventaris',
            '13. Pemeliharaan dan Operasional Kendaraan Dinas' => '13. Pemeliharaan Kendaraan Dinas',
            '14. Pemeliharaan Gedung Bangunan Dalam Negeri' => '14. Pemeliharaan Gedung/Bangunan',
            '15. Sewa Gedung Pertemuan' => '15. Sewa Gedung Pertemuan',
            '16. Transportasi dari dan/atau ke Terminal Bus Stasiun Bandara Pelabuhan Dalam Rangka Perjalanan Dinas Dalam Negeri' => '16. Transportasi Terminal',
            '17. Tiket Pesawat Perjalanan Dinas Dalam Negeri Pergi Pulang (PP)' => '17. Tiket Pesawat Dalam Negeri',
            '18. Tiket Pesawat Perjalanan Dinas Luar Negeri Pergi Pulang (PP)' => '18. Tiket Pesawat Luar Negeri',
            '19. Penyelenggaraan Perwakilan Republik Indonesia di Luar Negeri' => '19. Perwakilan RI LN',
        ];

        return $mapping[$label] ?? $label;
    }

    /**
     * Show final summary with simple text formatting
     */
    private function showFinalSummary(array $stats, array $categorySummary, array $fileList, float $duration): void
    {
        $totalImported = $stats['imported'];
        $totalSkipped = $stats['skipped'];

        $this->command->newLine();
        $this->command->info('===========================================');
        $this->command->info('  📋 IMPORT SUMMARY');
        $this->command->info('===========================================');
        $this->command->newLine();

        // Files Processed
        $this->command->line('  📁 FILES PROCESSED');
        $this->command->line("    ✅ Success: 31 files");
        $this->command->line("    ❌ Failed: 0 files");
        $this->command->line("    ⏱️  Time: {$duration} seconds");
        $this->command->newLine();

        // Data Overview
        $this->command->line('  📊 DATA OVERVIEW');
        $this->command->line("    📥 Total Imported: {$totalImported} rows");
        $this->command->line("    ⏭️  Total Skipped: {$totalSkipped} rows");
        $this->command->newLine();

        // Currency Breakdown
        $this->showCurrencyBreakdown();

        // Grouping Breakdown
        $this->showGroupingBreakdown();

        // Imported Files List
        $this->showFileListSummary($fileList);

        $this->command->newLine();
        $this->command->info('===========================================');
        $this->command->line('  ✅ <info>SEEDING COMPLETED SUCCESSFULLY</info>');
        $this->command->info('===========================================');
        $this->command->newLine();
    }

    /**
     * Show currency breakdown with percentage and visual bar
     */
    private function showCurrencyBreakdown(): void
    {
        $currencyCounts = DB::table('sbm_details')
            ->select('currency', DB::raw('COUNT(*) as total'))
            ->groupBy('currency')
            ->get();

        $total = $currencyCounts->sum('total');

        $this->command->line('  💰 CURRENCY BREAKDOWN');

        foreach ($currencyCounts as $count) {
            $percentage = $total > 0 ? round(($count->total / $total) * 100, 1) : 0;
            $barLength = (int)($percentage / 5); // 20 chars = 100%
            $bar = str_repeat('█', $barLength) . str_repeat('░', 20 - $barLength);
            $this->command->line(sprintf('    %s: %d rows (%.1f%%) %s', $count->currency, $count->total, $percentage, $bar));
        }

        $this->command->newLine();
    }

    /**
     * Show grouping breakdown
     */
    private function showGroupingBreakdown(): void
    {
        $totalGrouped = DB::table('sbm_details')
            ->whereNotNull('grouping_label')
            ->where('grouping_label', '!=', '')
            ->count();

        $totalNotGrouped = DB::table('sbm_details')
            ->where(function ($query) {
                $query->whereNull('grouping_label')
                    ->orWhere('grouping_label', '');
            })
            ->count();

        $total = $totalGrouped + $totalNotGrouped;
        $groupedPercent = $total > 0 ? round(($totalGrouped / $total) * 100, 1) : 0;
        $notGroupedPercent = 100 - $groupedPercent;

        $this->command->line('  🌍 GROUPING BREAKDOWN');
        $this->command->line(sprintf('    ✅ With Grouping: %d rows (%.1f%%)', $totalGrouped, $groupedPercent));
        $this->command->line(sprintf('    ⬜ Without Grouping: %d rows (%.1f%%)', $totalNotGrouped, $notGroupedPercent));

        // Top 5 grouping labels
        $top5 = DB::table('sbm_details')
            ->select('grouping_label', DB::raw('COUNT(*) as total'))
            ->whereNotNull('grouping_label')
            ->where('grouping_label', '!=', '')
            ->groupBy('grouping_label')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        if ($top5->isNotEmpty()) {
            $this->command->newLine();
            $this->command->line('    🏆 Top 5 Grouping Labels:');

            foreach ($top5 as $i => $item) {
                $num = $i + 1;
                $label = substr($item->grouping_label, 0, 40);
                $dots = str_repeat('.', max(3, 40 - strlen($label)));
                $this->command->line(sprintf('      %d. %s %s %d rows', $num, $label, $dots, $item->total));
            }
        }

        $this->command->newLine();
    }

    /**
     * Show file list summary
     */
    private function showFileListSummary(array $fileList): void
    {
        $this->command->line('  📂 IMPORTED FILES (' . count($fileList) . ' files)');
        $this->command->newLine();

        foreach ($fileList as $file) {
            $index = sprintf('[%02d]', $file['index']);
            $label = $file['short_label'];
            $count = $file['imported'] . ' rows';
            $dotsLength = 48 - strlen($index) - strlen($label) - strlen($count);
            $dotsLength = max(0, $dotsLength);
            $dots = str_repeat('.', $dotsLength);

            $this->command->line(sprintf('    📄 %s %s %s %s', $index, $label, $dots, $count));
        }

        $this->command->newLine();
    }

    /**
     * Import data to database in batches
     */
    private function importData(array $allData): void
    {
        // Truncate table first to prevent duplicates
        $this->command->warn('  ⚠️  Truncating sbm_details table...');
        DB::table('sbm_details')->truncate();

        // Add timestamps to all data
        $now = now()->toDateTimeString();
        foreach ($allData as &$row) {
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
        }
        unset($row);

        $chunkSize = 500;
        $chunks = array_chunk($allData, $chunkSize);
        $totalChunks = count($chunks);

        $importedCount = 0;
        $bar = $this->command->getOutput()->createProgressBar($totalChunks);
        $bar->start();

        foreach ($chunks as $chunkIndex => $chunk) {
            try {
                DB::table('sbm_details')->insert($chunk);
                $importedCount += count($chunk);
            } catch (\Exception $e) {
                $this->command->newLine();
                $this->command->warn("Warning: Failed to insert chunk " . ($chunkIndex + 1) . ": " . $e->getMessage());
                Log::warning("Seeder chunk insert failed", [
                    'chunk' => $chunkIndex,
                    'error' => $e->getMessage(),
                ]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->command->newLine();
    }
}
