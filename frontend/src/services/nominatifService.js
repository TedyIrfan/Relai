import api from './api';

export const nominatifService = {
  // Get all nominatifs with pagination and filters
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/nominatifs', { params });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data nominatif';
      return { success: false, message };
    }
  },

  // Get single nominatif by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/nominatifs/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data nominatif';
      return { success: false, message };
    }
  },

  // Create new nominatif
  create: async (data) => {
    try {
      // DEBUG: Log data being sent to backend
      console.log('🔍 FRONTEND DEBUG - Sending data to backend:', data);
      console.log('📝 transport_data field:', data.transport_data);
      console.log('📝 transport_data type:', typeof data.transport_data);
      console.log('📝 transport_data length:', data.transport_data ? data.transport_data.length : 'N/A');

      const response = await api.post('/nominatifs', data);
      console.log('✅ Backend response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Backend error:', error.response?.data);
      const message = error.response?.data?.message || 'Gagal membuat nominatif';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Update existing nominatif
  update: async (id, data) => {
    try {
      const response = await api.put(`/nominatifs/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengupdate nominatif';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Submit nominatif (change status from draft to submitted)
  submit: async (id) => {
    try {
      const response = await api.post(`/nominatifs/${id}/submit`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal submit nominatif';
      return { success: false, message };
    }
  },

  // Delete nominatif (draft only)
  delete: async (id) => {
    try {
      const response = await api.delete(`/nominatifs/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus nominatif';
      return { success: false, message };
    }
  },

  // Get nominatifs by status
  getByStatus: async (status) => {
    try {
      const response = await api.get('/nominatifs', { params: { status } });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data nominatif';
      return { success: false, message };
    }
  },

  // Calculate total pagu from form data
  calculateTotalPagu: (formData) => {
    let total = 0;

    // Calculate from transportasiPerHari (new structure)
    if (formData.transportasiPerHari) {
      formData.transportasiPerHari.forEach(transport => {
        total += (transport.paguTransportasiBerangkat || 0) +
                 (transport.paguTaksiBerangkat || 0) +
                 (transport.paguTransportasiPulang || 0) +
                 (transport.paguTaksiPulang || 0);
      });
    }

    // Calculate from penginapan
    if (formData.penginapan && formData.penginapan.menginap) {
      total += (formData.penginapan.jumlahMalam || 1) * (formData.penginapan.paguPerMalam || 0);
    }

    // Calculate from uang_harian
    if (formData.uang_harian) {
      total += (formData.uang_harian.jumlahHari || 1) * (formData.uang_harian.paguPerHari || 0);
    }

    // Calculate from uang_representasi
    if (formData.uang_representasi) {
      total += (formData.uang_representasi.jumlahHari || 1) * (formData.uang_representasi.paguPerHari || 0);
    }

    return total;
  },

  // Format form data for API submission
  formatFormData: (formData, rkaDetailId) => {
    // Convert transportasiPerHari to transport_data format for backend
    const transportData = [];
    if (formData.transportasiPerHari) {
      formData.transportasiPerHari.forEach(transport => {
        const day = transport.hari;

        // Add transportasi utama pergi (pesawat/kereta/bus dll)
        if (transport.jenisBerangkat && transport.paguTransportasiBerangkat > 0) {
          transportData.push({
            hari: day,
            arah: 'pergi',
            jenis_transportasi: transport.jenisBerangkat,
            pagu: transport.paguTransportasiBerangkat,
            biaya_aktual: transport.biayaAktualTransportasiBerangkat || 0,
            keterangan: `Transportasi ${transport.jenisBerangkat} pergi hari ke-${day}`
          });
        }

        // Add taksi pergi (jika ada)
        if (transport.paguTaksiBerangkat > 0) {
          transportData.push({
            hari: day,
            arah: 'pergi',
            jenis_transportasi: 'taksi',
            pagu: transport.paguTaksiBerangkat,
            biaya_aktual: transport.biayaAktualTaksiBerangkat || 0,
            keterangan: `Transportasi taksi pergi hari ke-${day}`
          });
        }

        // Add transportasi utama pulang (pesawat/kereta/bus dll)
        if (transport.jenisPulang && transport.paguTransportasiPulang > 0) {
          transportData.push({
            hari: day,
            arah: 'pulang',
            jenis_transportasi: transport.jenisPulang,
            pagu: transport.paguTransportasiPulang,
            biaya_aktual: transport.biayaAktualTransportasiPulang || 0,
            keterangan: `Transportasi ${transport.jenisPulang} pulang hari ke-${day}`
          });
        }

        // Add taksi pulang (jika ada)
        if (transport.paguTaksiPulang > 0) {
          transportData.push({
            hari: day,
            arah: 'pulang',
            jenis_transportasi: 'taksi',
            pagu: transport.paguTaksiPulang,
            biaya_aktual: transport.biayaAktualTaksiPulang || 0,
            keterangan: `Transportasi taksi pulang hari ke-${day}`
          });
        }
      });
    }

    return {
      rka_detail_id: rkaDetailId,
      deskripsi_perjalanan_dinas: formData.detailPerjalananDinas?.deskripsi || '',
      jumlah_hari: formData.jumlahHari || 1,
      tanggal_mulai: formData.tanggalMulai || new Date().toISOString().split('T')[0],
      tanggal_selesai: formData.tanggalSelesai || new Date().toISOString().split('T')[0],
      rute_perjalanan: formData.rutePerjalanan || [],
      transport_data: transportData, // New field for separate table
      penginapan: formData.penginapan || { menginap: false },
      uang_harian: formData.uangHarian || { jumlahHari: 0, paguPerHari: 0 },
      uang_representasi: formData.uangRepresentasi || { jumlahHari: 0, paguPerHari: 0 },
    };
  }
};