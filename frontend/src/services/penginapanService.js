import api from './api';

export const penginapanService = {
  // Get penginapan data by master nominatif
  getPenginapan: async (nominatifId) => {
    try {
      const response = await api.get(`/nominatifs/${nominatifId}/penginapan`);
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data penginapan';
      return { success: false, message };
    }
  },

  // Save or update penginapan for nominatif
  savePenginapan: async (nominatifId, penginapanData) => {
    try {
      // Convert form data to API format for each malam detail
      const apiData = penginapanData.malamDetails.map(detail => ({
        malam: detail.malam,
        lokasi_penginapan: detail.lokasi || '',
        nama_hotel: detail.nama_hotel || '',
        keterangan: detail.keterangan || '',
        pagu: detail.pagu || 0,
        biaya_aktual: detail.aktual || 0
      }));

      const response = await api.post(`/nominatifs/${nominatifId}/penginapan`, { penginapanData: apiData });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menyimpan penginapan';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Update existing penginapan
  updatePenginapan: async (penginapanId, penginapanData) => {
    try {
      // Convert form data to API format
      const apiData = {
        malam: penginapanData.malam,
        lokasi_penginapan: penginapanData.lokasi || '',
        nama_hotel: penginapanData.nama_hotel || '',
        keterangan: penginapanData.keterangan || '',
        pagu: penginapanData.pagu || 0,
        biaya_aktual: penginapanData.aktual || 0
      };

      console.log('🔄 Updating penginapan:', { penginapanId, apiData });
      const response = await api.put(`/nominatifs/penginapan/${penginapanId}`, apiData);
      console.log('✅ Update successful:', response.data);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ Update error:', error.response?.data || error);
      const message = error.response?.data?.message || 'Gagal mengupdate penginapan';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Delete penginapan
  deletePenginapan: async (penginapanId) => {
    try {
      const response = await api.delete(`/nominatifs/penginapan/${penginapanId}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus penginapan';
      return { success: false, message };
    }
  },

  // Auto-generate penginapan from rute perjalanan
  generateFromRute: async (nominatifId, ruteData, defaultPagu = 800000) => {
    try {
      const response = await api.post(`/nominatifs/${nominatifId}/penginapan/generate`, {
        rute_perjalanan: ruteData, // Backend expects rute_perjalanan wrapper
        default_pagu_per_malam: defaultPagu
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal generate penginapan dari rute';
      return { success: false, message };
    }
  },

  // Legacy methods for backward compatibility - DISABLED to prevent 500 errors
  // These endpoints don't exist in the current API routes
  /*
  getByLocation: async (lokasi) => {
    try {
      const response = await api.get('/penginapan', { params: { lokasi } });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data penginapan';
      return { success: false, message };
    }
  },

  // Get standard pagu per malam by location
  getPaguByLocation: async (lokasi) => {
    try {
      const response = await api.get('/penginapan/pagu', { params: { lokasi } });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data pagu penginapan';
      return { success: false, message };
    }
  },

  // Get all available penginapan locations
  getLocations: async () => {
    try {
      const response = await api.get('/penginapan/locations');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data lokasi penginapan';
      return { success: false, message };
    }
  },
  */

  // Calculate penginapan cost
  calculateCost: (jumlahMalam, paguPerMalam) => {
    const total = jumlahMalam * paguPerMalam;
    return {
      jumlahMalam,
      paguPerMalam,
      total
    };
  },

  // Format penginapan data for form (legacy compatibility)
  formatPenginapanData: (penginapanData) => {
    return {
      menginap: penginapanData?.menginap || false,
      jumlahMalam: penginapanData?.jumlahMalam || 1,
      paguPerMalam: penginapanData?.paguPerMalam || 0,
      biayaAktualPerMalam: penginapanData?.biayaAktualPerMalam || 0,
      total: penginapanData?.total || 0,
      malamDetails: penginapanData?.malamDetails || []
    };
  },

  // Convert API response to form data format
  apiToFormData: (apiData) => {
    return {
      menginap: true,
      jumlahMalam: apiData?.length || 0,
      malamDetails: apiData?.map(item => ({
        malam: item.malam,
        lokasi: item.lokasi_penginapan,
        pagu: item.pagu,
        aktual: item.biaya_aktual,
        nama_hotel: item.nama_hotel,
        keterangan: item.keterangan,
        id: item.id
      })) || []
    };
  },

  // Convert form data to API request format
  formDataToApi: (formData, malamIndex) => {
    const malamData = formData.malamDetails?.[malamIndex];
    if (!malamData) return null;

    return {
      malam: malamData.malam,
      lokasi_penginapan: malamData.lokasi || '',
      pagu: malamData.pagu || 0,
      biaya_aktual: malamData.aktual || 0,
      nama_hotel: malamData.nama_hotel || '',
      keterangan: malamData.keterangan || ''
    };
  },

  // Default pagu values by city type
  getDefaultPagu: (kota) => {
    const defaults = {
      'Jakarta': 900000,
      'Surabaya': 850000,
      'Bandung': 800000,
      'Medan': 750000,
      'Semarang': 700000,
      'Makassar': 650000,
      'Denpasar': 600000,
      'Palembang': 550000,
      'Tangerang': 500000,
      'Depok': 450000,
      'Bekasi': 400000,
      'Bogor': 350000,
      'Batam': 300000,
      'Pekanbaru': 280000,
      'Bandar Lampung': 250000,
      'Malang': 220000,
      'Yogyakarta': 200000,
      'Samarinda': 180000,
      'Pontianak': 150000,
      'Manado': 120000,
      'Mataram': 100000,
      'Kupang': 80000,
      'Jayapura': 70000,
      'Ambon': 60000,
      'Ternate': 50000,
      'Kendari': 40000,
      'Sorong': 30000,
      'default': 500000
    };

    return defaults[kota] || defaults['default'];
  },

  // Helper methods for specific use cases (tambahan orang)
  getPenginapanTambahanOrang: async (tambahanOrangId) => {
    // TODO: Implement when tambahan orang penginapan API is ready
    console.warn('getPenginapanTambahanOrang not implemented yet');
    return { success: false, message: 'Not implemented' };
  },

  updatePenginapanTambahanOrang: async (tambahanOrangId, penginapanData) => {
    // TODO: Implement when tambahan orang penginapan API is ready
    console.warn('updatePenginapanTambahanOrang not implemented yet');
    return { success: false, message: 'Not implemented' };
  },

  savePenginapanTambahanOrang: async (tambahanOrangId, penginapanData) => {
    // TODO: Implement when tambahan orang penginapan API is ready
    console.warn('savePenginapanTambahanOrang not implemented yet');
    return { success: false, message: 'Not implemented' };
  }
};

export default penginapanService;