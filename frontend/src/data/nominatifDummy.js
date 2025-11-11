// Dummy data untuk Nominatif Entry System
import { masterRKAData } from './anggaranADummy.js';

// Filter Master RKA untuk kode anggaran perjalanan dinas (fallback data)
export const kodeAnggaranOptions = masterRKAData
  .filter(item =>
    item.layanan.toLowerCase().includes('perjalanan') ||
    item.layanan.toLowerCase().includes('dinas') ||
    item.artiKode.toLowerCase().includes('perjalanan') ||
    item.artiKode.toLowerCase().includes('dinas')
  )
  .map(item => ({
    value: item.codeRka,
    label: `${item.codeRka} + ${item.artiKode}`,
    kategori: item.kategoriAnggaran,
    layanan: item.layanan,
    wilayah: item.wilayah,
    artiKode: item.artiKode,
    codeRka: item.codeRka
  }));

// Fallback function jika API gagal
export const getFallbackKodeAnggaranOptions = () => {
  return kodeAnggaranOptions;
};

// Initial state untuk form nominatif
export const initialNominatifData = {
  // Section 1: Detail Perjalanan Dinas
  detailPerjalananDinas: {
    deskripsi: ''
  },

  // Section 2: Kode Anggaran
  kodeAnggaranRKA: '',

  // Section 3: Perjalanan
  jumlahHari: 0,
  rutePerjalanan: [],
  tanggalPerjalanan: {
    tanggalMulai: '',
    tanggalSelesai: ''
  },
  tujuanList: [], // New: JSON array format for tujuan_list database field
  ruteDari: 'Jakarta', // New: Route origin
  rutePulang: 'Jakarta', // New: Route destination

  // Section 4-5: Transportasi Per Hari
  transportasiPerHari: [
    {
      hari: 1,
      jenisBerangkat: '',
      paguTransportasiBerangkat: 0,
      paguTaksiBerangkat: 0,
      biayaAktualTransportasiBerangkat: 0,
      biayaAktualTaksiBerangkat: 0,
      subtotalBerangkat: 0,
      jenisPulang: '',
      paguTransportasiPulang: 0,
      paguTaksiPulang: 0,
      biayaAktualTransportasiPulang: 0,
      biayaAktualTaksiPulang: 0,
      subtotalPulang: 0,
      totalHari: 0
    }
  ],

  // Section 6: Penginapan
  penginapan: {
    menginap: false,
    jumlahMalam: 1,
    paguPerMalam: 0,
    biayaAktualPerMalam: 0,
    total: 0
  },

  // Section 7: Uang Harian
  uangHarian: {
    jumlahHari: 0,
    paguPerHari: 0,
    total: 0
  },

  // Section 8: Uang Representasi
  uangRepresentasi: {
    jumlahHari: 0,
    paguPerHari: 0,
    total: 0
  },

  // Ringkasan
  totalPagu: 0,
  status: 'draft',
  isEditable: true
};

// Dummy saved drafts untuk testing
export const dummyDrafts = [
  {
    id: 1,
    ...initialNominatifData,
    deskripsiTugas: 'Rapat koordinasi dengan Pemda Jabar terkait proyek infrastruktur',
    kodeAnggaranRKA: '524111',
    tujuan: 'Bandung',
    status: 'draft',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: 2,
    ...initialNominatifData,
    deskripsiTugas: 'Monitoring pembangunan jalan tol di Surabaya',
    kodeAnggaranRKA: '524112',
    tujuan: 'Surabaya',
    status: 'draft',
    createdAt: '2025-01-14T14:20:00Z'
  }
];

// Dummy submitted nominatifs untuk testing
export const dummySubmittedNominatifs = [
  {
    id: 3,
    deskripsiTugas: 'Kunjungan kerja ke Balikpapan untuk tinjauan pelabuhan',
    kodeAnggaranRKA: '524111',
    asal: 'Jakarta',
    tujuan: 'Balikpapan',
    tanggalPergi: '2025-01-10',
    tanggalPulang: '2025-01-12',
    transportasiBerangkat: {
      jenis: 'Pesawat',
      paguTransportasi: 1500000,
      paguTaksi: 100000,
      subtotal: 1600000
    },
    transportasiPulang: {
      jenis: 'Pesawat',
      paguTransportasi: 1500000,
      paguTaksi: 100000,
      subtotal: 1600000
    },
    penginapan: {
      menginap: true,
      jumlahMalam: 2,
      paguPerMalam: 800000,
      total: 1600000
    },
    uangHarian: {
      jumlahHari: 3,
      paguPerHari: 600000,
      total: 1800000
    },
    uangRepresentasi: {
      jumlahHari: 3,
      paguPerHari: 150000,
      total: 450000
    },
    totalPagu: 7050000,
    status: 'submitted',
    isEditable: false,
    submittedAt: '2025-01-09T16:45:00Z'
  }
];