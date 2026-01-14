import React, { useState, useEffect } from 'react';

const DetailPerjalananSection = ({ jumlahHari, rutePerjalanan, tanggalPerjalanan, onChange, isEditable, isEditMode = false, tujuanList = [], ruteDari = 'Jakarta', rutePulang = 'Jakarta' }) => {
  const [destinations, setDestinations] = useState([]);

  // Debug props
  console.log('🔍 DetailPerjalananSection Props:', {
    isEditMode,
    isEditable,
    jumlahHari,
    tujuanList,
    destinationsLength: destinations.length
  });

  // Initialize destinations from tujuanList prop or existing rutePerjalanan
  useEffect(() => {
    console.log('🔄 useEffect triggered:', {
      trigger: 'useEffect',
      jumlahHari,
      tujuanListLength: tujuanList?.length || 0,
      rutePerjalananLength: rutePerjalanan?.length || 0
    });

    // Calculate expected number of destinations
    const expectedJumlahTujuan = Math.max(1, (jumlahHari || 1) - 1);
    console.log('📍 Expected destinations for', jumlahHari, 'hari:', expectedJumlahTujuan);

    // Skip if already has correct count and non-empty values
    if (destinations.length === expectedJumlahTujuan && destinations.some(d => d !== '')) {
      console.log('📍 Destinations already set correctly, skipping');
      return;
    }

    let newDestinations = Array(expectedJumlahTujuan).fill('');

    // Priority 1: Use tujuanList from backend (highest priority)
    if (tujuanList && tujuanList.length > 0) {
      console.log('📍 Using tujuanList:', tujuanList);
      newDestinations = tujuanList.map((dest, i) => i < expectedJumlahTujuan ? dest : '');
    }
    // Priority 2: Use rutePerjalanan for compatibility
    else if (rutePerjalanan && rutePerjalanan.length > 0) {
      console.log('📍 Using rutePerjalanan:', rutePerjalanan);
      const firstDay = rutePerjalanan[0];
      const destList = [];

      if (firstDay.ke) destList.push(firstDay.ke);
      if (firstDay.tujuan2) destList.push(firstDay.tujuan2);
      if (firstDay.tujuan3) destList.push(firstDay.tujuan3);
      if (firstDay.tujuan4) destList.push(firstDay.tujuan4);
      if (firstDay.tujuan5) destList.push(firstDay.tujuan5);
      if (firstDay.tujuan6) destList.push(firstDay.tujuan6);

      if (destList.length > 0) {
        newDestinations = destList.map((dest, i) => i < expectedJumlahTujuan ? dest : '');
      }
    }

    // Fill remaining slots if array is shorter than expected
    while (newDestinations.length < expectedJumlahTujuan) {
      newDestinations.push('');
    }

    // Trim if array is longer than expected
    if (newDestinations.length > expectedJumlahTujuan) {
      newDestinations = newDestinations.slice(0, expectedJumlahTujuan);
    }

    console.log('📍 Final destinations to set:', {
      jumlahHari,
      expectedJumlahTujuan,
      newDestinations
    });

    setDestinations(newDestinations);
  }, [jumlahHari, tujuanList?.length, rutePerjalanan?.length, JSON.stringify(tujuanList), JSON.stringify(rutePerjalanan)]);

  // Handle destination change (JSON array format for tujuan_list)
  const handleDestinationChange = (index, value) => {
    console.log('📝 Destination change:', { index, value, currentDestinations: destinations });

    // Create new array to avoid mutation issues
    const newDestinations = destinations.map((dest, i) =>
      i === index ? value : dest
    );

    console.log('📝 New destinations (JSON array):', newDestinations);
    setDestinations(newDestinations);

    // Update tujuanList directly as JSON array (this will be sent to backend tujuan_list field)
    onChange('tujuanList', newDestinations);

    // Keep minimal rutePerjalanan for backward compatibility, but prioritize tujuanList
    const newRutePerjalanan = [{
      hari: 1,
      dari: ruteDari,
      ke: newDestinations[0] || '',
      pulang: rutePulang,
      tanggal: tanggalPerjalanan?.tanggalMulai || new Date().toISOString().split('T')[0]
    }];

    onChange('rutePerjalanan', newRutePerjalanan);
  };
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

  // Generate rute perjalanan otomatis - JSON array format for tujuan_list
  const generateRutePerjalanan = (hari, tanggal) => {
    if (!tanggal || !tanggal.tanggalMulai || hari <= 0) return;

    // Generate destinations array (scalable)
    // Logic: 1&2 hari = 1 tujuan, 3+ hari = (hari-1) tujuan
    const expectedJumlahTujuan = Math.max(1, hari - 1);
    console.log('🔄 generateRutePerjalanan:', {
      hari,
      expectedJumlahTujuan,
      currentDestinations: destinations
    });

    // Preserve existing destination values if available
    const newDestinations = Array(expectedJumlahTujuan).fill('');
    destinations.forEach((dest, i) => {
      if (i < expectedJumlahTujuan) {
        newDestinations[i] = dest;
      }
    });

    console.log('🔄 New destinations (JSON array) in generateRutePerjalanan:', newDestinations);
    setDestinations(newDestinations);

    // Update tujuanList directly as JSON array (this will be sent to backend tujuan_list field)
    onChange('tujuanList', newDestinations);

    // Keep minimal rutePerjalanan for backward compatibility, but prioritize tujuanList
    let newRutePerjalanan = [{
      hari: 1,
      dari: ruteDari,
      ke: newDestinations[0] || '',
      pulang: rutePulang,
      tanggal: tanggal.tanggalMulai
    }];

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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
        {console.log('Render check:', { jumlahHari, destinationsLength: destinations.length })}
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

              {/* Dynamic Tujuan Fields - Scalable Array Format */}
              {destinations.map((destination, index) => {
                const isFieldDisabled = !isEditable;
                console.log(`🔍 Field ${index + 1} Debug:`, {
                  index,
                  destination,
                  isFieldDisabled,
                  isEditMode,
                  isEditable
                });

                return (
                  <div key={index} className="relative z-10">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tujuan {index + 1}
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => handleDestinationChange(index, e.target.value)}
                      disabled={isFieldDisabled}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors duration-200 ${
                        isFieldDisabled
                          ? 'bg-gray-50 text-gray-500 border-gray-100 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-gray-300 cursor-text'
                      }`}
                      placeholder={`Kota tujuan ke-${index + 1}`}
                      autoComplete="off"
                      tabIndex={index + 1}
                    />
                    {/* Debug indicator */}
                    <div className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                );
              })}

              {/* Pulang Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pulang
                </label>
                <div className="px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 text-center font-medium">
                  {rutePulang}
                </div>
              </div>
            </div>

            {/* Visual Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  {destinations.length > 0 && destinations.some(d => d.trim() !== '')
                    ? `🗺️ Rute: ${ruteDari} → ${destinations.filter(d => d.trim() !== '').join(' → ')} → ${rutePulang} (${jumlahHari} hari)`
                    : `🗺️ Rute: ${ruteDari} → [Isi ${destinations.length} Tujuan] → ${rutePulang} (${jumlahHari} hari)`
                  }
                </p>
                {destinations.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Hari 1: Berangkat dari ${ruteDari} | Hari {jumlahHari}: Pulang ke ${rutePulang}
                    {destinations.length > 1 && (
                      <span className="ml-2">• Tujuan ke-{destinations.length}: {destinations[destinations.length - 1] || '[kosong]'}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {jumlahHari > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium text-blue-800 text-center">
              🗺️ Rute Perjalanan: {jumlahHari} hari
              {destinations.length === 1 && ' - Jakarta → [1 Tujuan] → Jakarta (perjalanan sehari)'}
              {destinations.length === 2 && ' - Jakarta → [2 Tujuan] → Jakarta (1 malam)'}
              {destinations.length === 3 && ' - Jakarta → [3 Tujuan] → Jakarta (2 malam)'}
              {destinations.length === 4 && ' - Jakarta → [4 Tujuan] → Jakarta (3 malam)'}
              {destinations.length > 4 && ` - Jakarta → [${destinations.length} Tujuan] → Jakarta (${destinations.length - 1} malam)`}
            </p>
            <p className="text-xs text-blue-600 text-center mt-1">
              💡 Isi {destinations.length} kolom tujuan di atas
              <span className="ml-2">• Hari 1: Berangkat • Hari {jumlahHari}: Pulang</span>
              {destinations.length > 0 && destinations.some(d => d.trim() !== '') && (
                <span className="ml-2">• Saat ini: {destinations.filter(d => d.trim() !== '').length} tujuan terisi</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPerjalananSection;