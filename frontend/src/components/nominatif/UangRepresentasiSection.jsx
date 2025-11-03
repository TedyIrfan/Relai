import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const UangRepresentasiSection = ({ data, lamaDinas, onChange, isEditable }) => {
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
      onChange('uangRepresentasi.jumlahHari', jumlahHari);
    }
    if (data.total !== total) {
      onChange('uangRepresentasi.total', total);
    }
  }, [lamaDinas, data.paguPerHari, data.jumlahHari, data.total, onChange]);

  const handleInputChange = (field, value) => {
    if (field === 'paguPerHari') {
      onChange(`uangRepresentasi.${field}`, parseCurrencyValue(value) || 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header dengan icon dan informasi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Uang Representasi
            </label>
            <p className="text-xs text-gray-500">
              Tentukan pagu uang representasi untuk kegiatan resmi
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {formatRupiah(data.total || 0)}
        </div>
      </div>

      {/* Uang Representasi Details */}
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

      {/* Total Uang Representasi */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Uang Representasi:</span>
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

export default UangRepresentasiSection;