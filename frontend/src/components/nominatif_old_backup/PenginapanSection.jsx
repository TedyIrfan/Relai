import React, { useEffect, useState } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';
import penginapanService from '../../services/penginapanService.js';

const PenginapanSection = ({
  data,
  onChange,
  isEditable,
  rutePerjalanan = null,
  tujuanList = [],
  jumlahHari = 1,
  nominatifId = null, // For master nominatif
  tambahanOrangId = null, // For tambahan orang
  isTambahanOrang = false // Flag to indicate tambahan orang mode
}) => {
  // State for penginapan data from API
  const [penginapanData, setPenginapanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  console.log('PenginapanSection render:', {
    data,
    isEditable,
    rutePerjalanan,
    tujuanList: tujuanList?.length ? tujuanList : 'EMPTY',
    tujuanListLength: tujuanList?.length || 0,
    jumlahHari,
    nominatifId,
    tambahanOrangId,
    isTambahanOrang
  });

  // Generate rute display text
  const getRuteDisplayText = () => {
    // Prioritas 1: Cari dari tujuanList (data dari form Detail Perjalanan)
    if (tujuanList && tujuanList.length > 0) {
      const destinations = tujuanList.map(item => {
        // Handle both string and object formats
        if (typeof item === 'string') {
          return item;
        } else if (item && typeof item === 'object') {
          return item.tujuan || item;
        }
        return item;
      }).filter(Boolean);

      if (destinations.length > 0) {
        const dari = 'Jakarta'; // Default dari
        const tujuanString = destinations.join(' → ');
        return `${dari} → ${tujuanString} → ${dari}`;
      }
    }

    // Prioritas 2: Cari dari rutePerjalanan
    if (rutePerjalanan && rutePerjalanan.kota_asal && rutePerjalanan.kota_tujuan) {
      return `${rutePerjalanan.kota_asal} → ${rutePerjalanan.kota_tujuan} → ${rutePerjalanan.kota_asal}`;
    }

    return 'Belum ada rute';
  };

  // Extract kota tujuan untuk lokasi penginapan
  const getLokasiPenginapan = () => {
    // Prioritas 1: Cari dari tujuanList (data dari form Detail Perjalanan)
    if (tujuanList && tujuanList.length > 0) {
      const firstTujuan = tujuanList[0];
      // Handle both string and object formats
      if (typeof firstTujuan === 'string') {
        return firstTujuan;
      } else if (firstTujuan && typeof firstTujuan === 'object') {
        return firstTujuan.tujuan || firstTujuan;
      }
    }

    // Prioritas 2: Cari dari rutePerjalanan.kota_tujuan (existing logic)
    if (rutePerjalanan && rutePerjalanan.kota_tujuan) {
      return rutePerjalanan.kota_tujuan;
    }

    // Prioritas 3: Try to extract from array structure if exists
    if (rutePerjalanan && Array.isArray(rutePerjalanan) && rutePerjalanan.length > 0) {
      const firstRute = rutePerjalanan[0];
      if (firstRute && firstRute.tujuan) {
        return firstRute.tujuan;
      }
    }

    return 'Tujuan';
  };

  // Generate hari display text
  const getHariDisplayText = () => {
    if (jumlahHari <= 1) {
      return `Hari 1: Perjalanan 1 hari`;
    }

    const kotaAsal = rutePerjalanan?.kota_asal || 'Asal';
    const kotaTujuan = getLokasiPenginapan();

    let hariText = `Hari 1: Berangkat dari ${kotaAsal}`;
    for (let i = 2; i < jumlahHari; i++) {
      hariText += ` | Hari ${i}: Aktivitas di ${kotaTujuan}`;
    }
    hariText += ` | Hari ${jumlahHari}: Pulang ke ${kotaAsal}`;

    return hariText;
  };

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

  // Load penginapan data when component mounts or IDs change
  useEffect(() => {
    const loadPenginapanData = async () => {
      // Enhanced validation to prevent string "null" or invalid IDs
      const isValidId = (id) => {
        return id && id !== 'null' && id !== null && id !== undefined && id !== '';
      };

      const validNominatifId = isValidId(nominatifId) ? parseInt(nominatifId) : null;
      const validTambahanOrangId = isValidId(tambahanOrangId) ? parseInt(tambahanOrangId) : null;

      if (!validNominatifId && !validTambahanOrangId) {
        console.log('🔄 No valid IDs available, setting initialized without loading');
        setInitialized(true);
        return;
      }

      console.log('🔄 Loading penginapan data for IDs:', { nominatifId: validNominatifId, tambahanOrangId: validTambahanOrangId });
      setLoading(true);
      try {
        let response;
        if (isTambahanOrang && validTambahanOrangId) {
          response = await penginapanService.getPenginapanTambahanOrang(validTambahanOrangId);
        } else if (validNominatifId) {
          response = await penginapanService.getPenginapan(validNominatifId);
        }

        if (response && response.success) {
          console.log('✅ Penginapan data loaded:', response.data);
          // Convert API response to form data format
          const formData = penginapanService.apiToFormData(response.data);
          setPenginapanData(formData.malamDetails || []);

          // Update parent form state
          onChange('penginapan', formData);
        } else {
          console.log('ℹ️ No existing penginapan data found');
          setPenginapanData([]);
        }
      } catch (error) {
        console.error('Error loading penginapan data:', error);
        setPenginapanData([]);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadPenginapanData();
  }, [nominatifId, tambahanOrangId, isTambahanOrang]);

  // Auto-generate or update penginapan when menginap changes or jumlahHari changes
  useEffect(() => {
    if (!initialized || loading) return;

    console.log('Penginapan useEffect trigger:', {
      menginap: data?.menginap,
      jumlahHari,
      nominatifId,
      tambahanOrangId,
      isTambahanOrang,
      shouldGenerate: data?.menginap && jumlahHari > 1,
      hasData: penginapanData.length > 0,
      expectedMalam: Math.max(0, jumlahHari - 1),
      hasValidId: nominatifId || tambahanOrangId
    });

    const shouldGenerate = data?.menginap && jumlahHari > 1;
    const hasData = penginapanData.length > 0;
    const expectedMalam = Math.max(0, jumlahHari - 1);
    const hasValidId = nominatifId || tambahanOrangId;

    // Only generate if we have a valid ID (data already saved)
    if (shouldGenerate && hasValidId && (!hasData || penginapanData.length !== expectedMalam)) {
      generatePenginapanData();
    } else if (!data?.menginap && hasData) {
      // Clear penginapan data if not staying overnight
      clearPenginapanData();
    }
  }, [data?.menginap, jumlahHari, initialized, loading, nominatifId, tambahanOrangId, isTambahanOrang, penginapanData.length]);

  // Progressive Save: Save penginapan data when nominatifId becomes available
  useEffect(() => {
    if (nominatifId && penginapanData.length > 0 && !loading) {
      console.log('🔄 Progressive Save Trigger: NominatifId available, saving penginapan data...');
      savePendingPenginapanData();
    }
  }, [nominatifId]);

  // Save pending penginapan data after main nominatif is saved
  const savePendingPenginapanData = async () => {
    if (!nominatifId || penginapanData.length === 0) return;

    try {
      console.log('💾 Progressive Save: Saving pending penginapan data...');

      for (let i = 0; i < penginapanData.length; i++) {
        const malamData = penginapanData[i];

        // Only save if data doesn't have ID (not yet saved)
        if (!malamData.id && (malamData.pagu > 0 || malamData.aktual > 0 || malamData.nama_hotel || malamData.keterangan)) {
          const formData = {
            malamDetails: [malamData]
          };

          const response = await penginapanService.savePenginapan(nominatifId, formData);

          if (response && response.success && response.data && response.data.length > 0) {
            // Update local data with new ID from server
            const updatedData = [...penginapanData];
            updatedData[i] = {
              ...updatedData[i],
              id: response.data[response.data.length - 1].id
            };
            setPenginapanData(updatedData);
            console.log('✅ Progressive Save: Penginapan malam', i + 1, 'saved with ID:', updatedData[i].id);
          }
        }
      }

      console.log('✅ Progressive Save: All pending penginapan data saved successfully');
    } catch (error) {
      console.error('❌ Progressive Save: Failed to save pending penginapan data:', error);
    }
  };

  // Generate penginapan data from route
  const generatePenginapanData = async () => {
    console.log('🚀 generatePenginapanData called:', {
      nominatifId,
      tambahanOrangId,
      isTambahanOrang,
      jumlahHari,
      '📊 Jumlah Malam': Math.max(0, jumlahHari - 1)
    });

    if (!nominatifId && !tambahanOrangId) {
      console.log('❌ Early return: No IDs available - Data must be saved first');
      return;
    }

    const jumlahMalam = Math.max(0, jumlahHari - 1);
    if (jumlahMalam === 0) {
      console.log('❌ Early return: Jumlah malam is 0');
      return;
    }

    // Prevent infinite retry - check if already generating
    if (window._penginapanGenerating) {
      console.warn('🚫 Penginapan generation already in progress, skipping...');
      return;
    }

    console.log('✅ Validation passed, proceeding with API call...');

    // Set generation flag to prevent retries
    window._penginapanGenerating = true;
    setLoading(true);

    try {
      // Prepare rute data for API - NO DOUBLE NESTING!
      const ruteData = {
        tujuan_list: tujuanList.map(item => {
          // Handle both string and object formats
          if (typeof item === 'string') {
            return item;
          } else if (item && typeof item === 'object') {
            return item.tujuan || item;
          }
          return item;
        }).filter(Boolean),
        total_hari: jumlahHari,
        dari: 'Jakarta',
        pulang: 'Jakarta'
      };

      console.log('📋 API Parameters:', {
        ruteData,
        'Pagu Mode': 'User Input Manual (No Default)',
        'Jumlah Malam': jumlahMalam
      });
      console.log('📋 RuteData Detail:', JSON.stringify(ruteData, null, 2));

      let response;

      // Enhanced validation for generation
      const isValidId = (id) => {
        return id && id !== 'null' && id !== null && id !== undefined && id !== '' && !isNaN(parseInt(id));
      };

      const validNominatifId = isValidId(nominatifId) ? parseInt(nominatifId) : null;
      const validTambahanOrangId = isValidId(tambahanOrangId) ? parseInt(tambahanOrangId) : null;

      if (validNominatifId && !isTambahanOrang) {
        console.log('🟢 Calling generateFromRute with ID:', validNominatifId);
        response = await penginapanService.generateFromRute(
          validNominatifId,
          ruteData, // Send directly - no wrapping to prevent double nesting
          0 // No default pagu - user will input manually
        );
      } else if (isTambahanOrang && validTambahanOrangId) {
        console.log('🔵 Tambahan orang generation not implemented yet...');
        // TODO: Implement when tambahan orang penginapan API is ready
        return;
      } else {
        console.log('❌ No valid ID available for generation', {
          nominatifId,
          tambahanOrangId,
          isTambahanOrang,
          validNominatifId,
          validTambahanOrangId
        });
        return;
      }

      console.log('📥 API Response received:', response);

      if (response && response.success) {
        // Convert API response to form data format
        const formData = penginapanService.apiToFormData(response.data);
        setPenginapanData(formData.malamDetails || []);

        // Update parent form state for compatibility
        updateParentFormState(formData.malamDetails || []);

        console.log(`✅ Berhasil generate ${jumlahMalam} malam penginapan`);
      }
    } catch (error) {
      console.error('❌ Error generating penginapan:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Do NOT retry - just log the error and continue
    } finally {
      // Always clear the generation flag and loading state
      window._penginapanGenerating = false;
      setLoading(false);
    }
  };

  // Clear penginapan data
  const clearPenginapanData = async () => {
    if (!nominatifId && !tambahanOrangId) return;

    setLoading(true);
    try {
      if (penginapanData.length > 0) {
        // Delete existing records
        for (const record of penginapanData) {
          try {
            if (isTambahanOrang) {
              await penginapanService.deletePenginapanTambahanOrang(record.id);
            } else {
              await penginapanService.deletePenginapan(record.id);
            }
          } catch (error) {
            console.error('Error deleting penginapan record:', error);
          }
        }

        setPenginapanData([]);
        updateParentFormState([]);
      }
    } catch (error) {
      console.error('Error clearing penginapan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update parent form state for backward compatibility
  const updateParentFormState = (data) => {
    console.log('🔄 updateParentFormState called with data:', data);

    let totalPagu = 0;
    let totalAktual = 0;
    const malamDetails = [];
    const malamDetailsObject = {};

    data.forEach((item, index) => {
      totalPagu += parseFloat(item.pagu) || 0;
      totalAktual += parseFloat(item.aktual) || 0;

      const malamDetail = {
        malam: item.malam || (index + 1),
        pagu: parseFloat(item.pagu) || 0,
        aktual: parseFloat(item.aktual) || 0,
        lokasi: item.lokasi || '',
        nama_hotel: item.nama_hotel || '',
        keterangan: item.keterangan || ''
      };

      // Add to array for proper storage
      malamDetails.push(malamDetail);

      // Also add to object for backward compatibility
      malamDetailsObject[index] = malamDetail;
    });

    const anggaranRealisasi = totalPagu - totalAktual;

    console.log('📊 Penginapan totals calculated:', {
      totalPagu,
      totalAktual,
      anggaranRealisasi,
      malamCount: data.length,
      malamDetailsArray: malamDetails,
      malamDetailsObject: malamDetailsObject
    });

    // Update parent form state - CRITICAL: Use array format
    onChange('penginapan', {
      menginap: true,
      jumlahMalam: data.length,
      malamDetails: malamDetails
    });

    // Also update individual fields for compatibility
    onChange('penginapan.total', totalPagu);
    onChange('penginapan.totalBiayaAktual', totalAktual);
    onChange('penginapan.anggaranRealisasi', anggaranRealisasi);
    onChange('penginapan.malamDetails', malamDetails);
    onChange('penginapan.jumlahMalam', data.length);
  };

  // Handle per malam input changes
  const handleMalamChange = async (index, field, value) => {
    if (!isEditable || loading) return;

    const updatedData = [...penginapanData];
    if (!updatedData[index]) {
      updatedData[index] = {
        id: null,
        malam: index + 1,
        lokasi: getLokasiForMalam(index + 1),
        pagu: 0,
        aktual: 0,
        nama_hotel: '',
        keterangan: ''
      };
    }

    // Parse currency value
    const numericValue = parseFloat(String(value).replace(/[^\d]/g, '')) || 0;

    if (field === 'pagu') {
      updatedData[index].pagu = numericValue;
    } else if (field === 'biaya_aktual') {
      updatedData[index].aktual = numericValue;
    } else if (field === 'nama_hotel') {
      updatedData[index].nama_hotel = value;
    } else if (field === 'keterangan') {
      updatedData[index].keterangan = value;
    }

    setPenginapanData(updatedData);

    // Update API if record exists, otherwise create new record
    try {
      let response;
      if (isTambahanOrang) {
        if (updatedData[index].id) {
          response = await penginapanService.updatePenginapanTambahanOrang(
            updatedData[index].id,
            updatedData[index]
          );
        } else {
          // Create new record - we need to use the savePenginapan method
          // But first we need to make sure we have the right data structure
          const formData = {
            malamDetails: [updatedData[index]]
          };

          // Validate ID before calling API
          if (!tambahanOrangId || tambahanOrangId === 'null' || tambahanOrangId === null || tambahanOrangId === undefined) {
            console.error('❌ Cannot save penginapan: Invalid tambahanOrangId', { tambahanOrangId });
            // Don't call API if ID is invalid
            return;
          }

          console.log('💾 Saving penginapan with tambahanOrangId:', tambahanOrangId);
          response = await penginapanService.savePenginapanTambahanOrang(tambahanOrangId, formData);
        }
      } else {
        if (updatedData[index].id) {
          response = await penginapanService.updatePenginapan(
            updatedData[index].id,
            updatedData[index]
          );
        } else {
          // Create new record
          const formData = {
            malamDetails: [updatedData[index]]
          };

          // Progressive Save: Handle case when nominatif is not yet saved
          if (!nominatifId || nominatifId === 'null' || nominatifId === null || nominatifId === undefined) {
            console.log('🔄 Progressive Save: Nominatif not yet saved, updating local state only');
            // Don't call API if ID is invalid - this is expected for new records
            // Just update local state without API call - will be saved later
            setPenginapanData(updatedData);
            updateParentFormState(updatedData);
            return;
          }

          console.log('💾 Saving penginapan with nominatifId:', nominatifId);
          response = await penginapanService.savePenginapan(nominatifId, formData);
        }
      }

      if (response && response.success) {
        console.log('✅ Penginapan save/update successful:', response);

        // Update the ID if it was just created
        if (!updatedData[index].id && response.data && response.data.length > 0) {
          updatedData[index].id = response.data[response.data.length - 1].id;
          console.log('🆔 New record ID assigned:', updatedData[index].id);
        }

        // For existing records, update the data from response
        if (updatedData[index].id && response.data) {
          const updatedRecord = response.data.find(item => item.id === updatedData[index].id);
          if (updatedRecord) {
            updatedData[index] = {
              ...updatedData[index],
              nama_hotel: updatedRecord.nama_hotel,
              keterangan: updatedRecord.keterangan,
              pagu: parseFloat(updatedRecord.pagu),
              aktual: parseFloat(updatedRecord.biaya_aktual)
            };
            console.log('🔄 Updated record from response:', updatedRecord);
          }
        }

        setPenginapanData(updatedData);
        updateParentFormState(updatedData);
        console.log('📊 Final penginapanData after save:', updatedData);
      }
    } catch (error) {
      console.error('❌ Error saving/updating penginapan:', error);
      console.log('❌ Gagal save/update data penginapan:', error.message || error);
      // Revert state on error
      setPenginapanData(penginapanData);
    }
  };

  // Get lokasi for specific malam
  const getLokasiForMalam = (malam) => {
    if (!tujuanList || tujuanList.length === 0) {
      return rutePerjalanan?.kota_tujuan || 'Tujuan';
    }

    const tujuanCount = tujuanList.length;

    if (tujuanCount === 1) {
      const tujuan = tujuanList[0];
      // Handle both string and object formats
      if (typeof tujuan === 'string') {
        return tujuan;
      } else if (tujuan && typeof tujuan === 'object') {
        return tujuan.tujuan || tujuan;
      }
      return 'Tujuan';
    }

    // Logic yang benar: Malam 1 -> tujuan pertama, Malam 2 -> tujuan kedua, dst
    if (malam <= tujuanCount) {
      const tujuan = tujuanList[malam - 1];
      // Handle both string and object formats
      if (typeof tujuan === 'string') {
        return tujuan;
      } else if (tujuan && typeof tujuan === 'object') {
        return tujuan.tujuan || tujuan;
      }
      return 'Tujuan';
    }

    // Jika malam lebih banyak dari tujuan, gunakan tujuan terakhir
    const lastTujuan = tujuanList[tujuanCount - 1];
    // Handle both string and object formats
    if (typeof lastTujuan === 'string') {
      return lastTujuan;
    } else if (lastTujuan && typeof lastTujuan === 'object') {
      return lastTujuan.tujuan || lastTujuan;
    }
    return 'Tujuan';
  };

  const handleInputChange = (field, value) => {
    if (field === 'menginap') {
      onChange('penginapan.menginap', value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header dengan informasi rute */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">Map</span>
          <h3 className="text-sm font-semibold text-gray-800">
            Rute: {getRuteDisplayText()} ({jumlahHari} hari)
          </h3>
        </div>
        <p className="text-xs text-gray-600 ml-6">
          {getHariDisplayText()}
        </p>
      </div>

      {/* Penginapan section header */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-800">
          Tentukan kebutuhan penginapan untuk perjalanan dinas
        </h4>

        {/* Lokasi Penginapan Info */}
        {jumlahHari > 1 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
              <span className="text-base">📍</span>
              Penginapan di: {getLokasiPenginapan()}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="text-sm font-medium text-yellow-700 bg-yellow-50 px-3 py-2 rounded">
            Loading...
          </div>
        )}

        {/* Total display */}
        <div className="text-sm font-medium text-gray-700 bg-blue-50 px-3 py-2 rounded">
          Total: {data.menginap ? formatRupiah(data.total || 0) : 'Rp 0'}
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
          {/* Jumlah Malam Info */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah Malam</label>
            <input
              type="text"
              value={Math.max(0, jumlahHari - 1)}
              disabled={true} // Always readonly, auto-calculated
              className="w-full px-4 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-700 text-sm cursor-not-allowed"
              readOnly
            />
          </div>

          {/* Dynamic inputs per malam */}
          {Array.from({ length: Math.max(0, jumlahHari - 1) }, (_, index) => {
            const malamData = penginapanData[index] || {};
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                  Malam {index + 1} - {getLokasiForMalam(index + 1)}
                </h5>

                <div className="grid grid-cols-2 gap-4">
                  {/* Pagu Malam */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Pagu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formatCurrencyInput(malamData.pagu || 0)}
                      onChange={(e) => handleMalamChange(index, 'pagu', e.target.value)}
                      disabled={!isEditable || loading}
                      placeholder="0"
                      className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                    />
                  </div>

                  {/* Biaya Aktual Malam */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Biaya Aktual
                    </label>
                    <input
                      type="text"
                      value={formatCurrencyInput(malamData.aktual || 0)}
                      onChange={(e) => handleMalamChange(index, 'biaya_aktual', e.target.value)}
                      disabled={!isEditable || loading}
                      placeholder="0"
                      className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Additional fields for hotel name and keterangan */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Nama Hotel */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nama Hotel
                    </label>
                    <input
                      type="text"
                      value={malamData.nama_hotel || ''}
                      onChange={(e) => handleMalamChange(index, 'nama_hotel', e.target.value)}
                      disabled={!isEditable || loading}
                      placeholder="Nama hotel (opsional)"
                      className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                    />
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Keterangan
                    </label>
                    <input
                      type="text"
                      value={malamData.keterangan || ''}
                      onChange={(e) => handleMalamChange(index, 'keterangan', e.target.value)}
                      disabled={!isEditable || loading}
                      placeholder="Keterangan (opsional)"
                      className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Subtotal per malam */}
                <div className="mt-2 text-xs text-gray-500">
                  Subtotal: {formatRupiah(malamData.pagu || 0)}
                </div>

                {/* Anggaran Realisasi per malam */}
                <div className="mt-1 text-xs text-gray-500">
                  Selisih: {formatRupiah((malamData.pagu || 0) - (malamData.aktual || 0))}
                </div>
              </div>
            );
          })}
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800">Total Penginapan:</span>
              <span className="text-base font-bold text-blue-900">
                {formatRupiah(penginapanData.reduce((sum, item) => sum + (parseFloat(item.pagu) || 0), 0))}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {Math.max(0, jumlahHari - 1)} malam
            </p>
          </div>

          {/* Anggaran Realisasi */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800">Anggaran Realisasi:</span>
              <span className="text-base font-bold text-green-900">
                {formatRupiah(
              penginapanData.reduce((sum, item) => sum + (parseFloat(item.pagu) || 0), 0) -
              penginapanData.reduce((sum, item) => sum + (parseFloat(item.aktual) || 0), 0)
            )}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Pagu (Rp {formatRupiah(penginapanData.reduce((sum, item) => sum + (parseFloat(item.pagu) || 0), 0)).replace('Rp ', '')}) - Biaya Aktual (Rp {formatRupiah(penginapanData.reduce((sum, item) => sum + (parseFloat(item.aktual) || 0), 0)).replace('Rp ', '')})
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PenginapanSection;