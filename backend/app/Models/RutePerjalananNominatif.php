<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RutePerjalananNominatif extends Model
{
    use HasFactory;

    protected $table = 'rute_perjalanans';

    protected $fillable = [
        'nominatif_id',
        'user_id',
        // Section 3: Detail Perjalanan
        'jumlah_hari',
        'tanggal_mulai',
        'tanggal_selesai',
        'keterangan_perjalanan',
        // Route details (per hari)
        'hari',
        'dari',
        'tujuan',
        'tujuan2',
        'tujuan3',
        'tujuan4',
        'tujuan5',
        'tujuan6',
        'pulang',
        'tanggal',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_hari' => 'integer',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'tanggal' => 'date',
    ];

    /**
     * Get the nominatif that owns the route.
     */
    public function nominatif(): BelongsTo
    {
        return $this->belongsTo(Nominatif::class);
    }

    /**
     * Get the user that owns the route.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all destinations as an array.
     */
    public function getAllDestinationsAttribute(): array
    {
        $destinations = [];

        if ($this->tujuan) $destinations[] = $this->tujuan;
        if ($this->tujuan2) $destinations[] = $this->tujuan2;
        if ($this->tujuan3) $destinations[] = $this->tujuan3;
        if ($this->tujuan4) $destinations[] = $this->tujuan4;
        if ($this->tujuan5) $destinations[] = $this->tujuan5;
        if ($this->tujuan6) $destinations[] = $this->tujuan6;

        return $destinations;
    }

    /**
     * Get the primary destination (tujuan or first available).
     */
    public function getPrimaryDestinationAttribute(): ?string
    {
        return $this->tujuan ?: null;
    }

    /**
     * Get formatted route string.
     */
    public function getFormattedRouteAttribute(): string
    {
        $route = $this->dari;

        foreach (range(1, 6) as $i) {
            $field = $i === 1 ? 'tujuan' : "tujuan{$i}";
            if ($this->$field) {
                $route .= ' → ' . $this->$field;
            }
        }

        if ($this->pulang) {
            $route .= ' → ' . $this->pulang;
        }

        return $route;
    }

    /**
     * Scope routes by nominatif.
     */
    public function scopeByNominatif($query, $nominatifId)
    {
        return $query->where('nominatif_id', $nominatifId);
    }

    /**
     * Scope routes by user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope routes ordered by day.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('hari');
    }
}