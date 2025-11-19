import api from './api';

export const nominatifService = {
  // Get all nominatifs with pagination and filters
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/nominatifs-new', { params });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data nominatif';
      return { success: false, message };
    }
  },

  // Get single nominatif by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/nominatifs-new/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data nominatif';
      return { success: false, message };
    }
  },

  // Create new nominatif
  create: async (data) => {
    try {
      const response = await api.post('/nominatifs-new', data);
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
      const response = await api.put(`/nominatifs-new/${id}`, data);
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
      const response = await api.post(`/nominatifs-new/${id}/submit`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal submit nominatif';
      return { success: false, message };
    }
  },

  // Delete nominatif (draft only)
  delete: async (id) => {
    try {
      const response = await api.delete(`/nominatifs-new/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus nominatif';
      return { success: false, message };
    }
  },

  // Get nominatifs by status
  getByStatus: async (status) => {
    try {
      const response = await api.get('/nominatifs-new', { params: { status } });
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
    // Debug: Log penginapan data structure
    console.log('🔍 DEBUG formatFormData - penginapan structure:', {
      'penginapan exists': !!formData.penginapan,
      'penginapan data': formData.penginapan,
      'malamDetails exists': !!(formData.penginapan && formData.penginapan.malamDetails),
      'malamDetails data': formData.penginapan?.malamDetails,
      'malamDetails length': formData.penginapan?.malamDetails?.length
    });

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
      penginapan: formData.penginapan && formData.penginapan.malamDetails && formData.penginapan.malamDetails.length > 0 ? {
        menginap: true, // Force to true if we have malamDetails
        jumlahMalam: formData.penginapan.jumlahMalam || formData.penginapan.malamDetails.length || 0,
        malamDetails: formData.penginapan.malamDetails.map(detail => ({
          malam: detail.malam || 1,
          lokasi: detail.lokasi || '',
          nama_hotel: detail.nama_hotel || null,
          keterangan: detail.keterangan || null,
          pagu: detail.pagu || 0,
          aktual: detail.aktual || 0
        }))
      } : { menginap: false },
      uang_harian: formData.uangHarian || { jumlahHari: 0, paguPerHari: 0 },
      uang_representasi: formData.uangRepresentasi || { jumlahHari: 0, paguPerHari: 0 },
      // Critical fix: These fields were being overridden by frontend but need proper defaults
      transportasi_per_hari: formData.transportasiPerHari || [],
    };

    // Debug: Log final API data
    console.log('🚀 DEBUG: Final API Data being sent:', {
      jumlah_hari: apiData.jumlah_hari,
      original_jumlahHari: formData.jumlahHari,
      full_api_data: apiData
    });

    return apiData;
  },

  // === NEW DETAIL ROWS API METHODS (Replacing Tambahan Orang) ===

  // Get all detail rows (persons) for a nominatif
  getDetailRows: async (nominatifId) => {
    try {
      const response = await api.get(`/nominatifs/${nominatifId}/details`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data detail rows';
      return { success: false, message };
    }
  },

  // Save/Update single detail row (person)
  saveDetailRow: async (nominatifId, detailRowData) => {
    try {
      const response = await api.post(`/nominatifs/${nominatifId}/details`, detailRowData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menyimpan detail row';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Update existing detail row
  updateDetailRow: async (nominatifId, rowId, detailRowData) => {
    try {
      const response = await api.put(`/nominatifs/${nominatifId}/details/${rowId}`, detailRowData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengupdate detail row';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // Delete specific detail row
  deleteDetailRow: async (nominatifId, rowId) => {
    try {
      const response = await api.delete(`/nominatifs/${nominatifId}/details/${rowId}`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menghapus detail row';
      return { success: false, message };
    }
  },

  // Bulk save multiple detail rows
  bulkSaveDetailRows: async (nominatifId, detailRowsData) => {
    try {
      const response = await api.post(`/nominatifs/${nominatifId}/details/bulk`, detailRowsData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menyimpan detail rows';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // === BIAYA ROWS API METHODS (Financial Data) ===

  // Get biaya rows for a detail row
  getBiayaRows: async (detailRowId) => {
    try {
      const response = await api.get(`/nominatifs/details/${detailRowId}/biaya`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengambil data biaya rows';
      return { success: false, message };
    }
  },

  // Save biaya row
  saveBiayaRow: async (detailRowId, biayaData) => {
    try {
      const response = await api.post(`/nominatifs/details/${detailRowId}/biaya`, biayaData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal menyimpan biaya row';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  },

  // === NEW DATA FORMATTING METHODS (for 4-table architecture) ===

  // Format Excel table data for new backend structure
  formatExcelTableData: (rows, rkaDetailId) => {
    // Separate main row and additional rows
    const mainRow = rows.find(row => row.person_type === 'main');
    const additionalRows = rows.filter(row => row.person_type !== 'main');

    // Prepare detail rows (person + route data)
    const detailRows = [];

    // Add main row
    if (mainRow) {
      detailRows.push({
        person_type: 'main',
        nama_lengkap: mainRow.nama_lengkap,
        golongan: mainRow.golongan,
        jabatan: mainRow.jabatan,
        eselon: mainRow.eselon,
        asal: mainRow.asal,
        tujuan: mainRow.tujuan,
        tanggal_pergi: mainRow.tanggal_pergi,
        tanggal_sampai: mainRow.tanggal_sampai,
      });
    }

    // Add additional rows
    additionalRows.forEach(row => {
      detailRows.push({
        person_type: 'tambahan',
        nama_lengkap: row.nama_lengkap,
        golongan: row.golongan,
        jabatan: row.jabatan,
        eselon: row.eselon,
        asal: row.asal,
        tujuan: row.tujuan,
        tanggal_pergi: row.tanggal_pergi,
        tanggal_sampai: row.tanggal_sampai,
      });
    });

    // Prepare biaya rows (financial data) for each person
    const biayaRows = [];

    rows.forEach(row => {
      const biayaData = {
        // Transportasi
        transport_pesawat_non_pp_pagu: parseFloat(row.transport_pesawat_non_pp_pagu) || 0,
        transport_pesawat_non_pp_aktual: parseFloat(row.transport_pesawat_non_pp_aktual) || 0,
        transport_taksi_pagu: parseFloat(row.transport_taksi_pagu) || 0,
        transport_taksi_aktual: parseFloat(row.transport_taksi_aktual) || 0,

        // Penginapan
        penginapan_jumlah_malam: parseInt(row.penginapan_jumlah_malam) || 0,
        penginapan_pagu_perhari: parseFloat(row.penginapan_pagu_perhari) || 0,
        penginapan_aktual_perhari: parseFloat(row.penginapan_aktual_perhari) || 0,

        // Uang Harian Meeting Fullboard
        uang_harian_meeting_fullboard_jumlah_hari: parseInt(row.uang_harian_meeting_fullboard_jumlah_hari) || 0,
        uang_harian_meeting_fullboard_pagu_perhari: parseFloat(row.uang_harian_meeting_fullboard_pagu_perhari) || 0,
        uang_harian_meeting_fullboard_aktual_perhari: parseFloat(row.uang_harian_meeting_fullboard_aktual_perhari) || 0,

        // Uang Harian Meeting Fullday
        uang_harian_meeting_fullday_jumlah_hari: parseInt(row.uang_harian_meeting_fullday_jumlah_hari) || 0,
        uang_harian_meeting_fullday_pagu_perhari: parseFloat(row.uang_harian_meeting_fullday_pagu_perhari) || 0,
        uang_harian_meeting_fullday_aktual_perhari: parseFloat(row.uang_harian_meeting_fullday_aktual_perhari) || 0,

        // Uang Harian Luar Kota
        uang_harian_luar_kota_jumlah_hari: parseInt(row.uang_harian_luar_kota_jumlah_hari) || 0,
        uang_harian_luar_kota_pagu_perhari: parseFloat(row.uang_harian_luar_kota_pagu_perhari) || 0,
        uang_harian_luar_kota_aktual_perhari: parseFloat(row.uang_harian_luar_kota_aktual_perhari) || 0,

        // Uang Harian Dalam Kota
        uang_harian_dalam_kota_jumlah_hari: parseInt(row.uang_harian_dalam_kota_jumlah_hari) || 0,
        uang_harian_dalam_kota_pagu_perhari: parseFloat(row.uang_harian_dalam_kota_pagu_perhari) || 0,
        uang_harian_dalam_kota_aktual_perhari: parseFloat(row.uang_harian_dalam_kota_aktual_perhari) || 0,

        // Representasi Luar Kota
        representasi_luar_kota_jumlah_hari: parseInt(row.representasi_luar_kota_jumlah_hari) || 0,
        representasi_luar_kota_pagu_perhari: parseFloat(row.representasi_luar_kota_pagu_perhari) || 0,
        representasi_luar_kota_aktual_perhari: parseFloat(row.representasi_luar_kota_aktual_perhari) || 0,

        // Representasi Dalam Kota
        representasi_dalam_kota_jumlah_hari: parseInt(row.representasi_dalam_kota_jumlah_hari) || 0,
        representasi_dalam_kota_pagu_perhari: parseFloat(row.representasi_dalam_kota_pagu_perhari) || 0,
        representasi_dalam_kota_aktual_perhari: parseFloat(row.representasi_dalam_kota_aktual_perhari) || 0,
      };

      biayaRows.push(biayaData);
    });

    // Main nominatif data
    const nominatifData = {
      rka_detail_id: rkaDetailId,
      deskripsi_perjalanan_dinas: mainRow?.deskripsi_perjalanan || '',
      jumlah_hari: additionalRows.length + 1, // Total persons
      tanggal_mulai: mainRow?.tanggal_pergi || new Date().toISOString().split('T')[0],
      tanggal_selesai: mainRow?.tanggal_sampai || new Date().toISOString().split('T')[0],
    };

    return {
      nominatif: nominatifData,
      detail_rows: detailRows,
      biaya_rows: biayaRows,
    };
  },

  // Calculate total from Excel table rows
  calculateTotalsFromRows: (rows) => {
    let totalPagu = 0;
    let totalAktual = 0;

    rows.forEach(row => {
      // Transportasi
      totalPagu += (parseFloat(row.transport_pesawat_non_pp_pagu) || 0) + (parseFloat(row.transport_taksi_pagu) || 0);
      totalAktual += (parseFloat(row.transport_pesawat_non_pp_aktual) || 0) + (parseFloat(row.transport_taksi_aktual) || 0);

      // Penginapan
      const penginapanTotal = (parseInt(row.penginapan_jumlah_malam) || 0) * (parseFloat(row.penginapan_pagu_perhari) || 0);
      totalPagu += penginapanTotal;
      totalAktual += (parseInt(row.penginapan_jumlah_malam) || 0) * (parseFloat(row.penginapan_aktual_perhari) || 0);

      // Uang Harian (all types)
      totalPagu += (parseInt(row.uang_harian_meeting_fullboard_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullboard_pagu_perhari) || 0);
      totalAktual += (parseInt(row.uang_harian_meeting_fullboard_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullboard_aktual_perhari) || 0);

      totalPagu += (parseInt(row.uang_harian_meeting_fullday_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullday_pagu_perhari) || 0);
      totalAktual += (parseInt(row.uang_harian_meeting_fullday_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullday_aktual_perhari) || 0);

      totalPagu += (parseInt(row.uang_harian_luar_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_luar_kota_pagu_perhari) || 0);
      totalAktual += (parseInt(row.uang_harian_luar_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_luar_kota_aktual_perhari) || 0);

      totalPagu += (parseInt(row.uang_harian_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_dalam_kota_pagu_perhari) || 0);
      totalAktual += (parseInt(row.uang_harian_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_dalam_kota_aktual_perhari) || 0);

      // Representasi (all types)
      totalPagu += (parseInt(row.representasi_luar_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_luar_kota_pagu_perhari) || 0);
      totalAktual += (parseInt(row.representasi_luar_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_luar_kota_aktual_perhari) || 0);

      totalPagu += (parseInt(row.representasi_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_dalam_kota_pagu_perhari) || 0);
      totalAktual += (parseInt(row.representasi_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_dalam_kota_aktual_perhari) || 0);
    });

    return { totalPagu, totalAktual };
  }
};