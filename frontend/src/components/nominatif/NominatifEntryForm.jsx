import React, { useState, useEffect } from 'react';
import { initialNominatifData } from '../../data/nominatifDummy.js';
import { nominatifService } from '../../services/nominatifService.js';
import { authService } from '../../services/authService.js';
import useNotification from '../../hooks/useNotification.js';
import DetailPerjalananDinasSection from './DetailPerjalananDinasSection.jsx';
import KodeAnggaranSection from './KodeAnggaranSection.jsx';
import DetailPerjalananSection from './DetailPerjalananSection.jsx';
import TransportasiPergiSection from './TransportasiPergiSection.jsx';
import TransportasiPulangSection from './TransportasiPulangSection.jsx';
import PenginapanSection from './PenginapanSection.jsx';
import UangHarianSection from './UangHarianSection.jsx';
import UangRepresentasiSection from './UangRepresentasiSection.jsx';
import RingkasanTotalSection from './RingkasanTotalSection.jsx';

const NominatifEntryForm = ({ editId, onCancel }) => {
  const [formData, setFormData] = useState(initialNominatifData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [nominatifId, setNominatifId] = useState(null); // Store current nominatif ID
  const notification = useNotification();
  const [isNewRecord, setIsNewRecord] = useState(true); // Track if this is new or existing record
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're in edit mode

  const isEditable = formData.isEditable; // Get editable status from form data

  // Check authentication on mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      alert('Anda harus login terlebih dahulu');
      window.location.href = '/login';
      return;
    }

    // Check if editing existing nominatif (from prop or URL)
    const nominatifIdToEdit = editId || new URLSearchParams(window.location.search).get('id');

    if (nominatifIdToEdit) {
      setIsEditMode(true);
      loadExistingNominatif(nominatifIdToEdit);
    }
  }, [editId]);

  // Load existing nominatif data
  const loadExistingNominatif = async (id) => {
    try {
      setLoading(true);
      const response = await nominatifService.getById(id);

      if (response.success) {
        // Handle both response formats: response.data.data or response.data
        const nominatifData = response.data.data || response.data;

        
        // Map API data to form structure
        setFormData({
          // Basic fields
          status: nominatifData.status,
          isEditable: nominatifData.is_editable,

          // Detail Perjalanan Dinas
          detailPerjalananDinas: {
            deskripsi: nominatifData.deskripsi_perjalanan_dinas || ''
          },

          // Dates and duration
          jumlahHari: nominatifData.jumlah_hari || 0,
          tanggalMulai: nominatifData.tanggal_mulai?.split('T')[0] || '',
          tanggalSelesai: nominatifData.tanggal_selesai?.split('T')[0] || '',

          // RKA data - load from relationship
          kodeAnggaranRKA: nominatifData.rka_detail ? {
            id: nominatifData.rka_detail.id,
            kode: nominatifData.rka_detail.code_rka,
            value: nominatifData.rka_detail.code_rka, // Add value field for dropdown compatibility
            layanan: nominatifData.rka_detail.layanan,
            wilayah: nominatifData.rka_detail.wilayah, // Add wilayah field
            anggaranLayanan: nominatifData.rka_detail.anggaran_layanan,
            kategoriAnggaran: nominatifData.rka_detail.kategori_anggaran
          } : null,

          // Complex nested data
          rutePerjalanan: nominatifData.rute_perjalanan || [],
          transportasiPerHari: nominatifData.transportasi_per_hari || [],
          penginapan: nominatifData.penginapan || { menginap: false },
          uangHarian: nominatifData.uang_harian || { jumlahHari: 0, paguPerHari: 0 },
          uangRepresentasi: nominatifData.uang_representasi || { jumlahHari: 0, paguPerHari: 0 },

  
          // Totals
          totalPagu: nominatifData.total_pagu || 0,
          totalBiayaAktual: nominatifData.total_biaya_aktual || 0,
          totalAnggaranRealisasi: nominatifData.total_anggaran_realisasi || 0,
        });

        setNominatifId(id);
        setIsNewRecord(false);

        // For edit mode, start at page 2 since page 1 data is already filled
        if (nominatifData.status === 'draft' && nominatifData.rka_detail) {
          setCurrentPage(2);
        } else {
          // For new records, stay on page 1
          setCurrentPage(1);
        }
      }
    } catch (error) {
      console.error('Error loading nominatif:', error);
      alert('Gagal memuat data nominatif');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field, value) => {
    // Debug: Log field changes for kodeAnggaranRKA
    if (field === 'kodeAnggaranRKA') {
      console.log('handleChange - kodeAnggaranRKA changed to:', value);
    }

    setFormData(prev => {
      // Handle nested object updates
      if (field.includes('.')) {
        const [section, subfield] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subfield]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Validation functions
  const validateSave = () => {
    // Minimal validation for save
    if (!formData.detailPerjalananDinas?.deskripsi?.trim()) {
      return 'Deskripsi perjalanan dinas harus diisi untuk menyimpan draft.';
    }
    return null;
  };

  
  const validateSubmit = () => {
    // Strict validation for submit
    const errors = [];

    if (!formData.detailPerjalananDinas?.deskripsi?.trim()) {
      errors.push('Deskripsi perjalanan dinas harus diisi');
    }
    if (!formData.kodeAnggaranRKA) {
      errors.push('Kode anggaran RKA harus dipilih');
    }

    // Validate rute perjalanan
    if (!formData.rutePerjalanan || formData.rutePerjalanan.length === 0) {
      errors.push('Rute perjalanan harus diisi');
    } else {
      formData.rutePerjalanan.forEach((rute, index) => {
        if (!rute.dari.trim()) {
          errors.push(`Lokasi "dari" untuk hari ke-${rute.hari} harus diisi`);
        }
        if (!rute.ke.trim()) {
          errors.push(`Lokasi "ke" untuk hari ke-${rute.hari} harus diisi`);
        }
        if (!rute.tanggal) {
          errors.push(`Tanggal untuk hari ke-${rute.hari} harus diisi`);
        }
      });
    }

    if (!formData.jumlahHari) {
      errors.push('Lama dinas harus diisi');
    }

    return errors.length > 0 ? errors.join(', ') + '.' : null;
  };

  const handleSave = async () => {
    const error = validateSave();
    if (error) {
      notification.error('Validasi Gagal', error);
      return;
    }

    // Debug: Log current formData structure
    console.log('Current formData.kodeAnggaranRKA:', formData.kodeAnggaranRKA);

    // Check if RKA is selected - check for object with ID
    if (!formData.kodeAnggaranRKA || !formData.kodeAnggaranRKA.id) {
      notification.error('Kode Anggaran Diperlukan', 'Kode anggaran harus dipilih terlebih dahulu sebelum menyimpan draft.');
      return;
    }

    // Check if anggaran is available
    if (formData.kodeAnggaranRKA.anggaranAvailable <= 0) {
      notification.error('Anggaran Tidak Tersedia', 'Anggaran untuk kode anggaran yang dipilih tidak tersedia atau sudah habis. Silakan pilih kode anggaran lain.');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const rkaId = formData.kodeAnggaranRKA.id;
      const apiData = nominatifService.formatFormData(formData, rkaId);

      let response;
      if (isNewRecord) {
        // Create new nominatif
        response = await nominatifService.create(apiData);
        if (response.success) {
          setNominatifId(response.data.data.id);
          setIsNewRecord(false);

          // Update form data with response
          setFormData(prev => ({
            ...prev,
            status: 'draft',
            isEditable: true,
            totalPagu: response.data.data.total_pagu,
            totalBiayaAktual: response.data.data.total_biaya_aktual,
            totalAnggaranRealisasi: response.data.data.total_anggaran_realisasi
          }));

          notification.success('Draft Berhasil Disimpan!', `Data draft telah disimpan dengan ID: ${response.data.data.id}`);
        } else {
          throw new Error(response.message || 'Gagal membuat draft baru');
        }
      } else {
        // Update existing nominatif
        response = await nominatifService.update(nominatifId, apiData);
        if (response.success) {
          // Update form data with response
          setFormData(prev => ({
            ...prev,
            totalPagu: response.data.data.total_pagu,
            totalBiayaAktual: response.data.data.total_biaya_aktual,
            totalAnggaranRealisasi: response.data.data.total_anggaran_realisasi
          }));

          notification.success('Draft Berhasil Diupdate!', 'Perubahan data draft telah berhasil disimpan.');
        } else {
          throw new Error(response.message || 'Gagal mengupdate draft');
        }
      }
    } catch (error) {
      console.error('Save error:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Data yang dikirim tidak valid';

        // Check for anggaran-related errors
        if (errorMessage.toLowerCase().includes('anggaran') || errorMessage.toLowerCase().includes('budget')) {
          notification.error('Anggaran Tidak Mencukupi', errorMessage);
        } else if (errorMessage.toLowerCase().includes('unik') || errorMessage.toLowerCase().includes('duplicate')) {
          notification.error('Data Duplikat', errorMessage);
        } else {
          notification.error('Validasi Error', errorMessage);
        }
      } else if (error.response?.status === 403) {
        notification.error('Akses Ditolak', 'Anda tidak memiliki izin untuk menyimpan data ini.');
      } else if (error.response?.status === 404) {
        notification.error('Data Tidak Ditemukan', 'Data yang akan diupdate tidak ditemukan.');
      } else if (error.response?.status >= 500) {
        notification.error('Server Error', 'Terjadi kesalahan pada server. Silakan coba lagi nanti.');
      } else {
        notification.error('Gagal Menyimpan', error.message || 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const error = validateSubmit();
    if (error) {
      notification.error('Validasi Gagal', 'Mohon lengkapi data berikut:\n' + error);
      return;
    }

    // Check if RKA is selected - check for object with ID
    if (!formData.kodeAnggaranRKA || !formData.kodeAnggaranRKA.id) {
      notification.error('Kode Anggaran Diperlukan', 'Kode anggaran harus dipilih terlebih dahulu sebelum submit.');
      return;
    }

    // Check if anggaran is available
    if (formData.kodeAnggaranRKA.anggaranAvailable <= 0) {
      notification.error('Anggaran Tidak Tersedia', 'Anggaran untuk kode anggaran yang dipilih tidak tersedia atau sudah habis. Silakan pilih kode anggaran lain.');
      return;
    }

    // Save first if this is a new record
    if (isNewRecord) {
      notification.info('Perlu Menyimpan Draft', 'Data belum disimpan. Sistem akan menyimpan draft terlebih dahulu sebelum submit.');

      await handleSave();
      if (isNewRecord) { // If still new after save, it failed
        return;
      }
    }

    // Direct submit without confirmation dialog
    await confirmSubmit();
  };

  const confirmSubmit = async () => {
    setLoading(true);

    try {
      const response = await nominatifService.submit(nominatifId);

      if (response.success) {
        // Update status to submitted and make non-editable
        setFormData(prev => ({
          ...prev,
          status: 'submitted',
          isEditable: false,
          totalBiayaAktual: response.data.data.total_biaya_aktual,
          totalAnggaranRealisasi: response.data.data.total_anggaran_realisasi
        }));

        notification.success('Submit Berhasil!', 'Nominatif berhasil disubmit! Anggaran tidak terpakai telah dikembalikan ke Master RKA.');
      } else {
        throw new Error(response.message || 'Gagal submit nominatif');
      }
    } catch (error) {
      console.error('Submit error:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Data yang dikirim tidak valid';

        // Check for anggaran-related errors
        if (errorMessage.toLowerCase().includes('anggaran') || errorMessage.toLowerCase().includes('budget')) {
          notification.error('Anggaran Tidak Mencukupi', errorMessage);
        } else if (errorMessage.toLowerCase().includes('status') || errorMessage.toLowerCase().includes('submitted')) {
          notification.error('Status Error', 'Data nominatif tidak dalam status yang dapat disubmit.');
        } else {
          notification.error('Validasi Error', errorMessage);
        }
      } else if (error.response?.status === 403) {
        notification.error('Akses Ditolak', error.response.data.message || 'Anda tidak memiliki izin untuk submit data ini.');
      } else if (error.response?.status === 404) {
        notification.error('Data Tidak Ditemukan', 'Data yang akan disubmit tidak ditemukan.');
      } else if (error.response?.status >= 500) {
        notification.error('Server Error', 'Terjadi kesalahan pada server. Silakan coba lagi nanti.');
      } else {
        notification.error('Gagal Submit', error.message || 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Page navigation functions
  const handleNextPage = () => {
    if (currentPage === 1) {
      // Validate page 1 before proceeding
      const error = validatePage1();
      if (error) {
        alert(error);
        return;
      }
      setCurrentPage(2);
    }
  };

  const handlePrevPage = () => {
    if (currentPage === 2) {
      setCurrentPage(1);
    }
  };

  const validatePage1 = () => {
    // For edit mode, page 1 is already validated
    if (!isNewRecord && formData.kodeAnggaranRKA) {
      return null;
    }

    // Validate required fields for page 1
    if (!formData.detailPerjalananDinas?.deskripsi?.trim()) {
      return 'Mohon lengkapi deskripsi perjalanan dinas terlebih dahulu.';
    }
    if (!formData.kodeAnggaranRKA) {
      return 'Mohon pilih kode anggaran RKA terlebih dahulu.';
    }
    return null;
  };

  const validatePage2 = () => {
    // Validate required fields for page 2
    if (!formData.jumlahHari || formData.jumlahHari <= 0) {
      return 'Mohon lengkapi detail perjalanan dengan benar.';
    }
    if (!formData.rutePerjalanan || formData.rutePerjalanan.length === 0) {
      return 'Mohon lengkapi rute perjalanan.';
    }
    // Check if all routes have destinations
    const emptyDestinations = formData.rutePerjalanan.filter(rute => !rute.ke?.trim());
    if (emptyDestinations.length > 0) {
      return 'Semua tujuan perjalanan harus diisi.';
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Notification Container */}
      {notification.notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notification.notifications.map((notif) => (
            <div
              key={notif.id}
              className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out ${
                notif.type === 'success'
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : notif.type === 'error'
                  ? 'bg-red-50 border-red-500 text-red-800'
                  : notif.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                  : 'bg-blue-50 border-blue-500 text-blue-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notif.type === 'success' && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {notif.type === 'error' && (
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {notif.type === 'warning' && (
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {notif.type === 'info' && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-sm">{notif.title || notif.message}</p>
                    {notif.title && <p className="text-sm mt-1 opacity-90">{notif.message}</p>}
                  </div>
                </div>
                <button
                  onClick={() => notification.close(notif.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Page Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-3 mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-1 ${
                currentPage === 1
                  ? 'bg-blue-400 text-white border-2 border-blue-500'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              }`}
              title={isEditMode ? "Page 1 dapat dilihat tapi tidak diedit" : ""}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${currentPage === 1 ? 'bg-white' : 'bg-gray-400'}`}></div>
              <span>Page 1</span>
              <span className="hidden sm:inline">Detail & Kode</span>
              {isEditMode && (
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7S4.477 16.057 3.272 12z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => currentPage === 3 ? setCurrentPage(2) : handleNextPage()}
              disabled={!isEditable && currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-1 ${
                currentPage === 2
                  ? 'bg-blue-400 text-white border-2 border-blue-500'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${currentPage === 2 ? 'bg-white' : 'bg-gray-400'}`}></div>
              <span>Page 2</span>
              <span className="hidden sm:inline">Rincian</span>
            </button>
            <button
              onClick={() => {
                if (currentPage === 1) {
                  const error = validatePage1();
                  if (error) {
                    alert(error);
                    return;
                  }
                } else if (currentPage === 2) {
                  const error = validatePage2();
                  if (error) {
                    alert(error);
                    return;
                  }
                }
                setCurrentPage(3);
              }}
              disabled={!isEditable && currentPage === 2}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-1 ${
                currentPage === 3
                  ? 'bg-blue-400 text-white border-2 border-blue-500'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${currentPage === 3 ? 'bg-white' : 'bg-gray-400'}`}></div>
              <span>Page 3</span>
              <span className="hidden sm:inline">Ringkasan</span>
            </button>
          </div>

          {/* Action Buttons for Page 2 */}
          {currentPage === 2 && (
            <div className="flex gap-2">
              {/* Save Draft Button */}
              {isEditable && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                  <span>{loading ? 'Menyimpan...' : 'Simpan Draft'}</span>
                </button>
              )}

              {/* Cancel Button */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Batal</span>
                </button>
              )}
            </div>
          )}

          {/* Action Buttons for Page 3 */}
          {currentPage === 3 && (
            <div className="flex gap-2">
              {/* Save Draft Button */}
              {isEditable && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                  <span>{loading ? 'Menyimpan...' : 'Simpan Draft'}</span>
                </button>
              )}

              {/* Submit Button */}
              {isEditable && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{loading ? 'Memproses...' : 'Submit'}</span>
                </button>
              )}

              {/* Cancel Button */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Batal</span>
                </button>
              )}
            </div>
          )}

          {/* Cancel Button for Page 1 */}
          {currentPage === 1 && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Batal</span>
            </button>
          )}
        </div>
      </div>

      {/* Page 1: Detail Perjalanan & Kode Anggaran */}
      {currentPage === 1 && (
        <div className="space-y-6">
          {isEditMode && (
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-yellow-100 font-medium">Mode Edit: Data pada halaman ini hanya dapat dilihat, tidak dapat diedit</span>
              </div>
            </div>
          )}

          {/* Sections Container */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Section 1: Detail Perjalanan Dinas */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-6">
              <DetailPerjalananDinasSection
                data={formData.detailPerjalananDinas || {}}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 2: Kode Anggaran */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-6">
                <KodeAnggaranSection
                  kodeAnggaranRKA={formData.kodeAnggaranRKA}
                  onChange={handleChange}
                  isEditable={formData.isEditable}
                  isEditMode={isEditMode}
                />
            </div>
          </div>
        </div>
      )}

      {/* Page 2: Section 3-8 - Rincian Perjalanan */}
      {currentPage === 2 && (
        <div className="space-y-6">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {/* Section 3-8: Rincian Lengkap Perjalanan */}
            {/* Section 3: Detail Perjalanan */}
            <div className="flex-shrink-0 w-[500px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-6">
              <DetailPerjalananSection
                jumlahHari={formData.jumlahHari}
                rutePerjalanan={formData.rutePerjalanan}
                tanggalPerjalanan={formData.tanggalPerjalanan}
                onChange={handleChange}
                isEditable={formData.isEditable}
                isEditMode={isEditMode}
              />
            </div>

            {/* Section 4: Transportasi Pergi */}
            <div className="flex-shrink-0 w-[500px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-6">
              <TransportasiPergiSection
                jumlahHari={formData.jumlahHari}
                transportasiPerHari={formData.transportasiPerHari}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 5: Transportasi Pulang */}
            <div className="flex-shrink-0 w-[500px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-6">
              <TransportasiPulangSection
                jumlahHari={formData.jumlahHari}
                transportasiPerHari={formData.transportasiPerHari}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 6: Penginapan */}
            <div className="flex-shrink-0 w-[500px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-6">
              <PenginapanSection
                data={formData.penginapan}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 7: Uang Harian */}
            <div className="flex-shrink-0 w-[500px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-6">
              <UangHarianSection
                data={formData.uangHarian}
                lamaDinas={formData.jumlahHari}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 8: Uang Representasi */}
            <div className="flex-shrink-0 w-[500px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-6">
              <UangRepresentasiSection
                data={formData.uangRepresentasi}
                lamaDinas={formData.jumlahHari}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page 3: Ringkasan Total Biaya */}
      {currentPage === 3 && (
        <div className="space-y-6">
          {/* Ringkasan Total */}
          <RingkasanTotalSection
            transportasiPerHari={formData.transportasiPerHari}
            penginapan={formData.penginapan}
            uangHarian={formData.uangHarian}
            uangRepresentasi={formData.uangRepresentasi}
            totalPagu={formData.totalPagu}
            onChange={handleChange}
          />

          </div>
      )}
    </div>
  );
};

export default NominatifEntryForm;