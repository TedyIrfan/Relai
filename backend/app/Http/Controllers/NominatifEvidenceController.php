<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\NominatifNew;
use App\Models\NominatifEvidence;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

class NominatifEvidenceController extends Controller
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
     * Display evidence files for a nominatif.
     */
    public function index($nominatifId)
    {
        $nominatif = NominatifNew::findOrFail($nominatifId);

        // Security check
        if ($nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $evidenceFiles = $nominatif->evidence()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $evidenceFiles
        ]);
    }

    /**
     * Store a newly uploaded evidence file in storage.
     */
    public function store(Request $request, $nominatifId)
    {
        $nominatif = NominatifNew::findOrFail($nominatifId);

        // Security check
        if ($nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot upload evidence to submitted nominatif'
            ], 422);
        }

        $request->validate([
            'evidence_file' => 'required|file|mimes:jpg,jpeg,png|max:5120', // Max 5MB, images only
            'keterangan' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('evidence_file');
            $userId = $this->getAuthenticatedUser(app('request'))?->id;

            // Create unique filename
            $fileName = time() . '_' . $userId . '_' . $nominatifId . '_' . $file->getClientOriginalName();

            // Store file
            $path = $file->storeAs(
                "evidence/{$userId}/nominatif_{$nominatifId}",
                $fileName,
                'public'
            );

            // Create evidence record
            $evidence = NominatifEvidence::create([
                'nominatif_id' => $nominatifId,
                'evidence_foto_path' => $path,
                'evidence_foto_name' => $file->getClientOriginalName(),
                'evidence_foto_size' => $file->getSize(),
                'evidence_foto_type' => $file->getMimeType(),
                'keterangan' => $request->keterangan,
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
        if ($evidence->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
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
        if ($evidence->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($evidence->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit evidence in submitted nominatif'
            ], 422);
        }

        $request->validate([
            'keterangan' => 'nullable|string|max:500'
        ]);

        $evidence->update([
            'keterangan' => $request->keterangan
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evidence updated successfully',
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
        if ($evidence->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($evidence->nominatif->status !== 'draft') {
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
        if ($evidence->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
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
     * Get all evidence files for a nominatif with file type info
     */
    public function getAllEvidence($nominatifId)
    {
        $nominatif = NominatifNew::findOrFail($nominatifId);

        // Security check
        if ($nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $evidenceFiles = $nominatif->evidence()->orderBy('created_at', 'desc')->get();

        // Add file type info to each evidence
        $evidenceFiles = $evidenceFiles->map(function($evidence) {
            $evidence->file_info = $this->getFileTypeInfo($evidence->evidence_foto_name);
            $evidence->formatted_size = $this->getFormattedFileSize($evidence->evidence_foto_size);
            return $evidence;
        });

        return response()->json([
            'success' => true,
            'data' => $evidenceFiles
        ]);
    }

    /**
     * Get formatted file size
     */
    private function getFormattedFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get file type information
     */
    private function getFileTypeInfo($fileName)
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        $imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        $documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];

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
        } else {
            return [
                'type' => 'other',
                'category' => 'Other File',
                'previewable' => false
            ];
        }
    }
}