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
    const totalTransportasi = transportasiPerHari?.reduce((total, transport) => total + (transport.totalHari || 0), 0) || 0;
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Ringkasan Total Pagu
      </h3>

      {/* Total Details */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        {/* Rincian Biaya */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Rincian Biaya Perjalanan Dinas</h4>

          <div className="space-y-3">
            {/* Transportasi */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Transportasi</span>
                <span className="text-xs text-gray-500 block">({transportasiPerHari?.length || 0} hari)</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(transportasiPerHari?.reduce((total, transport) => total + (transport.totalHari || 0), 0) || 0)}
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
        </div>

        {/* Total */}
        <div className="pt-4 border-t-2 border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total Pagu:</span>
            <span className="text-xl font-bold text-gray-700">
              {formatRupiah(totalPagu || 0)}
            </span>
          </div>
        </div>

              </div>
    </div>
  );
};

export default RingkasanTotalSection;