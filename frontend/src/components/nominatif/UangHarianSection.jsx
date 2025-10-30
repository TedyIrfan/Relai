import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const UangHarianSection = ({ data, lamaDinas, onChange, isEditable }) => {
  // Auto-calculate when lamaDinas or paguPerHari changes
  useEffect(() => {
    const jumlahHari = lamaDinas || 0;
    const total = jumlahHari * (data.paguPerHari || 0);

    if (data.jumlahHari !== jumlahHari) {
      onChange('uangHarian.jumlahHari', jumlahHari);
    }
    if (data.total !== total) {
      onChange('uangHarian.total', total);
    }
  }, [lamaDinas, data.paguPerHari, data.jumlahHari, data.total, onChange]);

  const handleInputChange = (field, value) => {
    if (field === 'paguPerHari') {
      onChange(`uangHarian.${field}`, parseFloat(value) || 0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Section 7: Uang Harian
      </h3>

      {/* Uang Harian Details */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        {/* Informasi Durasi */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Durasi</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Hari</label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900">
                {data.jumlahHari || 0} hari
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900">
                Auto dari lama dinas
              </div>
            </div>
          </div>
        </div>

        {/* Pagu Per Hari */}
        <div className="mb-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pagu Per Hari <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-xs">Rp</span>
                <input
                  type="number"
                  value={data.paguPerHari || ''}
                  onChange={(e) => handleInputChange('paguPerHari', e.target.value)}
                  disabled={!isEditable}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total Uang Harian */}
        <div className="pt-4 border-t border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Uang Harian:</span>
            <span className="text-lg font-semibold text-gray-700">
              {formatRupiah(data.total || 0)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {data.jumlahHari || 0} hari × {formatRupiah(data.paguPerHari || 0)}
          </p>
        </div>

        </div>
    </div>
  );
};

export default UangHarianSection;