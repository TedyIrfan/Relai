// Column definitions untuk Master RKA (ALL 16 COLUMNS)
export const masterRKAColumns = [
  { key: 'programDukunganManajemen', label: 'Program Dukungan Manajemen', width: '120px' },
  { key: 'kodeProgram', label: 'Kode Program', width: '100px' },
  { key: 'layananUmum', label: 'Layanan Umum', width: '120px' },
  { key: 'kodeLayanan1', label: 'Kode Layanan 1', width: '100px' },
  { key: 'kodeLayanan2', label: 'Kode Layanan 2', width: '100px' },
  { key: 'layananTataUsaha', label: 'Layanan Tata Usaha', width: '180px' },
  { key: 'kategoriAnggaran', label: 'Kategori', width: '80px' },
  { key: 'codeRka', label: 'Code RKA', width: '100px' },
  { key: 'layanan', label: 'Layanan', width: '300px' },
  { key: 'wilayah', label: 'Wilayah', width: '80px' },
  { key: 'artiKode', label: 'Arti Kode', width: '150px' },
  { key: 'sisaPemakaianAnggaran', label: 'Sisa Pemakaian Anggaran', width: '120px' },
  { key: 'status', label: 'Status', width: '80px' },
  { key: 'anggaranPerjalanan', label: 'Anggaran Perjalanan', width: '120px' },
  { key: 'anggaranLayanan', label: 'Anggaran Layanan', width: '120px' },
  { key: 'sbm', label: 'SBM', width: '80px' }
];

// Utility functions
export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getKategoriColor = (kategori) => {
  switch (kategori?.toUpperCase()) {
    case 'A':
      return 'bg-blue-100 text-blue-800';
    case 'B':
      return 'bg-purple-100 text-purple-800';
    case 'C':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getKategoriLabel = (kategori) => {
  switch (kategori?.toUpperCase()) {
    case 'A':
      return 'A - Dinas Pimpinan';
    case 'B':
      return 'B - Pengelolaan Tata Usaha Sekretaris Menko';
    case 'C':
      return 'C - Konferensi Infrastruktur Internasional';
    default:
      return kategori;
  }
};