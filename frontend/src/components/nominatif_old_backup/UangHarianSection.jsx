import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const UangHarianSection = ({ data, lamaDinas, onChange, isEditable }) => {
  // Format currency untuk display
  const formatCurrencyInput = (value) => {
    if (value === undefined || value === null || value === '') return '';
    // Remove non-numeric characters
    const numberValue = String(value).replace(/[^\d]/g, '');
    if (numberValue === '') return '';
    // Format with dots
    return parseInt(numberValue).toLocaleString('id-ID');
  };

  // Parse currency value back to number
  const parseCurrencyValue = (value) => {
    if (!value) return 0;
    const numberValue = String(value).replace(/[^\d]/g, '');
    return parseInt(numberValue) || 0;
  };

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
      onChange(`uangHarian.${field}`, parseCurrencyValue(value) || 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header dengan icon dan informasi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Uang Harian
            </label>
            <p className="text-xs text-gray-500">
              Tentukan pagu uang harian untuk perjalanan dinas
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {formatRupiah(data.total || 0)}
        </div>
      </div>

      {/* Uang Harian Details */}
      <div className="space-y-4">
        {/* Informasi Durasi */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Hari</label>
          <div className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <span className="text-sm text-gray-700">
              {data.jumlahHari || 0} hari (auto dari lama dinas)
            </span>
          </div>
        </div>

        {/* Pagu Per Hari */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Pagu Per Hari
          </label>
          <input
            type="text"
            value={formatCurrencyInput(data.paguPerHari)}
            onChange={(e) => handleInputChange('paguPerHari', e.target.value)}
            disabled={!isEditable}
            placeholder="0"
            className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
          />
        </div>
      </div>

      {/* Total Uang Harian */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
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
  );
};

export default UangHarianSection;