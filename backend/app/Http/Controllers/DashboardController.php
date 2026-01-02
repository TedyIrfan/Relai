<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;
use Illuminate\Http\Request;
use App\Models\Anggaran;
use App\Models\KategoriAnggaran;
use App\Models\RkaDetail;

/**
 * @OA\Tag(
 *     name="Dashboard",
 *     description="Dashboard and budget management operations"
 * )
 */
class DashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/dashboard",
     *     summary="Get dashboard data",
     *     tags={"Dashboard"},
     *     @OA\Parameter(
     *         name="tahun",
     *         in="path",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Dashboard data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="tahun",
     *                     type="integer",
     *                     example=2025
     *                 ),
     *                 @OA\Property(
     *                     property="totalAnggaran",
     *                     type="number",
     *                     example=2000000000
     *                 ),
     *                 @OA\Property(
     *                     property="anggaranTerpakai",
     *                     type="number",
     *                     example=500000000
     *                 ),
     *                 @OA\Property(
     *                     property="anggaranSP2D",
     *                     type="number",
     *                     example=300000000
     *                 ),
     *                 @OA\Property(
     *                     property="sisaAnggaran",
     *                     type="number",
     *                     example=1500000000
     *                 ),
     *                 @OA\Property(
     *                     property="kategori",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(
     *                             property="nama",
     *                             type="string"
     *                         ),
     *                         @OA\Property(
     *                             property="anggaran",
     *                             type="number"
     *                         ),
     *                         @OA\Property(
     *                             property="terpakai",
     *                             type="number"
     *                         ),
     *                         @OA\Property(
     *                             property="sp2d",
     *                             type="number"
     *                         ),
     *                         @OA\Property(
     *                             property="sisa",
     *                             type="number"
     *                         ),
     *                         @OA\Property(
     *                             property="percentage",
     *                             type="number"
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function index($tahun = 2025)
    {
        // Get main anggaran data
        $anggaran = Anggaran::getByYear($tahun);

        // If no data found, create default
        if (!$anggaran) {
            $anggaran = $this->createDefaultAnggaran($tahun);
        }

        // 🔄 Calculate total anggaran berjalan from RKA Details (Anggaran Berjalan)
        $totalAnggaranBerjalanFromRKA = RkaDetail::sum('anggaran_berjalan');
        \Log::info('📊 Dashboard DEBUG - RKA Budget Calculation:');
        \Log::info('  - Total Anggaran Berjalan from RKA (anggaran_berjalan): ' . number_format($totalAnggaranBerjalanFromRKA, 0, ',', '.'));
        \Log::info('  - Before (old) anggaran.berjalan: ' . number_format($anggaran->anggaran_berjalan, 0, ',', '.'));

        // 🔄 Calculate total SP2D from RKA Details (SP2D Tracking)
        $totalSP2DFromRKA = RkaDetail::sum('anggaran_sp2d');
        \Log::info('  - Total SP2D from RKA (anggaran_sp2d): ' . number_format($totalSP2DFromRKA, 0, ',', '.'));
        \Log::info('  - Before (old) anggaran.sp2d: ' . number_format($anggaran->sp2d, 0, ',', '.'));

        // Update anggaran.berjalan dengan nilai dari RKA
        $anggaran->anggaran_berjalan = $totalAnggaranBerjalanFromRKA;

        // Update anggaran.sp2d dengan nilai dari RKA
        $anggaran->sp2d = $totalSP2DFromRKA;
        $anggaran->save(); // Optional: jika mau update di database

        \Log::info('  - After (new) anggaran.berjalan: ' . number_format($anggaran->anggaran_berjalan, 0, ',', '.'));
        \Log::info('  - After (new) anggaran.sp2d: ' . number_format($anggaran->sp2d, 0, ',', '.'));

        // Get or create kategori data
        $kategoriData = KategoriAnggaran::getAllByTahun($tahun);

        // If no kategori data, create default kategori
        if ($kategoriData->isEmpty()) {
            $kategoriData = $this->createDefaultKategori($tahun);
        }

        // Format kategori untuk response
        $kategoriFormatted = $kategoriData->map(function($kategori) {
            // Calculate Anggaran Berjalan from RKA Details for this kategori
            $berjalanFromRKA = RkaDetail::whereHas('kategoriAnggaran', function($query) use ($kategori) {
                $query->where('id', $kategori->id);
            })->sum('anggaran_berjalan');

            // Calculate SP2D from RKA Details for this kategori
            $sp2dFromRKA = RkaDetail::whereHas('kategoriAnggaran', function($query) use ($kategori) {
                $query->where('id', $kategori->id);
            })->sum('anggaran_sp2d');

            \Log::info('📊 Kategori DEBUG - from RKA:');
            \Log::info('  - Kategori: ' . $kategori->nama_kategori);
            \Log::info('  - Berjalan from RKA Details: ' . number_format($berjalanFromRKA, 0, ',', '.'));
            \Log::info('  - SP2D from RKA Details: ' . number_format($sp2dFromRKA, 0, ',', '.'));

            return [
                'nama' => $kategori->nama_kategori,
                'anggaran' => $kategori->total_anggaran_kategori,
                'berjalan' => $berjalanFromRKA, // Use RKA Details calculation
                'sp2d' => $sp2dFromRKA, // Use RKA Details calculation
                'sisa' => $kategori->total_anggaran_kategori - $berjalanFromRKA,
                'percentage' => $kategori->total_anggaran_kategori > 0 ? ($berjalanFromRKA / $kategori->total_anggaran_kategori) * 100 : 0
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'tahun' => $anggaran->tahun,
                'totalAnggaran' => $anggaran->total_anggaran,
                'anggaranBerjalan' => $anggaran->anggaran_berjalan,
                'anggaranSP2D' => $anggaran->sp2d,
                'sisaAnggaran' => $anggaran->getSisaAnggaranAttribute(),
                'kategori' => $kategoriFormatted->toArray()
            ],
            'message' => 'Dashboard data retrieved successfully from kategori_anggarans table - Updated with Anggaran Berjalan'
        ]);
    }

    /**
     * Create default anggaran if not exists
     */
    private function createDefaultAnggaran($tahun)
    {
        $data = $this->getTahunData($tahun);
        return Anggaran::create($data);
    }

    /**
     * Create default kategori for tahun
     */
    private function createDefaultKategori($tahun)
    {
        $kategoriConfigs = $this->getKategoriData($tahun);
        $createdKategori = collect();

        foreach ($kategoriConfigs as $kategoriData) {
            $kategori = KategoriAnggaran::create($kategoriData);
            $createdKategori->push($kategori);
        }

        return $createdKategori;
    }

    /**
     * Get kategori data per tahun configuration
     */
    private function getKategoriData($tahun)
    {
        if ($tahun == 2025) {
            return [
                [
                    'tahun' => 2025,
                    'kode' => 'KA',
                    'nama_kategori' => 'Kategori A',
                    'total_anggaran_kategori' => 3432039625,
                    'anggaran_terpakai_kategori' => 0,
                    'sp2d_kategori' => 0,
                    'keterangan' => 'Kategori A - Tahun 2025'
                ],
                [
                    'tahun' => 2025,
                    'kode' => 'KB',
                    'nama_kategori' => 'Kategori B',
                    'total_anggaran_kategori' => 1786105495,
                    'anggaran_terpakai_kategori' => 0,
                    'sp2d_kategori' => 0,
                    'keterangan' => 'Kategori B - Tahun 2025'
                ],
                [
                    'tahun' => 2025,
                    'kode' => 'KC',
                    'nama_kategori' => 'Kategori C',
                    'total_anggaran_kategori' => 4007278982275,
                    'anggaran_terpakai_kategori' => 0,
                    'sp2d_kategori' => 0,
                    'keterangan' => 'Kategori C - Tahun 2025'
                ]
            ];
        }

        // For other years, use percentage based allocation
        $anggaran = Anggaran::getByYear($tahun);
        if ($anggaran) {
            return [
                [
                    'tahun' => $tahun,
                    'kode' => 'KA',
                    'nama_kategori' => 'Kategori A',
                    'total_anggaran_kategori' => $anggaran->total_anggaran * 0.35,
                    'anggaran_terpakai_kategori' => 0,
                    'sp2d_kategori' => 0,
                    'keterangan' => "Kategori A - Tahun {$tahun}"
                ],
                [
                    'tahun' => $tahun,
                    'kode' => 'KB',
                    'nama_kategori' => 'Kategori B',
                    'total_anggaran_kategori' => $anggaran->total_anggaran * 0.325,
                    'anggaran_terpakai_kategori' => 0,
                    'sp2d_kategori' => 0,
                    'keterangan' => "Kategori B - Tahun {$tahun}"
                ],
                [
                    'tahun' => $tahun,
                    'kode' => 'KC',
                    'nama_kategori' => 'Kategori C',
                    'total_anggaran_kategori' => $anggaran->total_anggaran * 0.325,
                    'anggaran_terpakai_kategori' => 0,
                    'sp2d_kategori' => 0,
                    'keterangan' => "Kategori C - Tahun {$tahun}"
                ]
            ];
        }

        return [];
    }

    
    /**
     * Get data per tahun configuration
     */
    private function getTahunData($tahun)
    {
        $tahunConfigs = [
            2025 => [
                'tahun' => 2025,
                'total_anggaran' => 4012497127395,    // 4.012.497.127.395
                'anggaran_terpakai' => 0,              // 0 (belum ada realisasi)
                'sp2d' => 0,                          // 0 (belum ada SP2D)
                'keterangan' => 'Data tahun 2025 - 4.012.497.127.395'
            ],
            2024 => [
                'tahun' => 2024,
                'total_anggaran' => 1800000000,    // 1.8 MILIAR
                'anggaran_terpakai' => 720000000,  // 720 juta (40%)
                'sp2d' => 540000000,              // 540 juta (30%)
                'keterangan' => 'Data tahun 2024 - 1.8 MILIAR'
            ],
            2023 => [
                'tahun' => 2023,
                'total_anggaran' => 1500000000,    // 1.5 MILIAR
                'anggaran_terpakai' => 900000000,  // 900 juta (60%)
                'sp2d' => 750000000,              // 750 juta (50%)
                'keterangan' => 'Data tahun 2023 - 1.5 MILIAR'
            ],
            2026 => [
                'tahun' => 2026,
                'total_anggaran' => 2200000000,    // 2.2 MILIAR
                'anggaran_terpakai' => 0,          // 0 (belum ada realisasi)
                'sp2d' => 0,                      // 0 (belum ada SP2D)
                'keterangan' => 'Data tahun 2026 - Planning (belum realisasi)'
            ]
        ];

        return $tahunConfigs[$tahun] ?? $tahunConfigs[2025];
    }

    /**
     * Seed multiple years data
     */
    public function seedData()
    {
        $years = [2023, 2024, 2025, 2026];
        $created = [];

        foreach ($years as $tahun) {
            $existing = Anggaran::getByYear($tahun);
            if (!$existing) {
                $anggaran = $this->createDefaultAnggaran($tahun);
                $created[] = $anggaran;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Data seeded successfully',
            'data' => $created
        ]);
    }

    /**
     * Get KPI metrics only
     *
     * @OA\Get(
     *     path="/api/dashboard/kpi",
     *     tags={"Dashboard"},
     *     summary="Get KPI metrics",
     *     description="Get key performance indicators for budget monitoring",
     *     @OA\Response(
     *         response=200,
     *         description="KPI data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="tahun", type="integer", example=2025),
     *                 @OA\Property(property="totalAnggaran", type="number", example=4012497127395),
     *                 @OA\Property(property="anggaranTerpakai", type="number", example=0),
     *                 @OA\Property(property="anggaranSP2D", type="number", example=0),
     *                 @OA\Property(property="sisaAnggaran", type="number", example=4012497127395)
     *             )
     *         )
     *     )
     * )
     */
    public function kpi()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'tahun' => 2025,
                'totalAnggaran' => 4012497127395,
                'anggaranTerpakai' => 0,
                'anggaranSP2D' => 0,
                'sisaAnggaran' => 4012497127395
            ],
            'message' => 'KPI data retrieved successfully'
        ]);
    }

    /**
     * Get chart data only
     *
     * @OA\Get(
     *     path="/api/dashboard/charts",
     *     tags={"Dashboard"},
     *     summary="Get chart data",
     *     description="Get chart data for budget visualization by category",
     *     @OA\Parameter(
     *         name="tahun",
     *         in="query",
     *         required=false,
     *         description="Tahun anggaran",
     *         @OA\Schema(type="integer", example=2025)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Chart data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function charts($tahun = 2025)
    {
        // Get kategori data sama seperti dashboard utama
        $kategoriData = KategoriAnggaran::getAllByTahun($tahun);

        if ($kategoriData->isEmpty()) {
            $kategoriData = $this->createDefaultKategori($tahun);
        }

        // Format kategori untuk chart dengan data dinamis dari RKA
        $kategoriFormatted = $kategoriData->map(function($kategori) {
            // Calculate Anggaran Berjalan from RKA Details for this kategori
            $berjalanFromRKA = RkaDetail::whereHas('kategoriAnggaran', function($query) use ($kategori) {
                $query->where('id', $kategori->id);
            })->sum('anggaran_berjalan');

            // Calculate SP2D from RKA Details for this kategori
            $sp2dFromRKA = RkaDetail::whereHas('kategoriAnggaran', function($query) use ($kategori) {
                $query->where('id', $kategori->id);
            })->sum('anggaran_sp2d');

            return [
                'nama' => $kategori->nama_kategori,
                'anggaran' => $kategori->total_anggaran_kategori,
                'berjalan' => $berjalanFromRKA, // Anggaran yang sedang digunakan
                'sp2d' => $sp2dFromRKA,     // Anggaran yang sudah jadi SP2D
                'sisa' => $kategori->total_anggaran_kategori - $berjalanFromRKA,
                'persentaseTerpakai' => $kategori->total_anggaran_kategori > 0 ? ($berjalanFromRKA / $kategori->total_anggaran_kategori) * 100 : 0
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'tahun' => $tahun,
                'kategori' => $kategoriFormatted->toArray()
            ],
            'message' => 'Chart data retrieved successfully from Master RKA'
        ]);
    }

    /**
     * Get all kategori by tahun
     *
     * @OA\Get(
     *     path="/api/kategori/{tahun}",
     *     tags={"Dashboard"},
     *     summary="Get kategori by tahun",
     *     description="Get all kategori anggaran for specific year",
     *     @OA\Parameter(
     *         name="tahun",
     *         in="path",
     *         required=true,
     *         description="Tahun anggaran",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Kategori data retrieved successfully"
     *     )
     * )
     */
    public function getKategoriByTahun($tahun)
    {
        $kategoriData = KategoriAnggaran::getAllByTahun($tahun);

        if ($kategoriData->isEmpty()) {
            $kategoriData = $this->createDefaultKategori($tahun);
        }

        $kategoriFormatted = $kategoriData->map(function($kategori) {
            return [
                'nama' => $kategori->nama_kategori,
                'total' => $kategori->total_anggaran_kategori,
                'terpakai' => $kategori->anggaran_terpakai_kategori,
                'sp2d' => $kategori->sp2d_kategori,
                'sisa' => $kategori->getSisaAnggaranKategoriAttribute(),
                'percentage' => $kategori->getPercentageUsed()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'tahun' => $tahun,
                'kategori' => $kategoriFormatted->toArray()
            ],
            'message' => 'Kategori data retrieved successfully'
        ]);
    }

    /**
     * Update anggaran terpakai untuk kategori tertentu
     *
     * @OA\Post(
     *     path="/api/kategori/{tahun}/{kategori}/update-terpakai",
     *     tags={"Dashboard"},
     *     summary="Update anggaran terpakai",
     *     description="Update anggaran terpakai for specific kategori",
     *     @OA\Parameter(
     *         name="tahun",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="kategori",
     *         in="path",
     *         required=true,
     *         description="Kategori (KA/KB/KC or A/B/C)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="jumlah",
     *         in="query",
     *         required=true,
     *         description="Jumlah anggaran terpakai",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         required=false,
     *         description="Type: add or subtract",
     *         @OA\Schema(type="string", enum={"add", "subtract"})
     *     ),
     *     @OA\Response(response=200, description="Update successful"),
     *     @OA\Response(response=404, description="Kategori tidak ditemukan")
     * )
     */
    public function updateAnggaranTerpakai(Request $request, $tahun, $kategori)
    {
        $request->validate([
            'jumlah' => 'required|numeric|min:0',
            'type' => 'in:add,subtract' // default: add
        ]);

        $type = $request->input('type', 'add');
        $jumlah = (float) $request->input('jumlah');

        $kategoriData = KategoriAnggaran::getByTahunAndKategori($tahun, $kategori);

        if (!$kategoriData) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        $kategoriData->updateAnggaranTerpakai($jumlah, $type);

        return response()->json([
            'success' => true,
            'data' => [
                'kategori' => $kategori,
                'tahun' => $tahun,
                'jumlah_updated' => $jumlah,
                'type' => $type,
                'new_terpakai' => $kategoriData->anggaran_terpakai_kategori,
                'new_sisa' => $kategoriData->getSisaAnggaranKategoriAttribute()
            ],
            'message' => 'Anggaran terpakai berhasil diupdate'
        ]);
    }

    /**
     * Update SP2D untuk kategori tertentu
     *
     * @OA\Post(
     *     path="/api/kategori/{tahun}/{kategori}/update-sp2d",
     *     tags={"Dashboard"},
     *     summary="Update SP2D",
     *     description="Update SP2D for specific kategori",
     *     @OA\Parameter(
     *         name="tahun",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="kategori",
     *         in="path",
     *         required=true,
     *         description="Kategori (KA/KB/KC or A/B/C)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="jumlah",
     *         in="query",
     *         required=true,
     *         description="Jumlah SP2D",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         required=false,
     *         description="Type: add or subtract",
     *         @OA\Schema(type="string", enum={"add", "subtract"})
     *     ),
     *     @OA\Response(response=200, description="Update successful"),
     *     @OA\Response(response=404, description="Kategori tidak ditemukan")
     * )
     */
    public function updateSP2D(Request $request, $tahun, $kategori)
    {
        $request->validate([
            'jumlah' => 'required|numeric|min:0',
            'type' => 'in:add,subtract' // default: add
        ]);

        $type = $request->input('type', 'add');
        $jumlah = (float) $request->input('jumlah');

        $kategoriData = KategoriAnggaran::getByTahunAndKategori($tahun, $kategori);

        if (!$kategoriData) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        $kategoriData->updateSP2D($jumlah, $type);

        return response()->json([
            'success' => true,
            'data' => [
                'kategori' => $kategori,
                'tahun' => $tahun,
                'jumlah_updated' => $jumlah,
                'type' => $type,
                'new_sp2d' => $kategoriData->sp2d_kategori
            ],
            'message' => 'SP2D berhasil diupdate'
        ]);
    }

    /**
     * Sync main anggaran from kategori data
     *
     * @OA\Post(
     *     path="/api/kategori/{tahun}/sync",
     *     tags={"Dashboard"},
     *     summary="Sync main anggaran",
     *     description="Sync main anggaran from kategori data",
     *     @OA\Parameter(
     *         name="tahun",
     *         in="path",
     *         required=true,
     *         description="Tahun anggaran",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Sync successful"),
     *     @OA\Response(response=404, description="Data anggaran tidak ditemukan")
     * )
     */
    public function syncMainAnggaran($tahun)
    {
        $anggaran = KategoriAnggaran::syncMainAnggaran($tahun);

        if (!$anggaran) {
            return response()->json([
                'success' => false,
                'message' => 'Data anggaran tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'tahun' => $tahun,
                'total_anggaran' => $anggaran->total_anggaran,
                'anggaran_terpakai' => $anggaran->anggaran_terpakai,
                'sp2d' => $anggaran->sp2d,
                'sisa_anggaran' => $anggaran->getSisaAnggaranAttribute()
            ],
            'message' => 'Main anggaran berhasil disync dari kategori data'
        ]);
    }
}