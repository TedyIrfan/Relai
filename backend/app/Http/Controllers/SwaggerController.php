<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="RelAI API Documentation",
 *     version="1.0.0",
 *     description="API documentation for RelAI - Realisasi Keuangan Kementerian Koordinator Bidang Infrastruktur dan Pembangunan Kewilayahan",
 *     @OA\Contact(
 *         email="admin@relai.go.id",
 *         name="RelAI Admin"
 *     )
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication and management operations"
 * )
 *
 * @OA\Tag(
 *     name="Dashboard",
 *     description="Dashboard and budget management operations"
 * )
 *
 * @OA\Tag(
 *     name="SBM",
 *     description="Master Standar Biaya Masukan (SBM) operations"
 * )
 *
 * @OA\Schema(
 *     schema="User",
 *     title="User",
 *     description="User model",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="username",
 *         type="string",
 *         example="eselon1"
 *     ),
 *     @OA\Property(
 *         property="nama",
 *         type="string",
 *         example="Eselon 1 User"
 *     ),
 *     @OA\Property(
 *         property="jabatan",
 *         type="string",
 *         example="Eselon 1"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="Anggaran",
 *     title="Anggaran",
 *     description="Anggaran model",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="tahun",
 *         type="integer",
 *         example=2025
 *     ),
 *     @OA\Property(
 *         property="total_anggaran",
 *         type="number",
 *         format="decimal",
 *         example=2000000000.00
 *     ),
 *     @OA\Property(
 *         property="anggaran_terpakai",
 *         type="number",
 *         format="decimal",
 *         example=500000000.00
 *     ),
 *     @OA\Property(
 *         property="sp2d",
 *         type="number",
 *         format="decimal",
 *         example=300000000.00
 *     ),
 *     @OA\Property(
 *         property="sisa_anggaran",
 *         type="number",
 *         format="decimal",
 *         example=1500000000.00
 *     ),
 *     @OA\Property(
 *         property="keterangan",
 *         type="string",
 *         example="Anggaran tahun 2025"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="SbmDetail",
 *     title="SbmDetail",
 *     description="Master Standar Biaya Masukan (SBM) detail",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="category",
 *         type="string",
 *         example="transportasi_provinsi"
 *     ),
 *     @OA\Property(
 *         property="source_file",
 *         type="string",
 *         example="SECTION 1.xlsx"
 *     ),
 *     @OA\Property(
 *         property="no",
 *         type="string",
 *         example="1"
 *     ),
 *     @OA\Property(
 *         property="provinsi",
 *         type="string",
 *         example="DKI Jakarta"
 *     ),
 *     @OA\Property(
 *         property="uraian",
 *         type="string",
 *         example="Tiket Pesawat Ekonomi"
 *     ),
 *     @OA\Property(
 *         property="satuan",
 *         type="string",
 *         example="orang"
 *     ),
 *     @OA\Property(
 *         property="besaran",
 *         type="number",
 *         example=1500000
 *     ),
 *     @OA\Property(
 *         property="besaran_formatted",
 *         type="string",
 *         example="Rp 1.500.000"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="SbmCategory",
 *     title="SbmCategory",
 *     description="SBM Category with metadata",
 *     @OA\Property(
 *         property="category",
 *         type="string",
 *         example="transportasi_provinsi"
 *     ),
 *     @OA\Property(
 *         property="source_file",
 *         type="string",
 *         example="SECTION 1.xlsx"
 *     ),
 *     @OA\Property(
 *         property="total_records",
 *         type="integer",
 *         example=34
 *     ),
 *     @OA\Property(
 *         property="last_updated",
 *         type="string",
 *         format="date-time",
 *         example="2024-12-31T10:00:00.000000Z"
 *     )
 * )
 */
class SwaggerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/test",
     *     tags={"Authentication"},
     *     summary="Test endpoint",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="API is working!"
     *             )
     *         )
     *     )
     * )
     */
    public function test()
    {
        return response()->json(['message' => 'API is working!']);
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/categories",
     *     tags={"SBM"},
     *     summary="Get all SBM categories",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/SbmCategory")
     *             )
     *         )
     *     )
     * )
     */
    public function sbmCategories()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/{category}",
     *     tags={"SBM"},
     *     summary="Get SBM data by category with filters",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         description="Category name (e.g., transportasi_provinsi)",
     *         @OA\Schema(type="string", example="transportasi_provinsi")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search keyword",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="provinsi",
     *         in="query",
     *         description="Filter by provinsi",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="grouping",
     *         in="query",
     *         description="Filter by grouping label",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort by field",
     *         @OA\Schema(type="string", enum={"id", "no", "provinsi", "uraian", "besaran"})
     *     ),
     *     @OA\Parameter(
     *         name="order",
     *         in="query",
     *         description="Sort order",
     *         @OA\Schema(type="string", enum={"asc", "desc"})
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page (max 100)",
     *         @OA\Schema(type="integer", minimum=1, maximum=100, default=15)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/SbmDetail")
     *             ),
     *             @OA\Property(
     *                 property="meta",
     *                 type="object",
     *                 @OA\Property(property="category", type="string"),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Category not found"
     *     )
     * )
     */
    public function sbmByCategory()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/filters/options",
     *     tags={"SBM"},
     *     summary="Get available filter options (all categories)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
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
     *                     property="categories",
     *                     type="array",
     *                     description="All available categories",
     *                     @OA\Items(type="string")
     *                 ),
     *                 @OA\Property(
     *                     property="sub_categories",
     *                     type="array",
     *                     description="All available sub-categories",
     *                     @OA\Items(type="string")
     *                 ),
     *                 @OA\Property(
     *                     property="parent_sections",
     *                     type="array",
     *                     description="All available parent sections",
     *                     @OA\Items(type="string")
     *                 ),
     *                 @OA\Property(
     *                     property="grouping_labels",
     *                     type="array",
     *                     description="All available grouping labels",
     *                     @OA\Items(type="string")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function sbmFilterOptions()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/filters/{category}",
     *     tags={"SBM"},
     *     summary="Get filter options for specific category",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         description="Category name (e.g., honorarium_28, transportasi_provinsi)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 description="Filter options specific to the category. Each field from the Excel file becomes a filter option with all unique values.",
     *                 additionalProperties=true,
     *                 example={
     *                     "_source_files": {"Honorarium 28 SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI.xlsx"},
     *                     "provinsi": {"ACEH", "DKI JAKARTA", "JAWA BARAT"},
     *                     "satuan": {"OH"}
     *                 }
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Category not found")
     *         )
     *     )
     * )
     */
    public function sbmFiltersByCategory()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/summary",
     *     tags={"SBM"},
     *     summary="Get SBM summary statistics",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="total_records", type="integer"),
     *                 @OA\Property(property="total_categories", type="integer"),
     *                 @OA\Property(
     *                     property="by_category",
     *                     type="object",
     *                     additionalProperties=true
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function sbmSummary()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/detail/{id}",
     *     tags={"SBM"},
     *     summary="Get single SBM record by ID",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Record ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 ref="#/components/schemas/SbmDetail"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Record not found"
     *     )
     * )
     */
    public function sbmDetail()
    {
        // Documentation only - actual logic in SbmController
    }
}