<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Nominatif extends Model
{
    use HasFactory;

    protected $table = 'master_nominatifs';

    protected $fillable = [
        'rka_detail_id',
        'user_id',
        'deskripsi_perjalanan_dinas',
        'jumlah_hari',
        'status',
        'is_editable',
        'penginapan',
        'uang_harian',
        'uang_representasi',
        'transportasi_per_hari',
        'total_pagu',
        'total_biaya_aktual',
        'total_anggaran_realisasi',
        'anggaran_berjalan',
        'anggaran_sp2d',
    ];

    protected $casts = [
        'is_editable' => 'boolean',
        'penginapan' => 'array',
        'uang_harian' => 'array',
        'uang_representasi' => 'array',
        'transportasi_per_hari' => 'array',
        'total_pagu' => 'decimal:2',
        'total_biaya_aktual' => 'decimal:2',
        'total_anggaran_realisasi' => 'decimal:2',
        'anggaran_berjalan' => 'decimal:2',
        'anggaran_sp2d' => 'decimal:2',
    ];

    
    // Relationships
    public function rkaDetail()
    {
        return $this->belongsTo(RkaDetail::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transportasi()
    {
        return $this->hasMany(TransportasiNominatif::class, 'master_nominatif_id', 'id')
                    ->orderBy('hari')
                    ->orderBy('arah');
    }

    public function transportasiPergi()
    {
        return $this->hasMany(TransportasiNominatif::class, 'master_nominatif_id', 'id')
                    ->where('arah', 'pergi')
                    ->orderBy('hari');
    }

    public function transportasiPulang()
    {
        return $this->hasMany(TransportasiNominatif::class, 'master_nominatif_id', 'id')
                    ->where('arah', 'pulang')
                    ->orderBy('hari');
    }

    public function tambahanOrang()
    {
        return $this->hasMany(TambahanOrangNominatif::class, 'master_nominatif_id', 'id')
                    ->orderBy('id');
    }

    public function rutePerjalanan()
    {
        return $this->hasOne(RutePerjalananNominatif::class, 'master_nominatif_id', 'id');
    }

    public function rutePerjalananNominatif()
    {
        return $this->hasOne(RutePerjalananNominatif::class, 'master_nominatif_id', 'id');
    }

    public function penginapan()
    {
        return $this->hasMany(PenginapanNominatif::class, 'master_nominatif_id', 'id')
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

    public function getAnggaranSp2dFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_sp2d, 0, ',', '.');
    }

    // Accessors for route data from child relationship
    public function getJumlahHariAttribute()
    {
        return optional($this->rutePerjalananNominatif)->total_hari ?? 0;
    }

    public function getTanggalMulaiAttribute()
    {
        $rute = $this->rutePerjalananNominatif;
        return $rute ? $rute->tanggal_mulai->format('Y-m-d') : null;
    }

    public function getTanggalSelesaiAttribute()
    {
        $rute = $this->rutePerjalananNominatif;
        return $rute ? $rute->tanggal_selesai->format('Y-m-d') : null;
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeEditable($query)
    {
        return $query->where('is_editable', true);
    }

    // Business Logic
    public function submit()
    {
        // Move anggaran_berjalan to anggaran_sp2d
        $this->anggaran_sp2d = $this->anggaran_berjalan;
        $this->anggaran_berjalan = 0;

        $this->status = 'submitted';
        $this->is_editable = false;
        $this->save();
    }

    public function canEdit()
    {
        return $this->is_editable && $this->status === 'draft';
    }

    // Calculate totals from JSON data
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

        // Calculate from penginapan (NEW: from separate table)
        $penginapanData = $this->penginapan;
        if ($penginapanData && count($penginapanData) > 0) {
            foreach ($penginapanData as $penginapan) {
                $totalPagu += $penginapan->pagu ?? 0;
                $totalBiayaAktual += $penginapan->biaya_aktual ?? 0;
            }
        }

        // Calculate from uang harian (masuk ke total pagu dan total aktual)
        if ($this->uang_harian) {
            $jumlahHari = $this->jumlah_hari ?? 1;
            $uangHarianPerHari = ($this->uang_harian['paguPerHari'] ?? 0);
            $uangHarianTotal = $uangHarianPerHari * $jumlahHari;
            // Uang harian masuk ke totalPagu dan totalBiayaAktual
            $totalPagu += $uangHarianTotal;
            $totalBiayaAktual += $uangHarianTotal; // Updated: masuk ke aktual juga
        }

        // Calculate from uang representasi (masuk ke total pagu dan total aktual)
        if ($this->uang_representasi) {
            $jumlahHari = $this->jumlah_hari ?? 1;
            $uangRepresentasiPerHari = ($this->uang_representasi['paguPerHari'] ?? 0);
            $uangRepresentasiTotal = $uangRepresentasiPerHari * $jumlahHari;
            // Uang representasi masuk ke totalPagu dan totalBiayaAktual
            $totalPagu += $uangRepresentasiTotal;
            $totalBiayaAktual += $uangRepresentasiTotal; // Updated: masuk ke aktual juga
        }

        // Calculate from tambahan orang
        $tambahanOrang = $this->tambahanOrang;
        if ($tambahanOrang && $tambahanOrang->count() > 0) {
            foreach ($tambahanOrang as $orang) {
                $totalPagu += $orang->pagu;
                $totalBiayaAktual += $orang->aktual;
            }
        }

        $this->total_pagu = $totalPagu;
        $this->total_biaya_aktual = $totalBiayaAktual;

        // Hitung ulang untuk logic baru: transport+penginapan selisih + uang harian/representasi full
        $transportPenginapanPagu = 0;
        $transportPenginapanAktual = 0;
        $uangHarianDanRepresentasi = 0;

        // Dari main form
        $transportasiData = $this->transportasi;
        if ($transportasiData && $transportasiData->count() > 0) {
            foreach ($transportasiData as $transport) {
                $transportPenginapanPagu += $transport->pagu ?? 0;
                $transportPenginapanAktual += $transport->biaya_aktual ?? 0;
            }
        }

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

        // Dari tambahan orang
        $tambahanOrang = $this->tambahanOrang;
        if ($tambahanOrang && $tambahanOrang->count() > 0) {
            foreach ($tambahanOrang as $orang) {
                // Transport dan penginapan dari tambahan orang
                $transportTambahan = $orang->transportasi;
                if ($transportTambahan && $transportTambahan->count() > 0) {
                    foreach ($transportTambahan as $transport) {
                        $transportPenginapanPagu += $transport->pagu ?? 0;
                        $transportPenginapanAktual += $transport->biaya_aktual ?? 0;
                    }
                }

                if ($orang->penginapan && isset($orang->penginapan['menginap']) && $orang->penginapan['menginap']) {
                    $transportPenginapanPagu += ($orang->penginapan['jumlahMalam'] ?? 1) * ($orang->penginapan['paguPerMalam'] ?? 0);
                    $transportPenginapanAktual += ($orang->penginapan['jumlahMalam'] ?? 1) * ($orang->penginapan['biayaAktualPerMalam'] ?? 0);
                }

                // Uang harian dan representasi dari tambahan orang (dihitung perhari)
                $jumlahHariOrang = $orang->jumlah_hari ?? 1;

                if ($orang->uang_harian) {
                    $uangHarianPerHari = ($orang->uang_harian['paguPerHari'] ?? 0);
                    $uangHarianDanRepresentasi += $uangHarianPerHari * $jumlahHariOrang;
                }
                if ($orang->uang_representasi) {
                    $uangRepresentasiPerHari = ($orang->uang_representasi['paguPerHari'] ?? 0);
                    $uangHarianDanRepresentasi += $uangRepresentasiPerHari * $jumlahHariOrang;
                }
            }
        }

        // Logic baru: (transport+penginapan pagu - transport+penginapan aktual) + uang harian/representasi full
        $this->anggaran_berjalan = ($transportPenginapanPagu - $transportPenginapanAktual) + $uangHarianDanRepresentasi;

        // Only set anggaran_sp2d if it's already submitted
        if ($this->status === 'submitted' && $this->anggaran_sp2d == 0) {
            $this->anggaran_sp2d = $this->anggaran_berjalan;
            $this->anggaran_berjalan = 0;
        }

        $this->save();
    }
}
