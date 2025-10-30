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
    } else if (field === 'jumlahMalam' || field === 'paguPerMalam' || field === 'biayaAktualPerMalam') {
      onChange(`penginapan.${field}`, parseFloat(value) || 0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
            className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Ya, saya membutuhkan penginapan
          </span>
        </label>
      </div>

      {/* Show penginapan details only if checked */}
      {data.menginap && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          {/* Jumlah Malam */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Jumlah Malam</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Malam <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.jumlahMalam}
                  onChange={(e) => handleInputChange('jumlahMalam', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                  placeholder="1"
                />
              </div>

              <div className="col-span-9">
                <label className="block text-xs font-medium text-gray-600 mb-1">Info</label>
                <p className="text-xs text-gray-500">Input manual jumlah malam</p>
              </div>
            </div>
          </div>

          {/* Pagu dan Biaya Aktual */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Detail Biaya</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Pagu per Malam */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Pagu per Malam <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-xs">Rp</span>
                  <input
                    type="number"
                    value={data.paguPerMalam || ''}
                    onChange={(e) => handleInputChange('paguPerMalam', e.target.value)}
                    disabled={!isEditable}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                  />
                </div>
              </div>

              {/* Biaya Aktual */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Biaya Aktual
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-xs">Rp</span>
                  <input
                    type="number"
                    value={data.biayaAktualPerMalam || ''}
                    onChange={(e) => handleInputChange('biayaAktualPerMalam', e.target.value)}
                    disabled={!isEditable}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total Penginapan */}
          <div className="pt-4 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Penginapan:</span>
              <span className="text-lg font-semibold text-gray-700">
                {formatRupiah(data.total || 0)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.jumlahMalam} × {formatRupiah(data.paguPerMalam || 0)}
            </p>
          </div>

          <p className="text-xs text-gray-500">
            *Jumlah Malam & Pagu per Malam required untuk Submit
          </p>
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