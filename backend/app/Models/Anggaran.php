<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anggaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'tahun',
        'total_anggaran',
        'anggaran_terpakai',
        'sp2d',
        'keterangan'
    ];

    protected $casts = [
        'total_anggaran' => 'decimal:2',
        'anggaran_terpakai' => 'decimal:2',
        'sp2d' => 'decimal:2',
        'sisa_anggaran' => 'decimal:2',
        'tahun' => 'integer'
    ];

    /**
     * Get sisa anggaran calculated value
     */
    public function getSisaAnggaranAttribute()
    {
        // Ensure values are numeric and not null
        $total = (float) ($this->total_anggaran ?? 0);
        $terpakai = (float) ($this->anggaran_terpakai ?? 0);
        return max(0, $total - $terpakai); // Ensure no negative values
    }

    /**
     * Get anggaran by year
     */
    public static function getByYear($tahun)
    {
        return self::where('tahun', $tahun)->first();
    }

    /**
     * Format anggaran to Rupiah
     */
    public function formatRupiah($amount)
    {
        return 'Rp ' . number_format($amount, 0, ',', '.');
    }

    /**
     * Get percentage used
     */
    public function getPercentageUsed()
    {
        $total = (float) ($this->total_anggaran ?? 0);
        $terpakai = (float) ($this->anggaran_terpakai ?? 0);

        if ($total == 0) return 0;
        return round(($terpakai / $total) * 100, 2);
    }

    /**
     * Get SP2D percentage
     */
    public function getSp2dPercentage()
    {
        $total = (float) ($this->total_anggaran ?? 0);
        $sp2d = (float) ($this->sp2d ?? 0);

        if ($total == 0) return 0;
        return round(($sp2d / $total) * 100, 2);
    }
}