import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const RingkasanTotalSection = ({
  transportasiBerangkat,
  transportasiPulang,
  penginapan,
  uangHarian,
  uangRepresentasi,
  totalPagu,
  onChange
}) => {
  // Auto-calculate total pagu
  useEffect(() => {
    const subtotalBerangkat = transportasiBerangkat?.subtotal || 0;
    const subtotalPulang = transportasiPulang?.subtotal || 0;
    const totalPenginapan = penginapan?.total || 0;
    const totalUangHarian = uangHarian?.total || 0;
    const totalUangRepresentasi = uangRepresentasi?.total || 0;

    const grandTotal = subtotalBerangkat + subtotalPulang + totalPenginapan + totalUangHarian + totalUangRepresentasi;

    if (totalPagu !== grandTotal) {
      onChange('totalPagu', grandTotal);
    }
  }, [
    transportasiBerangkat?.subtotal,
    transportasiPulang?.subtotal,
    penginapan?.total,
    uangHarian?.total,
    uangRepresentasi?.total,
    totalPagu,
    onChange
  ]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border-2 border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        RINGKASAN TOTAL PAGU
      </h3>

      <div className="space-y-3">
        {/* Detail Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Transportasi Berangkat:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(transportasiBerangkat?.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Transportasi Pulang:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(transportasiPulang?.subtotal || 0)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Penginapan:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(penginapan?.total || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Uang Harian:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatRupiah(uangHarian?.total || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Uang Representasi */}
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Uang Representasi:</span>
          <span className="text-sm font-medium text-gray-900">
            {formatRupiah(uangRepresentasi?.total || 0)}
          </span>
        </div>

        {/* Grand Total */}
        <div className="pt-4 border-t-2 border-blue-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">TOTAL PAGU:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatRupiah(totalPagu || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800">
          <strong>Catatan:</strong> Total pagu akan terhitung otomatis berdasarkan input di setiap section.
        </p>
      </div>
    </div>
  );
};

export default RingkasanTotalSection;