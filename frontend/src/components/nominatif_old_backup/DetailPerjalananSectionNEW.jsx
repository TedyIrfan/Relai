import React, { useState, useEffect } from 'react';
import { rutePerjalananService } from '../../services/rutePerjalananService';

const DetailPerjalananSectionNEW = ({
  masterNominatifId,
  jumlahHari,
  tanggalPerjalanan,
  onChange,
  isEditable,
  isEditMode = false
}) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load existing route data
  useEffect(() => {
    if (masterNominatifId) {
      loadRouteData();
    }
  }, [masterNominatifId]);

  const loadRouteData = async () => {
    try {
      setLoading(true);
      const response = await rutePerjalananService.getByNominatifId(masterNominatifId);

      if (response.success && response.data.data) {
        const routeData = response.data.data;
        setDestinations(routeData.tujuan_list || []);

        // Update parent component with route data
        if (routeData.tanggal_mulai && routeData.tanggal_selesai) {
          onChange('tanggalPerjalanan', {
            tanggalMulai: routeData.tanggal_mulai,
            tanggalSelesai: routeData.tanggal_selesai
          });
        }
      }
    } catch (error) {
      console.error('Error loading route data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle perubahan tanggal rentang
  const handleTanggalChange = (field, value) => {
    const newTanggal = { ...tanggalPerjalanan, [field]: value };

    // Auto-calculate jumlah hari jika kedua tanggal sudah diisi
    if (newTanggal.tanggalMulai && newTanggal.tanggalSelesai) {
      const mulai = new Date(newTanggal.tanggalMulai);
      const selesai = new Date(newTanggal.tanggalSelesai);
      const diffTime = Math.abs(selesai - mulai);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      onChange('jumlahHari', diffDays);
      onChange('tanggalPerjalanan', newTanggal);

      // Generate destinations automatically
      generateDestinations(diffDays);
    } else {
      onChange('tanggalPerjalanan', newTanggal);
    }
  };

  // Generate destinations based on total days
  const generateDestinations = (totalHari) => {
    const jumlahTujuan = totalHari - 1;
    const newDestinations = Array(jumlahTujuan).fill('');
    setDestinations(newDestinations);
    onChange('destinations', newDestinations);
  };

  // Handle destination change
  const handleDestinationChange = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
    onChange('destinations', newDestinations);

    // Clear errors for this field
    if (errors[`tujuan_${index + 1}`]) {
      const newErrors = { ...errors };
      delete newErrors[`tujuan_${index + 1}`];
      setErrors(newErrors);
    }
  };

  // Save route data
  const saveRouteData = async () => {
    try {
      setLoading(true);

      const routeData = {
        master_nominatif_id: masterNominatifId,
        total_hari: jumlahHari,
        tanggal_mulai: tanggalPerjalanan?.tanggalMulai,
        tanggal_selesai: tanggalPerjalanan?.tanggalSelesai,
        dari: 'Jakarta',
        pulang: 'Jakarta',
        tujuan_list: destinations
      };

      // Validate data
      const validation = rutePerjalananService.validateRouteData(routeData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return false;
      }

      let response;
      if (masterNominatifId && destinations.length > 0) {
        // Try to update existing route
        const existingRoute = await rutePerjalananService.getByNominatifId(masterNominatifId);
        if (existingRoute.success && existingRoute.data.data) {
          response = await rutePerjalananService.update(existingRoute.data.data.id, routeData);
        } else {
          response = await rutePerjalananService.create(routeData);
        }
      } else {
        response = await rutePerjalananService.create(routeData);
      }

      if (response.success) {
        console.log('✅ Route saved successfully:', response.data);
        return true;
      } else {
        setErrors(response.errors || {});
        return false;
      }
    } catch (error) {
      console.error('Error saving route data:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get route description for display
  const getRouteDescription = () => {
    return rutePerjalananService.getTripDescription(jumlahHari, destinations.filter(d => d.trim()).length);
  };

  // Get formatted route for display
  const getFormattedRoute = () => {
    return rutePerjalananService.formatRouteForDisplay({ tujuan_list: destinations });
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
              Tentukan tanggal, tujuan, dan jumlah hari perjalanan dinas
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {jumlahHari ? getRouteDescription() : '-'}
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
            <div className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <span className="text-sm text-gray-700">
                {jumlahHari ? `${jumlahHari} hari` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Destinations Section */}
        {jumlahHari > 0 && (
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Header untuk Detail Perjalanan */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                🗺️
              </div>
              <span className="ml-3 font-semibold text-gray-800 text-lg">
                Daftar Tujuan Perjalanan
              </span>
            </div>

            {/* Dynamic Destination Fields */}
            <div className="space-y-4">
              {(() => {
                const jumlahTujuan = Math.max(0, jumlahHari - 1);
                return Array.from({ length: jumlahTujuan }, (_, index) => {
                  const hasError = errors[`tujuan_${index + 1}`];

                  return (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tujuan {index + 1} {jumlahHari === 1 && '(Pergi-Pulang Hari yang Sama)'}
                      </label>
                      <input
                        type="text"
                        value={destinations[index] || ''}
                        onChange={(e) => handleDestinationChange(index, e.target.value)}
                        disabled={isEditMode || !isEditable}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200 ${
                          hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                        }`}
                        placeholder={`Masukkan kota tujuan ke-${index + 1}`}
                      />
                      {hasError && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors[`tujuan_${index + 1}`]}
                        </p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Visual Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  🗺️ Rute: {getFormattedRoute()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Jakarta → Destinations → Jakarta ({jumlahHari} hari)
                </p>
              </div>
            </div>
          </div>
        )}

        {jumlahHari > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium text-blue-800 text-center">
              🗺️ {getRouteDescription()}
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      {isEditable && !isEditMode && (
        <div className="flex justify-end">
          <button
            onClick={saveRouteData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-200"
          >
            {loading ? 'Menyimpan...' : 'Simpan Rute'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailPerjalananSectionNEW;