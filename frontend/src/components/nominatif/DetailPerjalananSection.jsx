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

  // Generate rute perjalanan otomatis
  const generateRutePerjalanan = (hari, tanggal) => {
    if (!tanggal || !tanggal.tanggalMulai || hari <= 0) return;

    const newRutePerjalanan = [];
    const startDate = new Date(tanggal.tanggalMulai);

    for (let i = 0; i < hari; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      newRutePerjalanan.push({
        hari: i + 1,
        dari: i === 0 ? 'Jakarta' : '',
        ke: '',
        tanggal: currentDate.toISOString().split('T')[0] // Format YYYY-MM-DD
      });
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

        {/* Perjalanan */}
        {jumlahHari > 0 && (
          <div className="space-y-4">
            {Array.from({ length: jumlahHari }, (_, index) => {
              const hari = index + 1;
              const rute = {
                dari: (rutePerjalanan?.[index]?.dari !== undefined) ? rutePerjalanan[index].dari : (index === 0 ? 'Jakarta' : ''),
                ke: (rutePerjalanan?.[index]?.ke !== undefined) ? rutePerjalanan[index].ke : '',
                tanggal: (rutePerjalanan?.[index]?.tanggal !== undefined) ? rutePerjalanan[index].tanggal : ''
              };

              console.log('DetailPerjalanan render:', {
                hari,
                index,
                rute,
                rutePerjalanan,
                tanggalPerjalanan,
                isEditable,
                isEditMode,
                keValue: rute.ke,
                keIsUndefined: rute.ke === undefined,
                dariValue: rute.dari,
                hariCount: jumlahHari
              });

              // Handle perubahan rute (kecuali tanggal karena sudah auto)
              const handleRuteChange = (hari, field, value) => {
                console.log('DetailPerjalanan handleRuteChange:', { hari, field, value, isEditable, isEditMode });
                const newRutePerjalanan = [...(rutePerjalanan || [])];
                const hariIndex = parseInt(hari) - 1;

                // Ensure the array has enough elements
                while (newRutePerjalanan.length <= hariIndex) {
                  newRutePerjalanan.push({
                    dari: newRutePerjalanan.length === 0 ? 'Jakarta' : '',
                    ke: '',
                    tanggal: ''
                  });
                }

                // Update the specific field
                newRutePerjalanan[hariIndex] = {
                  ...newRutePerjalanan[hariIndex],
                  [field]: value
                };

                onChange('rutePerjalanan', newRutePerjalanan);
              };

              return (
                <div key={hari} className="border border-gray-200 rounded-lg p-4 mt-2">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      {hari}
                    </div>
                    <span className="ml-2 font-normal text-gray-700">Perjalanan: {jumlahHari} hari</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Dari {hari === 1 ? '' : <span className="text-red-500">*</span>}
                      </label>
                      {hari === 1 ? (
                        <input
                          type="text"
                          value="Jakarta"
                          disabled
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-500"
                          readOnly
                        />
                      ) : (
                        <input
                          type="text"
                          value={rute.dari ?? ''}
                          onChange={(e) => handleRuteChange(hari, 'dari', e.target.value)}
                          disabled={isEditMode || !isEditable}
                          className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tujuan
                      </label>
                      <input
                        type="text"
                        value={rute.ke ?? ''}
                        onChange={(e) => handleRuteChange(hari, 'ke', e.target.value)}
                        disabled={isEditMode || !isEditable}
                        className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {jumlahHari > 0 && (
          <div className="mt-4 p-2  rounded-lg border border-gray-200">
            <p className="text-base text-gray-500">
              Perjalanan: {jumlahHari} hari dari Jakarta
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPerjalananSection;