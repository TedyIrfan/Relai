<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\NominatifNew;
use App\Models\NominatifDetailRow;
use App\Models\NominatifBiayaRow;
use App\Models\NominatifEvidence;
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

        // 🔥 REMOVED: Security check for READ-ONLY access
        // All authenticated users can view detail rows (read-only) from other users
        // This is needed for "All Status" feature where users can view nominatifs from all users

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
            // 'rows.*.id' => 'sometimes|exists:nominatif_detail_rows,id', // Skip validation - handle in logic
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

                // Process evidence links and create/update evidence records
                $this->processEvidenceLinks($updatedRows, $request->rows, $detailRow->nominatif_id);

                // Update evidence descriptions if person_name changed (sebelum commit!)
                $this->updateEvidenceDescriptions($updatedRows);

                // Auto-sort rows by person_name after update
                $this->autoSortByName($detailRow->nominatif_id);

                // Update nominatif totals
                $this->updateNominatifTotals($detailRow->nominatif_id);

                \Log::info("💳 COMMITTING DATABASE TRANSACTION", [
                    'nominatif_id' => $detailRow->nominatif_id,
                    'evidence_updates_completed' => count($updatedRows)
                ]);

                DB::commit();

                \Log::info("✅ DATABASE TRANSACTION COMMITTED SUCCESSFULLY");

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
     * Validate draft data without modifying database
     */
    public function validateDraftData(Request $request, $nominatifId)
    {
        // Check if user owns the nominatif (skip auth for testing)
        $nominatif = NominatifNew::findOrFail($nominatifId);
        // TODO: Re-enable auth validation after testing

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit rows in submitted nominatif'
            ], 422);
        }

        $requestData = $request->all();
        $rows = $requestData['rows'] ?? [];
        $deletedRows = $requestData['deleted_rows'] ?? [];

        \Log::info('=== VALIDATE DRAFT DATA START ===');
        \Log::info('Nominatif ID: ' . $nominatifId);
        \Log::info('Rows to validate: ' . count($rows));
        \Log::info('Deleted rows: ' . json_encode($deletedRows));

        // Validation only - no database modifications
        $validatedRows = [];
        $validationErrors = [];

        foreach ($rows as $index => $rowData) {
            $errors = [];

            \Log::info("=== VALIDATING ROW {$index} ===");
            \Log::info("Row data: " . json_encode($rowData));

            // Validate row structure - accept both nama_lengkap and person_name
            if (empty($rowData['nama_lengkap']) && empty($rowData['person_name'])) {
                $errors[] = "Nama lengkap wajib diisi";
                \Log::warning("❌ Nama lengkap kosong");
            }
            if (empty($rowData['asal'])) {
                $errors[] = "Asal wajib diisi";
                \Log::warning("❌ Asal kosong");
            }
            if (empty($rowData['tujuan'])) {
                $errors[] = "Tujuan wajib diisi";
                \Log::warning("❌ Tujuan kosong");
            }

            // Check if existing row exists (for updates)
            if (!str_starts_with($rowData['id'], 'temp_')) {
                // 🔥 FIXED: Skip validation for rows that are marked as deleted
                if (in_array($rowData['id'], $deletedRows)) {
                    \Log::info("⏭️ Skipping validation for deleted row ID: {$rowData['id']}");
                    continue; // Skip to next row
                }

                $detailRow = NominatifDetailRow::find($rowData['id']);
                if (!$detailRow) {
                    $errors[] = "Row dengan ID {$rowData['id']} tidak ditemukan";
                }
            }

            if (empty($errors)) {
                // Validation passed
                $validatedRows[] = [
                    'temp_id' => $rowData['id'],
                    'database_id' => !str_starts_with($rowData['id'], 'temp_') ? $rowData['id'] : null,
                    'data' => $rowData,
                    'is_new' => str_starts_with($rowData['id'], 'temp_')
                ];
                \Log::info("✅ Row {$index} validation passed");
            } else {
                $validationErrors[$index] = $errors;
                \Log::warning("❌ Row {$index} validation failed:", $errors);
            }
        }

        return response()->json([
            'success' => empty($validationErrors),
            'message' => empty($validationErrors) ? 'Validation successful' : 'Validation failed',
            'validated_rows' => $validatedRows,
            'validation_errors' => $validationErrors,
            'rows_count' => count($validatedRows)
        ]);
    }

    /**
     * Execute draft changes to database
     */
    public function executeDraft(Request $request, $nominatifId)
    {
        // Check if user owns the nominatif (skip auth for testing)
        $nominatif = NominatifNew::findOrFail($nominatifId);
        // TODO: Re-enable auth validation after testing

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit rows in submitted nominatif'
            ], 422);
        }

        $requestData = $request->all();
        $rows = $requestData['rows'] ?? [];

        // \Log::info('⚡ EXECUTE DRAFT START (OPTIMIZED) - ID: ' . $nominatifId . ', Rows: ' . count($rows));

        DB::beginTransaction();
        try {
            $updatedRows = [];
            $idMapping = []; // temp_id -> database_id mapping

            // ⚡ SMART DELETE: Process deletions FIRST before any row operations (OPTIMIZED)
            $deletedRows = $requestData['deleted_rows'] ?? [];
            if (!empty($deletedRows)) {
                // \Log::info("⚡ DELETING " . count($deletedRows) . " ROWS");
                // ⚡ PERFORMANCE: Bulk delete instead of individual deletes
                NominatifBiayaRow::whereIn('nominatif_detail_row_id', $deletedRows)->delete();
                NominatifEvidence::whereIn('nominatif_detail_row_id', $deletedRows)->delete();
                NominatifDetailRow::whereIn('id', $deletedRows)->delete();
            }

            // ⚡ PERFORMANCE: Get max row_order once for all new rows
            $maxRowOrder = NominatifDetailRow::where('nominatif_id', $nominatifId)->max('row_order') ?? 0;

            foreach ($rows as $index => $rowData) {
                if (!str_starts_with($rowData['id'], 'temp_')) {
                    // EXISTING ROW LOGIC (Update) - Optimized
                    $detailRow = NominatifDetailRow::find($rowData['id']);
                    if ($detailRow) {
                        $detailRow->update($rowData);
                        $updatedRows[] = $detailRow->fresh();
                        $idMapping[$rowData['id']] = $rowData['id'];
                    }
                } else {
                    // NEW ROW LOGIC (Create) - Optimized
                    $newRow = NominatifDetailRow::create([
                        'nominatif_id' => $nominatifId,
                        'person_name' => $rowData['nama_lengkap'] ?? $rowData['person_name'] ?? 'Unknown',
                        'asal' => $rowData['asal'],
                        'tujuan' => $rowData['tujuan'],
                        'golongan' => $rowData['golongan'] ?? null,
                        'jabatan' => $rowData['jabatan'] ?? null,
                        'eselon' => $rowData['eselon'] ?? null,
                        'tanggal_pergi' => $rowData['tanggal_pergi'] ?? null,
                        'tanggal_sampai' => $rowData['tanggal_sampai'] ?? null,
                        'row_order' => $maxRowOrder + $index + 1,
                        'no' => $index + 1,
                    ]);

                    $idMapping[$rowData['id']] = $newRow->id;

                    // ⚡ PERFORMANCE: Use default values array for biaya
                    NominatifBiayaRow::create([
                        'nominatif_detail_row_id' => $newRow->id,
                        'transport_pesawat_non_pp_pagu' => 0,
                        'transport_pesawat_non_pp_aktual' => 0,
                        'transport_taksi_pagu' => 0,
                        'transport_taksi_aktual' => 0,
                        'penginapan_jumlah_malam' => 0,
                        'penginapan_pagu_perhari' => 0,
                        'penginapan_aktual_perhari' => 0,
                        'uang_harian_luar_kota_jumlah_hari' => 0,
                        'uang_harian_luar_kota_pagu_perhari' => 0,
                        'uang_harian_luar_kota_aktual_perhari' => 0,
                        'uang_harian_dalam_kota_jumlah_hari' => 0,
                        'uang_harian_dalam_kota_pagu_perhari' => 0,
                        'uang_harian_dalam_kota_aktual_perhari' => 0,
                        'representasi_luar_kota_jumlah_hari' => 0,
                        'representasi_luar_kota_pagu_perhari' => 0,
                        'representasi_luar_kota_aktual_perhari' => 0,
                        'representasi_dalam_kota_jumlah_hari' => 0,
                        'representasi_dalam_kota_pagu_perhari' => 0,
                        'representasi_dalam_kota_aktual_perhari' => 0,
                    ]);

                    $updatedRows[] = $newRow->fresh();
                }
            }

            // 🔥 DELETED ROWS PROCESSED ABOVE - MOVED TO BEGINNING TO WORK WITH AUTO-SORT
            // Process deleted rows
            // $deletedRows = $requestData['deleted_rows'] ?? [];
            // foreach ($deletedRows as $rowId) {
            //     \Log::info("🗑️ DELETING ROW: {$rowId}");
            //     $deletedRow = NominatifDetailRow::findOrFail($rowId);
            //
            //     // 🔥 DEBUG: Log row data BEFORE deletion
            //     \Log::info("🎯 ROW DATA BEFORE DELETE:", [
            //         'id' => $deletedRow->id,
            //         'person_name' => $deletedRow->person_name,
            //         'asal' => $deletedRow->asal,
            //         'tujuan' => $deletedRow->tujuan
            //     ]);
            //
            //     $deletedRow->delete();
            //     // Also delete related biaya row
            //     NominatifBiayaRow::where('nominatif_detail_row_id', $rowId)->delete();
            //     NominatifEvidence::where('nominatif_detail_row_id', $rowId)->delete();
            // }

            // ⚡ PERFORMANCE: Conditional auto-sort - only if names changed or rows added/deleted
            $hasNameChanges = collect($rows)->contains(function($row) {
                return isset($row['person_name']) || isset($row['nama_lengkap']);
            });
            $hasRowOperations = !empty($deletedRows) || collect($rows)->contains(function($row) {
                return str_starts_with($row['id'], 'temp_');
            });

            // ⚡ REQUIRED AUTO-SORT: Fix performance issue, keep functionality
            if ($hasRowOperations) {
                $this->autoSortByName($nominatifId);
            }

            // ⚡ OPTIMIZED RESPONSE: Return minimal but useful data
            $updatedRows = collect($rows)->map(function($row) use ($idMapping) {
                return [
                    'id' => $idMapping[$row['id']] ?? $row['id'],
                    'person_name' => $row['nama_lengkap'] ?? $row['person_name'] ?? 'Unknown'
                ];
            });

            DB::commit();

            // ⚡ OPTIMIZED TOTALS UPDATE: Use async approach for better performance
            if (php_sapi_name() !== 'cli') {
                // Update totals asynchronously - faster response for user
                register_shutdown_function(function() use ($nominatifId) {
                    try {
                        $this->updateNominatifTotals($nominatifId);
                    } catch (\Exception $e) {
                        \Log::error('Background totals update failed: ' . $e->getMessage());
                    }
                });
            } else {
                $this->updateNominatifTotals($nominatifId);
            }

            // \Log::info("⚡ Draft execution completed successfully (OPTIMIZED) - Created: " . count(array_filter($rows, fn($r) => str_starts_with($r['id'], 'temp_'))) . " Updated: " . count(array_filter($rows, fn($r) => !str_starts_with($r['id'], 'temp_'))) . " Deleted: " . count($deletedRows));

            return response()->json([
                'success' => true,
                'message' => 'Berhasil Simpan Draft - Data sedang diproses',
                'data' => $updatedRows, // Minimal data - no eager loading
                'id_mapping' => $idMapping // Critical for frontend
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('❌ Draft execution failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save draft',
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

                $createdRows[] = $detailRow;
            }

            // ⚡ PERFORMANCE: Bulk create biaya rows instead of individual creates
            $biayaRows = [];
            foreach ($createdRows as $row) {
                $biayaRows[] = [
                    'nominatif_detail_row_id' => $row->id,
                    'transport_pesawat_non_pp_pagu' => 0,
                    'transport_pesawat_non_pp_aktual' => 0,
                    'transport_taksi_pagu' => 0,
                    'transport_taksi_aktual' => 0,
                    'penginapan_jumlah_malam' => 0,
                    'penginapan_pagu_perhari' => 0,
                    'penginapan_aktual_perhari' => 0,
                    'uang_harian_meeting_fullboard_jumlah_hari' => 0,
                    'uang_harian_meeting_fullboard_pagu_perhari' => 0,
                    'uang_harian_meeting_fullboard_aktual_perhari' => 0,
                    'uang_harian_meeting_fullday_jumlah_hari' => 0,
                    'uang_harian_meeting_fullday_pagu_perhari' => 0,
                    'uang_harian_meeting_fullday_aktual_perhari' => 0,
                    'uang_harian_luar_kota_jumlah_hari' => 0,
                    'uang_harian_luar_kota_pagu_perhari' => 0,
                    'uang_harian_luar_kota_aktual_perhari' => 0,
                    'uang_harian_dalam_kota_jumlah_hari' => 0,
                    'uang_harian_dalam_kota_pagu_perhari' => 0,
                    'uang_harian_dalam_kota_aktual_perhari' => 0,
                    'representasi_luar_kota_jumlah_hari' => 0,
                    'representasi_luar_kota_pagu_perhari' => 0,
                    'representasi_luar_kota_aktual_perhari' => 0,
                    'representasi_dalam_kota_jumlah_hari' => 0,
                    'representasi_dalam_kota_pagu_perhari' => 0,
                    'representasi_dalam_kota_aktual_perhari' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Single bulk insert for all biaya rows
            if (!empty($biayaRows)) {
                NominatifBiayaRow::insert($biayaRows);
            }

            // ⚡ REQUIRED AUTO-SORT: Fix performance issue, keep functionality
            $this->autoSortByName($nominatifId);

            // ⚡ OPTIMIZED RESPONSE: Return minimal but useful data
            $simpleCreatedRows = collect($createdRows)->map(function($row) {
                return [
                    'id' => $row->id,
                    'person_name' => $row->person_name
                ];
            });

            DB::commit();

            // ⚡ OPTIMIZED TOTALS UPDATE: Use async approach for better performance
            if (php_sapi_name() !== 'cli') {
                register_shutdown_function(function() use ($nominatifId) {
                    try {
                        $this->updateNominatifTotals($nominatifId);
                    } catch (\Exception $e) {
                        \Log::error('Background totals update failed in bulkStore: ' . $e->getMessage());
                    }
                });
            } else {
                $this->updateNominatifTotals($nominatifId);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail rows created successfully',
                'data' => $simpleCreatedRows // Minimal data - no eager loading
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
        // Check if user owns the nominatif (skip auth for testing)
        $nominatif = NominatifNew::findOrFail($nominatifId);
        // TODO: Re-enable auth validation after testing
        // ->where('user_id', $this->getAuthenticatedUser(app('request'))?->id)

        // Get raw data instead of validated to preserve 'id' field
        $requestData = $request->all();
        $rows = $requestData['rows'];

        // DEBUG: Log nominatif status check
        \Log::info("🔍 NOMINATIF STATUS CHECK - ID: {$nominatifId}", [
            'nominatif_id' => $nominatif->id,
            'nominatif_status' => $nominatif->status,
            'nominatif_user_id' => $nominatif->user_id,
            'authenticated_user_id' => $this->getAuthenticatedUser(app('request'))?->id,
            'is_draft' => $nominatif->status === 'draft'
        ]);

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            \Log::error("❌ EDIT BLOCKED - Nominatif {$nominatifId} status is '{$nominatif->status}', expected 'draft'");
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit rows in submitted nominatif'
            ], 422);
        }

        \Log::info("✅ EDIT ALLOWED - Nominatif {$nominatifId} status is '{$nominatif->status}'");

        // Debug: Log incoming data
        \Log::info('=== BULK UPDATE START ===');
        \Log::info('Request data:', [
            'nominatifId' => $nominatifId,
            'rows_count' => count($rows),
            'raw_rows' => $rows
        ]);

        DB::beginTransaction();
        try {
            $updatedRows = [];
            foreach ($rows as $index => $rowData) {
                \Log::info("=== PROCESSING ROW {$index} ===");
                \Log::info('Row data to process:', $rowData);

                // NEW LOGIC: Check if temporary or permanent ID
                if (!str_starts_with($rowData['id'], 'temp_')) {
                    // EXISTING ROW LOGIC (Update)
                    \Log::info("Processing EXISTING row ID: {$rowData['id']}");

                    $detailRow = NominatifDetailRow::find($rowData['id']);
                    if (!$detailRow) {
                        \Log::warning("⚠️ Row {$rowData['id']} not found, skipping update");
                        continue; // Skip this row and continue with next
                    }

                    $updateResult = $detailRow->update($rowData);

                    \Log::info("✅ Updated existing row ID: {$rowData['id']}", [
                        'success' => $updateResult,
                        'updated_row' => $detailRow->fresh()->toArray()
                    ]);

                    $updatedRows[] = $detailRow->fresh();

                } else {
                    // NEW ROW LOGIC (Create)
                    \Log::info("Processing NEW row, temporary ID: {$rowData['id']}");

                    // Get next row_order
                    $maxRowOrder = NominatifDetailRow::where('nominatif_id', $nominatifId)
                        ->max('row_order') ?? 0;

                    $newRow = NominatifDetailRow::create([
                        'nominatif_id' => $nominatifId,
                        'person_name' => $rowData['nama_lengkap'] ?? $rowData['person_name'] ?? 'Unknown',
                        'asal' => $rowData['asal'],
                        'tujuan' => $rowData['tujuan'],
                        'golongan' => $rowData['golongan'] ?? null,
                        'jabatan' => $rowData['jabatan'] ?? null,
                        'eselon' => $rowData['eselon'] ?? null,
                        'tanggal_pergi' => $rowData['tanggal_pergi'] ?? null,
                        'tanggal_sampai' => $rowData['tanggal_sampai'] ?? null,
                        'row_order' => $maxRowOrder + 1,
                        'no' => $index + 1,
                    ]);

                    \Log::info("✅ Created new row, temp ID: {$rowData['id']} → DB ID: {$newRow->id}");

                    // Create biaya row for new detail row
                    $biayaData = [
                        'nominatif_detail_row_id' => $newRow->id,
                        'transport_pesawat_non_pp_pagu' => 0,
                        'transport_pesawat_non_pp_aktual' => 0,
                        'transport_taksi_pagu' => 0,
                        'transport_taksi_aktual' => 0,
                        'transport_pesawat_pp_pagu' => 0,
                        'transport_pesawat_pp_aktual' => 0,
                        'transport_taksi_bandara_pagu' => 0,
                        'transport_taksi_bandara_aktual' => 0,
                        'penginapan_jumlah_malam' => 0,
                        'penginapan_pagu_perhari' => 0,
                        'penginapan_aktual_perhari' => 0,
                        'uang_harian_meeting_fullboard_jumlah_hari' => 0,
                        'uang_harian_meeting_fullboard_pagu_perhari' => 0,
                        'uang_harian_meeting_fullboard_aktual_perhari' => 0,
                        'uang_harian_meeting_fullday_jumlah_hari' => 0,
                        'uang_harian_meeting_fullday_pagu_perhari' => 0,
                        'uang_harian_meeting_fullday_aktual_perhari' => 0,
                        'uang_harian_luar_kota_jumlah_hari' => 0,
                        'uang_harian_luar_kota_pagu_perhari' => 0,
                        'uang_harian_luar_kota_aktual_perhari' => 0,
                        'uang_harian_dalam_kota_jumlah_hari' => 0,
                        'uang_harian_dalam_kota_pagu_perhari' => 0,
                        'uang_harian_dalam_kota_aktual_perhari' => 0,
                        'representasi_luar_kota_jumlah_hari' => 0,
                        'representasi_luar_kota_pagu_perhari' => 0,
                        'representasi_luar_kota_aktual_perhari' => 0,
                        'representasi_dalam_kota_jumlah_hari' => 0,
                        'representasi_dalam_kota_pagu_perhari' => 0,
                        'representasi_dalam_kota_aktual_perhari' => 0,
                    ];

                    $newBiayaRow = NominatifBiayaRow::create($biayaData);
                    \Log::info("✅ Created biaya row for new detail row ID: {$newRow->id}");

                    $updatedRows[] = $newRow->fresh();
                }
            }

            // Auto-sort rows by person_name after update
            $this->autoSortByName($nominatifId);
            $updatedRows = NominatifDetailRow::where('nominatif_id', $nominatifId)
                ->orderBy('row_order')
                ->with(['biayaRow', 'evidence']) // Kembali eager loading yang aman
                ->get();

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil Simpan Draft',
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
        // Get all evidence for this nominatif to determine correct numbering
        $nominatifId = $updatedRows[0]->nominatif_id ?? null;
        if (!$nominatifId) return;

        // Get all rows for this nominatif ordered by row_order
        $allRows = NominatifDetailRow::where('nominatif_id', $nominatifId)
            ->orderBy('row_order')
            ->get();

        // Create mapping of row_id to evidence number
        $rowToEvidenceNumber = [];
        foreach ($allRows as $index => $row) {
            $rowToEvidenceNumber[$row->id] = $index + 1;
        }

        foreach ($updatedRows as $row) {
            $evidence = $row->evidence()->first();
            if ($evidence) {
                // Use correct evidence number based on row_order
                $evidenceNumber = $rowToEvidenceNumber[$row->id] ?? '1';

                // Update description with new person_name sesuai format yang diminta
                $newDescription = "evidence {$evidenceNumber} punya {$row->person_name}";

                \Log::info("🔄 Updating evidence description", [
                    'row_id' => $row->id,
                    'evidence_id' => $evidence->id,
                    'row_order' => $row->row_order,
                    'evidence_number' => $evidenceNumber,
                    'old_description' => $evidence->keterangan,
                    'new_description' => $newDescription,
                    'person_name' => $row->person_name
                ]);

                // Update evidence keterangan in database with force save
                $evidence->keterangan = $newDescription;
                $updateResult = $evidence->save();

                // Force refresh to confirm database update
                $freshEvidence = $evidence->fresh();

                \Log::info("💾 Evidence database update result", [
                    'evidence_id' => $evidence->id,
                    'update_success' => $updateResult,
                    'old_keterangan' => $evidence->keterangan,
                    'final_keterangan' => $freshEvidence->keterangan,
                    'updated_at' => $freshEvidence->updated_at,
                    'is_dirty' => $evidence->isDirty('keterangan'),
                    'was_changed' => $evidence->wasChanged('keterangan')
                ]);
            }
        }
    }

    /**
     * Process evidence links from bulk update and create/update evidence records
     */
    private function processEvidenceLinks($updatedRows, $requestData, $nominatifId)
    {
        // Create row order mapping for evidence numbering
        $rowOrderMap = [];
        foreach ($updatedRows as $index => $row) {
            $rowOrderMap[$row->id] = $index + 1;
        }

        foreach ($requestData as $rowData) {
            $rowId = $rowData['id'];

            // Check if evidence_link is provided and not empty
            if (isset($rowData['evidence_link']) && !empty($rowData['evidence_link'])) {
                $detailRow = NominatifDetailRow::find($rowId);
                if ($detailRow) {
                    $evidenceNumber = $rowOrderMap[$rowId] ?? 1;
                    $personName = $detailRow->person_name ?? 'Unknown';

                    // Generate evidence description
                    $evidenceDescription = "evidence {$evidenceNumber} punya {$personName}";

                    // Create or update evidence record
                    $evidence = NominatifEvidence::updateOrCreate(
                        [
                            'nominatif_id' => $nominatifId,
                            'nominatif_detail_row_id' => $rowId
                        ],
                        [
                            'evidence_link' => $rowData['evidence_link'],
                            'evidence_name' => "Evidence {$evidenceNumber} - {$personName}",
                            'keterangan' => $evidenceDescription,
                            'user_id' => $this->getAuthenticatedUser(app('request'))?->id
                        ]
                    );

                    \Log::info("🔗 Evidence processed", [
                        'row_id' => $rowId,
                        'evidence_link' => $rowData['evidence_link'],
                        'evidence_description' => $evidenceDescription,
                        'evidence_id' => $evidence->id,
                        'person_name' => $personName
                    ]);
                }
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
     * Update nominatif totals and RKA budget - OPTIMIZED VERSION
     */
    private function updateNominatifTotals($nominatifId)
    {
        $nominatif = NominatifNew::findOrFail($nominatifId);

        // ⚡ PERFORMANCE: Use database aggregation instead of PHP loop
        $totals = DB::table('nominatif_detail_rows as ndr')
            ->leftJoin('nominatif_biaya_rows as nbr', 'ndr.id', '=', 'nbr.nominatif_detail_row_id')
            ->where('ndr.nominatif_id', $nominatifId)
            ->selectRaw('
                COALESCE(SUM(nbr.total_pagu_row), 0) as total_pagu,
                COALESCE(SUM(nbr.total_aktual_row), 0) as total_aktual
            ')
            ->first();

        $totalPagu = (int) $totals->total_pagu;
        $totalAktual = (int) $totals->total_aktual;

        // 🎯 Get old value before update for RKA calculation
        $oldAktual = $nominatif->total_aktual_trip ?? 0;

        // ⚡ PERFORMANCE: Single update instead of multiple queries
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
     * Auto-sort rows by person_name (alphabetical) - OPTIMIZED VERSION
     */
    private function autoSortByName($nominatifId)
    {
        // ⚡ ULTRA FAST: Get sorted rows with minimal data
        $rows = NominatifDetailRow::where('nominatif_id', $nominatifId)
            ->orderBy('person_name', 'asc')
            ->get(['id', 'row_order', 'no']);

        if ($rows->isEmpty()) {
            return;
        }

        // ⚡ ULTRA FAST: Simple individual updates - much faster than complex SQL
        foreach ($rows as $index => $row) {
            $newOrder = $index + 1;
            if ($row->row_order != $newOrder || $row->no != $newOrder) {
                // Direct Eloquent update - much simpler and faster
                $row->update([
                    'row_order' => $newOrder,
                    'no' => $newOrder
                ]);
            }
        }
    }
}