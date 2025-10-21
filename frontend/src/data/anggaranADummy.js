// Dummy data untuk Master RKA (data realistik untuk perjalanan dinas)
export const masterRKAData = [
  {
    id: 1,
    programDukunganManajemen: "132",
    kodeProgram: "1 WA",
    layananUmum: "7394",
    kodeLayanan1: "EBA",
    kodeLayanan2: "962",
    layananTataUsaha: "053",
    kategoriAnggaran: "A",
    codeRka: "524111",
    layanan: "Belanja Perjalanan Dinas Biasa",
    wilayah: "JAWA",
    artiKode: "Belanja Perjalanan Dinas",
    sisaPemakaianAnggaran: 91,
    status: "OK",
    anggaranPerjalanan: 4107000,
    anggaranLayanan: 373737000,
    sbm: "SBM"
  },
  {
    id: 2,
    programDukunganManajemen: "132",
    kodeProgram: "1 WA",
    layananUmum: "7394",
    kodeLayanan1: "EBA",
    kodeLayanan2: "962",
    layananTataUsaha: "053",
    kategoriAnggaran: "B",
    codeRka: "524112",
    layanan: "Belanja Perjalanan Dinas Dalam Luar Negeri",
    wilayah: "LUAR NEGERI",
    artiKode: "Perjalanan Dinas Luar Negeri",
    sisaPemakaianAnggaran: 85,
    status: "OK",
    anggaranPerjalanan: 15000000,
    anggaranLayanan: 250000000,
    sbm: "SBM"
  },
  {
    id: 3,
    programDukunganManajemen: "132",
    kodeProgram: "1 WA",
    layananUmum: "7394",
    kodeLayanan1: "EBA",
    kodeLayanan2: "962",
    layananTataUsaha: "053",
    kategoriAnggaran: "C",
    codeRka: "524113",
    layanan: "Belanja Perjalanan Dinas Rapat Koordinasi",
    wilayah: "DKI JAKARTA",
    artiKode: "Rapat Koordinasi Antar Instansi",
    sisaPemakaianAnggaran: 78,
    status: "OK",
    anggaranPerjalanan: 2500000,
    anggaranLayanan: 100000000,
    sbm: "SBM"
  },
  {
    id: 4,
    programDukunganManajemen: "132",
    kodeProgram: "1 WA",
    layananUmum: "7394",
    kodeLayanan1: "EBA",
    kodeLayanan2: "962",
    layananTataUsaha: "053",
    kategoriAnggaran: "A",
    codeRka: "524114",
    layanan: "Belanja Perjalanan Dinas Monitoring dan Evaluasi",
    wilayah: "SUMATERA",
    artiKode: "Monitoring Proyek Infrastruktur",
    sisaPemakaianAnggaran: 92,
    status: "OK",
    anggaranPerjalanan: 8000000,
    anggaranLayanan: 450000000,
    sbm: "SBM"
  },
  {
    id: 5,
    programDukunganManajemen: "132",
    kodeProgram: "1 WA",
    layananUmum: "7394",
    kodeLayanan1: "EBA",
    kodeLayanan2: "962",
    layananTataUsaha: "053",
    kategoriAnggaran: "B",
    codeRka: "524115",
    layanan: "Belanja Perjalanan Dinas Kunjungan Kerja",
    wilayah: "KALIMANTAN",
    artiKode: "Kunjungan Kerja ke Daerah",
    sisaPemakaianAnggaran: 88,
    status: "OK",
    anggaranPerjalanan: 6500000,
    anggaranLayanan: 320000000,
    sbm: "SBM"
  }
];

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