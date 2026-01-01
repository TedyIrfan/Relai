import api from './api';

// SBM Categories definition
export const SBM_CATEGORIES = {
  // Honorarium 28-39
  honorarium_28: {
    label: 'H28 - Uang Harian & Representasi Perjalanan Dinas Dalam Negeri',
    group: 'Honorarium',
    order: 1,
  },
  honorarium_29: {
    label: 'H29 - Uang Harian Perjalanan Dinas Luar Negeri',
    group: 'Honorarium',
    order: 2,
  },
  honorarium_30: {
    label: 'H30 - Penginapan Perjalanan Dinas Dalam Negeri',
    group: 'Honorarium',
    order: 3,
  },
  honorarium_31: {
    label: 'H31 - Rapat/Pertemuan di Luar Kantor',
    group: 'Honorarium',
    order: 4,
  },
  honorarium_32: {
    label: 'H32 - Tiket Perjalanan Dinas Pindah Luar Negeri',
    group: 'Honorarium',
    order: 5,
  },
  honorarium_33: {
    label: 'H33 - Operasional Kepala Perwakilan RI Luar Negeri',
    group: 'Honorarium',
    order: 6,
  },
  honorarium_34: {
    label: 'H34 - Makanan Penambah Daya Tahan Tubuh',
    group: 'Honorarium',
    order: 7,
  },
  honorarium_35: {
    label: 'H35 - Sewa Kendaraan',
    group: 'Honorarium',
    order: 8,
  },
  honorarium_36: {
    label: 'H36 - Pengadaan Kendaraan Dinas',
    group: 'Honorarium',
    order: 9,
  },
  honorarium_37: {
    label: 'H37 - Pengadaan Pakaian Dinas',
    group: 'Honorarium',
    order: 10,
  },
  honorarium_38: {
    label: 'H38 - Konsumsi Rapat/Pertemuan',
    group: 'Honorarium',
    order: 11,
  },
  honorarium_39: {
    label: 'H39 - Konsumsi Diklat',
    group: 'Honorarium',
    order: 12,
  },
  // Section 1-19
  transportasi_provinsi: {
    label: 'Transportasi Provinsi',
    group: 'Section',
    order: 13,
  },
  transportasi_dki: {
    label: 'Transportasi DKI Jakarta',
    group: 'Section',
    order: 14,
  },
  transportasi_kabupaten: {
    label: 'Transportasi Kabupaten',
    group: 'Section',
    order: 15,
  },
  pemeliharaan_sarana_kantor: {
    label: 'Pemeliharaan Sarana Kantor',
    group: 'Section',
    order: 16,
  },
  penerjemahan_pengetikan: {
    label: 'Penerjemahan & Pengetikan',
    group: 'Section',
    order: 17,
  },
  beasiswa: {
    label: 'Beasiswa',
    group: 'Section',
    order: 18,
  },
  sewa_fotokopi: {
    label: 'Sewa Fotokopi',
    group: 'Section',
    order: 19,
  },
  honorarium_narasumber: {
    label: 'Honorarium Narasumber',
    group: 'Section',
    order: 20,
  },
  bahan_makanan: {
    label: 'Bahan Makanan',
    group: 'Section',
    order: 21,
  },
  konsumsi_tahanan: {
    label: 'Konsumsi Tahanan',
    group: 'Section',
    order: 22,
  },
  keperluan_perkantoran: {
    label: 'Keperluan Perkantoran',
    group: 'Section',
    order: 23,
  },
  penggantian_inventaris: {
    label: 'Penggantian Inventaris',
    group: 'Section',
    order: 24,
  },
  pemeliharaan_kendaraan: {
    label: 'Pemeliharaan Kendaraan',
    group: 'Section',
    order: 25,
  },
  pemeliharaan_gedung: {
    label: 'Pemeliharaan Gedung',
    group: 'Section',
    order: 26,
  },
  sewa_gedung: {
    label: 'Sewa Gedung',
    group: 'Section',
    order: 27,
  },
  transportasi_terminal: {
    label: 'Transportasi Terminal',
    group: 'Section',
    order: 28,
  },
  tiket_pesawat_dalam_negeri: {
    label: 'Tiket Pesawat Dalam Negeri',
    group: 'Section',
    order: 29,
  },
  tiket_pesawat_luar_negeri: {
    label: 'Tiket Pesawat Luar Negeri',
    group: 'Section',
    order: 30,
  },
  perwakilan_ri: {
    label: 'Perwakilan RI Luar Negeri',
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
};

export default sbmService;
