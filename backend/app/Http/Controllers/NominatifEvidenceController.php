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
    /**
     * 🔥 FIXED: Enhanced method to handle authentication for both nominatif and detail row
     */
    private function getAuthenticatedUser(Request $request, $detailRowId = null)
    {
        $token = $request->bearerToken();

        if (!$token) {
            \Log::warning('No token provided in request', [
                'headers' => $request->headers->all(),
                'url' => $request->fullUrl(),
                'method' => $request->method()
            ]);
            return null;
        }

        // Find the token in the personal_access_tokens table
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            \Log::warning('Invalid token provided', [
                'token' => $token,
                'token_exists' => PersonalAccessToken::findToken($token) !== null
            ]);
            return null;
        }

        // Get the user associated with this token
        $user = $accessToken->tokenable;

        if (!$user) {
            \Log::warning('Token exists but no user associated', [
                'token_id' => $accessToken->id,
                'tokenable_type' => get_class($accessToken->tokenable),
                'tokenable_id' => $accessToken->tokenable_id
            ]);
            return null;
        }

        \Log::info('User authenticated successfully', [
            'user_id' => $user->id,
            'user_email' => $user->email ?? 'no-email',
            'token_id' => $accessToken->id,
            'detailRowId' => $detailRowId,
            'request_url' => $request->fullUrl()
        ]);

        return $user;
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
     * Store evidence with nominatif_detail_row_id support
     */
    public function storeWithDetailRow(Request $request, $nominatifId, $detailRowId = null)
    {
        $nominatif = NominatifNew::findOrFail($nominatifId);

        // Security check
        if ($nominatif->user_id !== $this->getAuthenticatedUser($request)?->id) {
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

        // 🔥 FIXED: Support both file upload and Google Drive links
        $request->validate([
            'evidence_link' => 'required_without:evidence_file|url|max:1000',
            'evidence_name' => 'required|string|max:255',
            'evidence_file' => 'required_without:evidence_link|file|mimes:jpg,jpeg,png,pdf,bmp,gif,webp,svg|max:10240', // Max 10MB, images + PDF
            'keterangan' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            $userId = $this->getAuthenticatedUser($request)?->id;
            $evidenceData = [];

            // Handle Google Drive Link
            if ($request->filled('evidence_link')) {
                \Log::info("🔗 Storing Google Drive evidence", [
                    'nominatif_id' => $nominatifId,
                    'detail_row_id' => $detailRowId,
                    'evidence_link' => $request->evidence_link,
                    'evidence_name' => $request->evidence_name
                ]);

                $evidenceData = [
                    'nominatif_id' => $nominatifId,
                    'nominatif_detail_row_id' => $detailRowId,
                    'evidence_link' => $request->evidence_link,
                    'evidence_name' => $request->evidence_name,
                    'keterangan' => $request->keterangan,
                    'user_id' => $userId,
                ];
            }
            // Handle File Upload (legacy)
            else {
                $file = $request->file('evidence_file');

                \Log::info("📁 Storing file evidence", [
                    'nominatif_id' => $nominatifId,
                    'detail_row_id' => $detailRowId,
                    'filename' => $file->getClientOriginalName()
                ]);

                // Create unique filename
                $fileName = time() . '_' . $userId . '_' . $nominatifId . '_' . ($detailRowId ?? 'general') . '_' . $file->getClientOriginalName();

                // Store file
                $path = $file->storeAs(
                    "evidence/{$userId}/nominatif_{$nominatifId}",
                    $fileName,
                    'public'
                );

                $evidenceData = [
                    'nominatif_id' => $nominatifId,
                    'nominatif_detail_row_id' => $detailRowId,
                    'evidence_foto_path' => $path,
                    'evidence_foto_name' => $file->getClientOriginalName(),
                    'evidence_foto_size' => $file->getSize(),
                    'evidence_foto_type' => $file->getMimeType(),
                    'keterangan' => $request->keterangan,
                    'user_id' => $userId,
                ];
            }

            // Create evidence record
            $evidence = NominatifEvidence::create($evidenceData);

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
     * Get file type information for image files
     */
    private function getFileTypeInfo($fileName)
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        $imageTypes = [
            'jpg' => ['type' => 'JPEG', 'icon' => '📷'],
            'jpeg' => ['type' => 'JPEG', 'icon' => '📷'],
            'png' => ['type' => 'PNG', 'icon' => '🖼️'],
            'gif' => ['type' => 'GIF', 'icon' => '🎞️'],
            'bmp' => ['type' => 'BMP', 'icon' => '🎨'],
            'webp' => ['type' => 'WebP', 'icon' => '🌐'],
            'svg' => ['type' => 'SVG', 'icon' => '🎭']
        ];

        if (isset($imageTypes[$extension])) {
            return [
                'type' => 'image',
                'format' => $imageTypes[$extension]['type'],
                'category' => 'Image File',
                'icon' => $imageTypes[$extension]['icon'],
                'previewable' => true
            ];
        } else {
            return [
                'type' => 'other',
                'format' => 'Unknown',
                'category' => 'File',
                'icon' => '📎',
                'previewable' => false
            ];
        }
    }
}