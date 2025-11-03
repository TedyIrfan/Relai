<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TransportasiNominatif extends Model
{
    use HasFactory;

    protected $table = 'transportasi_nominatifs';

    protected $fillable = [
        'nominatif_id',
        'hari',
        'arah',
        'jenis_transportasi',
        'pagu',
        'biaya_aktual',
        'anggaran_realisasi',
        'keterangan',
    ];

    protected $casts = [
        'hari' => 'integer',
        'pagu' => 'decimal:2',
        'biaya_aktual' => 'decimal:2',
        'anggaran_realisasi' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
    ];

    // Relationships
    public function nominatif()
    {
        return $this->belongsTo(Nominatif::class, 'nominatif_id', 'id');
    }

    // Accessors & Mutators
    public function getPaguFormattedAttribute()
    {
        return 'Rp ' . number_format($this->pagu, 0, ',', '.');
    }

    public function getBiayaAktualFormattedAttribute()
    {
        return 'Rp ' . number_format($this->biaya_aktual, 0, ',', '.');
    }

    public function getAnggaranRealisasiFormattedAttribute()
    {
        return 'Rp ' . number_format($this->anggaran_realisasi, 0, ',', '.');
    }

    // Methods
    public function calculateAnggaranRealisasi()
    {
        $this->anggaran_realisasi = $this->pagu - $this->biaya_aktual;
        $this->save();
    }

    public static function getByNominatifId($nominatifId, $arah = null)
    {
        $query = static::where('nominatif_id', $nominatifId);

        if ($arah) {
            $query->where('arah', $arah);
        }

        return $query->orderBy('hari')->orderBy('arah')->get();
    }

    public static function getTotalByNominatifId($nominatifId, $arah = null)
    {
        $query = static::where('nominatif_id', $nominatifId);

        if ($arah) {
            $query->where('arah', $arah);
        }

        return $query->sum('anggaran_realisasi');
    }
}