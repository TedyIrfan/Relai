import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const PerjalananSection = ({
  asal,
  tujuan,
  tanggalPergi,
  tanggalPulang,
  lamaDinas,
  onChange,
  isEditable
}) => {
  // Auto-calculate lama dinas when dates change
  useEffect(() => {
    if (tanggalPergi && tanggalPulang) {
      const startDate = new Date(tanggalPergi);
      const endDate = new Date(tanggalPulang);

      if (startDate <= endDate) {
        // Include both start and end date in calculation
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        onChange('lamaDinas', diffDays);
      }
    }
  }, [tanggalPergi, tanggalPulang, onChange]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Section 3: Perjalanan
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Asal */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Asal
          </label>
          <input
            type="text"
            value={asal}
            onChange={(e) => onChange('asal', e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Jakarta"
          />
        </div>

        {/* Tujuan */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tujuan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={tujuan}
            onChange={(e) => onChange('tujuan', e.target.value)}
            disabled={!isEditable}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Contoh: Bandung"
          />
        </div>

        {/* Tanggal Pergi */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tanggal Pergi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={tanggalPergi}
            onChange={(e) => onChange('tanggalPergi', e.target.value)}
            disabled={!isEditable}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        {/* Tanggal Pulang */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tanggal Pulang <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={tanggalPulang}
            onChange={(e) => onChange('tanggalPulang', e.target.value)}
            disabled={!isEditable}
            min={tanggalPergi || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      </div>

      {/* Lama Dinas (Auto-calculated) */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Lama Dinas:</span>
          <span className="text-lg font-bold text-purple-600">
            {lamaDinas > 0 ? `${lamaDinas} hari` : '-'}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        *Tujuan, Tanggal Pergi & Pulang required untuk Submit
      </p>
    </div>
  );
};

export default PerjalananSection;