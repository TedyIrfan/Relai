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
      const response = await api.post('/nominatifs', data);
      return { success: true, data: response.data };
    } catch (error) {
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

    const apiData = {
      rka_detail_id: rkaDetailId,
      deskripsi_perjalanan_dinas: formData.detailPerjalananDinas?.deskripsi || '',
      jumlah_hari: formData.jumlahHari || 1,
      tanggal_mulai: formData.tanggalPerjalanan?.tanggalMulai || new Date().toISOString().split('T')[0],
      tanggal_selesai: formData.tanggalPerjalanan?.tanggalSelesai || new Date().toISOString().split('T')[0],
      rute_perjalanan: formData.rutePerjalanan || [],
      tujuan_list: formData.tujuanList || [], // Fixed: use tujuanList (camelCase) from handleChange
      rute_dari: formData.ruteDari || 'Jakarta', // Fixed: use ruteDari (camelCase)
      rute_pulang: formData.rutePulang || 'Jakarta', // Fixed: use rutePulang (camelCase)
      transport_data: transportData, // New field for separate table
      penginapan: formData.penginapan || { menginap: false },
      uang_harian: formData.uangHarian || { jumlahHari: 0, paguPerHari: 0 },
      uang_representasi: formData.uangRepresentasi || { jumlahHari: 0, paguPerHari: 0 },
      // Critical fix: These fields were being overridden by frontend but need proper defaults
      transportasi_per_hari: formData.transportasiPerHari || [],
    };

    return apiData;
  },

  // Delete all tambahan orang for a nominatif
  deleteTambahanOrang: async (nominatifId) => {
    try {
      const response = await api.delete(`/nominatifs/${nominatifId}/tambahan-orang`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus tambahan orang';
      return { success: false, message };
    }
  },

  // === NEW TAMBAHAN ORANG API METHODS ===

  // Get all tambahan orang for a nominatif
  getTambahanOrang: async (nominatifId) => {
    try {
      const response = await api.get(`/nominatifs/${nominatifId}/tambahan-orang`);
      // Return backend response directly without double-wrapping
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data tambahan orang';
      return { success: false, message };
    }
  },

  // Save/Update single tambahan orang
  saveTambahanOrang: async (nominatifId, tambahanOrangData) => {
    try {
      const response = await api.post(`/nominatifs/${nominatifId}/tambahan-orang`, tambahanOrangData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menyimpan tambahan orang';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Update existing tambahan orang
  updateTambahanOrang: async (tambahanOrangId, tambahanOrangData) => {
    try {
      const response = await api.put(`/nominatifs/tambahan-orang/${tambahanOrangId}`, tambahanOrangData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengupdate tambahan orang';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Delete specific tambahan orang
  deleteTambahanOrangById: async (nominatifId, tambahanOrangId) => {
    try {
      const response = await api.delete(`/nominatifs/${nominatifId}/tambahan-orang/${tambahanOrangId}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus tambahan orang';
      return { success: false, message };
    }
  },

  // Format tambahan orang data for backend (using existing table structure)
  formatTambahanOrangData: (formData) => {
    // Convert frontend structure to backend table structure
    return {
      nama_peserta: formData.nama || '',
      jabatan_peserta: formData.jabatan || '',
      pagu: formData.pagu || 0,
      aktual: formData.aktual || 0,
      anggaran_realisasi: formData.anggaran_realisasi || 0,
      jumlah_hari: formData.jumlahHari || 0,
      tanggal_mulai: formData.tanggalMulai || null,
      tanggal_selesai: formData.tanggalSelesai || null,
      rute_perjalanan: formData.rutePerjalanan || [],
      // Transport data handled separately via API calls
      transportasi_data: formData.transportasiData || [],
      // Individual sections as JSON
      penginapan: formData.penginapan || {},
      uang_harian: formData.uang_harian || {},
      uang_representasi: formData.uang_representasi || {},
    };
  },

  // Calculate total pagu for tambahan orang
  calculateTambahanOrangPagu: (formData) => {
    let total = 0;

    // Transportasi
    if (formData.transportasi_data) {
      formData.transportasi_data.forEach(transport => {
        total += transport.pagu || 0;
      });
    }

    // Penginapan
    if (formData.penginapan?.menginap) {
      total += (formData.penginapan.jumlahMalam || 1) * (formData.penginapan.paguPerMalam || 0);
    }

    // Uang harian
    if (formData.uang_harian?.total) {
      total += formData.uang_harian.total;
    }

    // Uang representasi
    if (formData.uang_representasi?.total) {
      total += formData.uang_representasi.total;
    }

    return total;
  }
};