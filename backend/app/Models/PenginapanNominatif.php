<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PenginapanNominatif extends Model
{
    use HasFactory;

    protected $table = 'penginapan_nominatifs';

    protected $fillable = [
        'master_nominatif_id',
        'malam',
        'lokasi_penginapan',
        'nama_hotel',
        'keterangan',
        'pagu',
        'biaya_aktual',
    ];

    protected $casts = [
        'pagu' => 'decimal:2',
        'biaya_aktual' => 'decimal:2',
        'anggaran_realisasi' => 'decimal:2',
    ];

    // Relationships
    public function masterNominatif()
    {
        return $this->belongsTo(Nominatif::class, 'master_nominatif_id', 'id');
    }

    // Alternative naming for consistency
    public function nominatif()
    {
        return $this->belongsTo(Nominatif::class, 'master_nominatif_id', 'id');
    }

    // Accessors for formatted values
    public function getPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->pagu, 0, ',', '.');
    }

    public function getBiayaAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->biaya_aktual, 0, ',', '.');
    }

    public function getAnggaranRealisasiFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_realisasi, 0, ',', '.');
    }

    public function getMalamTextAttribute()
    {
        return "Malam ke-{$this->malam}";
    }

    // Scopes
    public function scopeByNominatif($query, $nominatifId)
    {
        return $query->where('master_nominatif_id', $nominatifId);
    }

    public function scopeByLokasi($query, $lokasi)
    {
        return $query->where('lokasi_penginapan', $lokasi);
    }

    public function scopeByMalam($query, $malam)
    {
        return $query->where('malam', $malam);
    }

    public function scopeAktual($query)
    {
        return $query->where('biaya_aktual', '>', 0);
    }

    // Business Logic
    public function updateActualCost($biayaAktual)
    {
        $this->biaya_aktual = $biayaAktual;
        $this->save();

        // Trigger recalculation in parent nominatif
        if ($this->masterNominatif) {
            $this->masterNominatif->calculateTotals();
        }
    }

    public function isFullyUtilized()
    {
        return $this->biaya_aktual >= $this->pagu;
    }

    public function getUtilizationPercentage()
    {
        if ($this->pagu == 0) return 0;
        return min(100, ($this->biaya_aktual / $this->pagu) * 100);
    }

    public function getRemainingBudget()
    {
        return max(0, $this->pagu - $this->biaya_aktual);
    }

    // Static methods for data generation
    public static function generateFromRutePerjalanan($masterNominatifId, $rutePerjalanan, $defaultPaguPerMalam = 800000)
    {
        $penginapanRecords = [];

        if (!$rutePerjalanan || !$rutePerjalanan->tujuan_list) {
            return $penginapanRecords;
        }

        $jumlahMalam = $rutePerjalanan->total_hari - 1;
        $tujuanList = $rutePerjalanan->tujuan_list;

        for ($i = 0; $i < $jumlahMalam; $i++) {
            $lokasi = $tujuanList[$i] ?? end($tujuanList);

            $penginapanRecords[] = [
                'master_nominatif_id' => $masterNominatifId,
                'malam' => $i + 1,
                'lokasi_penginapan' => $lokasi,
                'nama_hotel' => null, // User input manual
                'keterangan' => null, // User input manual
                'pagu' => 0, // User will input manually
                'biaya_aktual' => 0,
                // Remove anggaran_realisasi - let database calculate it
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        return $penginapanRecords;
    }

    // Get default pagu by location
    public static function getDefaultPaguByLokasi($lokasi)
    {
        $defaults = [
            'Jakarta' => 900000,
            'Surabaya' => 850000,
            'Bandung' => 800000,
            'Medan' => 750000,
            'Semarang' => 700000,
            'Makassar' => 650000,
            'Denpasar' => 600000,
            'Palembang' => 550000,
            'Tangerang' => 500000,
            'Depok' => 450000,
            'Bekasi' => 400000,
            'Bogor' => 350000,
            'Batam' => 300000,
            'Pekanbaru' => 280000,
            'Bandar Lampung' => 250000,
            'Malang' => 220000,
            'Yogyakarta' => 200000,
            'Samarinda' => 180000,
            'Pontianak' => 150000,
            'Manado' => 120000,
            'Mataram' => 100000,
            'Kupang' => 80000,
            'Jayapura' => 70000,
            'Ambon' => 60000,
            'Ternate' => 50000,
            'Kendari' => 40000,
            'Sorong' => 30000,
        ];

        return $defaults[$lokasi] ?? 500000; // Default 500k untuk lokasi tidak diketahui
    }
}