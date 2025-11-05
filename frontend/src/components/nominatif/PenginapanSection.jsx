import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const PenginapanSection = ({ data, onChange, isEditable }) => {
  console.log('PenginapanSection render:', { data, isEditable });

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
      onChange(`penginapan.${field}`, parseCurrencyValue(value) || 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header dengan icon dan informasi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Penginapan
            </label>
            <p className="text-xs text-gray-500">
              Tentukan kebutuhan penginapan untuk perjalanan dinas
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {data.menginap ? formatRupiah(data.total || 0) : 'Day trip'}
        </div>
      </div>

      {/* Checkbox for menginap */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.menginap}
            onChange={(e) => handleInputChange('menginap', e.target.checked)}
            disabled={!isEditable}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Ya, saya membutuhkan penginapan
          </span>
        </label>
      </div>

      {/* Show penginapan details only if checked */}
      {data.menginap && (
        <div className="space-y-4">
          {/* Jumlah Malam */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Malam</label>
            <input
              type="text"
              min="1"
              value={data.jumlahMalam || ''}
              onChange={(e) => handleInputChange('jumlahMalam', e.target.value)}
              disabled={!isEditable}
              className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
              placeholder="1"
            />
          </div>

          {/* Pagu dan Biaya Aktual */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pagu per Malam */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pagu per Malam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formatCurrencyInput(data.paguPerMalam)}
                onChange={(e) => handleInputChange('paguPerMalam', e.target.value)}
                disabled={!isEditable}
                placeholder="0"
                className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
              />
            </div>

            {/* Biaya Aktual */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Biaya Aktual
              </label>
              <input
                type="text"
                value={formatCurrencyInput(data.biayaAktualPerMalam)}
                onChange={(e) => handleInputChange('biayaAktualPerMalam', e.target.value)}
                disabled={!isEditable}
                placeholder="0"
                className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      )}

      {!data.menginap && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Tidak ada penginapan (day trip)</span>
          </div>
        </div>
      )}

      {/* Total dan Realisasi - hanya muncul jika menginap */}
      {data.menginap && (
        <>
          {/* Total Penginapan */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
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
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Anggaran Realisasi:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatRupiah(((data.total || 0) - ((data.jumlahMalam || 1) * (data.biayaAktualPerMalam || 0))))}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pagu ({formatRupiah(data.total || 0)}) - Biaya Aktual ({formatRupiah((data.jumlahMalam || 1) * (data.biayaAktualPerMalam || 0))})
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PenginapanSection;