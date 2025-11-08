<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TambahanOrangNominatif extends Model
{
    use HasFactory;

    protected $fillable = [
        'master_nominatif_id',
        'nama',
        'jabatan',
        'penginapan',
        'uang_harian',
        'uang_representasi',
        'total_pagu',
        'total_biaya_aktual',
        'anggaran_berjalan',
    ];

    protected $casts = [
        'penginapan' => 'array',
        'uang_harian' => 'array',
        'uang_representasi' => 'array',
        'total_pagu' => 'decimal:2',
        'total_biaya_aktual' => 'decimal:2',
        'anggaran_berjalan' => 'decimal:2',
    ];

    /**
     * Get the master nominatif that owns this additional person.
     */
    public function masterNominatif(): BelongsTo
    {
        return $this->belongsTo(Nominatif::class, 'master_nominatif_id');
    }

    /**
     * Get the transportasi records for this additional person.
     */
    public function transportasi(): HasMany
    {
        return $this->hasMany(TransportasiTambahanOrang::class)
                    ->orderBy('hari')
                    ->orderBy('arah');
    }

    /**
     * Get the transportasi pergi records.
     */
    public function transportasiPergi(): HasMany
    {
        return $this->hasMany(TransportasiTambahanOrang::class)
                    ->where('arah', 'pergi')
                    ->orderBy('hari');
    }

    /**
     * Get the transportasi pulang records.
     */
    public function transportasiPulang(): HasMany
    {
        return $this->hasMany(TransportasiTambahanOrang::class)
                    ->where('arah', 'pulang')
                    ->orderBy('hari');
    }

    /**
     * Get the rute perjalanan for this additional person.
     */
    public function rutePerjalanan(): HasOne
    {
        return $this->hasOne(RutePerjalananTambahanOrang::class);
    }

    // Accessors & Mutators
    public function getTotalPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_pagu, 0, ',', '.');
    }

    public function getTotalBiayaAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_biaya_aktual, 0, ',', '.');
    }

    public function getAnggaranBerjalanFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_berjalan, 0, ',', '.');
    }

    // Accessors for route data from child relationship
    public function getJumlahHariAttribute()
    {
        return optional($this->rutePerjalanan)->total_hari ?? 0;
    }

    public function getTanggalMulaiAttribute()
    {
        $rute = $this->rutePerjalanan;
        return $rute ? $rute->tanggal_mulai->format('Y-m-d') : null;
    }

    public function getTanggalSelesaiAttribute()
    {
        $rute = $this->rutePerjalanan;
        return $rute ? $rute->tanggal_selesai->format('Y-m-d') : null;
    }

    // Business Logic
    public function calculateTotals()
    {
        $totalPagu = 0;
        $totalBiayaAktual = 0;

        // Calculate from transportasi relationship data
        $transportasiData = $this->transportasi;
        if ($transportasiData && $transportasiData->count() > 0) {
            foreach ($transportasiData as $transport) {
                $totalPagu += $transport->pagu ?? 0;
                $totalBiayaAktual += $transport->biaya_aktual ?? 0;
            }
        }

        // Calculate from penginapan
        if ($this->penginapan && isset($this->penginapan['menginap']) && $this->penginapan['menginap']) {
            $totalPagu += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['paguPerMalam'] ?? 0);
            $totalBiayaAktual += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['biayaAktualPerMalam'] ?? 0);
        }

        // Calculate from uang harian (masuk ke total pagu saja)
        if ($this->uang_harian) {
            $uangHarianTotal = ($this->uang_harian['total'] ?? 0);
            $totalPagu += $uangHarianTotal;
        }

        // Calculate from uang representasi (masuk ke total pagu saja)
        if ($this->uang_representasi) {
            $uangRepresentasiTotal = ($this->uang_representasi['total'] ?? 0);
            $totalPagu += $uangRepresentasiTotal;
        }

        $this->total_pagu = $totalPagu;
        $this->total_biaya_aktual = $totalBiayaAktual;

        // Anggaran berjalan = total pagu - total biaya aktual
        $this->anggaran_berjalan = $totalPagu - $totalBiayaAktual;

        $this->save();
    }
}