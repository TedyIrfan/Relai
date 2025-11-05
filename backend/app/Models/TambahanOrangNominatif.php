<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TambahanOrangNominatif extends Model
{
    protected $fillable = [
        'nominatif_id',
        'nama_peserta',
        'jabatan_peserta',
        'pagu',
        'aktual',
        'anggaran_realisasi',
        // Detail Perjalanan fields
        'jumlah_hari',
        'tanggal_mulai',
        'tanggal_selesai',
        'rute_perjalanan',
        // Transportasi fields
        'transportasi_per_hari',
        // Penginapan fields
        'menginap',
        'jumlah_malam',
        'pagu_per_malam',
        'biaya_aktual_per_malam',
        'penginapan_total',
        'penginapan_anggaran_realisasi',
        // Uang Harian fields
        'uang_harian_jumlah_hari',
        'uang_harian_pagu_per_hari',
        'uang_harian_total',
        // Uang Representasi fields
        'uang_representasi_jumlah_hari',
        'uang_representasi_pagu_per_hari',
        'uang_representasi_total',
    ];

    protected $casts = [
        'pagu' => 'decimal:2',
        'aktual' => 'decimal:2',
        'anggaran_realisasi' => 'decimal:2',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'rute_perjalanan' => 'array',
        'transportasi_per_hari' => 'array',
        'menginap' => 'boolean',
        'pagu_per_malam' => 'decimal:2',
        'biaya_aktual_per_malam' => 'decimal:2',
        'penginapan_total' => 'decimal:2',
        'penginapan_anggaran_realisasi' => 'decimal:2',
        'uang_harian_pagu_per_hari' => 'decimal:2',
        'uang_harian_total' => 'decimal:2',
        'uang_representasi_pagu_per_hari' => 'decimal:2',
        'uang_representasi_total' => 'decimal:2',
    ];

    public function nominatif(): BelongsTo
    {
        return $this->belongsTo(Nominatif::class);
    }

    public function getFormattedPaguAttribute(): string
    {
        return 'Rp ' . number_format($this->pagu, 0, ',', '.');
    }

    public function getFormattedAktualAttribute(): string
    {
        return 'Rp ' . number_format($this->aktual, 0, ',', '.');
    }

    public function getFormattedAnggaranRealisasiAttribute(): string
    {
        return 'Rp ' . number_format($this->anggaran_realisasi, 0, ',', '.');
    }
}
