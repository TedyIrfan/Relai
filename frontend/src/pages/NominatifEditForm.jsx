import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Plus, ChevronDown, AlertCircle, ArrowLeft, Search, Edit3, Save, Send, Clock, CheckCircle } from 'lucide-react';
import useNotification from '../hooks/useNotification';
import KonfirmasiDialog from '../components/KonfirmasiDialog';
import api from '../services/api';

const NominatifEditForm = () => {
  const { id } = useParams(); // Get nominatif ID from URL
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useNotification();

  // Log saat component mount
  console.log('🎯 NominatifEditForm component mounted!');
  console.log('📍 Nominatif ID from URL:', id);

  // Form state
  const [rkaList, setRkaList] = useState([]);
  const [selectedRKA, setSelectedRKA] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');

  // State untuk form data
  const [formData, setFormData] = useState({
    deskripsiPerjalanan: '',
    tanggalMulai: '',
    tanggalSelesai: ''
  });

  // State untuk loading dan saving
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // State untuk status nominatif
  const [nominatifStatus, setNominatifStatus] = useState('');

  // State untuk dialog konfirmasi
  const [dialogKonfirmasi, setDialogKonfirmasi] = useState({
    isOpen: false,
    type: 'submit'
  });

  // Get token from localStorage
  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.token || localStorage.getItem('token');
    } catch (error) {
      return localStorage.getItem('token');
    }
  };

  // Calculate helpers
  const calculateTersisa = (item) => {
    const available = item.anggaranLayanan || 0;
    const used = item.anggaran_berjalan || 0;
    return available - used;
  };

  const getSelectedRKAData = () => rkaList.find(r => r.id == selectedRKA);

  // Format RKA display - SAMA PERSIS seperti NominatifCreate
  const formatRKADisplay = (rka) => {
    if (!rka) return '';
    const kode = rka.kode_rka || rka.codeRka || '';
    const layanan = rka.arti_kode || rka.layanan || '';
    return `${kode} - ${layanan}`;
  };

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Handle form data changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to save draft (update nominatif)
  const handleSaveDraft = async () => {
    if (!selectedRKA || !formData.deskripsiPerjalanan) {
      showError('Silakan isi deskripsi perjalanan dan pilih Code RKA terlebih dahulu');
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(`/nominatifs-new/${id}`, {
        deskripsi_perjalanan_dinas: formData.deskripsiPerjalanan,
        tanggal_mulai: formData.tanggalMulai,
        tanggal_selesai: formData.tanggalSelesai,
        rka_detail_id: selectedRKA
      });

      showSuccess('Draft berhasil disimpan!');
      // Delay 1.5 detik agar notifikasi terbaca
      setTimeout(() => {
        navigate('/nominatif');
      }, 1500);
    } catch (error) {
      showError('Terjadi kesalahan saat menyimpan draft');
    } finally {
      setSaving(false);
    }
  };

  // Function to submit nominatif - buka dialog konfirmasi dulu
  const handleSubmit = () => {
    if (!selectedRKA || !formData.deskripsiPerjalanan) {
      showError('Silakan isi deskripsi perjalanan dan pilih Code RKA terlebih dahulu');
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
    setSaving(true);

    try {
      // Save dulu, lalu submit
      const response = await api.put(`/nominatifs-new/${id}`, {
        deskripsi_perjalanan_dinas: formData.deskripsiPerjalanan,
        tanggal_mulai: formData.tanggalMulai,
        tanggal_selesai: formData.tanggalSelesai,
        rka_detail_id: selectedRKA,
        status: 'submitted'
      });

      showSuccess('Nominatif berhasil dikirim!');
      // Delay 1.5 detik agar notifikasi terbaca
      setTimeout(() => {
        navigate('/nominatif');
      }, 1500);
    } catch (error) {
      showError('Terjadi kesalahan saat mengirim nominatif');
    } finally {
      setSaving(false);
      // Tutup dialog
      setDialogKonfirmasi({ isOpen: false, type: 'submit' });
    }
  };

  // Fetch existing nominatif data and RKA list
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.log('❌ No ID provided');
        return;
      }

      try {
        setInitialLoading(true);
        console.log('🚀 Starting data fetch for nominatif ID:', id);

        const token = getToken();
        console.log('🔑 Token exists:', !!token);

        if (!token) {
          console.error('❌ No token found!');
          showError('Anda belum login. Silakan login terlebih dahulu.');
          navigate('/login');
          return;
        }

        // Step 1: Fetch existing nominatif data
        const nominatifResponse = await api.get(`/nominatifs-new/${id}`);
        const nominatifData = nominatifResponse.data;
        console.log('✅ Raw API Response:', nominatifData);

        // Extract actual data from wrapper response
        const actualData = nominatifData.data || nominatifData;
        console.log('✅ Extracted data:', actualData);

        // Data ada di dalam actualData.nominatif
        const nominatifRecord = actualData.nominatif || actualData;
        console.log('✅ Nominatif record:', nominatifRecord);

        // Set form data - convert date format to yyyy-MM-dd for input type="date"
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          // Handle ISO format with timezone
          if (dateString.includes('T')) {
            return dateString.split('T')[0]; // "2025-12-23T00:00:00.000000Z" -> "2025-12-23"
          }
          return dateString;
        };

        const newFormData = {
          deskripsiPerjalanan: nominatifRecord.deskripsi_perjalanan_dinas || '',
          tanggalMulai: formatDateForInput(nominatifRecord.tanggal_mulai) || '',
          tanggalSelesai: formatDateForInput(nominatifRecord.tanggal_selesai) || ''
        };
        setFormData(newFormData);
        console.log('📝 Form data set:', newFormData);

        // Set Status
        setNominatifStatus(nominatifRecord.status || 'draft');
        console.log('📊 Status set:', nominatifRecord.status || 'draft');

        // Set RKA
        const rkaId = nominatifRecord.rka_detail_id;
        setSelectedRKA(rkaId || '');
        console.log('🎯 RKA ID set:', rkaId);

        // Fetch RKA list
        const rkaResponse = await api.get('/rka-details');

        // Axios returns data directly
        const data = rkaResponse.data;
        let rkaArray = [];

        if (Array.isArray(data)) {
          rkaArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          rkaArray = data.data;
        }

        if (rkaArray.length > 0) {
          setRkaList(rkaArray);
          console.log('✅ RKA List loaded:', rkaArray.length);
        }

      } catch (error) {
        console.error('❌ Error:', error);
        showError('Gagal memuat data: ' + error.message);
      } finally {
        setInitialLoading(false);
        console.log('🏁 Fetch done');
      }
    };

    fetchData();
  }, [id]);

  // Filter RKA list - SAMA PERSIS seperti NominatifCreate
  const filteredRkaList = rkaList.filter(rka => {
    const tersisa = calculateTersisa(rka);
    const matchesKategori = !kategoriFilter || rka.kategoriAnggaran === kategoriFilter;

    // Search across multiple fields - SAMA PERSIS
    const searchText = searchTerm.toLowerCase();
    const fullDisplayText = formatRKADisplay(rka).toLowerCase();

    const matchesSearch = !searchTerm ||
      // Cari di format lengkap (kode + arti kode dengan separator -)
      fullDisplayText.includes(searchText) ||
      // Cari di kode lengkap saja
      `${rka.kode_rka || ''}`.includes(searchText) ||
      // Cari di arti kode
      (rka.arti_kode && rka.arti_kode.toLowerCase().includes(searchText)) ||
      // Cari di nama layanan (backup jika artiKode tidak ada)
      (rka.layanan && rka.layanan.toLowerCase().includes(searchText));

    // PENTING: Selected RKA harus SELALU muncul di list (ignore filter)
    const isSelected = rka.id == selectedRKA;

    // Filter: (tersisa > 0 ATAU selected RKA) DAN matchesKategori DAN matches search
    return ((tersisa > 0) || isSelected) && matchesKategori && matchesSearch;
  });

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data nominatif...</p>
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Komponen Dialog Konfirmasi */}
      <KonfirmasiDialog
        isOpen={dialogKonfirmasi.isOpen}
        onClose={() => setDialogKonfirmasi({ isOpen: false, type: 'submit' })}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Pengiriman Nominatif"
        message={`Apakah Anda yakin sudah mengisi data Nominatif maupun Data Detail Nominatif dengan benar?\n\nDeskripsi: ${formData.deskripsiPerjalanan}\n\nPastikan semua data sudah benar sebelum melanjutkan.`}
        confirmText="Submit"
        cancelText="Batal"
        type="success"
        iconType="warning"
        isLoading={saving}
      />

      <div className="min-h-screen bg-gray-50">
      {/* Header - SAMA PERSIS seperti NominatifCreate */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/nominatif')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
              <div className="flex items-center">
                <Edit3 className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Edit Nominatif
                    </h1>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Status:</span>
                    </div>
                    <span className="text-sm text-gray-800">{nominatifStatus}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Perbarui data perjalanan dinas dan pilih Code RKA
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Ke Detail Nominatif di sebelah kanan */}
            <button
              onClick={() => selectedRKA && navigate(`/nominatif/${selectedRKA}?id=${id}`)}
              disabled={!selectedRKA}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Ke Detail Nominatif
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - SAMA PERSIS seperti NominatifCreate */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Edit Nominatif Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">

          {/* Form Data */}
          <div className="space-y-6">
            {/* Top Section - Deskripsi and Dates - SAMA PERSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deskripsi Perjalanan Dinas */}
              <div>
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Perjalanan Dinas <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="deskripsi"
                  value={formData.deskripsiPerjalanan}
                  onChange={(e) => handleInputChange('deskripsiPerjalanan', e.target.value)}
                  placeholder="Contoh: Rapat Koordinasi Pelaksanaan Program Kerja Tahun 2025..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                />
              </div>

              {/* Tanggal dan RKA Selection */}
              <div className="space-y-4">
                {/* Tanggal Perjalanan */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tanggal-mulai" className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      id="tanggal-mulai"
                      value={formData.tanggalMulai}
                      onChange={(e) => handleInputChange('tanggalMulai', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="tanggal-selesai" className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      id="tanggal-selesai"
                      value={formData.tanggalSelesai}
                      onChange={(e) => handleInputChange('tanggalSelesai', e.target.value)}
                      min={formData.tanggalMulai}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* RKA Selection Section - LOCKED (seperti NonNominatifEdit) */}
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
              </div>
            </div>

            {/* Selected RKA Info - SAMA PERSIS dengan NonNominatifCreate (full-width, outside grid) */}
            {getSelectedRKAData() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Detail RKA yang Dipilih:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div><strong>Code Lengkap:</strong> {formatRKADisplay(getSelectedRKAData())}</div>
                  <div><strong>Layanan:</strong> {getSelectedRKAData()?.layanan}</div>
                  <div><strong>Arti Kode:</strong> {getSelectedRKAData()?.arti_kode || getSelectedRKAData()?.artiKode}</div>
                  <div><strong>Kategori:</strong> {getSelectedRKAData()?.kategoriAnggaran}</div>
                  <div><strong>Wilayah:</strong> {getSelectedRKAData()?.wilayah}</div>
                  {getSelectedRKAData() && (
                    <div><strong>Anggaran Tersedia:</strong> Rp {calculateTersisa(getSelectedRKAData()).toLocaleString('id-ID')}</div>
                  )}
                </div>
              </div>
            )}

            {/* Warning jika sisa anggaran sedikit - SAMA PERSIS dengan NonNominatifCreate */}
            {getSelectedRKAData() && calculateTersisa(getSelectedRKAData()) <= 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Peringatan!</p>
                  <p>Sisa anggaran untuk RKA ini habis atau tidak mencukupi.</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - SAMA PERSIS dengan NonNominatifEdit */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/nominatif')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={saving || !selectedRKA || !formData.deskripsiPerjalanan}
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
              disabled={saving || !selectedRKA || !formData.deskripsiPerjalanan}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
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
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default NominatifEditForm;