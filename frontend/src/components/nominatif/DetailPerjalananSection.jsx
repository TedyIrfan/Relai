import React from 'react';

const DetailPerjalananSection = ({ jumlahHari, rutePerjalanan, tanggalPerjalanan, onChange, isEditable, isEditMode = false }) => {
  // Handle perubahan tanggal rentang
  const handleTanggalChange = (field, value) => {
    const newTanggal = { ...tanggalPerjalanan, [field]: value };

    // Auto-calculate jumlah hari jika kedua tanggal sudah diisi
    if (newTanggal.tanggalMulai && newTanggal.tanggalSelesai) {
      const mulai = new Date(newTanggal.tanggalMulai);
      const selesai = new Date(newTanggal.tanggalSelesai);
      const diffTime = Math.abs(selesai - mulai);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 karena include hari pertama

      onChange('jumlahHari', diffDays);
      onChange('tanggalPerjalanan', newTanggal);

      // Generate rute perjalanan otomatis
      generateRutePerjalanan(diffDays, newTanggal);
    } else {
      onChange('tanggalPerjalanan', newTanggal);
    }
  };

  // Generate rute perjalanan otomatis - single form
  const generateRutePerjalanan = (hari, tanggal) => {
    if (!tanggal || !tanggal.tanggalMulai || hari <= 0) return;

    // Create single record with multiple tujuan fields
    let newRutePerjalanan = [{
      hari: 1,
      dari: 'Jakarta',
      ke: '',
      pulang: 'Jakarta',
      tanggal: tanggal.tanggalMulai
    }];

    // Add additional tujuan fields for 3+ days
    if (hari > 2) {
      for (let i = 1; i < (hari - 1); i++) {
        newRutePerjalanan[0][`tujuan${i + 1}`] = '';
      }
    }

    onChange('rutePerjalanan', newRutePerjalanan);
  };

  return (
    <div className="space-y-4">
      {/* Header dengan icon dan informasi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Detail Perjalanan
            </label>
            <p className="text-xs text-gray-500">
              Tentukan tanggal, rute, dan jumlah hari perjalanan dinas
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {jumlahHari} hari
        </div>
      </div>

      {/* Tanggal dan Rute */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={tanggalPerjalanan?.tanggalMulai || ''}
              onChange={(e) => handleTanggalChange('tanggalMulai', e.target.value)}
              disabled={isEditMode || !isEditable}
              className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={tanggalPerjalanan?.tanggalSelesai || ''}
              onChange={(e) => handleTanggalChange('tanggalSelesai', e.target.value)}
              disabled={isEditMode || !isEditable}
              className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Jumlah Hari
            </label>
            <div className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg ">
              <span className="text-sm text-gray-700">
                {jumlahHari ? `${jumlahHari} hari` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Perjalanan - Single Card Layout */}
        {jumlahHari > 0 && (
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Header untuk Detail Perjalanan */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                🗓️
              </div>
              <span className="ml-3 font-semibold text-gray-800 text-lg">
                Rute Perjalanan {jumlahHari} Hari
              </span>
            </div>

            {/* Single form with dynamic tujuan columns */}
            <div className="space-y-4">
              {/* Dari Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dari
                </label>
                <div className="px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-700 text-center font-medium">
                  Jakarta
                </div>
              </div>

              {/* Dynamic Tujuan Fields */}
              {(() => {
                // Logic:
                // 1-2 hari: 1 tujuan field
                // 3 hari: 2 tujuan fields
                // 4 hari: 3 tujuan fields
                // dst...
                let jumlahTujuanFields = jumlahHari <= 2 ? 1 : (jumlahHari - 1);

                return Array.from({ length: jumlahTujuanFields }, (_, index) => {
                  const tujuanField = index === 0 ? 'ke' : `tujuan${index + 1}`;
                  // Get value from first day (since it's single form)
                  const currentValue = (rutePerjalanan?.[0]?.[tujuanField] !== undefined) ? rutePerjalanan[0][tujuanField] : '';

                  return (
                    <div key={tujuanField}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tujuan {index + 1}
                      </label>
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => {
                          const newRutePerjalanan = [...(rutePerjalanan || [])];
                          if (!newRutePerjalanan[0]) {
                            newRutePerjalanan[0] = {
                              hari: 1,
                              dari: 'Jakarta',
                              ke: '',
                              pulang: '',
                              tanggal: new Date().toISOString().split('T')[0]
                            };
                          }
                          newRutePerjalanan[0] = {
                            ...newRutePerjalanan[0],
                            [tujuanField]: e.target.value
                          };
                          onChange('rutePerjalanan', newRutePerjalanan);
                        }}
                        disabled={isEditMode || !isEditable}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                        placeholder={`Kota tujuan ke-${index + 1}`}
                      />
                    </div>
                  );
                });
              })()}

              {/* Pulang Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pulang
                </label>
                <div className="px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 text-center font-medium">
                  Jakarta
                </div>
              </div>
            </div>

            {/* Visual Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  {jumlahHari <= 2
                    ? `🗺️ Rute: Jakarta → [Tujuan] → Jakarta (${jumlahHari} hari)`
                    : `🗺️ Rute: Jakarta → [${jumlahHari - 1} Tujuan] → Jakarta (${jumlahHari} hari)`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {jumlahHari > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium text-blue-800 text-center">
              🗺️ Rute Perjalanan: {jumlahHari} hari
              {jumlahHari === 1 && ' - Pergi & Pulang'}
              {jumlahHari === 2 && ' - Jakarta → [Tujuan] → Jakarta'}
              {jumlahHari > 2 && ` - Jakarta → [${jumlahHari - 1} Kota] → Jakarta`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPerjalananSection;