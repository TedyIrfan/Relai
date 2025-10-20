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
        'sbm',
    ];

    protected $casts = [
        'sisa_pemakaian_anggaran' => 'decimal:2',
        'anggaran_perjalanan' => 'decimal:2',
        'anggaran_layanan' => 'decimal:2',
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
}
