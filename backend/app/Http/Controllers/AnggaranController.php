<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Anggaran;

class AnggaranController extends Controller
{
    public function index()
    {
        $anggarans = Anggaran::orderBy('tahun', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $anggarans
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/anggarans/{id}",
     *     tags={"Anggaran"},
     *     summary="Get single anggaran by ID",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Anggaran details",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="tahun", type="integer"),
     *                 @OA\Property(property="total_anggaran", type="number"),
     *                 @OA\Property(property="anggaran_terpakai", type="number"),
     *                 @OA\Property(property="sp2d", type="number"),
     *                 @OA\Property(property="sisa_anggaran", type="number"),
     *                 @OA\Property(property="keterangan", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Anggaran not found")
     * )
     */
    public function show($id)
    {
        $anggaran = Anggaran::find($id);

        if (!$anggaran) {
            return response()->json([
                'success' => false,
                'message' => 'Anggaran not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $anggaran
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/anggarans",
     *     tags={"Anggaran"},
     *     summary="Create new anggaran",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"tahun","total_anggaran"},
     *             @OA\Property(property="tahun", type="integer", example=2025),
     *             @OA\Property(property="total_anggaran", type="number", format="decimal", example=2000000000.00),
     *             @OA\Property(property="anggaran_terpakai", type="number", format="decimal", example=0.00),
     *             @OA\Property(property="sp2d", type="number", format="decimal", example=0.00),
     *             @OA\Property(property="keterangan", type="string", example="Anggaran tahun 2025")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Anggaran created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Anggaran created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Anggaran")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required|integer|unique:anggarans,tahun',
            'total_anggaran' => 'required|numeric|min:0',
            'anggaran_terpakai' => 'nullable|numeric|min:0',
            'sp2d' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string|max:500'
        ]);

        $anggaran = Anggaran::create([
            'tahun' => $request->tahun,
            'total_anggaran' => $request->total_anggaran,
            'anggaran_terpakai' => $request->anggaran_terpakai ?? 0,
            'sp2d' => $request->sp2d ?? 0,
            'keterangan' => $request->keterangan
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Anggaran created successfully',
            'data' => $anggaran
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/anggarans/{id}",
     *     tags={"Anggaran"},
     *     summary="Update anggaran data",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="tahun", type="integer", example=2025),
     *             @OA\Property(property="total_anggaran", type="number", format="decimal", example=2500000000.00),
     *             @OA\Property(property="anggaran_terpakai", type="number", format="decimal", example=750000000.00),
     *             @OA\Property(property="sp2d", type="number", format="decimal", example=500000000.00),
     *             @OA\Property(property="keterangan", type="string", example="Updated anggaran tahun 2025")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Anggaran updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Anggaran updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Anggaran")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $anggaran = Anggaran::find($id);

        if (!$anggaran) {
            return response()->json([
                'success' => false,
                'message' => 'Anggaran not found'
            ], 404);
        }

        $request->validate([
            'tahun' => 'sometimes|required|integer|unique:anggarans,tahun,' . $id,
            'total_anggaran' => 'sometimes|required|numeric|min:0',
            'anggaran_terpakai' => 'sometimes|nullable|numeric|min:0',
            'sp2d' => 'sometimes|nullable|numeric|min:0',
            'keterangan' => 'sometimes|nullable|string|max:500'
        ]);

        // Update only provided fields
        if ($request->has('tahun')) $anggaran->tahun = $request->tahun;
        if ($request->has('total_anggaran')) $anggaran->total_anggaran = $request->total_anggaran;
        if ($request->has('anggaran_terpakai')) $anggaran->anggaran_terpakai = $request->anggaran_terpakai;
        if ($request->has('sp2d')) $anggaran->sp2d = $request->sp2d;
        if ($request->has('keterangan')) $anggaran->keterangan = $request->keterangan;

        $anggaran->save();

        return response()->json([
            'success' => true,
            'message' => 'Anggaran updated successfully',
            'data' => $anggaran
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/anggarans/{id}",
     *     tags={"Anggaran"},
     *     summary="Delete anggaran",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Anggaran deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Anggaran deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Anggaran not found")
     * )
     */
    public function destroy($id)
    {
        $anggaran = Anggaran::find($id);

        if (!$anggaran) {
            return response()->json([
                'success' => false,
                'message' => 'Anggaran not found'
            ], 404);
        }

        $anggaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Anggaran deleted successfully'
        ]);
    }
}

/**
 * @OA\Schema(
 *     schema="Anggaran",
 *     title="Anggaran",
 *     description="Anggaran model",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="Anggaran ID"
 *     ),
 *     @OA\Property(
 *         property="tahun",
 *         type="integer",
 *         description="Tahun anggaran"
 *     ),
 *     @OA\Property(
 *         property="total_anggaran",
 *         type="number",
 *         format="decimal",
 *         description="Total anggaran"
 *     ),
 *     @OA\Property(
 *         property="anggaran_terpakai",
 *         type="number",
 *         format="decimal",
 *         description="Anggaran yang terpakai"
 *     ),
 *     @OA\Property(
 *         property="sp2d",
 *         type="number",
 *         format="decimal",
 *         description="Anggaran SP2D"
 *     ),
 *     @OA\Property(
 *         property="sisa_anggaran",
 *         type="number",
 *         format="decimal",
 *         description="Sisa anggaran"
 *     ),
 *     @OA\Property(
 *         property="keterangan",
 *         type="string",
 *         description="Keterangan anggaran"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         description="Created timestamp"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         description="Updated timestamp"
 *     )
 * )
 */