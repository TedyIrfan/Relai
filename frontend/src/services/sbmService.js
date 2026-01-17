import api from './api';

// SBM Categories definition
export const SBM_CATEGORIES = {
  // Honorarium 28-39
  honorarium_28: {
    label: 'Honorarium 28 SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI',
    group: 'Honorarium',
    order: 1,
  },
  honorarium_29: {
    label: 'Honorarium 29 SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI',
    group: 'Honorarium',
    order: 2,
  },
  honorarium_30: {
    label: 'Honorarium 30 SATUAN BIAYA PENGINAPAN PERJALANAN DINAS DALAM NEGERI',
    group: 'Honorarium',
    order: 3,
  },
  honorarium_31: {
    label: 'Honorarium 31 SATUAN BIAYA PAKET KEGIATAN RAPAT/PERTEMUAN DI LUAR KANTOR',
    group: 'Honorarium',
    order: 4,
  },
  honorarium_32: {
    label: 'Honorarium 32 SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI',
    group: 'Honorarium',
    order: 5,
  },
  honorarium_33: {
    label: 'Honorarium 33 SATUAN BIAYA OPERASIONAL KEPALA PERWAKILAN RI LUAR NEGERI',
    group: 'Honorarium',
    order: 6,
  },
  honorarium_34: {
    label: 'Honorarium 34 SATUAN BIAYA MAKANAN PENAMBAH DAYA TAHAN TUBUH',
    group: 'Honorarium',
    order: 7,
  },
  honorarium_35: {
    label: 'Honorarium 35 SATUAN BIAYA SEWA KENDARAAN',
    group: 'Honorarium',
    order: 8,
  },
  honorarium_36: {
    label: 'Honorarium 36 SATUAN BIAYA PENGADAAN KENDARAAN DINAS',
    group: 'Honorarium',
    order: 9,
  },
  honorarium_37: {
    label: 'Honorarium 37 SATUAN BIAYA PENGADAAN PAKAIAN DINAS',
    group: 'Honorarium',
    order: 10,
  },
  honorarium_38: {
    label: 'Honorarium 38 SATUAN BIAYA KONSUMSI RAPAT/PERTEMUAN',
    group: 'Honorarium',
    order: 11,
  },
  honorarium_39: {
    label: 'Honorarium 39 SATUAN BIAYA KONSUMSI DIKLAT',
    group: 'Honorarium',
    order: 12,
  },
  // Section 1-19
  transportasi_provinsi: {
    label: 'Section 1 SATUAN BIAYA TRANSPORTASI PROVINSI',
    group: 'Section',
    order: 13,
  },
  transportasi_dki: {
    label: 'Section 2 SATUAN BIAYA TRANSPORTASI DKI JAKARTA',
    group: 'Section',
    order: 14,
  },
  transportasi_kabupaten: {
    label: 'Section 3 SATUAN BIAYA TRANSPORTASI KABUPATEN',
    group: 'Section',
    order: 15,
  },
  pemeliharaan_sarana_kantor: {
    label: 'Section 4 SATUAN BIAYA PEMELIHARAAN SARANA KANTOR',
    group: 'Section',
    order: 16,
  },
  penerjemahan_pengetikan: {
    label: 'Section 5 SATUAN BIAYA PENERJEMAHAN DAN PENGETIKAN',
    group: 'Section',
    order: 17,
  },
  beasiswa: {
    label: 'Section 6 SATUAN BIAYA BEASISWA',
    group: 'Section',
    order: 18,
  },
  sewa_fotokopi: {
    label: 'Section 7 SATUAN BIAYA SEWA FOTOKOPI',
    group: 'Section',
    order: 19,
  },
  honorarium_narasumber: {
    label: 'Section 8 SATUAN BIAYA HONORARIUM NARASUMBER',
    group: 'Section',
    order: 20,
  },
  bahan_makanan: {
    label: 'Section 9 SATUAN BIAYA BAHAN MAKANAN',
    group: 'Section',
    order: 21,
  },
  konsumsi_tahanan: {
    label: 'Section 10 SATUAN BIAYA KONSUMSI TAHANAN',
    group: 'Section',
    order: 22,
  },
  keperluan_perkantoran: {
    label: 'Section 11 SATUAN BIAYA KEPERLUAN PERKANTORAN',
    group: 'Section',
    order: 23,
  },
  penggantian_inventaris: {
    label: 'Section 12 SATUAN BIAYA PENGGANTIAN INVENTARIS',
    group: 'Section',
    order: 24,
  },
  pemeliharaan_kendaraan: {
    label: 'Section 13 SATUAN BIAYA PEMELIHARAAN KENDARAAN',
    group: 'Section',
    order: 25,
  },
  pemeliharaan_gedung: {
    label: 'Section 14 SATUAN BIAYA PEMELIHARAAN GEDUNG',
    group: 'Section',
    order: 26,
  },
  sewa_gedung: {
    label: 'Section 15 SATUAN BIAYA SEWA GEDUNG',
    group: 'Section',
    order: 27,
  },
  transportasi_terminal: {
    label: 'Section 16 SATUAN BIAYA TRANSPORTASI TERMINAL',
    group: 'Section',
    order: 28,
  },
  tiket_pesawat_dalam_negeri: {
    label: 'Section 17 SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS DALAM NEGERI',
    group: 'Section',
    order: 29,
  },
  tiket_pesawat_luar_negeri: {
    label: 'Section 18 SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI',
    group: 'Section',
    order: 30,
  },
  perwakilan_ri: {
    label: 'Section 19 SATUAN BIAYA PERWAKILAN RI LUAR NEGERI',
    group: 'Section',
    order: 31,
  },
};

const sbmService = {
  /**
   * Get all categories with metadata
   */
  getCategories: async () => {
    const response = await api.get('/sbm/categories');
    return response.data;
  },

  /**
   * Get data by category with filters, search, sort, pagination
   */
  getByCategory: async (category, params = {}) => {
    const response = await api.get(`/sbm/${category}`, { params });
    return response.data;
  },

  /**
   * Get ALL data by category without pagination limit
   * Fetches all pages and returns complete dataset
   */
  getAllByCategory: async (category, params = {}) => {
    let allData = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await api.get(`/sbm/${category}`, {
        params: {
          ...params,
          page: page,
          per_page: 100,
        }
      });

      const data = response.data.data || [];
      allData = [...allData, ...data];

      // Check if there's more data
      const meta = response.data.meta || {};
      hasMore = page < meta.last_page;
      page++;
    }

    return {
      success: true,
      data: allData,
      meta: {
        total: allData.length,
        current_page: 1,
        last_page: 1,
        per_page: allData.length
      }
    };
  },

  /**
   * Get all filter options
   */
  getFilterOptions: async () => {
    const response = await api.get('/sbm/filters');
    return response.data;
  },

  /**
   * Get filter options by specific category
   */
  getFilterOptionsByCategory: async (category) => {
    const response = await api.get(`/sbm/filters/${category}`);
    return response.data;
  },

  /**
   * Get summary statistics
   */
  getSummary: async () => {
    const response = await api.get('/sbm/summary');
    return response.data;
  },

  /**
   * Get single record by ID
   */
  getById: async (id) => {
    const response = await api.get(`/sbm/detail/${id}`);
    return response.data;
  },

  /**
   * Search across all Master SBM categories
   * Used by Master SBM Search Popup in Nominatif
   */
  searchMasterSBM: async (query) => {
    const response = await api.get(`/sbm/search`, {
      params: { q: query }
    });
    return response.data;
  },
};

export default sbmService;
