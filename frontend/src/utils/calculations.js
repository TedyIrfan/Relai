/**
 * Utility functions for nominatif biaya calculations
 * EXACT SAME LOGIC as backend NominatifBiayaRowController
 */

// Currency formatting for Indonesian Rupiah
export const formatCurrency = (value) => {
  if (!value || value === 0) return 'Rp 0';
  return 'Rp ' + Number(value).toLocaleString('id-ID');
};

// Parse currency input to number
export const parseCurrency = (formattedValue) => {
  if (!formattedValue) return 0;
  return Number(formattedValue.toString().replace(/[^\d]/g, ''));
};

// Format number for display
export const formatNumber = (value) => {
  if (!value || value === 0) return '0';
  return Number(value).toLocaleString('id-ID');
};

// Parse number input
export const parseNumber = (formattedValue) => {
  if (!formattedValue) return 0;
  return Number(formattedValue.toString().replace(/[^\d]/g, ''));
};

/**
 * Calculate nominatif biaya row
 * EXACT SAME LOGIC as NominatifBiayaRowController.php
 * Lines 165-218 in backend
 */
export const calculateNominatifBiayaRow = (rowData) => {
  // Handle null/undefined values
  const safeValue = (value, defaultValue = 0) => {
    return value !== null && value !== undefined ? Number(value) : defaultValue;
  };

  // Penginapan calculation - SAME as backend line 165-168
  const penginapanJumlahMalam = safeValue(rowData.penginapan_jumlah_malam);
  const penginapanPaguPerhari = safeValue(rowData.penginapan_pagu_perhari);
  const penginapanAktualPerhari = safeValue(rowData.penginapan_aktual_perhari);

  const penginapanTotalPagu = penginapanJumlahMalam * penginapanPaguPerhari;
  const penginapanTotalAktual = penginapanJumlahMalam * penginapanAktualPerhari;
  const penginapanAnggaranBerjalan = penginapanTotalPagu - penginapanTotalAktual;

  // Meeting Fullboard calculation - SAME as backend line 170-172
  const meetingFullboardJumlahHari = safeValue(rowData.uang_harian_meeting_fullboard_jumlah_hari);
  const meetingFullboardPaguPerhari = safeValue(rowData.uang_harian_meeting_fullboard_pagu_perhari);
  const meetingFullboardAktualPerhari = safeValue(rowData.uang_harian_meeting_fullboard_aktual_perhari);

  const meetingFullboardTotalPagu = meetingFullboardJumlahHari * meetingFullboardPaguPerhari;
  const meetingFullboardTotalAktual = meetingFullboardJumlahHari * meetingFullboardAktualPerhari;
  const meetingFullboardAnggaranBerjalan = meetingFullboardTotalPagu - meetingFullboardTotalAktual;

  // Meeting Fullday calculation - SAME as backend line 174-176
  const meetingFulldayJumlahHari = safeValue(rowData.uang_harian_meeting_fullday_jumlah_hari);
  const meetingFulldayPaguPerhari = safeValue(rowData.uang_harian_meeting_fullday_pagu_perhari);
  const meetingFulldayAktualPerhari = safeValue(rowData.uang_harian_meeting_fullday_aktual_perhari);

  const meetingFulldayTotalPagu = meetingFulldayJumlahHari * meetingFulldayPaguPerhari;
  const meetingFulldayTotalAktual = meetingFulldayJumlahHari * meetingFulldayAktualPerhari;
  const meetingFulldayAnggaranBerjalan = meetingFulldayTotalPagu - meetingFulldayTotalAktual;

  // Luar Kota calculation - SAME as backend line 178-180
  const luarKotaJumlahHari = safeValue(rowData.uang_harian_luar_kota_jumlah_hari);
  const luarKotaPaguPerhari = safeValue(rowData.uang_harian_luar_kota_pagu_perhari);
  const luarKotaAktualPerhari = safeValue(rowData.uang_harian_luar_kota_aktual_perhari);

  const luarKotaTotalPagu = luarKotaJumlahHari * luarKotaPaguPerhari;
  const luarKotaTotalAktual = luarKotaJumlahHari * luarKotaAktualPerhari;
  const luarKotaAnggaranBerjalan = luarKotaTotalPagu - luarKotaTotalAktual;

  // Dalam Kota calculation - SAME as backend line 182-184
  const dalamKotaJumlahHari = safeValue(rowData.uang_harian_dalam_kota_jumlah_hari);
  const dalamKotaPaguPerhari = safeValue(rowData.uang_harian_dalam_kota_pagu_perhari);
  const dalamKotaAktualPerhari = safeValue(rowData.uang_harian_dalam_kota_aktual_perhari);

  const dalamKotaTotalPagu = dalamKotaJumlahHari * dalamKotaPaguPerhari;
  const dalamKotaTotalAktual = dalamKotaJumlahHari * dalamKotaAktualPerhari;
  const dalamKotaAnggaranBerjalan = dalamKotaTotalPagu - dalamKotaTotalAktual;

  // Representasi Luar Kota calculation - SAME as backend line 186-188
  const representasiLuarKotaJumlahHari = safeValue(rowData.representasi_luar_kota_jumlah_hari);
  const representasiLuarKotaPaguPerhari = safeValue(rowData.representasi_luar_kota_pagu_perhari);
  const representasiLuarKotaAktualPerhari = safeValue(rowData.representasi_luar_kota_aktual_perhari);

  const representasiLuarKotaTotalPagu = representasiLuarKotaJumlahHari * representasiLuarKotaPaguPerhari;
  const representasiLuarKotaTotalAktual = representasiLuarKotaJumlahHari * representasiLuarKotaAktualPerhari;
  const representasiLuarKotaAnggaranBerjalan = representasiLuarKotaTotalPagu - representasiLuarKotaTotalAktual;

  // Representasi Dalam Kota calculation - SAME as backend line 190-192
  const representasiDalamKotaJumlahHari = safeValue(rowData.representasi_dalam_kota_jumlah_hari);
  const representasiDalamKotaPaguPerhari = safeValue(rowData.representasi_dalam_kota_pagu_perhari);
  const representasiDalamKotaAktualPerhari = safeValue(rowData.representasi_dalam_kota_aktual_perhari);

  const representasiDalamKotaTotalPagu = representasiDalamKotaJumlahHari * representasiDalamKotaPaguPerhari;
  const representasiDalamKotaTotalAktual = representasiDalamKotaJumlahHari * representasiDalamKotaAktualPerhari;
  const representasiDalamKotaAnggaranBerjalan = representasiDalamKotaTotalPagu - representasiDalamKotaTotalAktual;

  // Grand Totals - SAME as backend line 195-216
  const transportPesawatNonPpPagu = safeValue(rowData.transport_pesawat_non_pp_pagu);
  const transportTaksiPagu = safeValue(rowData.transport_taksi_pagu);
  const transportPesawatNonPpAktual = safeValue(rowData.transport_pesawat_non_pp_aktual);
  const transportTaksiAktual = safeValue(rowData.transport_taksi_aktual);

  const totalPagu =
    transportPesawatNonPpPagu +
    transportTaksiPagu +
    penginapanTotalPagu +
    meetingFullboardTotalPagu +
    meetingFulldayTotalPagu +
    luarKotaTotalPagu +
    dalamKotaTotalPagu +
    representasiLuarKotaTotalPagu +
    representasiDalamKotaTotalPagu;

  const totalAktual =
    transportPesawatNonPpAktual +
    transportTaksiAktual +
    penginapanTotalAktual +
    meetingFullboardTotalAktual +
    meetingFulldayTotalAktual +
    luarKotaTotalAktual +
    dalamKotaTotalAktual +
    representasiLuarKotaTotalAktual +
    representasiDalamKotaTotalAktual;

  const totalAnggaranBerjalan = totalPagu - totalAktual;

  return {
    ...rowData,
    // Penginapan totals - SAME as backend update logic
    penginapan_total_pagu: penginapanTotalPagu,
    penginapan_total_aktual: penginapanTotalAktual,
    penginapan_anggaran_berjalan: penginapanAnggaranBerjalan,

    // Meeting Fullboard totals
    uang_harian_meeting_fullboard_total_pagu: meetingFullboardTotalPagu,
    uang_harian_meeting_fullboard_total_aktual: meetingFullboardTotalAktual,
    uang_harian_meeting_fullboard_anggaran_berjalan: meetingFullboardAnggaranBerjalan,

    // Meeting Fullday totals
    uang_harian_meeting_fullday_total_pagu: meetingFulldayTotalPagu,
    uang_harian_meeting_fullday_total_aktual: meetingFulldayTotalAktual,
    uang_harian_meeting_fullday_anggaran_berjalan: meetingFulldayAnggaranBerjalan,

    // Luar Kota totals
    uang_harian_luar_kota_total_pagu: luarKotaTotalPagu,
    uang_harian_luar_kota_total_aktual: luarKotaTotalAktual,
    uang_harian_luar_kota_anggaran_berjalan: luarKotaAnggaranBerjalan,

    // Dalam Kota totals
    uang_harian_dalam_kota_total_pagu: dalamKotaTotalPagu,
    uang_harian_dalam_kota_total_aktual: dalamKotaTotalAktual,
    uang_harian_dalam_kota_anggaran_berjalan: dalamKotaAnggaranBerjalan,

    // Representasi Luar Kota totals
    representasi_luar_kota_total_pagu: representasiLuarKotaTotalPagu,
    representasi_luar_kota_total_aktual: representasiLuarKotaTotalAktual,
    representasi_luar_kota_anggaran_berjalan: representasiLuarKotaAnggaranBerjalan,

    // Representasi Dalam Kota totals
    representasi_dalam_kota_total_pagu: representasiDalamKotaTotalPagu,
    representasi_dalam_kota_total_aktual: representasiDalamKotaTotalAktual,
    representasi_dalam_kota_anggaran_berjalan: representasiDalamKotaAnggaranBerjalan,

    // Grand totals - SAME as backend line 218
    total_pagu_row: totalPagu,
    total_aktual_row: totalAktual,
    total_anggaran_berjalan_row: totalAnggaranBerjalan,
  };
};

