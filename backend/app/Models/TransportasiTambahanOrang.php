<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransportasiTambahanOrang extends Model
{
    use HasFactory;

    protected $fillable = [
        'tambahan_orang_nominatif_id',
        'hari',
        'arah',
        'jenis_transportasi',
        'keterangan',
        'pagu',
        'biaya_aktual',
    ];

    protected $casts = [
        'pagu' => 'decimal:2',
        'biaya_aktual' => 'decimal:2',
    ];

    /**
     * Get the tambahan orang that owns this transportasi.
     */
    public function tambahanOrang(): BelongsTo
    {
        return $this->belongsTo(TambahanOrangNominatif::class);
    }

    // Accessors & Mutators
    public function getPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->pagu, 0, ',', '.');
    }

    public function getBiayaAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->biaya_aktual, 0, ',', '.');
    }

    /**
     * Scope untuk transportasi pergi
     */
    public function scopePergi($query)
    {
        return $query->where('arah', 'pergi');
    }

    /**
     * Scope untuk transportasi pulang
     */
    public function scopePulang($query)
    {
        return $query->where('arah', 'pulang');
    }

    /**
     * Scope untuk hari tertentu
     */
    public function scopeHari($query, $hari)
    {
        return $query->where('hari', $hari);
    }
}