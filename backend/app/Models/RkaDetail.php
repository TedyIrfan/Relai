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
        'sbm',
    ];

    protected $casts = [
        'sisa_pemakaian_anggaran' => 'decimal:2',
        'anggaran_perjalanan' => 'decimal:2',
        'anggaran_layanan' => 'decimal:2',
        'anggaran_layanan_used' => 'decimal:2',
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
        return $this->hasMany(Nominatif::class);
    }

    // Business Logic untuk tracking anggaran
    public function updateAnggaranUsed($amount)
    {
        \Log::info('💰 updateAnggaranUsed DEBUG:');
        \Log::info('  - RKA Detail ID: ' . $this->id);
        \Log::info('  - Code RKA: ' . $this->code_rka);
        \Log::info('  - Amount to add: ' . $amount);
        \Log::info('  - Before - anggaran_layanan_used: ' . $this->anggaran_layanan_used);
        \Log::info('  - Before - anggaran_layanan: ' . $this->anggaran_layanan);

        $this->anggaran_layanan_used += $amount;
        $this->save();

        \Log::info('  - After - anggaran_layanan_used: ' . $this->anggaran_layanan_used);
        \Log::info('  - After - anggaran_layanan_available: ' . $this->anggaran_layanan_available);
    }

    public function getAnggaranLayananAvailableAttribute()
    {
        return $this->anggaran_layanan - $this->anggaran_layanan_used;
    }
}
