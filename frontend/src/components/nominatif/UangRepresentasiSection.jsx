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
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Section 8: Uang Representasi
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jumlah Hari (Display Only - Auto from lama dinas) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Jumlah Hari
          </label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
            <span className="text-gray-700">{data.jumlahHari || 0} hari</span>
          </div>
          <p className="text-xs text-gray-500">Auto dari lama dinas</p>
        </div>

        {/* Pagu per Hari */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pagu per Hari <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
            <input
              type="number"
              value={data.paguPerHari || ''}
              onChange={(e) => handleInputChange('paguPerHari', e.target.value)}
              disabled={!isEditable}
              placeholder="0"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Total Uang Representasi (Auto-calculated) */}
      <div className="mt-4 p-4 bg-orange-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">Total Uang Representasi:</span>
            <p className="text-xs text-gray-500">{data.jumlahHari || 0} hari × {formatRupiah(data.paguPerHari || 0)}</p>
          </div>
          <span className="text-lg font-bold text-orange-600">
            {formatRupiah(data.total || 0)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        *Pagu per Hari required untuk Submit
      </p>
    </div>
  );
};

export default UangRepresentasiSection;