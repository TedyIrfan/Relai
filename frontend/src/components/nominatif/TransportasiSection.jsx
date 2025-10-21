import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const TransportasiSection = ({
  title,
  icon,
  type, // 'berangkat' or 'pulang'
  data,
  onChange,
  isEditable
}) => {
  // Auto-calculate subtotal
  useEffect(() => {
    const subtotal = (data.paguTransportasi || 0) + (data.paguTaksi || 0);
    if (data.subtotal !== subtotal) {
      onChange(`${type}.subtotal`, subtotal);
    }
  }, [data.paguTransportasi, data.paguTaksi, data.subtotal, onChange, type]);

  const handleInputChange = (field, value) => {
    // Convert to number if it's a numeric field
    if (field === 'paguTransportasi' || field === 'paguTaksi') {
      value = parseFloat(value) || 0;
    }
    onChange(`${type}.${field}`, value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        {icon}
        Section {type === 'berangkat' ? '4' : '5'}: Transportasi {type === 'berangkat' ? 'Berangkat' : 'Pulang'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Jenis Transportasi */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Jenis Transportasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.jenis}
            onChange={(e) => handleInputChange('jenis', e.target.value)}
            disabled={!isEditable}
            placeholder="Contoh: Pesawat, Kereta, Mobil"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        {/* Pagu Transportasi */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pagu Transportasi <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
            <input
              type="number"
              value={data.paguTransportasi || ''}
              onChange={(e) => handleInputChange('paguTransportasi', e.target.value)}
              disabled={!isEditable}
              placeholder="0"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>

        {/* Pagu Taksi */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pagu Taksi {type === 'berangkat' ? 'ke Bandara' : 'dari Stasiun'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
            <input
              type="number"
              value={data.paguTaksi || ''}
              onChange={(e) => handleInputChange('paguTaksi', e.target.value)}
              disabled={!isEditable}
              placeholder="0"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Subtotal (Auto-calculated) */}
      <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Subtotal {type === 'berangkat' ? 'Berangkat' : 'Pulang'}:</span>
          <span className="text-lg font-bold text-indigo-600">
            {formatRupiah(data.subtotal || 0)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        *Jenis Transportasi & Pagu Transportasi required untuk Submit
      </p>
    </div>
  );
};

// Icon exports for different transport types
export const BerangkatIcon = () => (
  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const PulangIcon = () => (
  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m12-7l-7 7 7 7" />
  </svg>
);

export default TransportasiSection;