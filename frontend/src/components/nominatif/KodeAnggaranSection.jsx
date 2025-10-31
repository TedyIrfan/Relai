import React, { useState, useEffect } from 'react';
import rkaService from '../../services/rkaService.js';

const KodeAnggaranSection = ({ kodeAnggaranRKA, onChange, isEditable }) => {
  const [kodeAnggaranOptions, setKodeAnggaranOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedWilayah, setSelectedWilayah] = useState('');

  // Smart truncate function
  const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  // Format option label untuk compact display
  const formatOptionLabel = (option) => {
    const truncatedLayanan = truncateText(option.layanan || '', 45);
    return `${option.value} - ${truncatedLayanan}`;
  };

  // Get unique filter options from data
  const getFilterOptions = (options) => {
    const kategoriSet = new Set();
    const wilayahSet = new Set();

    options.forEach(option => {
      if (option.kategori) kategoriSet.add(option.kategori);
      if (option.wilayah) wilayahSet.add(option.wilayah);
    });

    return {
      kategori: Array.from(kategoriSet).sort(),
      wilayah: Array.from(wilayahSet).sort()
    };
  };

  // Fetch kode anggaran options dari API
  useEffect(() => {
    const fetchKodeAnggaranOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const options = await rkaService.getKodeAnggaranOptions();
        setKodeAnggaranOptions(options);
        setFilteredOptions(options);
      } catch (error) {
        console.error('Failed to fetch kode anggaran options:', error);
        setError('Gagal memuat data kode anggaran. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchKodeAnggaranOptions();
  }, []);

  // Filter options based on search term and selected filters
  useEffect(() => {
    let filtered = kodeAnggaranOptions;

    // Apply text search
    if (searchTerm.trim()) {
      filtered = filtered.filter(option =>
        option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.layanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.artiKode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.wilayah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.searchTerms?.includes(searchTerm.toLowerCase()) ||
        option.kodeLengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.layananUmum?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.kodeLayanan1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.kodeLayanan2?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter by kategori
    if (selectedKategori) {
      filtered = filtered.filter(option =>
        option.kategori?.toLowerCase() === selectedKategori.toLowerCase()
      );
    }

    // Apply filter by wilayah
    if (selectedWilayah) {
      filtered = filtered.filter(option =>
        option.wilayah?.toLowerCase() === selectedWilayah.toLowerCase()
      );
    }

    setFilteredOptions(filtered);
  }, [searchTerm, selectedKategori, selectedWilayah, kodeAnggaranOptions]);

  const selectedOption = kodeAnggaranOptions.find(opt => opt.value === kodeAnggaranRKA);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'kategori':
        setSelectedKategori(value);
        break;
      case 'wilayah':
        setSelectedWilayah(value);
        break;
    }
  };

  const handleClearAllFilters = () => {
    setSelectedKategori('');
    setSelectedWilayah('');
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Section 2: Kode Anggaran RKA
      </h3>

      {/* Kode Anggaran Details */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        {/* Pencarian Kode Anggaran */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Pilih Kode Anggaran</h4>

          {/* Filter Dropdowns */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              {/* Filter Kategori */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Filter Kategori</label>
                <select
                  value={selectedKategori}
                  onChange={(e) => handleFilterChange('kategori', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                >
                  <option value="">-- Semua Kategori --</option>
                  {getFilterOptions(kodeAnggaranOptions).kategori.map((kategori) => (
                    <option key={kategori} value={kategori}>{kategori}</option>
                  ))}
                </select>
              </div>

              {/* Filter Wilayah */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Filter Wilayah</label>
                <select
                  value={selectedWilayah}
                  onChange={(e) => handleFilterChange('wilayah', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                >
                  <option value="">-- Semua Wilayah --</option>
                  {getFilterOptions(kodeAnggaranOptions).wilayah.map((wilayah) => (
                    <option key={wilayah} value={wilayah}>{wilayah}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedKategori || selectedWilayah || searchTerm) && (
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedKategori && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Kategori: {selectedKategori}
                      <button
                        onClick={() => setSelectedKategori('')}
                        disabled={!isEditable}
                        className="ml-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedWilayah && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Wilayah: {selectedWilayah}
                      <button
                        onClick={() => setSelectedWilayah('')}
                        disabled={!isEditable}
                        className="ml-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                      Search: {searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        disabled={!isEditable}
                        className="ml-1 text-orange-600 hover:text-orange-800 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClearAllFilters}
                  disabled={!isEditable}
                  className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-500 text-sm">Memuat data kode anggaran...</span>
            </div>
          ) : error ? (
            <div className="px-3 py-2 bg-white border border-red-200 rounded-lg">
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          ) : (
            <>
              {/* Search Input */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  disabled={!isEditable}
                  placeholder="Cari kode anggaran, layanan, wilayah..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search Results Count */}
              {searchTerm && (
                <div className="mb-2 text-xs text-gray-500">
                  Ditemukan {filteredOptions.length} dari {kodeAnggaranOptions.length} kode anggaran
                </div>
              )}

              {/* Dropdown Select */}
              <select
                value={kodeAnggaranRKA}
                onChange={(e) => onChange('kodeAnggaranRKA', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
              >
                <option value="">-- Pilih Kode Anggaran --</option>
                {filteredOptions.map((option, index) => (
                  <option key={`${option.value}-${index}`} value={option.value}>
                    {formatOptionLabel(option)}
                  </option>
                ))}
              </select>

              {/* No Results Message */}
              {searchTerm && filteredOptions.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Tidak ada kode anggaran yang cocok dengan "{searchTerm}"
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    💡 Tips: Coba format seperti "7394.EBA.962", "7394", "EBA", "perjalanan", "jakarta", "bali", dll.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

    </div>

      </div>
  );
};

export default KodeAnggaranSection;