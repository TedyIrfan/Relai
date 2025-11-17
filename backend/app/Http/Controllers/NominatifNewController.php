<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\NominatifNew;
use App\Models\RkaDetail;
use Carbon\Carbon;

class NominatifNewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = NominatifNew::with([
            'rkaDetail',
            'user',
            'detailRows' => function ($query) {
                $query->select('id', 'nominatif_id', 'person_type', 'person_name', 'row_order')
                      ->orderBy('row_order');
            }
        ])->byUser(Auth::id());

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
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'rka_detail_id' => 'required|exists:rka_details,id',
            'deskripsi_perjalanan_dinas' => 'required|string|max:1000',
            'tanggal_mulai' => 'required|date|after_or_equal:today',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
        ]);

        DB::beginTransaction();
        try {
            // Get RKA details for anggaran
            $rkaDetail = RkaDetail::findOrFail($request->rka_detail_id);

            $nominatif = NominatifNew::create([
                'rka_detail_id' => $request->rka_detail_id,
                'user_id' => Auth::id(),
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
     * Display the specified resource.
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

        // Security check
        if ($nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

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
            'tanggal_mulai' => 'sometimes|date|after_or_equal:today',
            'tanggal_selesai' => 'sometimes|date|after_or_equal:tanggal_mulai',
            'status' => 'sometimes|in:draft,submitted',
        ]);

        $nominatif = NominatifNew::findOrFail($id);

        // Security check
        if ($nominatif->user_id !== Auth::id()) {
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
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $nominatif = NominatifNew::findOrFail($id);

        // Security check
        if ($nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if can delete
        if ($nominatif->status === 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete submitted nominatif'
            ], 422);
        }

        // Get RKA details for anggaran update
        $rkaDetail = $nominatif->rkaDetail;

        // Calculate total actual from all rows to return to anggaran_berjalan
        $totalAktualTrip = $nominatif->detailRows()->sum(function ($row) {
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

        // Security check
        if ($nominatif->user_id !== Auth::id()) {
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
        $totalAktualTrip = $nominatif->detailRows()->sum(function ($row) {
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
        $totalPagu = $nominatif->detailRows()->sum(function ($row) {
            return $row->biayaRow?->total_pagu_row ?? 0;
        });

        $totalAktual = $nominatif->detailRows()->sum(function ($row) {
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