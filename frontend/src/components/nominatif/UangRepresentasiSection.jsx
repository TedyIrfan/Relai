import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const UangRepresentasiSection = ({ data, lamaDinas, onChange, isEditable }) => {
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
      onChange(`uangRepresentasi.${field}`, parseFloat(value) || 0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-normal text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Section 8: Uang Representasi
      </h3>

      {/* Uang Representasi Details */}
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

        {/* Total Uang Representasi */}
        <div className="bg-gray-50 p-3 rounded-lg">
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
    </div>
  );
};

export default UangRepresentasiSection;