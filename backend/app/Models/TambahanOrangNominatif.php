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
        'nama_peserta',
        'jabatan_peserta',
        'jumlah_hari',
        'pagu',
        'aktual',
        'anggaran_realisasi',
        // Master fields (sama seperti Nominatif)
        'deskripsi_perjalanan_dinas',
        'status',
        'is_editable',
        'transportasi_per_hari',
        'penginapan',
        'uang_harian',
        'uang_representasi',
        'total_pagu',
        'total_biaya_aktual',
        'anggaran_berjalan',
        'anggaran_sp2d',
        'total_anggaran_realisasi',
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

    /**
     * Get the penginapan records for this additional person.
     */
    public function penginapan(): HasMany
    {
        return $this->hasMany(PenginapanTambahanOrang::class, 'tambahan_orang_nominatif_id', 'id')
                    ->orderBy('malam');
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
            // New logic: support malamDetails structure (per malam inputs)
            if (isset($this->penginapan['malamDetails']) && is_array($this->penginapan['malamDetails'])) {
                foreach ($this->penginapan['malamDetails'] as $malam) {
                    $totalPagu += $malam['pagu'] ?? 0;
                    $totalBiayaAktual += $malam['aktual'] ?? 0;
                }
            } else {
                // Fallback to old logic for backward compatibility
                $totalPagu += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['paguPerMalam'] ?? 0);
                $totalBiayaAktual += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['biayaAktualPerMalam'] ?? 0);
            }
        }

        // Calculate from uang harian (masuk ke total pagu dan total aktual)
        if ($this->uang_harian) {
            $jumlahHari = $this->jumlah_hari ?? 1;
            $uangHarianPerHari = ($this->uang_harian['paguPerHari'] ?? 0);
            $uangHarianTotal = $uangHarianPerHari * $jumlahHari;
            $totalPagu += $uangHarianTotal;
            $totalBiayaAktual += $uangHarianTotal; // Updated: masuk ke aktual juga
        }

        // Calculate from uang representasi (masuk ke total pagu dan total aktual)
        if ($this->uang_representasi) {
            $jumlahHari = $this->jumlah_hari ?? 1;
            $uangRepresentasiPerHari = ($this->uang_representasi['paguPerHari'] ?? 0);
            $uangRepresentasiTotal = $uangRepresentasiPerHari * $jumlahHari;
            $totalPagu += $uangRepresentasiTotal;
            $totalBiayaAktual += $uangRepresentasiTotal; // Updated: masuk ke aktual juga
        }

        $this->total_pagu = $totalPagu;
        $this->total_biaya_aktual = $totalBiayaAktual;

        // Hitung ulang untuk logic baru: transport+penginapan selisih + uang harian/representasi full
        $transportPenginapanPagu = 0;
        $transportPenginapanAktual = 0;
        $uangHarianDanRepresentasi = 0;

        // Calculate from transportasi relationship data
        $transportasiData = $this->transportasi;
        if ($transportasiData && $transportasiData->count() > 0) {
            foreach ($transportasiData as $transport) {
                $transportPenginapanPagu += $transport->pagu ?? 0;
                $transportPenginapanAktual += $transport->biaya_aktual ?? 0;
            }
        }

        // Calculate from penginapan
        if ($this->penginapan && isset($this->penginapan['menginap']) && $this->penginapan['menginap']) {
            // New logic: support malamDetails structure (per malam inputs)
            if (isset($this->penginapan['malamDetails']) && is_array($this->penginapan['malamDetails'])) {
                foreach ($this->penginapan['malamDetails'] as $malam) {
                    $transportPenginapanPagu += $malam['pagu'] ?? 0;
                    $transportPenginapanAktual += $malam['aktual'] ?? 0;
                }
            } else {
                // Fallback to old logic for backward compatibility
                $transportPenginapanPagu += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['paguPerMalam'] ?? 0);
                $transportPenginapanAktual += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['biayaAktualPerMalam'] ?? 0);
            }
        }

        // Calculate uang harian dan representasi (dihitung perhari untuk anggaran)
        $jumlahHari = $this->jumlah_hari ?? 1;

        if ($this->uang_harian) {
            $uangHarianPerHari = ($this->uang_harian['paguPerHari'] ?? 0);
            $uangHarianDanRepresentasi += $uangHarianPerHari * $jumlahHari;
        }

        if ($this->uang_representasi) {
            $uangRepresentasiPerHari = ($this->uang_representasi['paguPerHari'] ?? 0);
            $uangHarianDanRepresentasi += $uangRepresentasiPerHari * $jumlahHari;
        }

        // Logic baru: (transport+penginapan pagu - transport+penginapan aktual) + uang harian/representasi full
        $this->anggaran_berjalan = ($transportPenginapanPagu - $transportPenginapanAktual) + $uangHarianDanRepresentasi;

        $this->save();
    }
}