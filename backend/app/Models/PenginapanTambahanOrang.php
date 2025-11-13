<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenginapanTambahanOrang extends Model
{
    use HasFactory;

    protected $fillable = [
        'tambahan_orang_nominatif_id',
        'malam',
        'lokasi_penginapan',
        'nama_hotel',
        'keterangan',
        'tipe_kamar',
        'nomor_kamar',
        'kapasitas',
        'pagu',
        'biaya_aktual',
        'anggaran_realisasi',
        'dipesan',
        'tanggal_checkin',
        'tanggal_checkout',
        'kode_booking',
    ];

    protected $casts = [
        'dipesan' => 'boolean',
        'tanggal_checkin' => 'date',
        'tanggal_checkout' => 'date',
        'pagu' => 'decimal:2',
        'biaya_aktual' => 'decimal:2',
        'anggaran_realisasi' => 'decimal:2',
        'kapasitas' => 'integer',
    ];

    /**
     * Get the tambahan orang that owns this penginapan record.
     */
    public function tambahanOrang(): BelongsTo
    {
        return $this->belongsTo(TambahanOrangNominatif::class, 'tambahan_orang_nominatif_id');
    }

    /**
     * Get formatted pagu amount.
     */
    public function getPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->pagu, 0, ',', '.');
    }

    /**
     * Get formatted biaya aktual amount.
     */
    public function getBiayaAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->biaya_aktual, 0, ',', '.');
    }

    /**
     * Get formatted anggaran realisasi amount.
     */
    public function getAnggaranRealisasiFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_realisasi, 0, ',', '.');
    }

    /**
     * Get full description for display.
     */
    public function getFullDescriptionAttribute()
    {
        $parts = [
            "Malam {$this->malam}",
            $this->nama_hotel ? "Hotel {$this->nama_hotel}" : null,
            $this->lokasi_penginapan ? "({$this->lokasi_penginapan})" : null,
            $this->keterangan ? "- {$this->keterangan}" : null
        ];

        return implode(' ', array_filter($parts));
    }
}