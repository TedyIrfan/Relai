import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, ChevronDown, AlertCircle, ArrowLeft } from 'lucide-react';

const NominatifCreate = () => {
  const navigate = useNavigate();
  const [rkaList, setRkaList] = useState([]);
  const [selectedRKA, setSelectedRKA] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // State untuk form data tambahan
  const [formData, setFormData] = useState({
    deskripsiPerjalanan: '',
    tanggalMulai: '',
    tanggalSelesai: ''
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

  // Function to handle create nominatif
  const handleCreateNominatif = () => {
    if (selectedRKA && formData.deskripsiPerjalanan) {
      const nominatifData = {
        rkaId: selectedRKA,
        deskripsi: formData.deskripsiPerjalanan,
        tanggalMulai: formData.tanggalMulai,
        tanggalSelesai: formData.tanggalSelesai,
        rkaDetail: getSelectedRKAData()
      };

      localStorage.setItem('nominatifDraft', JSON.stringify(nominatifData));
      navigate(`/nominatif/${selectedRKA}`);
    } else {
      alert('Silakan isi deskripsi perjalanan dan pilih Code RKA terlebih dahulu');
    }
  };

  const [kategoriFilter, setKategoriFilter] = useState('');

  // Filter RKA list by category and available budget
  const filteredRKA = rkaList.filter(rka => {
    const tersisa = calculateTersisa(rka);
    const matchesKategori = !kategoriFilter || rka.kategoriAnggaran === kategoriFilter;
    return tersisa > 0 && matchesKategori;
  });

  // Format display text for dropdown
  const formatRKADisplay = (rka) => {
    return `${rka.kodeProgram}.${rka.kodeLayanan1}.${rka.kodeLayanan2}.${rka.codeRka}.${rka.layanan}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/nominatif')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Buat Nominatif Baru
                </h1>
                <p className="text-sm text-gray-600">
                  Lengkapi data perjalanan dinas dan pilih Code RKA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Create Nominatif Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Buat Nominatif Baru
              </h2>
              <p className="text-gray-600">
                Lengkapi data perjalanan dinas dan pilih Code RKA
              </p>
            </div>

            {/* Form Data */}
            <div className="space-y-6">
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
                  rows={3}
                />
              </div>

              {/* Tanggal Perjalanan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Divider */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Code RKA</h3>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Kategori
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setKategoriFilter('')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      !kategoriFilter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setKategoriFilter('A')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      kategoriFilter === 'A'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    A - Dinas Pimpinan
                  </button>
                  <button
                    onClick={() => setKategoriFilter('B')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      kategoriFilter === 'B'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    B - Tata Usaha
                  </button>
                  <button
                    onClick={() => setKategoriFilter('C')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      kategoriFilter === 'C'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    C - Konferensi
                  </button>
                </div>
              </div>

              {/* RKA Dropdown */}
              <div>
                <label htmlFor="rka-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Code RKA
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                  >
                    <span className={selectedRKA ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedRKA
                        ? formatRKADisplay(getSelectedRKAData())
                        : 'Pilih Code RKA...'
                      }
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
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
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="space-y-1">
                                <div className="font-mono text-sm text-gray-900">
                                  {formatRKADisplay(rka)}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-600">
                                    {rka.kategoriAnggaran} • {rka.wilayah}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-green-600">
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
                        <div className="px-4 py-3 text-center text-gray-500">
                          {kategoriFilter
                            ? `Tidak ada RKA tersedia untuk kategori ${kategoriFilter}`
                            : 'Tidak ada RKA tersedia'
                          }
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected RKA Info */}
              {selectedRKA && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Detail RKA yang Dipilih:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><strong>Code Lengkap:</strong> {formatRKADisplay(getSelectedRKAData())}</div>
                    <div><strong>Layanan:</strong> {getSelectedRKAData()?.layanan}</div>
                    <div><strong>Kategori:</strong> {getSelectedRKAData()?.kategoriAnggaran}</div>
                    <div><strong>Wilayah:</strong> {getSelectedRKAData()?.wilayah}</div>
                    {getSelectedRKAData() && (
                      <div><strong>Anggaran Tersedia:</strong> Rp {calculateTersisa(getSelectedRKAData()).toLocaleString('id-ID')}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleCreateNominatif}
                disabled={!selectedRKA || !formData.deskripsiPerjalanan}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  selectedRKA && formData.deskripsiPerjalanan
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5" />
                {selectedRKA && formData.deskripsiPerjalanan
                  ? 'Buat Nominatif'
                  : !formData.deskripsiPerjalanan
                    ? 'Isi Deskripsi Perjalanan Terlebih Dahulu'
                    : 'Pilih Code RKA Terlebih Dahulu'
                }
              </button>
            </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default NominatifCreate;