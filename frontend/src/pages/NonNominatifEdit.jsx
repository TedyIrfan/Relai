import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Plus, ChevronDown, AlertCircle, ArrowLeft, Search, DollarSign, Calendar, Save, Send, Link, Edit, Eye } from 'lucide-react';
import nonNominatifService from '../services/nonNominatifService';
import Notifikasi from '../components/Notifikasi';
import KonfirmasiDialog from '../components/KonfirmasiDialog';
import { consoleLog, consoleError } from '../utils/logger';
import api from '../services/api';

const NonNominatifEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rkaList, setRkaList] = useState([]);
  const [selectedRKA, setSelectedRKA] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [originalStatus, setOriginalStatus] = useState('');
  const [viewMode, setViewMode] = useState(false); // true = read-only view mode for submitted

  // State untuk dialog konfirmasi
  const [dialogKonfirmasi, setDialogKonfirmasi] = useState({
    isOpen: false,
    type: 'submit'
  });

  // State untuk form data non-nominatif
  const [formData, setFormData] = useState({
    deskripsiKegiatan: '',
    tanggalKegiatan: '',
    danaAnggaran: '',
    evidenceLink: ''
  });

  // Calculate tersisa helper
  const calculateTersisa = (item) => {
    const available = item.anggaranLayanan || 0;
    const used = item.anggaran_berjalan || 0;
    return available - used;
  };

  // Get selected RKA data
  const getSelectedRKAData = () => rkaList.find(r => r.id == selectedRKA);

  // Fetch existing non-nominatif data
  useEffect(() => {
    const fetchNonNominatifData = async () => {
      try {
        setIsLoading(true);
        const response = await nonNominatifService.getById(id);
        consoleLog('Full response:', response);

        // Extract actual data from response
        const data = response.data || response;
        consoleLog('Non Nominatif data extracted:', data);

        // Set form data
        const formDataToSet = {
          deskripsiKegiatan: data.deskripsi_kegiatan || '',
          tanggalKegiatan: data.tanggal ? data.tanggal.split('T')[0] : '',
          danaAnggaran: data.total_anggaran_terpakai || '',
          evidenceLink: data.evidence_link || ''
        };

        consoleLog('Form data to set:', formDataToSet);
        setFormData(formDataToSet);

        // Set original status and view mode
        setOriginalStatus(data.status);
        // Set view mode if already submitted
        setViewMode(data.status === 'submitted');

        // Set selected RKA
        if (data.rka_detail_id) {
          consoleLog('Setting selected RKA to:', data.rka_detail_id);
          setSelectedRKA(data.rka_detail_id.toString());
        }
      } catch (error) {
        consoleError('Error fetching non-nominatif data:', error);
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Gagal memuat data non-nominatif', 'error');
        }
        navigate('/non-nominatif');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchNonNominatifData();
    }
  }, [id, navigate]);

  // Fetch RKA list for dropdown
  useEffect(() => {
    const fetchRKAList = async () => {
      try {
        setLoading(true);
        const response = await api.get('/rka-details');

        // Axios returns data directly
        const data = response.data;
        let rkaArray = [];

        if (Array.isArray(data)) {
          rkaArray = data;
        } else if (data && Array.isArray(data.data)) {
          rkaArray = data.data;
        } else if (data && Array.isArray(data.results)) {
          rkaArray = data.results;
        } else if (data && Array.isArray(data.rka_details)) {
          rkaArray = data.rka_details;
        } else if (data && typeof data === 'object') {
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            rkaArray = possibleArrays[0];
          }
        }

        if (Array.isArray(rkaArray)) {
          setRkaList(rkaArray);
        } else {
          setRkaList([]);
        }
      } catch (error) {
        setRkaList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRKAList();
  }, []);

  // Handle form data changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle dana anggaran input without double formatting
  const handleDanaAnggaranChange = (e) => {
    const numericValue = formatCurrencyInput(e.target.value);
    setFormData(prev => ({
      ...prev,
      danaAnggaran: numericValue
    }));
  };

  // Format currency input
  const formatCurrencyInput = (value) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue;
  };

  // Function to handle save draft
  const handleSaveDraft = async () => {
    if (!selectedRKA || !formData.deskripsiKegiatan || !formData.tanggalKegiatan || !formData.danaAnggaran || !formData.evidenceLink) {
      // Show error notification
      if (window.tampilkanNotifikasi) {
        window.tampilkanNotifikasi('Silakan isi semua field yang diperlukan: deskripsi kegiatan, tanggal, total anggaran terpakai, link Google Drive, dan pilih Code RKA terlebih dahulu', 'error');
      } else {
        alert('Silakan isi semua field yang diperlukan: deskripsi kegiatan, tanggal, total anggaran terpakai, link Google Drive, dan pilih Code RKA terlebih dahulu');
      }
      return;
    }

    // Set loading state
    setSaving(true);

    try {
      const payload = {
        rka_detail_id: selectedRKA,
        deskripsi_kegiatan: formData.deskripsiKegiatan,
        tanggal: formData.tanggalKegiatan,
        total_anggaran_terpakai: formData.danaAnggaran,
        evidence_link: formData.evidenceLink,
        status: 'draft'
      };

      const response = await nonNominatifService.update(id, payload);

      // Store notification in localStorage for the list page to show
      localStorage.setItem('showSuccessNotification', JSON.stringify({
        message: 'Non-nominatif berhasil diperbarui',
        type: 'success'
      }));

      // Navigate immediately to list page
      navigate('/non-nominatif');
    } catch (error) {
      consoleError('Error saving draft:', error);
      // Show error notification
      if (window.tampilkanNotifikasi) {
        window.tampilkanNotifikasi(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan draft', 'error');
      } else {
        alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan draft');
      }
    } finally {
      // Always reset loading state
      setSaving(false);
    }
  };

  // Function to handle submit non-nominatif
  const handleSubmit = async () => {
    if (!selectedRKA || !formData.deskripsiKegiatan || !formData.tanggalKegiatan || !formData.danaAnggaran || !formData.evidenceLink) {
      // Show error notification
      if (window.tampilkanNotifikasi) {
        window.tampilkanNotifikasi('Silakan isi semua field yang diperlukan: deskripsi kegiatan, tanggal, total anggaran terpakai, link Google Drive, dan pilih Code RKA terlebih dahulu', 'error');
      } else {
        alert('Silakan isi semua field yang diperlukan: deskripsi kegiatan, tanggal, total anggaran terpakai, link Google Drive, dan pilih Code RKA terlebih dahulu');
      }
      return;
    }

    // Buka dialog konfirmasi
    setDialogKonfirmasi({
      isOpen: true,
      type: 'submit'
    });
    return;
  };

  const handleConfirmSubmit = async () => {
    // Set loading state
    setSubmitting(true);

    try {
      // First update the data (keep as draft)
      const updatePayload = {
        rka_detail_id: selectedRKA,
        deskripsi_kegiatan: formData.deskripsiKegiatan,
        tanggal: formData.tanggalKegiatan,
        total_anggaran_terpakai: formData.danaAnggaran,
        evidence_link: formData.evidenceLink,
        status: 'draft' // Keep as draft first
      };

      await nonNominatifService.update(id, updatePayload);

      // Then submit it to change status to submitted
      const response = await nonNominatifService.submit(id);

      // Store notification in localStorage for the list page to show
      localStorage.setItem('showSuccessNotification', JSON.stringify({
        message: 'Non-nominatif berhasil diperbarui dan dikirim',
        type: 'success'
      }));

      // Navigate immediately to list page
      navigate('/non-nominatif');
    } catch (error) {
      consoleError('Error submitting:', error);
      // Show error notification
      if (window.tampilkanNotifikasi) {
        window.tampilkanNotifikasi(error.response?.data?.message || 'Terjadi kesalahan saat mengirim non-nominatif', 'error');
      } else {
        alert(error.response?.data?.message || 'Terjadi kesalahan saat mengirim non-nominatif');
      }
    } finally {
      setSubmitting(false);
      // Tutup dialog
      setDialogKonfirmasi({ isOpen: false, type: 'submit' });
    }
  };

  const [kategoriFilter, setKategoriFilter] = useState('');

  // Format display text for dropdown
  const formatRKADisplay = (rka) => {
    return `${rka.kodeProgram || ''}.${rka.kodeLayanan1 || ''}.${rka.kodeLayanan2 || ''}.${rka.codeRka || ''} - ${rka.layanan || ''}`;
  };

  // Filter RKA list by category, search term, and available budget
  const filteredRKA = rkaList.filter(rka => {
    const tersisa = calculateTersisa(rka);
    const matchesKategori = !kategoriFilter || rka.kategoriAnggaran === kategoriFilter;

    // Search across multiple fields
    const searchText = searchTerm.toLowerCase();
    const fullDisplayText = formatRKADisplay(rka).toLowerCase();

    const matchesSearch = !searchTerm ||
      // Cari di format lengkap (kode + arti kode dengan separator -)
      fullDisplayText.includes(searchText) ||
      // Cari di kode lengkap saja
      `${rka.kodeProgram || ''}.${rka.kodeLayanan1 || ''}.${rka.kodeLayanan2 || ''}.${rka.codeRka || ''}`.includes(searchText) ||
      // Cari di kode RKA saja
      (rka.codeRka && rka.codeRka.toLowerCase().includes(searchText)) ||
      // Cari di arti kode
      (rka.artiKode && rka.artiKode.toLowerCase().includes(searchText)) ||
      // Cari di nama layanan (backup jika artiKode tidak ada)
      (rka.layanan && rka.layanan.toLowerCase().includes(searchText));

    return tersisa > 0 && matchesKategori && matchesSearch;
  });

  // Format display currency
  const formatDisplayCurrency = (value) => {
    const numValue = parseInt(value) || 0;
    return new Intl.NumberFormat('id-ID').format(numValue);
  };

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Notifikasi />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data non-nominatif...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Notifikasi Component */}
      <Notifikasi />

      {/* Komponen Dialog Konfirmasi */}
      <KonfirmasiDialog
        isOpen={dialogKonfirmasi.isOpen}
        onClose={() => setDialogKonfirmasi({ isOpen: false, type: 'submit' })}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Pengiriman Non-Nominatif"
        message={`Apakah Anda yakin ingin mengirim data non-nominatif ini?\n\nDeskripsi: ${formData.deskripsiKegiatan}\n\nSetelah non-nominatif dikirim, data RKA anggaran tidak akan bisa diedit lagi.\n\nPastikan semua data sudah benar sebelum melanjutkan.`}
        confirmText="Submit"
        cancelText="Batal"
        type="success"
        iconType="warning"
        isLoading={submitting}
      />

      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/non-nominatif')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <div className="flex items-center">
              <Edit className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {viewMode ? 'View Non-Nominatif' : 'Edit Non-Nominatif'}
                </h1>
                <p className="text-sm text-gray-600">
                  {viewMode ? 'Lihat data non-nominatif (read-only)' : 'Perbarui data kegiatan non-nominatif'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create Non-Nominatif Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">

          {/* Form Data */}
          <div className="space-y-6">
            {/* Top Section - Deskripsi and Tanggal & Dana */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deskripsi Kegiatan */}
              <div>
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Kegiatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="deskripsi"
                  value={formData.deskripsiKegiatan}
                  onChange={(e) => handleInputChange('deskripsiKegiatan', e.target.value)}
                  placeholder="Contoh: Pembelian alat tulis kantor untuk periode Desember 2024..."
                  className={`w-full px-4 py-3 border rounded-lg ${
                    viewMode
                      ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  rows={6}
                  readOnly={viewMode}
                  disabled={viewMode}
                />
              </div>

              {/* Tanggal, Dana, dan RKA Selection */}
              <div className="space-y-4">
                {/* Tanggal */}
                <div>
                  <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="tanggal"
                    value={formData.tanggalKegiatan}
                    onChange={(e) => handleInputChange('tanggalKegiatan', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      viewMode
                        ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    readOnly={viewMode}
                    disabled={viewMode}
                  />
                </div>

                {/* Total Anggaran Terpakai */}
                <div>
                  <label htmlFor="total-anggaran" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Total Anggaran Terpakai <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                      type="text"
                      id="total-anggaran"
                      value={formatDisplayCurrency(formData.danaAnggaran)}
                      onChange={handleDanaAnggaranChange}
                      placeholder="0"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                        viewMode
                          ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      readOnly={viewMode}
                      disabled={viewMode}
                    />
                  </div>
                </div>

  
                {/* RKA Selection Section */}
                <div>
                  <label htmlFor="rka-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Code RKA <span className="text-red-500">*</span>
                  </label>
                  <div
                      className="w-full px-4 py-3 text-left bg-gray-100 border border-gray-300 rounded-lg shadow-sm overflow-hidden"
                    >
                      <span className={`block truncate ${selectedRKA ? 'text-gray-700' : 'text-gray-500'}`}>
                        {selectedRKA
                          ? formatRKADisplay(getSelectedRKAData())
                          : 'Pilih Code RKA...'
                        }
                      </span>
                    </div>
              </div>

            {/* Selected RKA Info */}
            {selectedRKA && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Detail RKA yang Dipilih:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div><strong>Code Lengkap:</strong> {formatRKADisplay(getSelectedRKAData())}</div>
                  <div><strong>Layanan:</strong> {getSelectedRKAData()?.layanan}</div>
                  <div><strong>Arti Kode:</strong> {getSelectedRKAData()?.artiKode}</div>
                  <div><strong>Kategori:</strong> {getSelectedRKAData()?.kategoriAnggaran}</div>
                  <div><strong>Wilayah:</strong> {getSelectedRKAData()?.wilayah}</div>
                  {getSelectedRKAData() && (
                    <div><strong>Anggaran Tersedia:</strong> Rp {calculateTersisa(getSelectedRKAData()).toLocaleString('id-ID')}</div>
                  )}
                </div>
              </div>
            )}

            {/* Warning jika dana anggaran melebihi tersisa */}
            {selectedRKA && formData.danaAnggaran && getSelectedRKAData() && (
              parseInt(formData.danaAnggaran) > calculateTersisa(getSelectedRKAData()) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">Peringatan: Dana Anggaran Melebihi Budget Tersedia!</p>
                      <p>Dana anggaran yang diinput (Rp {formatDisplayCurrency(formData.danaAnggaran)}) melebihi budget RKA yang tersedia (Rp {calculateTersisa(getSelectedRKAData()).toLocaleString('id-ID')}).</p>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Evidence Link */}
            <div>
              <label htmlFor="evidence-link" className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-1" />
                Link Google Drive <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="evidence-link"
                value={formData.evidenceLink}
                onChange={(e) => handleInputChange('evidenceLink', e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className={`w-full px-4 py-3 border rounded-lg ${
                  viewMode
                    ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
                readOnly={viewMode}
                disabled={viewMode}
              />
              <p className="text-sm text-gray-500 mt-1">
                {viewMode ? (
                  <a
                    href={formData.evidenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Buka Evidence di Google Drive
                  </a>
                ) : (
                  'Masukkan link Google Drive untuk bukti pendukung'
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              {viewMode ? (
                // View Mode - Only show Back button
                <button
                  onClick={() => navigate('/non-nominatif')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Kembali
                </button>
              ) : (
                // Edit Mode - Show all buttons
                <>
                  <button
                    onClick={() => navigate('/non-nominatif')}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleSaveDraft}
                    disabled={saving || submitting || !selectedRKA || !formData.deskripsiKegiatan || !formData.tanggalKegiatan || !formData.danaAnggaran || !formData.evidenceLink}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Draft
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || saving || !selectedRKA || !formData.deskripsiKegiatan || !formData.tanggalKegiatan || !formData.danaAnggaran || !formData.evidenceLink}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
    </>
  );
};

export default NonNominatifEdit;