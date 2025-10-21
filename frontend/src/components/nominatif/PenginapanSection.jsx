import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const PenginapanSection = ({ data, onChange, isEditable }) => {
  // Auto-calculate total when penginapan values change
  useEffect(() => {
    if (data.menginap) {
      const total = (data.jumlahMalam || 1) * (data.paguPerMalam || 0);
      if (data.total !== total) {
        onChange('penginapan.total', total);
      }
    } else {
      // Reset to 0 if not staying overnight
      if (data.total !== 0) {
        onChange('penginapan.total', 0);
      }
    }
  }, [data.menginap, data.jumlahMalam, data.paguPerMalam, data.total, onChange]);

  const handleInputChange = (field, value) => {
    if (field === 'menginap') {
      onChange('penginapan.menginap', value);
    } else if (field === 'jumlahMalam' || field === 'paguPerMalam') {
      onChange(`penginapan.${field}`, parseFloat(value) || 0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Section 6: Penginapan
      </h3>

      {/* Checkbox for menginap */}
      <div className="mb-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.menginap}
            onChange={(e) => handleInputChange('menginap', e.target.checked)}
            disabled={!isEditable}
            className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Ya, menginap
          </span>
        </label>
      </div>

      {/* Show penginapan details only if checked */}
      {data.menginap && (
        <div className="space-y-4 pl-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jumlah Malam */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Jumlah Malam <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={data.jumlahMalam}
                onChange={(e) => handleInputChange('jumlahMalam', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              />
              <p className="text-xs text-gray-500">Default: 1 malam</p>
            </div>

            {/* Pagu per Malam */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pagu per Malam <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                <input
                  type="number"
                  value={data.paguPerMalam || ''}
                  onChange={(e) => handleInputChange('paguPerMalam', e.target.value)}
                  disabled={!isEditable}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Total Penginapan (Auto-calculated) */}
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Total Penginapan:</span>
                <p className="text-xs text-gray-500">{data.jumlahMalam} × {formatRupiah(data.paguPerMalam || 0)}</p>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {formatRupiah(data.total || 0)}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            *Jumlah Malam & Pagu per Malam required untuk Submit
          </p>
        </div>
      )}

      {!data.menginap && (
        <div className="pl-7">
          <p className="text-sm text-gray-500">Tidak ada penginapan</p>
        </div>
      )}
    </div>
  );
};

export default PenginapanSection;