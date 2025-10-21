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
}