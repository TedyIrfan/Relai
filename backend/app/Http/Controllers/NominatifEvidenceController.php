<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\NominatifDetailRow;
use App\Models\NominatifEvidence;

class NominatifEvidenceController extends Controller
{
    /**
     * Display evidence files for a detail row.
     */
    public function index($detailRowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($detailRowId);

        // Security check
        if ($detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $evidenceFiles = $detailRow->evidence()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $evidenceFiles
        ]);
    }

    /**
     * Store a newly uploaded evidence file in storage.
     */
    public function store(Request $request, $detailRowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($detailRowId);

        // Security check
        if ($detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot upload evidence to submitted nominatif'
            ], 422);
        }

        $request->validate([
            'evidence_file' => 'required|file|mimes:jpg,jpeg,png|max:5120', // Max 5MB, images only
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('evidence_file');
            $userId = Auth::id();
            $nominatifId = $detailRow->nominatif_id;

            // Create unique filename
            $fileName = time() . '_' . $userId . '_' . $detailRowId . '_' . $file->getClientOriginalName();

            // Store file
            $path = $file->storeAs(
                "evidence/{$userId}/nominatif_{$nominatifId}/detail_{$detailRowId}",
                $fileName,
                'public'
            );

            // Create evidence record
            $evidence = NominatifEvidence::create([
                'nominatif_detail_row_id' => $detailRowId,
                'evidence_foto_path' => $path,
                'evidence_foto_name' => $file->getClientOriginalName(),
                'evidence_foto_size' => $file->getSize(),
                'evidence_foto_type' => $file->getMimeType(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Evidence uploaded successfully',
                'data' => $evidence
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload evidence',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified evidence file.
     */
    public function show($evidenceId)
    {
        $evidence = NominatifEvidence::findOrFail($evidenceId);

        // Security check
        if ($evidence->detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $evidence
        ]);
    }

    /**
     * Update evidence description.
     */
    public function update(Request $request, $evidenceId)
    {
        $evidence = NominatifEvidence::findOrFail($evidenceId);

        // Security check
        if ($evidence->detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($evidence->detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit evidence in submitted nominatif'
            ], 422);
        }

        // Simple evidence - just view/download, no edit needed
        return response()->json([
            'success' => true,
            'message' => 'Evidence viewed successfully',
            'data' => $evidence
        ]);
    }

    /**
     * Remove the specified evidence file from storage.
     */
    public function destroy($evidenceId)
    {
        $evidence = NominatifEvidence::findOrFail($evidenceId);

        // Security check
        if ($evidence->detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($evidence->detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete evidence in submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($evidence->evidence_foto_path)) {
                Storage::disk('public')->delete($evidence->evidence_foto_path);
            }

            // Delete database record
            $evidence->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Evidence deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete evidence',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download evidence file.
     */
    public function download($evidenceId)
    {
        $evidence = NominatifEvidence::findOrFail($evidenceId);

        // Security check
        if ($evidence->detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if file exists
        if (!Storage::disk('public')->exists($evidence->evidence_foto_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        // Return file download
        return Storage::disk('public')->download(
            $evidence->evidence_foto_path,
            $evidence->evidence_foto_name
        );
    }

    /**
     * Validate evidence upload
     */
    public function validate(Request $request)
    {
        $request->validate([
            'evidence_file' => 'required|file|mimes:jpg,jpeg,png|max:5120', // Max 5MB, images only
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evidence file is valid'
        ]);
    }

    /**
     * Get file type information
     */
    public function getFileTypeInfo($fileName)
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        $imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        $documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
        $spreadsheetTypes = ['xls', 'xlsx', 'csv'];
        $presentationTypes = ['ppt', 'pptx'];

        if (in_array($extension, $imageTypes)) {
            return [
                'type' => 'image',
                'category' => 'Image File',
                'previewable' => true
            ];
        } elseif (in_array($extension, $documentTypes)) {
            return [
                'type' => 'document',
                'category' => 'Document File',
                'previewable' => $extension === 'pdf'
            ];
        } elseif (in_array($extension, $spreadsheetTypes)) {
            return [
                'type' => 'spreadsheet',
                'category' => 'Spreadsheet File',
                'previewable' => false
            ];
        } elseif (in_array($extension, $presentationTypes)) {
            return [
                'type' => 'presentation',
                'category' => 'Presentation File',
                'previewable' => false
            ];
        } else {
            return [
                'type' => 'other',
                'category' => 'Other File',
                'previewable' => false
            ];
        }
    }
}