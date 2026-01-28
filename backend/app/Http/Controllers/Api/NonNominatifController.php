<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NonNominatif;
use App\Models\RkaDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NonNominatifController extends Controller
{
    /**
     * Get all non-nominatifs from all users (for All Status feature)
     * This endpoint does NOT filter by user_id - shows all non-nominatifs
     */
    public function indexAll()
    {
        $nonNominatifs = NonNominatif::with('rkaDetail')
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $nonNominatifs
        ]);
    }

    /**
     * Display a listing of the resource (filtered by authenticated user)
     */
    public function index()
    {
        $user = request()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $nonNominatifs = NonNominatif::with('rkaDetail')
            ->with('user:id,name')
            ->where('user_id', $user->id) // Filter by authenticated user only
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $nonNominatifs
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rka_detail_id' => 'required|exists:rka_details,id',
            'deskripsi_kegiatan' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'total_anggaran_terpakai' => 'required|numeric|min:0',
            'evidence_link' => 'required|url',
            'status' => 'required|in:draft,submitted'
        ]);

        // Sanctum token validation (handled by middleware)
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated['user_id'] = $user->id;

        // Use transaction for consistency
        DB::beginTransaction();
        try {
            $nonNominatif = NonNominatif::create($validated);

            // Update RKA budget
            $this->updateRKABudget($validated['rka_detail_id'], $validated['total_anggaran_terpakai'], $validated['status']);

            DB::commit();

            return response()->json([
                'message' => 'Non-nominatif created successfully',
                'data' => $nonNominatif->load('rkaDetail', 'user')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create non-nominatif: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $nonNominatif = NonNominatif::with(['rkaDetail', 'user'])->findOrFail($id);

        return response()->json([
            'message' => 'Non-nominatif retrieved successfully',
            'data' => $nonNominatif
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $nonNominatif = NonNominatif::findOrFail($id);

        // Sanctum token validation (handled by middleware)
        $user = $request->user();

        if (!$user || $nonNominatif->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'deskripsi_kegiatan' => 'sometimes|string|max:255',
            'tanggal' => 'sometimes|date',
            'total_anggaran_terpakai' => 'sometimes|numeric|min:0',
            'evidence_link' => 'sometimes|url'
        ]);

        DB::beginTransaction();
        try {
            $oldStatus = $nonNominatif->status;
            $oldAmount = $nonNominatif->total_anggaran_terpakai;

            $nonNominatif->update($validated);

            // Update RKA budget based on changes
            if (isset($validated['total_anggaran_terpakai']) || isset($validated['status'])) {
                $newStatus = $validated['status'] ?? $oldStatus;
                $newAmount = $validated['total_anggaran_terpakai'] ?? $oldAmount;

                $this->updateRKABudgetOnEdit(
                    $nonNominatif->rka_detail_id,
                    $oldAmount,
                    $newAmount,
                    $oldStatus,
                    $newStatus
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Non-nominatif updated successfully',
                'data' => $nonNominatif->load('rkaDetail', 'user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update non-nominatif: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $nonNominatif = NonNominatif::findOrFail($id);

        // Sanctum token validation (handled by middleware)
        $user = request()->user();

        if (!$user || $nonNominatif->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($nonNominatif->status !== 'draft') {
            return response()->json(['message' => 'Only draft can be deleted'], 400);
        }

        DB::beginTransaction();
        try {
            // Restore RKA budget
            $this->updateRKABudget($nonNominatif->rka_detail_id, -$nonNominatif->total_anggaran_terpakai, 'draft');

            $nonNominatif->delete();

            DB::commit();

            return response()->json([
                'message' => 'Non-nominatif deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete non-nominatif: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit draft non-nominatif
     */
    public function submit($id)
    {
        $nonNominatif = NonNominatif::findOrFail($id);

        // Sanctum token validation (handled by middleware)
        $user = request()->user();

        if (!$user || $nonNominatif->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($nonNominatif->status !== 'draft') {
            return response()->json(['message' => 'Only draft can be submitted'], 400);
        }

        DB::beginTransaction();
        try {
            $nonNominatif->update(['status' => 'submitted']);

            // Update RKA budget - pindahkan dari berjalan ke SP2D
            $this->submitRKABudget($nonNominatif->rka_detail_id, $nonNominatif->total_anggaran_terpakai);

            DB::commit();

            return response()->json([
                'message' => 'Non-nominatif submitted successfully',
                'data' => $nonNominatif->load('rkaDetail', 'user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to submit non-nominatif: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update RKA budget untuk draft
     */
    private function updateRKABudget($rkaId, $danaAnggaran, $status)
    {
        $rka = RkaDetail::findOrFail($rkaId);

        if ($status === 'draft') {
            // Tambah ke anggaran berjalan
            $rka->anggaran_berjalan += $danaAnggaran;
        } else if ($status === 'submitted') {
            // Pindahkan dari berjalan ke SP2D
            $rka->anggaran_berjalan -= $danaAnggaran;
            $rka->anggaran_sp2d += $danaAnggaran;
        }

        $rka->save();
    }

    /**
     * Update RKA budget saat edit
     */
    private function updateRKABudgetOnEdit($rkaId, $oldAmount, $newAmount, $oldStatus, $newStatus)
    {
        $rka = RkaDetail::findOrFail($rkaId);

        // Handle amount change
        if ($oldAmount !== $newAmount) {
            $difference = $newAmount - $oldAmount;

            if ($oldStatus === 'draft') {
                $rka->anggaran_berjalan += $difference;
            } else if ($oldStatus === 'submitted') {
                $rka->anggaran_sp2d += $difference;
            }
        }

        // Handle status change
        if ($oldStatus === 'draft' && $newStatus === 'submitted') {
            // Pindahkan dari berjalan ke SP2D
            $rka->anggaran_berjalan -= $newAmount;
            $rka->anggaran_sp2d += $newAmount;
        } else if ($oldStatus === 'submitted' && $newStatus === 'draft') {
            // Pindahkan dari SP2D ke berjalan
            $rka->anggaran_berjalan += $newAmount;
            $rka->anggaran_sp2d -= $newAmount;
        }

        $rka->save();
    }

    /**
     * Submit RKA budget (pindahkan ke SP2D)
     */
    private function submitRKABudget($rkaId, $danaAnggaran)
    {
        $rka = RkaDetail::findOrFail($rkaId);

        // Pastikan anggaran_berjalan tidak negatif
        if ($rka->anggaran_berjalan >= $danaAnggaran) {
            $rka->anggaran_berjalan -= $danaAnggaran;
        } else {
            // Jika kurang, set ke 0 dan log warning
            $rka->anggaran_berjalan = 0;
        }

        $rka->anggaran_sp2d += $danaAnggaran;
        $rka->save();
    }
}