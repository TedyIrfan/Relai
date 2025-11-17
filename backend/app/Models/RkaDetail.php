<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RkaDetail extends Model
{
    use HasFactory;

    protected $table = 'rka_details';

    protected $fillable = [
        'program_dukungan_manajemen',
        'kode_program',
        'layanan_umum',
        'kode_layanan_1',
        'kode_layanan_2',
        'layanan_tata_usaha',
        'kategori_anggaran_id',
        'code_rka',
        'layanan',
        'wilayah',
        'arti_kode',
        'sisa_pemakaian_anggaran',
        'status',
        'anggaran_perjalanan',
        'anggaran_layanan',
        'anggaran_layanan_used',
        'anggaran_berjalan',
        'anggaran_sp2d',
        'sbm',
    ];

    protected $casts = [
        'sisa_pemakaian_anggaran' => 'decimal:2',
        'anggaran_perjalanan' => 'decimal:2',
        'anggaran_layanan' => 'decimal:2',
        'anggaran_layanan_used' => 'decimal:2',
        'anggaran_berjalan' => 'decimal:2',
        'anggaran_sp2d' => 'decimal:2',
        'sp2d' => 'decimal:2',
    ];

    public function kategoriAnggaran()
    {
        return $this->belongsTo(KategoriAnggaran::class, 'kategori_anggaran_id');
    }

    // Accessors untuk formatting
    public function getAnggaranPerjalananFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_perjalanan, 0, ',', '.');
    }

    public function getAnggaranLayananFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_layanan, 0, ',', '.');
    }

    public function getAnggaranLayananAvailableFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_layanan_available, 0, ',', '.');
    }

    public function nominatifs()
    {
        return $this->hasMany(NominatifNew::class);
    }

    // Business Logic untuk tracking anggaran berjalan dari nominatif
    public function addAnggaranBerjalan($amount)
    {
        \Log::info('💰 RKA Detail addAnggaranBerjalan DEBUG:');
        \Log::info('  - RKA Detail ID: ' . $this->id);
        \Log::info('  - Code RKA: ' . $this->code_rka);
        \Log::info('  - Amount to add: ' . $amount);
        \Log::info('  - Before - anggaran_berjalan: ' . $this->anggaran_berjalan);
        \Log::info('  - Before - anggaran_sp2d: ' . $this->anggaran_sp2d);

        $this->anggaran_berjalan += $amount;
        $this->save();

        \Log::info('  - After - anggaran_berjalan: ' . $this->anggaran_berjalan);
        \Log::info('  - After - anggaran_sp2d: ' . $this->anggaran_sp2d);
    }

    public function reduceAnggaranBerjalan($amount)
    {
        \Log::info('💰 RKA Detail reduceAnggaranBerjalan DEBUG:');
        \Log::info('  - RKA Detail ID: ' . $this->id);
        \Log::info('  - Code RKA: ' . $this->code_rka);
        \Log::info('  - Amount to reduce: ' . $amount);
        \Log::info('  - Before - anggaran_berjalan: ' . $this->anggaran_berjalan);
        \Log::info('  - Before - anggaran_sp2d: ' . $this->anggaran_sp2d);

        $this->anggaran_berjalan = max(0, $this->anggaran_berjalan - $amount);
        $this->save();

        \Log::info('  - After - anggaran_berjalan: ' . $this->anggaran_berjalan);
        \Log::info('  - After - anggaran_sp2d: ' . $this->anggaran_sp2d);
    }

    public function moveToSP2D($amount)
    {
        \Log::info('💰 RKA Detail moveToSP2D DEBUG:');
        \Log::info('  - RKA Detail ID: ' . $this->id);
        \Log::info('  - Code RKA: ' . $this->code_rka);
        \Log::info('  - Amount to move: ' . $amount);
        \Log::info('  - Before - anggaran_berjalan: ' . $this->anggaran_berjalan);
        \Log::info('  - Before - anggaran_sp2d: ' . $this->anggaran_sp2d);

        // Move from anggaran_berjalan to anggaran_sp2d
        $this->anggaran_berjalan = max(0, $this->anggaran_berjalan - $amount);
        $this->anggaran_sp2d += $amount;
        $this->save();

        \Log::info('  - After - anggaran_berjalan: ' . $this->anggaran_berjalan);
        \Log::info('  - After - anggaran_sp2d: ' . $this->anggaran_sp2d);
    }

    public function getAnggaranLayananAvailableAttribute()
    {
        return $this->anggaran_layanan - $this->anggaran_berjalan - $this->anggaran_sp2d;
    }

    public function getAnggaranBerjalanFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_berjalan, 0, ',', '.');
    }

    public function getAnggaranSp2dFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_sp2d, 0, ',', '.');
    }

    public function getAnggaranTersisaAttribute()
    {
        $anggaranLayanan = floatval($this->anggaran_layanan ?? 0);
        $anggaranBerjalan = floatval($this->anggaran_berjalan ?? 0);
        $anggaranSp2d = floatval($this->anggaran_sp2d ?? 0);

        return (int)($anggaranLayanan - ($anggaranBerjalan + $anggaranSp2d));
    }

    // Legacy method for backward compatibility
    public function updateAnggaranUsed($amount)
    {
        // This method is kept for backward compatibility
        // It now uses the new Master RKA tracking methods
        if ($amount > 0) {
            $this->addAnggaranBerjalan($amount);
        } else {
            $this->reduceAnggaranBerjalan(abs($amount));
        }
    }

    // Accessor untuk formatting SP2D (legacy - keep for compatibility)
    public function getSp2dFormattedAttribute()
    {
        return 'Rp' . number_format($this->sp2d, 0, ',', '.');
    }

    public function getAnggaranTersisaFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_tersisa, 0, ',', '.');
    }
}