/**
 * Get budget status based on anggaran berjalan
 */
export const getBudgetStatus = (anggaranBerjalan) => {
  if (anggaranBerjalan < 0) return { status: 'over', color: 'text-red-600', bgColor: 'bg-red-50', label: 'Over Budget' };
  if (anggaranBerjalan === 0) return { status: 'exact', color: 'text-green-600', bgColor: 'bg-green-50', label: 'Exact Budget' };
  return { status: 'under', color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Under Budget' };
};

/**
 * Validation rules for input fields
 */
export const validateInput = (field, value, type = 'number') => {
  const numValue = Number(value);

  if (type === 'number') {
    if (isNaN(numValue)) return { isValid: false, message: 'Must be a valid number' };
    if (numValue < 0) return { isValid: false, message: 'Cannot be negative' };

    // Field-specific validations
    if (field.includes('jumlah_hari') && numValue > 365) {
      return { isValid: false, message: 'Maximum 365 days' };
    }

    if (field.includes('perhari') && numValue > 10000000) {
      return { isValid: false, message: 'Maximum 10,000,000 per day' };
    }
  }

  return { isValid: true, message: '' };
};

/**
 * Export utility for debugging
 */
export const debugCalculations = (rowData) => {
  const calculated = calculateNominatifBiayaRow(rowData);
  console.group('🧮 Nominatif Calculations Debug');
  console.log('Original Data:', rowData);
  console.log('Calculated Data:', calculated);
  console.log('Total Pagu:', calculated.total_pagu_row);
  console.log('Total Aktual:', calculated.total_aktual_row);
  console.log('Total Anggaran Berjalan:', calculated.total_anggaran_berjalan_row);
  console.groupEnd();
  return calculated;
};