<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\NominatifNew;
use App\Models\RkaDetail;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use Carbon\Carbon;

/**
 * @OA\Tag(
 *     name="Nominatif",
 *     description="Nominatif management operations"
 * )
 */
class NominatifNewController extends Controller
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

        // Debug logging
        \Log::info('Token validation attempt', [
            'token_exists' => !empty($token),
            'token_length' => $token ? strlen($token) : 0,
            'authorization_header' => $request->header('Authorization'),
            'all_headers' => $request->headers->all()
        ]);

        if (!$token) {
            \Log::warning('No token provided in request');
            return null;
        }

        // Find the token in the personal_access_tokens table
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            \Log::warning('Token not found in personal_access_tokens table', [
                'token_preview' => substr($token, 0, 20) . '...'
            ]);
            return null;
        }

        \Log::info('Token found successfully', [
            'token_id' => $accessToken->id,
            'tokenable_type' => $accessToken->tokenable_type,
            'tokenable_id' => $accessToken->tokenable_id
        ]);

        // Get the user associated with this token
        return $accessToken->tokenable;
    }

    /**
     * @OA\Get(
     *      path="/api/nominatifs-new",
     *      operationId="getNominatifsList",
     *      tags={"Nominatif"},
     *      summary="Get list of nominatifs",
     *      description="Returns list of nominatifs with pagination",
     *      security={{"sanctum":{}}},
     *      @OA\Parameter(
     *          name="status",
     *          in="query",
     *          description="Filter by status",
     *          required=false,
     *          @OA\Schema(
     *              type="string",
     *              enum={"draft", "submitted"}
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(
     *              @OA\Property(property="success", type="boolean", example=true),
     *              @OA\Property(property="data", type="object",
     *                  @OA\Property(property="data", type="array", @OA\Items(
     *                      @OA\Property(property="id", type="integer", example=1),
     *                      @OA\Property(property="deskripsi_perjalanan_dinas", type="string", example="Perjalanan Dinas Jakarta"),
     *                      @OA\Property(property="status", type="string", example="draft"),
     *                      @OA\Property(property="total_pagu_trip", type="number", example=5000000)
     *                  ))
     *              )
     *          )
     *      )
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = NominatifNew::with([
                'rkaDetail:id,code_rka,layanan',
                'user:id,name,email',
                'detailRows' => function ($query) {
                    $query->select('id', 'nominatif_id', 'person_type', 'person_name', 'nama', 'jabatan', 'eselon', 'row_order')
                          ->orderBy('row_order');
                },
                'detailRows.biayaRow'
            ]); // ->byUser(Auth::id()); // Temporarily disabled for debugging

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('tanggal_mulai', [$request->start_date, $request->end_date]);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('deskripsi_perjalanan_dinas', 'ILIKE', "%{$search}%")
                  ->orWhereHas('detailRows', function ($subQuery) use ($search) {
                      $subQuery->where('person_name', 'ILIKE', "%{$search}%")
                             ->orWhere('asal', 'ILIKE', "%{$search}%")
                             ->orWhere('tujuan', 'ILIKE', "%{$search}%");
                  });
            });
        }

        $nominatifs = $query->orderBy('created_at', 'desc')->paginate(10);

        // Calculate totals for each nominatif
        $nominatifs->getCollection()->transform(function ($nominatif) {
            $totalPagu = $nominatif->detailRows->sum(function ($row) {
                return $row->biayaRow?->total_pagu_row ?? 0;
            });
            $totalAktual = $nominatif->detailRows->sum(function ($row) {
                return $row->biayaRow?->total_aktual_row ?? 0;
            });
            $totalAnggaranBerjalan = $totalPagu - $totalAktual;

            $nominatif->total_pagu_trip = $totalPagu;
            $nominatif->total_aktual_trip = $totalAktual;
            $nominatif->total_anggaran_berjalan_trip = $totalAnggaranBerjalan;

            return $nominatif;
        });

            return response()->json([
                'success' => true,
                'data' => $nominatifs,
                'meta' => [
                    'current_page' => $nominatifs->currentPage(),
                    'last_page' => $nominatifs->lastPage(),
                    'per_page' => $nominatifs->perPage(),
                    'total' => $nominatifs->total(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('NominatifNewController@index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch nominatifs: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getTrace() : null
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *      path="/api/nominatifs-new",
     *      operationId="createNominatif",
     *      tags={"Nominatif"},
     *      summary="Create new nominatif",
     *      description="Create a new nominatif record",
     *      security={{"sanctum":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"rka_detail_id","deskripsi_perjalanan_dinas","tanggal_mulai","tanggal_selesai"},
     *              @OA\Property(property="rka_detail_id", type="integer", example=1),
     *              @OA\Property(property="deskripsi_perjalanan_dinas", type="string", example="Perjalanan Dinas Test"),
     *              @OA\Property(property="tanggal_mulai", type="string", format="date", example="2025-11-24"),
     *              @OA\Property(property="tanggal_selesai", type="string", format="date", example="2025-11-27")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Nominatif created successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="success", type="boolean", example=true),
     *              @OA\Property(property="message", type="string", example="Nominatif created successfully"),
     *              @OA\Property(property="data", type="object",
     *                  @OA\Property(property="id", type="integer", example=1),
     *                  @OA\Property(property="deskripsi_perjalanan_dinas", type="string"),
     *                  @OA\Property(property="status", type="string", example="draft")
     *              )
     *          )
     *      )
     * )
     */
    public function store(Request $request)
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
            'rka_detail_id' => 'required|exists:rka_details,id',
            'deskripsi_perjalanan_dinas' => 'required|string|max:1000',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
        ]);

        DB::beginTransaction();
        try {
            // Get RKA details for anggaran
            $rkaDetail = RkaDetail::findOrFail($request->rka_detail_id);

            $nominatif = NominatifNew::create([
                'rka_detail_id' => $request->rka_detail_id,
                'user_id' => $user->id, // Use authenticated user ID from manual validation
                'deskripsi_perjalanan_dinas' => $request->deskripsi_perjalanan_dinas,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'status' => 'draft',
                'total_pagu' => 0,
                'total_biaya_aktual' => 0,
                // New fields
                'total_pagu_trip' => 0,
                'total_aktual_trip' => 0,
                'total_anggaran_berjalan_trip' => $rkaDetail->anggaran_berjalan,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nominatif created successfully',
                'data' => $nominatif->load(['rkaDetail', 'user', 'detailRows'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create nominatif',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *      path="/api/nominatifs-new/{id}",
     *      operationId="getNominatifById",
     *      tags={"Nominatif"},
     *      summary="Get nominatif by ID",
     *      description="Returns detailed nominatif information with all related data",
     *      security={{"sanctum":{}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          description="Nominatif ID",
     *          required=true,
     *          @OA\Schema(type="integer", example=1)
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(
     *              @OA\Property(property="success", type="boolean", example=true),
     *              @OA\Property(property="data", type="object",
     *                  @OA\Property(property="nominatif", type="object",
     *                      @OA\Property(property="id", type="integer", example=1),
     *                      @OA\Property(property="deskripsi_perjalanan_dinas", type="string"),
     *                      @OA\Property(property="status", type="string", example="draft"),
     *                      @OA\Property(property="total_pagu_trip", type="number", example=5000000)
     *                  )
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Nominatif not found"
     *      )
     * )
     */
    public function show($id)
    {
        $nominatif = NominatifNew::with([
            'rkaDetail',
            'user',
            'detailRows' => function ($query) {
                $query->orderBy('row_order');
            },
            'detailRows.biayaRow',
            'detailRows.evidence' => function ($query) {
                $query->select('id', 'nominatif_detail_row_id', 'evidence_foto_name', 'evidence_foto_size');
            }
        ])->findOrFail($id);

        // DISABLED: Security check - temporarily disabled for testing edit mode
        // if ($nominatif->user_id !== Auth::id()) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Unauthorized access'
        //     ], 403);
        // }

        // Calculate summary data
        $summary = $this->calculateSummary($nominatif);

        return response()->json([
            'success' => true,
            'data' => [
                'nominatif' => $nominatif,
                'summary' => $summary
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'rka_detail_id' => 'sometimes|exists:rka_details,id',
            'deskripsi_perjalanan_dinas' => 'sometimes|string|max:1000',
            'tanggal_mulai' => 'sometimes|date',
            'tanggal_selesai' => 'sometimes|date|after_or_equal:tanggal_mulai',
            'status' => 'sometimes|in:draft,submitted',
        ]);

        $nominatif = NominatifNew::findOrFail($id);

        // Security check - Use manual token validation consistent with store()
        $user = $this->getAuthenticatedUser($request);
        if (!$user || $nominatif->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if still editable
        if ($nominatif->status === 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $nominatif->update($request->all());

            // Recalculate totals
            $this->recalculateTotals($nominatif);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nominatif updated successfully',
                'data' => $nominatif->load(['rkaDetail', 'user'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update nominatif',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get nominatif by RKA ID.
     */
    public function getByRka($rkaId)
    {
        try {
            $nominatif = NominatifNew::where('rka_detail_id', $rkaId)
                ->where('user_id', Auth::id())
                ->first();

            if (!$nominatif) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nominatif not found for this RKA'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $nominatif
            ]);

        } catch (\Exception $e) {
            \Log::error('Error getting nominatif by RKA', [
                'rkaId' => $rkaId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get nominatif'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $nominatif = NominatifNew::findOrFail($id);

        // Security check - Use manual token validation
        $user = $this->getAuthenticatedUser(request());
        if (!$user || $nominatif->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if can delete - only allow delete for draft and rejected
        $lockedStatuses = ['submitted', 'approved'];
        if (in_array($nominatif->status, $lockedStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete ' . $nominatif->status . ' nominatif. Only draft and rejected nominatifs can be deleted.'
            ], 422);
        }

        // Log deletion attempt
        \Log::info('Attempting to delete nominatif', [
            'nominatif_id' => $id,
            'status' => $nominatif->status,
            'user_id' => Auth::id(),
            'rka_detail_id' => $nominatif->rka_detail_id
        ]);

        // Get RKA details for anggaran update
        $rkaDetail = $nominatif->rkaDetail;

        // Calculate total actual from all rows to return to anggaran_berjalan
        $totalAktualTrip = $nominatif->detailRows()->get()->sum(function ($row) {
            return $row->biayaRow?->total_aktual_row ?? 0;
        });

        DB::beginTransaction();
        try {
            // If this was a draft, return the anggaran to anggaran_berjalan
            if ($totalAktualTrip > 0) {
                $rkaDetail->update([
                    'anggaran_berjalan' => $rkaDetail->anggaran_berjalan + $totalAktualTrip,
                    'anggaran_layanan_used' => $rkaDetail->anggaran_layanan_used - $totalAktualTrip,
                ]);
            }

            $nominatif->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nominatif deleted successfully',
                'anggaran_returned' => [
                    'total_aktual_returned' => $totalAktualTrip,
                    'rka_anggaran_berjalan' => $rkaDetail->anggaran_berjalan,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete nominatif',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit nominatif for review
     */
    public function submit($id)
    {
        $nominatif = NominatifNew::findOrFail($id);

        // Security check - Use manual token validation
        $user = $this->getAuthenticatedUser(request());
        if (!$user || $nominatif->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft nominatifs can be submitted'
            ], 422);
        }

        // Check if has at least one detail row
        if ($nominatif->detailRows()->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot submit nominatif without detail rows'
            ], 422);
        }

        // Get RKA details for anggaran update
        $rkaDetail = $nominatif->rkaDetail;

        // Calculate total actual from all rows
        $totalAktualTrip = $nominatif->detailRows()->get()->sum(function ($row) {
            return $row->biayaRow?->total_aktual_row ?? 0;
        });

        DB::beginTransaction();
        try {
            // Update RKA anggaran - move from anggaran_berjalan to anggaran_sp2d
            $rkaDetail->update([
                'anggaran_berjalan' => $rkaDetail->anggaran_berjalan + $totalAktualTrip,
                'anggaran_sp2d' => $rkaDetail->anggaran_sp2d - $totalAktualTrip,
                'anggaran_layanan_used' => $rkaDetail->anggaran_layanan_used + $totalAktualTrip,
            ]);

            // Update nominatif status
            $nominatif->status = 'submitted';
            $nominatif->save();

            // TODO: Send notification to reviewers
            // TODO: Log submission for audit trail

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nominatif submitted successfully',
                'data' => $nominatif,
                'anggaran_updated' => [
                    'total_aktual_trip' => $totalAktualTrip,
                    'rka_anggaran_berjalan' => $rkaDetail->anggaran_berjalan,
                    'rka_anggaran_sp2d' => $rkaDetail->anggaran_sp2d,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit nominatif',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search nominatifs
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $page = $request->get('page', 1);
        $limit = $request->get('limit', 10);

        $results = NominatifNew::with(['rkaDetail', 'user'])
            ->where('user_id', Auth::id())
            ->where(function ($q) use ($query) {
                $q->where('deskripsi_perjalanan_dinas', 'ILIKE', "%{$query}%")
                  ->orWhereHas('detailRows', function ($subQuery) use ($query) {
                      $subQuery->where('person_name', 'ILIKE', "%{$query}%")
                             ->orWhere('asal', 'ILIKE', "%{$query}%")
                             ->orWhere('tujuan', 'ILIKE', "%{$query}%");
                  });
            })
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $query
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics()
    {
        $userId = Auth::id();

        $stats = [
            'total_nominatifs' => NominatifNew::where('user_id', $userId)->count(),
            'draft_nominatifs' => NominatifNew::where('user_id', $userId)->where('status', 'draft')->count(),
            'submitted_nominatifs' => NominatifNew::where('user_id', $userId)->where('status', 'submitted')->count(),
            'total_pagu' => NominatifNew::where('user_id', $userId)->sum('total_pagu'),
            'total_biaya_aktual' => NominatifNew::where('user_id', $userId)->sum('total_biaya_aktual'),
            'this_month' => NominatifNew::where('user_id', $userId)
                ->whereMonth('created_at', Carbon::now()->month)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Export nominatif to PDF/Excel
     */
    public function export($id)
    {
        // TODO: Implement export functionality
        return response()->json([
            'success' => false,
            'message' => 'Export feature coming soon'
        ]);
    }

    /**
     * Calculate summary data for a nominatif
     */
    private function calculateSummary($nominatif)
    {
        $detailRows = $nominatif->detailRows;

        $summary = [
            'total_rows' => $detailRows->count(),
            'main_person_rows' => $detailRows->where('person_type', 'main')->count(),
            'tambahan_orang_rows' => $detailRows->where('person_type', 'tambahan')->count(),
            'total_pagu_calculated' => $detailRows->sum(function ($row) {
                return $row->biayaRow?->total_pagu_row ?? 0;
            }),
            'total_aktual_calculated' => $detailRows->sum(function ($row) {
                return $row->biayaRow?->total_aktual_row ?? 0;
            }),
            'total_evidence_files' => $detailRows->sum(function ($row) {
                return $row->evidence()->count();
            }),
        ];

        return $summary;
    }

    /**
     * Recalculate totals for a nominatif
     */
    private function recalculateTotals($nominatif)
    {
        // Get the collection first, then sum with closure
        $totalPagu = $nominatif->detailRows()->get()->sum(function ($row) {
            return $row->biayaRow?->total_pagu_row ?? 0;
        });

        $totalAktual = $nominatif->detailRows()->get()->sum(function ($row) {
            return $row->biayaRow?->total_aktual_row ?? 0;
        });

        $totalAnggaranBerjalan = $totalPagu - $totalAktual;

        $nominatif->update([
            'total_pagu' => $totalPagu,
            'total_biaya_aktual' => $totalAktual,
            // New fields
            'total_pagu_trip' => $totalPagu,
            'total_aktual_trip' => $totalAktual,
            'total_anggaran_berjalan_trip' => $totalAnggaranBerjalan,
        ]);
    }
}