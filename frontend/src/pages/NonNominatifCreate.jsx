import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, ChevronDown, AlertCircle, ArrowLeft, Search, DollarSign, Calendar, Save, Send, Link } from 'lucide-react';

const NonNominatifCreate = () => {
  const navigate = useNavigate();
  const [rkaList, setRkaList] = useState([]);
  const [selectedRKA, setSelectedRKA] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch RKA list for dropdown
  useEffect(() => {
    const fetchRKAList = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost/api/rka-details');

        if (response.ok) {
          const data = await response.json();
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

  // Format currency input
  const formatCurrencyInput = (value) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue;
  };

  // Function to handle save draft
  const handleSaveDraft = async () => {
    if (!selectedRKA || !formData.deskripsiKegiatan || !formData.danaAnggaran) {
      alert('Silakan isi deskripsi kegiatan, dana anggaran, dan pilih Code RKA terlebih dahulu');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const payload = {
        rka_detail_id: selectedRKA,
        deskripsi_kegiatan: formData.deskripsiKegiatan,
        tanggal_kegiatan: formData.tanggalKegiatan,
        dana_anggaran: formData.danaAnggaran,
        evidence_link: formData.evidenceLink,
        status: 'draft'
      };

      const response = await fetch('http://localhost/api/non-nominatifs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Non-nominatif berhasil disimpan sebagai draft');
        navigate('/non-nominatif');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal menyimpan draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Terjadi kesalahan saat menyimpan');
    }
  };

  // Function to handle submit non-nominatif
  const handleSubmit = async () => {
    if (!selectedRKA || !formData.deskripsiKegiatan || !formData.danaAnggaran) {
      alert('Silakan isi deskripsi kegiatan, dana anggaran, dan pilih Code RKA terlebih dahulu');
      return;
    }

    const confirmed = window.confirm(
      'Apakah Anda yakin ingin mengirim non-nominatif ini? Setelah dikirim, data tidak dapat diubah lagi.'
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const payload = {
        rka_detail_id: selectedRKA,
        deskripsi_kegiatan: formData.deskripsiKegiatan,
        tanggal_kegiatan: formData.tanggalKegiatan,
        dana_anggaran: formData.danaAnggaran,
        evidence_link: formData.evidenceLink,
        status: 'submitted'
      };

      const response = await fetch('http://localhost/api/non-nominatifs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Non-nominatif berhasil dikirim');
        navigate('/non-nominatif');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal mengirim non-nominatif');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Terjadi kesalahan saat mengirim');
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

  return (
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
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Buat Non-Nominatif Baru
                </h1>
                <p className="text-sm text-gray-600">
                  Lengkapi data kegiatan dan pilih Code RKA
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                />
              </div>

              {/* Tanggal, Dana, dan RKA Selection */}
              <div className="space-y-4">
                {/* Tanggal Kegiatan */}
                <div>
                  <label htmlFor="tanggal-kegiatan" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    id="tanggal-kegiatan"
                    value={formData.tanggalKegiatan}
                    onChange={(e) => handleInputChange('tanggalKegiatan', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Dana Anggaran */}
                <div>
                  <label htmlFor="dana-anggaran" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Dana Anggaran <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                      type="text"
                      id="dana-anggaran"
                      value={formatDisplayCurrency(formData.danaAnggaran)}
                      onChange={(e) => handleInputChange('danaAnggaran', formatCurrencyInput(e.target.value))}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

  
                {/* RKA Selection Section */}
                <div>
                  <label htmlFor="rka-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Code RKA <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                    >
                      <span className={`truncate ${selectedRKA ? 'text-gray-900' : 'text-gray-500'}`}>
                        {selectedRKA
                          ? formatRKADisplay(getSelectedRKAData())
                          : 'Pilih Code RKA...'
                        }
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                        {/* Search Box */}
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Cari kode atau arti kode..."
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Category Filter */}
                        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => setKategoriFilter('')}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                !kategoriFilter
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              Semua
                            </button>
                            <button
                              onClick={() => setKategoriFilter('A')}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                kategoriFilter === 'A'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              A - Dinas Pimpinan
                            </button>
                            <button
                              onClick={() => setKategoriFilter('B')}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                kategoriFilter === 'B'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              B - Tata Usaha
                            </button>
                            <button
                              onClick={() => setKategoriFilter('C')}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                kategoriFilter === 'C'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              C - Konferensi
                            </button>
                          </div>
                        </div>

                        {/* Dropdown Items */}
                        <div className="max-h-60 overflow-auto">
                          {loading ? (
                            <div className="px-4 py-3 text-center text-gray-500">
                              <div className="inline-flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                Memuat...
                              </div>
                            </div>
                          ) : filteredRKA.length > 0 ? (
                            filteredRKA.map((rka) => {
                              const tersisa = calculateTersisa(rka);

                              return (
                                <button
                                  key={rka.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedRKA(rka.id);
                                    setDropdownOpen(false);
                                    setSearchTerm('');
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="space-y-1">
                                    <div className="font-mono text-xs text-gray-900 truncate">
                                      {formatRKADisplay(rka)}
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">
                                      {rka.layanan}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs text-gray-500">
                                        {rka.kategoriAnggaran} • {rka.wilayah}
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs font-medium text-blue-600">
                                          Rp {tersisa.toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Tersisa
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-4 py-3 text-center text-gray-500 text-sm">
                              {searchTerm
                                ? 'Tidak ada hasil pencarian'
                                : kategoriFilter
                                  ? `Tidak ada RKA tersedia untuk kategori ${kategoriFilter}`
                                  : 'Tidak ada RKA tersedia'
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                Link Google Drive
              </label>
              <input
                type="url"
                id="evidence-link"
                value={formData.evidenceLink}
                onChange={(e) => handleInputChange('evidenceLink', e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Opsional: Masukkan link Google Drive untuk bukti pendukung
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/non-nominatif')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={!selectedRKA || !formData.deskripsiKegiatan || !formData.danaAnggaran}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Simpan Draft
              </button>

              <button
                onClick={handleSubmit}
                disabled={!selectedRKA || !formData.deskripsiKegiatan || !formData.danaAnggaran}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Kirim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonNominatifCreate;