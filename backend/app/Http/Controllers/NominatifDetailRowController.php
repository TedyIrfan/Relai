<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\NominatifNew;
use App\Models\NominatifDetailRow;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use Carbon\Carbon;

class NominatifDetailRowController extends Controller
{
    public function __construct()
    {
        // Remove auth middleware since we use manual token validation
    }

    /**
     * Manually validate Sanctum token and get authenticated user
     */
    private function getAuthenticatedUser(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return null;
        }

        // Find the token in the personal_access_tokens table
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return null;
        }

        // Get the user associated with this token
        return $accessToken->tokenable;
    }

    /**
     * Display a listing of detail rows for a nominatif.
     */
    public function index($nominatifId)
    {
        // DISABLED: Check if user owns the nominatif - temporarily disabled for testing
        // $nominatif = NominatifNew::where('id', $nominatifId)
        //     ->where('user_id', $this->getAuthenticatedUser(app('request'))?->id)
        //     ->firstOrFail();

        $detailRows = NominatifDetailRow::with(['biayaRow', 'evidence'])
            ->where('nominatif_id', $nominatifId)
            ->orderBy('row_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $detailRows
        ]);
    }

    /**
     * Store a newly created detail row in storage.
     */
    public function store(Request $request, $nominatifId)
    {
        $request->validate([
            'person_name' => 'required|string|max:255',
            'asal' => 'required|string|max:100',
            'tujuan' => 'required|string|max:100',
            'tanggal_pergi' => 'required|date',
            'tanggal_sampai' => 'required|date|after_or_equal:tanggal_pergi',
            'golongan' => 'nullable|string|max:10',
            'jabatan' => 'nullable|string|max:255',
            'eselon' => 'nullable|string|max:10',
        ]);

        // Check if user owns the nominatif
        $nominatif = NominatifNew::where('id', $nominatifId)
            ->where('user_id', $this->getAuthenticatedUser(app('request'))?->id)
            ->firstOrFail();

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add rows to submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Get the next row order
            $maxRowOrder = NominatifDetailRow::where('nominatif_id', $nominatifId)
                ->max('row_order') ?? 0;

            $detailRow = NominatifDetailRow::create([
                'nominatif_id' => $nominatifId,
                'person_name' => $request->person_name,
                'row_order' => $maxRowOrder + 1,
                'asal' => $request->asal,
                'tujuan' => $request->tujuan,
                'tanggal_pergi' => $request->tanggal_pergi,
                'tanggal_sampai' => $request->tanggal_sampai,
                'no' => $maxRowOrder + 1,
                'golongan' => $request->golongan,
                'jabatan' => $request->jabatan,
                'eselon' => $request->eselon,
            ]);

            // Create corresponding biaya row with default values including totals
            $biayaData = [
                // Transport fields (matches database schema)
                'transport_pesawat_non_pp_pagu' => 0,
                'transport_pesawat_non_pp_aktual' => 0,
                'transport_taksi_pergi_pagu' => 0,
                'transport_taksi_pergi_aktual' => 0,
                'transport_taksi_pulang_pagu' => 0,
                'transport_taksi_pulang_aktual' => 0,

                // Penginapan source fields (needed for generated columns)
                'penginapan_jumlah_malam' => 0,
                'penginapan_pagu_perhari' => 0,
                'penginapan_aktual_perhari' => 0,

                // Uang Harian Meeting Fullboard source fields (renamed from fullboard)
                'uang_harian_meeting_fullboard_jumlah_hari' => 0,
                'uang_harian_meeting_fullboard_pagu_perhari' => 0,
                'uang_harian_meeting_fullboard_aktual_perhari' => 0,

                // Uang Harian Meeting Fullday source fields
                'uang_harian_meeting_fullday_jumlah_hari' => 0,
                'uang_harian_meeting_fullday_pagu_perhari' => 0,
                'uang_harian_meeting_fullday_aktual_perhari' => 0,

                // Uang Harian Luar Kota source fields
                'uang_harian_luar_kota_jumlah_hari' => 0,
                'uang_harian_luar_kota_pagu_perhari' => 0,
                'uang_harian_luar_kota_aktual_perhari' => 0,

                // Uang Harian Dalam Kota source fields
                'uang_harian_dalam_kota_jumlah_hari' => 0,
                'uang_harian_dalam_kota_pagu_perhari' => 0,
                'uang_harian_dalam_kota_aktual_perhari' => 0,

                // Representasi Luar Kota source fields
                'representasi_luar_kota_jumlah_hari' => 0,
                'representasi_luar_kota_pagu_perhari' => 0,
                'representasi_luar_kota_aktual_perhari' => 0,

                // Representasi Dalam Kota source fields
                'representasi_dalam_kota_jumlah_hari' => 0,
                'representasi_dalam_kota_pagu_perhari' => 0,
                'representasi_dalam_kota_aktual_perhari' => 0,
            ];
            $detailRow->biayaRow()->create($biayaData);

            DB::commit();

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            return response()->json([
                'success' => true,
                'message' => 'Detail row created successfully',
                'data' => $detailRow->load(['biayaRow', 'evidence'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create detail row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified detail row.
     */
    public function show($rowId)
    {
        $detailRow = NominatifDetailRow::with(['biayaRow', 'evidence', 'nominatif.user'])
            ->findOrFail($rowId);

        // Security check
        if ($detailRow->nominatif->user_id !== $this->getAuthenticatedUser(request())?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $detailRow
        ]);
    }

    /**
     * Update the specified detail row in storage.
     */
    public function update(Request $request, $rowId)
    {
        $request->validate([
            'rows' => 'sometimes|array',
            'rows.*.id' => 'sometimes|exists:nominatif_detail_rows,id',
            'person_name' => 'sometimes|string|max:255',
            'asal' => 'sometimes|string|max:100',
            'tujuan' => 'sometimes|string|max:100',
            'tanggal_pergi' => 'sometimes|date',
            'tanggal_sampai' => 'sometimes|date|after_or_equal:tanggal_pergi',
            'golongan' => 'sometimes|string|max:10',
            'jabatan' => 'sometimes|string|max:255',
            'eselon' => 'sometimes|string|max:10',
        ]);

        $detailRow = NominatifDetailRow::findOrFail($rowId);

        // Security check
        if ($detailRow->nominatif->user_id !== $this->getAuthenticatedUser(request())?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit rows in submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Debug: Log incoming request data
            \Log::info('NominatifDetailRow update attempt:', [
                'rowId' => $rowId,
                'requestData' => $request->all(),
                'currentData' => $detailRow->toArray()
            ]);

            // Check if this is bulk data structure
            if ($request->has('rows') && is_array($request->rows)) {
                \Log::info('🔄 Bulk data structure detected, processing all rows');

                $updatedRows = [];
                foreach ($request->rows as $rowData) {
                    $targetDetailRow = NominatifDetailRow::where('id', $rowData['id'])->first();

                    if ($targetDetailRow) {
                        \Log::info("Found target row data in bulk structure:", [
                            'targetRowData' => $rowData
                        ]);

                        // Create update data with only fillable fields
                        $updateData = [];
                        foreach ($targetDetailRow->getFillable() as $field) {
                            if (isset($rowData[$field])) {
                                $updateData[$field] = $rowData[$field];
                            }
                        }

                        \Log::info("Update data to be saved:", [
                            'updateData' => $updateData
                        ]);

                        $updateResult = $targetDetailRow->update($updateData);

                        \Log::info("Update result:", [
                            'result' => $updateResult,
                            'updatedData' => $targetDetailRow->fresh()->toArray()
                        ]);

                        $updatedRows[] = $targetDetailRow->fresh();
                    }
                }

                // Update evidence descriptions if person_name changed (sebelum commit!)
                $this->updateEvidenceDescriptions($updatedRows);

                // Auto-sort rows by person_name after update
                $this->autoSortByName($detailRow->nominatif_id);

                // Update nominatif totals
                $this->updateNominatifTotals($detailRow->nominatif_id);

                DB::commit();

                // Get final sorted rows
                $finalRows = NominatifDetailRow::where('nominatif_id', $detailRow->nominatif_id)
                    ->orderBy('row_order')
                    ->with(['biayaRow', 'evidence'])
                    ->get();

                return response()->json([
                    'success' => true,
                    'message' => 'All detail rows updated successfully',
                    'data' => $finalRows
                ]);
            } else {
                // Single row update (legacy behavior)
                $updateData = $request->only($detailRow->getFillable());
                \Log::info('Update data to be saved:', ['updateData' => $updateData]);

                $result = $detailRow->update($updateData);

                \Log::info('Update result:', [
                    'result' => $result,
                    'updatedData' => $detailRow->fresh()->toArray()
                ]);

                // Update evidence descriptions if person_name changed (sebelum commit!)
                if (isset($updateData['person_name'])) {
                    $this->updateEvidenceDescriptions([$detailRow->fresh()]);
                }

                // Auto-sort rows by person_name after update
                $this->autoSortByName($detailRow->nominatif_id);

                // Update nominatif totals
                $this->updateNominatifTotals($detailRow->nominatif_id);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Detail row updated successfully',
                    'data' => $detailRow->load(['biayaRow', 'evidence'])
                ]);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update detail row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified detail row from storage.
     */
    public function destroy($rowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($rowId);

        // Security check
        if ($detailRow->nominatif->user_id !== $this->getAuthenticatedUser(request())?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete rows in submitted nominatif'
            ], 422);
        }

        $nominatifId = $detailRow->nominatif_id;

        DB::beginTransaction();
        try {
            $detailRow->delete();

            // Auto-sort rows by person_name after deletion
            $this->autoSortByName($nominatifId);

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Detail row deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete detail row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store multiple detail rows at once.
     */
    public function bulkStore(Request $request, $nominatifId)
    {
        // Manual token validation
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Invalid or missing token'
            ], 401);
        }

        $request->validate([
            'rows' => 'required|array|min:1',
                        'rows.*.person_name' => 'required|string|max:255',
            'rows.*.asal' => 'required|string|max:100',
            'rows.*.tujuan' => 'required|string|max:100',
            'rows.*.tanggal_pergi' => 'required|date',
            'rows.*.tanggal_sampai' => 'required|date|after_or_equal:rows.*.tanggal_pergi',
        ]);

        // Check if user owns the nominatif
        $nominatif = NominatifNew::where('id', $nominatifId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add rows to submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $maxRowOrder = NominatifDetailRow::where('nominatif_id', $nominatifId)
                ->max('row_order') ?? 0;

            $createdRows = [];
            foreach ($request->rows as $index => $rowData) {
                $detailRow = NominatifDetailRow::create([
                    'nominatif_id' => $nominatifId,
                    'person_name' => $rowData['person_name'],
                    'row_order' => $maxRowOrder + $index + 1,
                    'asal' => $rowData['asal'],
                    'tujuan' => $rowData['tujuan'],
                    'tanggal_pergi' => $rowData['tanggal_pergi'],
                    'tanggal_sampai' => $rowData['tanggal_sampai'],
                    'no' => $maxRowOrder + $index + 1,
                    'golongan' => $rowData['golongan'] ?? null,
                    'jabatan' => $rowData['jabatan'] ?? null,
                    'eselon' => $rowData['eselon'] ?? null,
                ]);

                // Create corresponding biaya row with default values including totals
                $biayaData = [
                    // Transport fields (matches database schema)
                    'transport_pesawat_non_pp_pagu' => 0,
                    'transport_pesawat_non_pp_aktual' => 0,
                    'transport_taksi_pergi_pagu' => 0,
                    'transport_taksi_pergi_aktual' => 0,
                    'transport_taksi_pulang_pagu' => 0,
                    'transport_taksi_pulang_aktual' => 0,

                    // Penginapan source fields (needed for generated columns)
                    'penginapan_jumlah_malam' => 0,
                    'penginapan_pagu_perhari' => 0,
                    'penginapan_aktual_perhari' => 0,

                    // Uang Harian Meeting Fullboard source fields (renamed from fullboard)
                    'uang_harian_meeting_fullboard_jumlah_hari' => 0,
                    'uang_harian_meeting_fullboard_pagu_perhari' => 0,
                    'uang_harian_meeting_fullboard_aktual_perhari' => 0,

                    // Uang Harian Meeting Fullday source fields
                    'uang_harian_meeting_fullday_jumlah_hari' => 0,
                    'uang_harian_meeting_fullday_pagu_perhari' => 0,
                    'uang_harian_meeting_fullday_aktual_perhari' => 0,

                    // Uang Harian Luar Kota source fields
                    'uang_harian_luar_kota_jumlah_hari' => 0,
                    'uang_harian_luar_kota_pagu_perhari' => 0,
                    'uang_harian_luar_kota_aktual_perhari' => 0,

                    // Uang Harian Dalam Kota source fields
                    'uang_harian_dalam_kota_jumlah_hari' => 0,
                    'uang_harian_dalam_kota_pagu_perhari' => 0,
                    'uang_harian_dalam_kota_aktual_perhari' => 0,

                    // Representasi Luar Kota source fields
                    'representasi_luar_kota_jumlah_hari' => 0,
                    'representasi_luar_kota_pagu_perhari' => 0,
                    'representasi_luar_kota_aktual_perhari' => 0,

                    // Representasi Dalam Kota source fields
                    'representasi_dalam_kota_jumlah_hari' => 0,
                    'representasi_dalam_kota_pagu_perhari' => 0,
                    'representasi_dalam_kota_aktual_perhari' => 0,
                ];
                $detailRow->biayaRow()->create($biayaData);

                $createdRows[] = $detailRow;
            }

            // Auto-sort rows by person_name
            $this->autoSortByName($nominatifId);
            $createdRows = NominatifDetailRow::where('nominatif_id', $nominatifId)
                ->orderBy('row_order')
                ->with(['biayaRow', 'evidence'])
                ->get();

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Detail rows created and auto-sorted successfully',
                'data' => $createdRows
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create detail rows',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update multiple detail rows at once.
     */
    public function bulkUpdate(Request $request, $nominatifId)
    {
        $validatedData = $request->validate([
            'rows' => 'required|array',
            'rows.*.id' => 'required|exists:nominatif_detail_rows,id',
            'rows.*.person_name' => 'sometimes|string|max:255',
            'rows.*.asal' => 'sometimes|string|max:100',
            'rows.*.tujuan' => 'sometimes|string|max:100',
            'rows.*.golongan' => 'sometimes|string|max:10',
            'rows.*.jabatan' => 'sometimes|string|max:255',
            'rows.*.eselon' => 'sometimes|string|max:10',
            'rows.*.tanggal_pergi' => 'sometimes|date',
            'rows.*.tanggal_sampai' => 'sometimes|date',
        ]);

        
        // Check if user owns the nominatif
        $nominatif = NominatifNew::where('id', $nominatifId)
            ->where('user_id', $this->getAuthenticatedUser(app('request'))?->id)
            ->firstOrFail();

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit rows in submitted nominatif'
            ], 422);
        }

        // Debug: Log incoming data
        \Log::info('=== BULK UPDATE START ===');
        \Log::info('Request data:', [
            'nominatifId' => $nominatifId,
            'rows_count' => count($validatedData['rows']),
            'raw_rows' => $request->rows,
            'validated_rows' => $validatedData['rows']
        ]);

        DB::beginTransaction();
        try {
            $updatedRows = [];
            foreach ($validatedData['rows'] as $index => $rowData) {
                \Log::info("=== PROCESSING ROW {$index} ===");
                \Log::info('Row data to update:', $rowData);

                $detailRow = NominatifDetailRow::where('id', $rowData['id'])->first();

                if ($detailRow) {
                    \Log::info('Found detail row:', $detailRow->toArray());

                    // Update dengan semua field yang dikirim
                    $updateResult = $detailRow->update($rowData);

                    \Log::info('Update result:', [
                        'success' => $updateResult,
                        'updated_row' => $detailRow->fresh()->toArray()
                    ]);

                    $updatedRows[] = $detailRow->fresh();
                } else {
                    \Log::warning('Detail row NOT found for ID:', $rowData['id']);
                }
            }

            // Auto-sort rows by person_name after update
            $this->autoSortByName($nominatifId);
            $updatedRows = NominatifDetailRow::where('nominatif_id', $nominatifId)
                ->orderBy('row_order')
                ->with(['biayaRow', 'evidence'])
                ->get();

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Detail rows updated and auto-sorted successfully',
                'data' => $updatedRows
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update detail rows',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update evidence descriptions when person_name changes
     */
    private function updateEvidenceDescriptions($updatedRows)
    {
        foreach ($updatedRows as $row) {
            $evidence = $row->evidence()->first();
            if ($evidence) {
                // Extract the evidence number from existing description
                $evidenceNumber = '1';
                if (preg_match('/Evidence (\d+) untuk /', $evidence->keterangan, $matches)) {
                    $evidenceNumber = $matches[1];
                }

                // Update description with new person_name
                $newDescription = "Evidence {$evidenceNumber} untuk {$row->person_name}";

                \Log::info("🔄 Updating evidence description", [
                    'row_id' => $row->id,
                    'evidence_id' => $evidence->id,
                    'old_description' => $evidence->keterangan,
                    'new_description' => $newDescription,
                    'person_name' => $row->person_name
                ]);

                $evidence->update(['keterangan' => $newDescription]);
            }
        }
    }

    /**
     * Validate detail row data
     */
    public function validate(Request $request)
    {
        $request->validate([
            'person_name' => 'required|string|max:255',
            'asal' => 'required|string|max:100',
            'tujuan' => 'required|string|max:100',
            'tanggal_pergi' => 'required|date',
            'tanggal_sampai' => 'required|date|after_or_equal:tanggal_pergi',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Detail row data is valid'
        ]);
    }

    /**
     * Update nominatif totals and RKA budget
     */
    private function updateNominatifTotals($nominatifId)
    {
        $nominatif = NominatifNew::findOrFail($nominatifId);

        $detailRows = $nominatif->detailRows()->with('biayaRow')->get();

        $totalPagu = 0;
        $totalAktual = 0;

        \Log::info("💰 Calculating totals for nominatif {$nominatifId}", [
            'detail_rows_count' => $detailRows->count(),
            'rows_with_biaya' => $detailRows->whereNotNull('biayaRow')->count()
        ]);

        foreach ($detailRows as $index => $row) {
            $rowPagu = $row->biayaRow?->total_pagu_row ?? 0;
            $rowAktual = $row->biayaRow?->total_aktual_row ?? 0;

            \Log::info("📊 Row {$index} calculation", [
                'row_id' => $row->id,
                'person_name' => $row->person_name,
                'row_pagu' => $rowPagu,
                'row_aktual' => $rowAktual,
                'running_total_pagu' => $totalPagu + $rowPagu,
                'running_total_aktual' => $totalAktual + $rowAktual
            ]);

            $totalPagu += $rowPagu;
            $totalAktual += $rowAktual;
        }

        \Log::info("💰 Final totals to be saved", [
            'nominatif_id' => $nominatifId,
            'total_pagu' => $totalPagu,
            'total_aktual' => $totalAktual,
            'expected_pagu' => 3 * 200000, // 3 rows × 200k
            'expected_aktual' => 3 * 100000  // 3 rows × 100k
        ]);

        // Get old values for budget calculation
        $oldAktual = $nominatif->total_aktual_trip ?? 0;

        $nominatif->update([
            'total_pagu' => $totalPagu,
            'total_biaya_aktual' => $totalAktual,
            'total_pagu_trip' => $totalPagu,
            'total_aktual_trip' => $totalAktual,
            'total_anggaran_berjalan_trip' => $totalPagu - $totalAktual,
        ]);

        // 🎯 FIX: Update RKA budget when nominatif is saved
        $this->updateRKABudget($nominatif, $totalAktual, $oldAktual);
    }

    /**
     * Update RKA budget when nominatif detail rows are saved
     */
    private function updateRKABudget($nominatif, $newAktual, $oldAktual)
    {
        $rkaDetail = $nominatif->rkaDetail;

        // 🎯 NOMINATIF LOGIC:
        // Anggaran Berjalan = Total PAGU yang diinput user (dari nominatif.total_pagu_trip)
        // Anggaran Layanan Used = Total AKTUAL yang dipakai user (dari nominatif.total_aktual_trip)
        $rkaDetail->update([
            'anggaran_berjalan' => $nominatif->total_pagu_trip,     // Total pagu yang diinput
            'anggaran_layanan_used' => $nominatif->total_aktual_trip, // Total aktual yang dipakai
        ]);

        \Log::info('RKA Budget updated - From Nominatif', [
            'nominatif_id' => $nominatif->id,
            'rka_code' => $rkaDetail->code_rka,
            'nominatif_total_pagu_trip' => $nominatif->total_pagu_trip,
            'nominatif_total_aktual_trip' => $nominatif->total_aktual_trip,
            'rka_anggaran_berjalan_set' => $nominatif->total_pagu_trip,
            'rka_anggaran_layanan_used_set' => $nominatif->total_aktual_trip,
            'rka_anggaran_sp2d' => $rkaDetail->anggaran_sp2d,
            'rka_anggaran_tersisa' => $rkaDetail->anggaran_layanan - $nominatif->total_pagu_trip - $rkaDetail->anggaran_sp2d,
        ]);
    }

    /**
     * Reorder rows after deletion
     */
    private function reorderRows($nominatifId)
    {
        $rows = NominatifDetailRow::where('nominatif_id', $nominatifId)
            ->orderBy('row_order')
            ->get();

        foreach ($rows as $index => $row) {
            $row->update(['row_order' => $index + 1]);
        }
    }

    /**
     * Auto-sort rows by person_name (alphabetical)
     */
    private function autoSortByName($nominatifId)
    {
        $rows = NominatifDetailRow::where('nominatif_id', $nominatifId)
            ->orderBy('person_name', 'asc')
            ->get();

        foreach ($rows as $index => $row) {
            $row->update([
                'row_order' => $index + 1,
                'no' => $index + 1
            ]);
        }
    }
}