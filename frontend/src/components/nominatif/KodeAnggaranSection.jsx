import React, { useState, useEffect } from 'react';
import rkaService from '../../services/rkaService.js';

const KodeAnggaranSection = ({ kodeAnggaranRKA, onChange, isEditable }) => {
  const [kodeAnggaranOptions, setKodeAnggaranOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(kodeAnggaranOptions);
    } else {
      const filtered = kodeAnggaranOptions.filter(option =>
        option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.layanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.artiKode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.wilayah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, kodeAnggaranOptions]);

  const selectedOption = kodeAnggaranOptions.find(opt => opt.value === kodeAnggaranRKA);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Section 2: Kode Anggaran RKA
      </h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Pilih Kode Anggaran <span className="text-red-500">*</span>
        </label>

        {loading ? (
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-500">Memuat data kode anggaran...</span>
          </div>
        ) : error ? (
          <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50">
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
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">-- Pilih Kode Anggaran --</option>
              {filteredOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* No Results Message */}
            {searchTerm && filteredOptions.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Tidak ada kode anggaran yang cocok dengan "{searchTerm}"
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Coba kata kunci lain seperti: "perjalanan", "dinas", "jakarta", "bali", dll.
                </p>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-gray-500">
          *Required untuk Submit
        </p>
      </div>

      {/* Show selected kategori info */}
      {selectedOption && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="space-y-2">
            <p className="text-sm font-bold text-blue-900">
              Kode Anggaran: {selectedOption.codeRka}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Arti Kode:</span> {selectedOption.artiKode}
            </p>
            <div className="flex gap-4 text-xs text-blue-700">
              <span><strong>Layanan:</strong> {selectedOption.layanan}</span>
              {selectedOption.wilayah && <span><strong>Wilayah:</strong> {selectedOption.wilayah}</span>}
              <span><strong>Kategori:</strong> {selectedOption.kategori}</span>
            </div>
          </div>
        </div>
      )}

      {/* Show total options loaded */}
      {!loading && !error && !searchTerm && (
        <p className="text-xs text-gray-400 mt-2">
          Menampilkan {kodeAnggaranOptions.length} kode anggaran perjalanan dinas
        </p>
      )}

      {/* Search tips */}
      {!loading && !error && (
        <p className="text-xs text-gray-400 mt-1">
          💡 Tips: Cari berdasarkan kode, layanan, wilayah, atau kategori
        </p>
      )}
    </div>
  );
};

export default KodeAnggaranSection;