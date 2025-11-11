import api from './api';

export const rutePerjalananService = {
  // Get route by nominatif ID
  getByNominatifId: async (nominatifId) => {
    try {
      const response = await api.get(`/rute-perjalanan/${nominatifId}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data rute perjalanan';
      return { success: false, message };
    }
  },

  // Get formatted route for display
  getFormattedRoute: async (nominatifId) => {
    try {
      const response = await api.get(`/rute-perjalanan/${nominatifId}/formatted`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data rute perjalanan';
      return { success: false, message };
    }
  },

  // Create new route
  create: async (data) => {
    try {
      console.log('🔍 Creating route data:', data);
      const response = await api.post('/rute-perjalanan', data);
      console.log('✅ Route created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error creating route:', error.response?.data);
      const message = error.response?.data?.message || 'Gagal membuat rute perjalanan';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Update existing route
  update: async (id, data) => {
    try {
      console.log('🔍 Updating route data:', data);
      const response = await api.put(`/rute-perjalanan/${id}`, data);
      console.log('✅ Route updated successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error updating route:', error.response?.data);
      const message = error.response?.data?.message || 'Gagal mengupdate rute perjalanan';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Delete route
  delete: async (id) => {
    try {
      await api.delete(`/rute-perjalanan/${id}`);
      return { success: true, message: 'Rute perjalanan berhasil dihapus' };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus rute perjalanan';
      return { success: false, message };
    }
  },

  // Validate route data
  validateRouteData: (data) => {
    const errors = {};

    // Validate total_hari
    if (!data.total_hari || data.total_hari < 1) {
      errors.total_hari = 'Total hari harus minimal 1';
    }

    if (data.total_hari > 365) {
      errors.total_hari = 'Total hari maksimal 365 hari';
    }

    // Validate dates
    if (!data.tanggal_mulai) {
      errors.tanggal_mulai = 'Tanggal mulai harus diisi';
    }

    if (!data.tanggal_selesai) {
      errors.tanggal_selesai = 'Tanggal selesai harus diisi';
    }

    if (data.tanggal_mulai && data.tanggal_selesai) {
      const mulai = new Date(data.tanggal_mulai);
      const selesai = new Date(data.tanggal_selesai);

      if (selesai < mulai) {
        errors.tanggal_selesai = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
      }

      // Check if days match
      if (data.total_hari) {
        const expectedEnd = new Date(mulai);
        expectedEnd.setDate(expectedEnd.getDate() + (data.total_hari - 1));

        if (selesai.toDateString() !== expectedEnd.toDateString()) {
          errors.total_hari = `Total hari ${data.total_hari} tidak sesuai dengan rentang tanggal ${mulai.toLocaleDateString('id-ID')} - ${selesai.toLocaleDateString('id-ID')}`;
        }
      }
    }

    // Validate tujuan_list
    if (!data.tujuan_list || !Array.isArray(data.tujuan_list)) {
      errors.tujuan_list = 'Daftar tujuan harus diisi';
    } else {
      const expectedDestinations = (data.total_hari || 1) - 1;
      const actualDestinations = data.tujuan_list.length;

      if (actualDestinations !== expectedDestinations) {
        errors.tujuan_list = `Jumlah tujuan harus ${expectedDestinations} untuk ${data.total_hari} hari`;
      }

      // Check for empty destinations
      data.tujuan_list.forEach((tujuan, index) => {
        if (!tujuan || tujuan.trim() === '') {
          errors[`tujuan_${index + 1}`] = `Tujuan ke-${index + 1} tidak boleh kosong`;
        }
      });

      // Check for duplicate destinations
      const uniqueDestinations = [...new Set(data.tujuan_list)];
      if (uniqueDestinations.length !== data.tujuan_list.length) {
        errors.tujuan_list = 'Tujuan tidak boleh duplikat';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Generate route destinations based on total days
  generateDestinations: (totalHari, existingDestinations = []) => {
    const jumlahTujuan = totalHari - 1;
    const destinations = Array(jumlahTujuan).fill('');

    // Keep existing values
    for (let i = 0; i < Math.min(existingDestinations.length, jumlahTujuan); i++) {
      destinations[i] = existingDestinations[i];
    }

    return destinations;
  },

  // Format route for display
  formatRouteForDisplay: (routeData) => {
    if (!routeData || !routeData.tujuan_list) {
      return 'Jakarta → Jakarta';
    }

    const route = ['Jakarta'];
    route.push(...routeData.tujuan_list.filter(t => t && t.trim()));
    route.push('Jakarta');

    return route.join(' → ');
  },

  // Calculate trip description
  getTripDescription: (totalHari, destinationCount) => {
    if (totalHari === 1) {
      return 'Pergi-Pulang (1 hari)';
    } else if (destinationCount === 1) {
      return `Jakarta → [1 Tujuan] → Jakarta (${totalHari} hari)`;
    } else {
      return `Jakarta → [${destinationCount} Tujuan] → Jakarta (${totalHari} hari)`;
    }
  }
};