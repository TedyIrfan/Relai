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
      <h3 className="text-lg font-normal text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Section 7: Uang Harian
      </h3>

      {/* Uang Harian Details */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        {/* Informasi Durasi */}
        <div className="mb-4">
          <label className="block text-sm font-normal text-gray-500 mb-2">Jumlah Hari</label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-normal text-gray-500">
            {data.jumlahHari || 0} hari (Auto dari lama dinas)
          </div>
        </div>

        {/* Pagu Per Hari */}
        <div className="mb-4">
          <label className="block text-sm font-normal text-gray-500 mb-2">
            Pagu Per Hari
          </label>
          <input
            type="number"
            value={data.paguPerHari || ''}
            onChange={(e) => handleInputChange('paguPerHari', e.target.value)}
            disabled={!isEditable}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
          />
        </div>

        {/* Total Uang Harian */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Uang Harian:</span>
            <span className="text-sm font-bold text-gray-900">
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