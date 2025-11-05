<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nominatif;

class DebugController extends Controller
{
    /**
     * Debug endpoint for nominatif calculation issues
     */
    public function nominatifDebug($id = null)
    {
        if ($id) {
            $nominatif = Nominatif::find($id);
            if (!$nominatif) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nominatif not found'
                ], 404);
            }

            // Get detailed breakdown
            $transportasiRecords = $nominatif->transportasi;
            $transportTotal = $transportasiRecords->sum('pagu');
            $transportAktual = $transportasiRecords->sum('biaya_aktual');

            $penginapanData = $nominatif->penginapan ?? [];
            $penginapanPagu = ($penginapanData['menginap'] ?? false) ?
                (($penginapanData['jumlahMalam'] ?? 1) * ($penginapanData['paguPerMalam'] ?? 0)) : 0;
            $penginapanAktual = ($penginapanData['menginap'] ?? false) ?
                (($penginapanData['jumlahMalam'] ?? 1) * ($penginapanData['biayaAktualPerMalam'] ?? 0)) : 0;

            $uangHarianPagu = ($nominatif->uang_harian['jumlahHari'] ?? 1) * ($nominatif->uang_harian['paguPerHari'] ?? 0);
            $uangRepresentasiPagu = ($nominatif->uang_representasi['jumlahHari'] ?? 1) * ($nominatif->uang_representasi['paguPerHari'] ?? 0);

            $manualPagu = $transportTotal + $penginapanPagu + $uangHarianPagu + $uangRepresentasiPagu;
            $manualAktual = $transportAktual + $penginapanAktual; // uang harian & representasi tidak ada aktual
            $manualRealisasi = $manualPagu - $manualAktual;

            return response()->json([
                'success' => true,
                'data' => [
                    'nominatif_id' => $nominatif->id,
                    'deskripsi' => $nominatif->deskripsi_perjalanan_dinas,
                    'status' => $nominatif->status,
                    'database_totals' => [
                        'total_pagu' => (float) $nominatif->total_pagu,
                        'total_biaya_aktual' => (float) $nominatif->total_biaya_aktual,
                        'total_anggaran_realisasi' => (float) $nominatif->total_anggaran_realisasi
                    ],
                    'manual_calculation' => [
                        'transportasi' => [
                            'pagu' => (float) $transportTotal,
                            'aktual' => (float) $transportAktual,
                            'realisasi' => (float) ($transportTotal - $transportAktual)
                        ],
                        'penginapan' => [
                            'pagu' => (float) $penginapanPagu,
                            'aktual' => (float) $penginapanAktual,
                            'realisasi' => (float) ($penginapanPagu - $penginapanAktual)
                        ],
                        'uang_harian' => [
                            'pagu' => (float) $uangHarianPagu,
                            'aktual' => 0,
                            'realisasi' => (float) $uangHarianPagu
                        ],
                        'uang_representasi' => [
                            'pagu' => (float) $uangRepresentasiPagu,
                            'aktual' => 0,
                            'realisasi' => (float) $uangRepresentasiPagu
                        ],
                        'total_manual' => [
                            'pagu' => (float) $manualPagu,
                            'aktual' => (float) $manualAktual,
                            'realisasi' => (float) $manualRealisasi
                        ]
                    ],
                    'comparison' => [
                        'pagu_diff' => (float) ($manualPagu - $nominatif->total_pagu),
                        'realisasi_diff' => (float) ($manualRealisasi - $nominatif->total_anggaran_realisasi),
                        'calculation_match' => ($manualPagu == $nominatif->total_pagu && $manualRealisasi == $nominatif->total_anggaran_realisasi)
                    ],
                    'raw_data' => [
                        'transportasi_per_hari' => $nominatif->transportasi_per_hari,
                        'penginapan' => $nominatif->penginapan,
                        'uang_harian' => $nominatif->uang_harian,
                        'uang_representasi' => $nominatif->uang_representasi
                    ]
                ]
            ]);
        } else {
            // List all nominatifs for debugging
            $nominatifs = Nominatif::with('transportasi')->get()->map(function($n) {
                return [
                    'id' => $n->id,
                    'deskripsi' => $n->deskripsi_perjalanan_dinas,
                    'total_pagu' => (float) $n->total_pagu,
                    'total_anggaran_realisasi' => (float) $n->total_anggaran_realisasi,
                    'status' => $n->status,
                    'transport_count' => $n->transportasi->count()
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $nominatifs,
                'message' => 'List of all nominatifs. Use /debug/nominatif/{id} for detailed breakdown'
            ]);
        }
    }

    /**
     * Test calculateTotals method
     */
    public function testCalculate($id)
    {
        $nominatif = Nominatif::find($id);
        if (!$nominatif) {
            return response()->json([
                'success' => false,
                'message' => 'Nominatif not found'
            ], 404);
        }

        $before = [
            'total_pagu' => (float) $nominatif->total_pagu,
            'total_anggaran_realisasi' => (float) $nominatif->total_anggaran_realisasi
        ];

        $nominatif->calculateTotals();

        $after = [
            'total_pagu' => (float) $nominatif->total_pagu,
            'total_anggaran_realisasi' => (float) $nominatif->total_anggaran_realisasi
        ];

        return response()->json([
            'success' => true,
            'message' => 'calculateTotals() executed',
            'before' => $before,
            'after' => $after,
            'changes' => [
                'pagu_changed' => $before['total_pagu'] !== $after['total_pagu'],
                'realisasi_changed' => $before['total_anggaran_realisasi'] !== $after['total_anggaran_realisasi']
            ]
        ]);
    }
}