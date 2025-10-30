import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const PerjalananSection = ({
  jumlahHari,
  rutePerjalanan,
  tanggalPulang,
  lamaDinas,
  onChange,
  isEditable
}) => {
  // Handle perubahan jumlah hari
  const handleJumlahHariChange = (value) => {
    const newJumlahHari = parseInt(value) || 1;
    onChange('jumlahHari', newJumlahHari);

    // Update rute perjalanan sesuai jumlah hari
    const newRutePerjalanan = [];
    for (let i = 1; i <= newJumlahHari; i++) {
      const existingRute = rutePerjalanan.find(r => r.hari === i);
      newRutePerjalanan.push({
        hari: i,
        dari: existingRute ? existingRute.dari : (i === 1 ? 'Jakarta' : (rutePerjalanan[i-2]?.ke || '')),
        ke: existingRute ? existingRute.ke : '',
        tanggal: existingRute ? existingRute.tanggal : ''
      });
    }
    onChange('rutePerjalanan', newRutePerjalanan);
    onChange('lamaDinas', newJumlahHari);
  };

  // Handle perubahan rute perjalanan
  const handleRuteChange = (hari, field, value) => {
    const newRutePerjalanan = rutePerjalanan.map(rute => {
      if (rute.hari === hari) {
        return { ...rute, [field]: value };
      }
      return rute;
    });
    onChange('rutePerjalanan', newRutePerjalanan);

    // Auto-fill next day's "dari" field when current "ke" changes
    if (field === 'ke' && hari < jumlahHari) {
      const nextRute = newRutePerjalanan.find(r => r.hari === hari + 1);
      if (nextRute && !nextRute.dari) {
        handleRuteChange(hari + 1, 'dari', value);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Section 3: Perjalanan
      </h3>

      {/* Perjalanan Details */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        {/* Jumlah Hari */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Jumlah Hari Perjalanan</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Jumlah Hari <span className="text-red-500">*</span>
              </label>
              <select
                value={jumlahHari}
                onChange={(e) => handleJumlahHariChange(e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(hari => (
                  <option key={hari} value={hari}>{hari} hari</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Info</label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-500">
                Menentukan jumlah rute perjalanan
              </div>
            </div>
          </div>
        </div>

        {/* Rute Perjalanan */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Rute Perjalanan</h4>
          <div className="space-y-4">
            {rutePerjalanan.map((rute, index) => (
              <div key={rute.hari} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {rute.hari}
                  </div>
                  <span className="ml-2 font-medium text-gray-700">Hari ke-{rute.hari}</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Dari */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Dari</label>
                    <input
                      type="text"
                      value={rute.dari}
                      onChange={(e) => handleRuteChange(rute.hari, 'dari', e.target.value)}
                      disabled={!isEditable}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                      placeholder="Kota asal"
                    />
                  </div>

                  {/* Ke */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ke <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rute.ke}
                      onChange={(e) => handleRuteChange(rute.hari, 'ke', e.target.value)}
                      disabled={!isEditable}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                      placeholder="Kota tujuan"
                    />
                  </div>

                  {/* Tanggal */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={rute.tanggal}
                      onChange={(e) => handleRuteChange(rute.hari, 'tanggal', e.target.value)}
                      disabled={!isEditable}
                      min={index === 0 ? new Date().toISOString().split('T')[0] : (rutePerjalanan[index - 1]?.tanggal || new Date().toISOString().split('T')[0])}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    />
                  </div>
                </div>

                {/* Show Route Preview */}
                {rute.dari && rute.ke && (
                  <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">
                      📍 {rute.dari} → {rute.ke}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Perjalanan:</span>
            <span className="text-lg font-semibold text-gray-700">
              {jumlahHari} hari ({jumlahHari} kota)
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-700">
            💡 <strong>Info:</strong> Semua field rute perjalanan wajib diisi untuk Submit
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerjalananSection;