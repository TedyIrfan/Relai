import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const RingkasanTotalSection = ({
  transportasiPerHari,
  penginapan,
  uangHarian,
  uangRepresentasi,
  totalPagu,
  onChange
}) => {
  // Auto-calculate total pagu
  useEffect(() => {
    // Hitung total transportasi dari anggaran realisasi (pagu - aktual)
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

    const grandTotal = totalTransportasi + totalPenginapan + totalUangHarian + totalUangRepresentasi;

    if (totalPagu !== grandTotal) {
      onChange('totalPagu', grandTotal);
    }
  }, [
    transportasiPerHari,
    penginapan?.total,
    uangHarian?.total,
    uangRepresentasi?.total,
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
                <span className="text-sm text-gray-600">Transportasi</span>
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
                <span className="text-sm text-gray-600">Penginapan</span>
                {penginapan?.menginap && (
                  <span className="text-xs text-gray-500 block">({penginapan.jumlahMalam || 0} malam)</span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(penginapan?.total || 0)}
              </span>
            </div>

            {/* Uang Harian */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Uang Harian</span>
                <span className="text-xs text-gray-500 block">({uangHarian?.jumlahHari || 0} hari)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(uangHarian?.total || 0)}
              </span>
            </div>

            {/* Uang Representasi */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Uang Representasi</span>
                <span className="text-xs text-gray-500 block">({uangRepresentasi?.jumlahHari || 0} hari)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(uangRepresentasi?.total || 0)}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Anggaran Berjalan:</span>
              <span className="text-xl font-bold text-gray-700">
                {formatRupiah(totalPagu || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingkasanTotalSection;