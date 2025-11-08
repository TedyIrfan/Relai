$nominatif = \App\Models\Nominatif::with(["transportasi", "tambahanOrang", "rutePerjalananNominatif"])
    ->where("deskripsi_perjalanan_dinas", "Uang Representasi Luar Kota Pejabat Eselon I [1 ORG x 3 HARI x 4 KALI]")
    ->first();

if ($nominatif) {
    echo "=== NOMINATIF DATA ===\n";
    echo "ID: " . $nominatif->id . "\n";
    echo "Total Pagu: Rp" . number_format($nominatif->total_pagu, 0, ",", ".") . "\n";
    echo "Total Aktual: Rp" . number_format($nominatif->total_biaya_aktual, 0, ",", ".") . "\n";
    echo "Anggaran Berjalan: Rp" . number_format($nominatif->anggaran_berjalan, 0, ",", ".") . "\n";
    
    echo "\n=== PENGINAPAN ===\n";
    $penginapan = $nominatif->penginapan;
    $totalPaguPenginapan = 0;
    $totalAktualPenginapan = 0;
    if ($penginapan && $penginapan["menginap"]) {
        $totalPaguPenginapan = ($penginapan["jumlahMalam"] ?? 1) * ($penginapan["paguPerMalam"] ?? 0);
        $totalAktualPenginapan = ($penginapan["jumlahMalam"] ?? 1) * ($penginapan["biayaAktualPerMalam"] ?? 0);
        echo "Menginap: Ya, " . ($penginapan["jumlahMalam"] ?? 0) . " malam\n";
        echo "Total Penginapan: Rp" . number_format($totalPaguPenginapan, 0, ",", ".") . " (pagu), Rp" . number_format($totalAktualPenginapan, 0, ",", ".") . " (aktual)\n";
    } else {
        echo "Tidak menginap\n";
    }
    
    echo "\n=== UANG HARIAN ===\n";
    $uangHarian = $nominatif->uang_harian;
    $uangHarianTotal = $uangHarian["total"] ?? 0;
    echo "Total Uang Harian: Rp" . number_format($uangHarianTotal, 0, ",", ".") . "\n";
    
    echo "\n=== UANG REPRESENTASI ===\n";
    $uangRepresentasi = $nominatif->uang_representasi;
    $uangRepresentasiTotal = $uangRepresentasi["total"] ?? 0;
    echo "Total Uang Representasi: Rp" . number_format($uangRepresentasiTotal, 0, ",", ".") . "\n";
    
    echo "\n=== TRANSPORTASI ===\n";
    $totalPaguTransport = 0;
    $totalAktualTransport = 0;
    foreach ($nominatif->transportasi as $transport) {
        echo "- " . $transport->jenis_transportasi . ": Pagu Rp" . number_format($transport->pagu, 0, ",", ".") . ", Aktual Rp" . number_format($transport->biaya_aktual, 0, ",", ".") . "\n";
        $totalPaguTransport += $transport->pagu;
        $totalAktualTransport += $transport->biaya_aktual;
    }
    echo "Total Transport: Rp" . number_format($totalPaguTransport, 0, ",", ".") . " (pagu), Rp" . number_format($totalAktualTransport, 0, ",", ".") . " (aktual)\n";
    
    echo "\n=== TAMBAHAN ORANG ===\n";
    $totalPaguTambahan = 0;
    $totalAktualTambahan = 0;
    foreach ($nominatif->tambahanOrang as $orang) {
        echo "- Orang " . $orang->id . ": Pagu Rp" . number_format($orang->pagu, 0, ",", ".") . ", Aktual Rp" . number_format($orang->aktual, 0, ",", ".") . "\n";
        $totalPaguTambahan += $orang->pagu;
        $totalAktualTambahan += $orang->aktual;
    }
    echo "Total Tambahan Orang: Rp" . number_format($totalPaguTambahan, 0, ",", ".") . " (pagu), Rp" . number_format($totalAktualTambahan, 0, ",", ".") . " (aktual)\n";
    
    echo "\n=== VERIFIKASI PERHITUNGAN ===\n";
    $hitungTotalPagu = $totalPaguTransport + $totalPaguPenginapan + $uangHarianTotal + $uangRepresentasiTotal + $totalPaguTambahan;
    $hitungTotalAktual = $totalAktualTransport + $totalAktualPenginapan + $totalAktualTambahan;
    $hitungAnggaranBerjalan = $hitungTotalPagu - $hitungTotalAktual;
    
    echo "Hitung Total Pagu: Rp" . number_format($hitungTotalPagu, 0, ",", ".") . "\n";
    echo "Hitung Total Aktual: Rp" . number_format($hitungTotalAktual, 0, ",", ".") . "\n";
    echo "Hitung Anggaran Berjalan: Rp" . number_format($hitungAnggaranBerjalan, 0, ",", ".") . "\n";
    
    echo "\n=== KOMPARASI ===\n";
    echo "Total Pagu - Database: Rp" . number_format($nominatif->total_pagu, 0, ",", ".") . " | Hitung: Rp" . number_format($hitungTotalPagu, 0, ",", ".") . " | " . ($nominatif->total_pagu == $hitungTotalPagu ? "✅ BENAR" : "❌ SALAH") . "\n";
    echo "Total Aktual - Database: Rp" . number_format($nominatif->total_biaya_aktual, 0, ",", ".") . " | Hitung: Rp" . number_format($hitungTotalAktual, 0, ",", ".") . " | " . ($nominatif->total_biaya_aktual == $hitungTotalAktual ? "✅ BENAR" : "❌ SALAH") . "\n";
    echo "Anggaran Berjalan - Database: Rp" . number_format($nominatif->anggaran_berjalan, 0, ",", ".") . " | Hitung: Rp" . number_format($hitungAnggaranBerjalan, 0, ",", ".") . " | " . ($nominatif->anggaran_berjalan == $hitungAnggaranBerjalan ? "✅ BENAR" : "❌ SALAH") . "\n";
} else {
    echo "Data tidak ditemukan\!\n";
}
