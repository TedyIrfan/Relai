import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const RingkasanTotalSection = ({
  transportasiPerHari,
  penginapan,
  uangHarian,
  uangRepresentasi,
  totalPagu,
  onChange,
  tambahanOrang = []
}) => {
  // Calculate total biaya aktual
  const calculateTotalBiayaAktual = () => {
    // Total aktual transportasi (form utama)
    const totalTransportasiAktual = transportasiPerHari?.reduce((total, transport) => {
      return total +
        (transport.biayaAktualTransportasiBerangkat || 0) +
        (transport.biayaAktualTaksiBerangkat || 0) +
        (transport.biayaAktualTransportasiPulang || 0) +
        (transport.biayaAktualTaksiPulang || 0);
    }, 0) || 0;

    // Total aktual penginapan (form utama)
    const totalPenginapanAktual = penginapan?.totalAktual || 0;

    // Total uang harian dan representasi (form utama)
    const totalUangHarian = uangHarian?.total || 0;
    const totalUangRepresentasi = uangRepresentasi?.total || 0;

    // Total aktual dari tambahan orang
    let totalTambahanOrangAktual = 0;
    tambahanOrang.forEach((orang) => {
      // Transportasi aktual tambahan orang
      const transportasiTambahanAktual = orang?.transportasiPerHari?.reduce((total, transport) => {
        return total +
          (transport.biayaAktualTransportasiBerangkat || 0) +
          (transport.biayaAktualTaksiBerangkat || 0) +
          (transport.biayaAktualTransportasiPulang || 0) +
          (transport.biayaAktualTaksiPulang || 0);
      }, 0) || 0;

      // Penginapan aktual tambahan orang
      const penginapanTambahanAktual = orang?.penginapan?.totalAktual || 0;

      // Uang harian dan representasi tambahan orang
      const uangHarianTambahan = orang?.uangHarian?.total || 0;
      const uangRepresentasiTambahan = orang?.uangRepresentasi?.total || 0;

      totalTambahanOrangAktual += transportasiTambahanAktual + penginapanTambahanAktual + uangHarianTambahan + uangRepresentasiTambahan;
    });

    return totalTransportasiAktual + totalPenginapanAktual + totalUangHarian + totalUangRepresentasi + totalTambahanOrangAktual;
  };

  // Calculate anggaran berjalan (pagu - aktual)
  const calculateAnggaranBerjalan = () => {
    const totalPaguCalculated = transportasiPerHari?.reduce((total, transport) => {
      const totalPagi = (transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) +
                        (transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0);
      const totalAktual = (transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0) +
                        (transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0);
      return total + (totalPagi - totalAktual);
    }, 0) || 0;

    const totalPenginapanBerjalan = penginapan?.anggaranRealisasi || 0;
    const totalUangHarianBerjalan = uangHarian?.total || 0;
    const totalUangRepresentasiBerjalan = uangRepresentasi?.total || 0;

    // Hitung anggaran berjalan dari tambahan orang
    let totalTambahanOrangBerjalan = 0;
    tambahanOrang.forEach((orang) => {
      // Transportasi berjalan tambahan orang (pagu - aktual)
      const transportasiTambahanBerjalan = orang?.transportasiPerHari?.reduce((total, transport) => {
        const totalPagi = (transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) +
                          (transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0);
        const totalAktual = (transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0) +
                          (transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0);
        return total + (totalPagi - totalAktual);
      }, 0) || 0;

      // Penginapan berjalan tambahan orang
      const penginapanTambahanBerjalan = orang?.penginapan?.anggaranRealisasi || 0;

      // Uang harian dan representasi tambahan orang
      const uangHarianTambahanBerjalan = orang?.uangHarian?.total || 0;
      const uangRepresentasiTambahanBerjalan = orang?.uangRepresentasi?.total || 0;

      totalTambahanOrangBerjalan += transportasiTambahanBerjalan + penginapanTambahanBerjalan + uangHarianTambahanBerjalan + uangRepresentasiTambahanBerjalan;
    });

    return totalPaguCalculated + totalPenginapanBerjalan + totalUangHarianBerjalan + totalUangRepresentasiBerjalan + totalTambahanOrangBerjalan;
  };

  const totalBiayaAktual = calculateTotalBiayaAktual();
  const anggaranBerjalan = calculateAnggaranBerjalan();
  // Auto-calculate total pagu
  useEffect(() => {
    // Hitung total transportasi dari anggaran realisasi (pagu - aktual) untuk form utama
    const totalTransportasi = transportasiPerHari?.reduce((total, transport) => {
      const totalPagi = (transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) +
                        (transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0);
      const totalAktual = (transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0) +
                        (transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0);
      return total + (totalPagi - totalAktual);
    }, 0) || 0;

    const totalPenginapan = penginapan?.total || 0;
    const totalUangHarian = uangHarian?.total || 0;
    const totalUangRepresentasi = uangRepresentasi?.total || 0;

    // Hitung total dari tambahan orang
    let totalTambahanOrang = 0;
    tambahanOrang.forEach((orang) => {
      // Transportasi tambahan orang
      const transportasiTambahan = orang?.transportasiPerHari?.reduce((total, transport) => {
        const totalPagi = (transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) +
                          (transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0);
        const totalAktual = (transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0) +
                          (transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0);
        return total + (totalPagi - totalAktual);
      }, 0) || 0;

      // Penginapan tambahan orang
      const penginapanTambahan = orang?.penginapan?.anggaranRealisasi || 0;

      // Uang harian tambahan orang
      const uangHarianTambahan = orang?.uangHarian?.total || 0;

      // Uang representasi tambahan orang
      const uangRepresentasiTambahan = orang?.uangRepresentasi?.total || 0;

      totalTambahanOrang += transportasiTambahan + penginapanTambahan + uangHarianTambahan + uangRepresentasiTambahan;
    });

    const grandTotal = totalTransportasi + totalPenginapan + totalUangHarian + totalUangRepresentasi + totalTambahanOrang;

    if (totalPagu !== grandTotal) {
      onChange('totalPagu', grandTotal);
    }
  }, [
    transportasiPerHari,
    penginapan?.total,
    uangHarian?.total,
    uangRepresentasi?.total,
    tambahanOrang,
    totalPagu,
    onChange
  ]);

  return (
    <div className="space-y-4">
      {/* Header dengan icon dan informasi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Ringkasan Anggaran Berjalan
            </label>
            <p className="text-xs text-gray-500">
              Total biaya yang berjalan untuk perjalanan dinas
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {formatRupiah(totalPagu || 0)}
        </div>
      </div>

      {/* Total Details */}
      <div className="space-y-4">
        {/* Rincian Biaya */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Rincian Biaya Perjalanan Dinas</h4>

          <div className="space-y-3">
            {/* Transportasi */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Transportasi Utama</span>
                <span className="text-xs text-gray-500 block">({transportasiPerHari?.length || 0} hari)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(transportasiPerHari?.reduce((total, transport) => {
                  const totalPagi = (transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) +
                                    (transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0);
                  const totalAktual = (transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0) +
                                    (transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0);
                  return total + (totalPagi - totalAktual);
                }, 0) || 0)}
              </span>
            </div>

            {/* Penginapan */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Penginapan Utama</span>
                {penginapan?.menginap && (
                  <span className="text-xs text-gray-500 block">({penginapan.jumlahMalam || 0} malam)</span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(penginapan?.anggaranRealisasi || 0)}
              </span>
            </div>

            {/* Uang Harian */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Uang Harian Utama</span>
                <span className="text-xs text-gray-500 block">({uangHarian?.jumlahHari || 0} hari)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(uangHarian?.total || 0)}
              </span>
            </div>

            {/* Uang Representasi */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Uang Representasi Utama</span>
                <span className="text-xs text-gray-500 block">({uangRepresentasi?.jumlahHari || 0} hari)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(uangRepresentasi?.total || 0)}
              </span>
            </div>

            {/* Tambahan Orang Section */}
            {tambahanOrang.length > 0 && (
              <>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Tambahan Orang ({tambahanOrang.length} orang)</h5>
                </div>

                {tambahanOrang.map((orang, index) => (
                  <div key={index} className="ml-4 space-y-2">
                    <div className="text-xs font-medium text-blue-600">
                      {orang.nama_peserta} - {orang.jabatan_peserta}
                    </div>

                    {/* Transportasi Tambahan Orang */}
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Transportasi</span>
                      <span className="text-xs font-medium text-gray-700">
                        {formatRupiah(orang?.transportasiPerHari?.reduce((total, transport) => {
                          const totalPagi = (transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) +
                                            (transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0);
                          const totalAktual = (transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0) +
                                            (transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0);
                          return total + (totalPagi - totalAktual);
                        }, 0) || 0)}
                      </span>
                    </div>

                    {/* Penginapan Tambahan Orang */}
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Penginapan</span>
                      <span className="text-xs font-medium text-gray-700">
                        {formatRupiah(orang?.penginapan?.anggaranRealisasi || 0)}
                      </span>
                    </div>

                    {/* Uang Harian Tambahan Orang */}
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Uang Harian</span>
                      <span className="text-xs font-medium text-gray-700">
                        {formatRupiah(orang?.uangHarian?.total || 0)}
                      </span>
                    </div>

                    {/* Uang Representasi Tambahan Orang */}
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Uang Representasi</span>
                      <span className="text-xs font-medium text-gray-700">
                        {formatRupiah(orang?.uangRepresentasi?.total || 0)}
                      </span>
                    </div>

                    {/* Subtotal Tambahan Orang */}
                    <div className="flex justify-between items-center py-2 bg-blue-50 px-2 rounded">
                      <span className="text-xs font-semibold text-blue-700">Subtotal {orang.nama_peserta}</span>
                      <span className="text-xs font-bold text-blue-700">
                        {formatRupiah(
                          (orang?.transportasiPerHari?.reduce((total, transport) => {
                            const totalPagi = (transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) +
                                              (transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0);
                            const totalAktual = (transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0) +
                                              (transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0);
                            return total + (totalPagi - totalAktual);
                          }, 0) || 0) +
                          (orang?.penginapan?.anggaranRealisasi || 0) +
                          (orang?.uangHarian?.total || 0) +
                          (orang?.uangRepresentasi?.total || 0)
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Total Tambahan Orang */}
                <div className="flex justify-between items-center py-2 bg-gray-100 px-3 rounded mt-2">
                  <span className="text-sm font-semibold text-gray-700">Total Tambahan Orang</span>
                  <span className="text-sm font-bold text-gray-700">
                    {formatRupiah(
                      tambahanOrang.reduce((total, orang) => {
                        const transportasiTambahan = orang?.transportasiPerHari?.reduce((total, transport) => {
                          const totalPagi = (transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) +
                                            (transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0);
                          const totalAktual = (transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0) +
                                            (transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0);
                          return total + (totalPagi - totalAktual);
                        }, 0) || 0;
                        return total + transportasiTambahan + (orang?.penginapan?.anggaranRealisasi || 0) + (orang?.uangHarian?.total || 0) + (orang?.uangRepresentasi?.total || 0);
                      }, 0)
                    )}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Summary Cards */}
          <div className="pt-4 border-t-2 border-gray-300 space-y-3">
            {/* Total Biaya Aktual */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-red-800">Total Biaya Aktual:</span>
                  <p className="text-xs text-red-600 mt-1">Total biaya yang sudah dikeluarkan</p>
                </div>
                <span className="text-xl font-bold text-red-700">
                  {formatRupiah(totalBiayaAktual)}
                </span>
              </div>
            </div>

            {/* Anggaran Berjalan */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-green-800">Anggaran Berjalan:</span>
                  <p className="text-xs text-green-600 mt-1">Sisa anggaran yang dapat digunakan (Pagu - Aktual)</p>
                </div>
                <span className="text-xl font-bold text-green-700">
                  {formatRupiah(anggaranBerjalan)}
                </span>
              </div>
            </div>

            {/* Total Pagu (Existing) */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-blue-800">Total Pagu Anggaran:</span>
                  <p className="text-xs text-blue-600 mt-1">Total keseluruhan pagu anggaran</p>
                </div>
                <span className="text-xl font-bold text-blue-700">
                  {formatRupiah(totalPagu || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingkasanTotalSection;