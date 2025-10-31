import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const PenginapanSection = ({ data, onChange, isEditable }) => {
  // Auto-calculate total and anggaran realisasi when penginapan values change
  useEffect(() => {
    if (data.menginap) {
      const total = (data.jumlahMalam || 1) * (data.paguPerMalam || 0);
      const totalBiayaAktual = (data.jumlahMalam || 1) * (data.biayaAktualPerMalam || 0);
      const anggaranRealisasi = total - totalBiayaAktual;

      if (data.total !== total) {
        onChange('penginapan.total', total);
      }
      if (data.anggaranRealisasi !== anggaranRealisasi) {
        onChange('penginapan.anggaranRealisasi', anggaranRealisasi);
      }
    } else {
      // Reset to 0 if not staying overnight
      if (data.total !== 0) {
        onChange('penginapan.total', 0);
      }
      if (data.anggaranRealisasi !== 0) {
        onChange('penginapan.anggaranRealisasi', 0);
      }
    }
  }, [data.menginap, data.jumlahMalam, data.paguPerMalam, data.biayaAktualPerMalam, data.total, data.anggaranRealisasi, onChange]);

  const handleInputChange = (field, value) => {
    if (field === 'menginap') {
      onChange('penginapan.menginap', value);
    } else if (field === 'jumlahMalam' || field === 'paguPerMalam' || field === 'biayaAktualPerMalam') {
      onChange(`penginapan.${field}`, parseFloat(value) || 0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-normal text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Section 6: Penginapan
      </h3>

      {/* Checkbox for menginap */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.menginap}
            onChange={(e) => handleInputChange('menginap', e.target.checked)}
            disabled={!isEditable}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
          />
          <span className="text-sm font-normal text-gray-700">
            Ya, saya membutuhkan penginapan
          </span>
        </label>
      </div>

      {/* Show penginapan details only if checked */}
      {data.menginap && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          {/* Jumlah Malam */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-gray-700 mb-2">Jumlah Malam</label>
            <input
              type="number"
              min="1"
              value={data.jumlahMalam}
              onChange={(e) => handleInputChange('jumlahMalam', e.target.value)}
              disabled={!isEditable}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
              placeholder="1"
            />
          </div>

          {/* Pagu dan Biaya Aktual */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Pagu per Malam */}
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Pagu per Malam <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={data.paguPerMalam || ''}
                onChange={(e) => handleInputChange('paguPerMalam', e.target.value)}
                disabled={!isEditable}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
              />
            </div>

            {/* Biaya Aktual */}
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Biaya Aktual
              </label>
              <input
                type="number"
                value={data.biayaAktualPerMalam || ''}
                onChange={(e) => handleInputChange('biayaAktualPerMalam', e.target.value)}
                disabled={!isEditable}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
              />
            </div>
          </div>

          {/* Total Penginapan */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Penginapan:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatRupiah(data.total || 0)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.jumlahMalam} × {formatRupiah(data.paguPerMalam || 0)}
            </p>
          </div>

          {/* Anggaran Realisasi */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">Anggaran Realisasi:</span>
              <span className="text-sm font-bold text-blue-900">
                {formatRupiah(((data.total || 0) - ((data.jumlahMalam || 1) * (data.biayaAktualPerMalam || 0))))}
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Pagu ({formatRupiah(data.total || 0)}) - Biaya Aktual ({formatRupiah((data.jumlahMalam || 1) * (data.biayaAktualPerMalam || 0))})
            </p>
          </div>
        </div>
      )}

      {!data.menginap && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center text-gray-500">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Tidak ada penginapan (day trip)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenginapanSection;