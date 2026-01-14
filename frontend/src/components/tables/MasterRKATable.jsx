import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { masterRKAColumns, formatRupiah, getKategoriColor } from '../../data/anggaranADummy';

const MasterRKATable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [rkaData, setRkaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedKategori) params.append('kategori', selectedKategori);

        const response = await fetch(`http://localhost:80/api/rka-details?${params}`);

        if (response.ok) {
          const data = await response.json();
          setRkaData(data);
          setUseAPI(true);
        } else {
          console.error('API Error:', response.statusText);
          setRkaData([]);
          setUseAPI(false);
        }
      } catch (error) {
        console.error('API Error:', error);
        setRkaData([]);
        setUseAPI(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedKategori]);

  // Client-side fuzzy search filter
  const filteredData = rkaData.filter(item => {
    if (!searchTerm) return true;

    const searchClean = searchTerm.toLowerCase().replace(/\s+/g, '');
    return Object.values(item).some(value => {
      if (!value) return false;
      const valueClean = value.toString().toLowerCase().replace(/\s+/g, '');
      return valueClean.includes(searchClean);
    });
  });

  // Search by specific field prioritized
  const getSearchHighlight = (text, field) => {
    if (!searchTerm) return text;

    // Convert text to string for comparison
    const textString = text ? text.toString() : '';
    const searchTermLower = searchTerm.toLowerCase();

    if (textString.toLowerCase().includes(searchTermLower)) {
      return (
        <span className="bg-yellow-100 text-yellow-800">
          {text}
        </span>
      );
    }
    return text;
  };

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Header dengan Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Data RKA Details</h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Kategori Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Semua Kategori</option>
              <option value="A">A - Dinas Pimpinan</option>
              <option value="B">B - Tata Usaha</option>
              <option value="C">C - Konferensi</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari layanan, kode, atau wilayah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4 mb-4 text-sm text-gray-600">
        <span>Filter: {selectedKategori || 'Semua'}</span>
        <span>•</span>
        <span>Hasil: {loading ? '...' : filteredData.length} data</span>
        {searchTerm && (
          <>
            <span>•</span>
            <span>Cari: "{searchTerm}"</span>
          </>
        )}
        {!loading && (
          <>
            <span>•</span>
            <span className="text-green-600">Database</span>
          </>
        )}
      </div>

      {/* Simple Table */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {masterRKAColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!loading && filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {getSearchHighlight(item.programDukunganManajemen, 'program')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-mono">
                    {getSearchHighlight(item.kodeProgram, 'kode_program')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {getSearchHighlight(item.layananUmum, 'layanan_umum')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-mono">
                    {getSearchHighlight(item.kodeLayanan1, 'kode_layanan_1')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-mono">
                    {getSearchHighlight(item.kodeLayanan2, 'kode_layanan_2')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {getSearchHighlight(item.layananTataUsaha, 'layanan_tata_usaha')}
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getKategoriColor(item.kategoriAnggaran)}`}>
                      {item.kategoriAnggaran}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-mono">
                    {getSearchHighlight(item.codeRka, 'code_rka')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 min-w-[200px] max-w-[300px]">
                    <div className="whitespace-normal">
                      {getSearchHighlight(item.layanan, 'layanan')}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {getSearchHighlight(item.wilayah, 'wilayah')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-xs">
                    {getSearchHighlight(item.artiKode, 'arti_kode')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-center">
                    {getSearchHighlight(item.sisaPemakaianAnggaran, 'sisa')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-center">
                    {getSearchHighlight(item.status, 'status')}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium">
                    {formatRupiah(item.anggaranPerjalanan)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium">
                    {formatRupiah(item.anggaranLayanan)}
                  </td>
                  <td className="px-3 py-2 text-sm text-blue-600 text-right font-medium">
                    {formatRupiah(item.anggaran_berjalan)}
                  </td>
                  <td className="px-3 py-2 text-sm text-green-600 text-right font-medium">
                    {formatRupiah(item.anggaran_sp2d)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium">
                    {formatRupiah(item.anggaran_tersisa)}
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {getSearchHighlight(item.sbm, 'sbm')}
                    </span>
                  </td>
                </tr>
              ))
            ) : loading ? (
              <tr>
                <td colSpan={18} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={18} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm || selectedKategori
                    ? `Tidak ada data yang cocok dengan filter "${searchTerm || selectedKategori}"`
                    : 'Belum ada data. Upload file Excel untuk memulai.'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer dengan Info */}
      <div className="mt-4 text-sm text-gray-500 text-center border-t pt-4">
        <div className="flex justify-center gap-4">
          <span>Total: {loading ? '...' : filteredData.length} data</span>
          {selectedKategori && (
            <span>• Kategori: {selectedKategori}</span>
          )}
          {searchTerm && (
            <span>• Pencarian: "{searchTerm}"</span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          💡 {!loading ? 'Data dari database real-time' : 'Menghubungkan ke database...'}
          {!loading && filteredData.length === 0 && ' - Gunakan tombol Import Excel untuk memulai'}
        </div>
      </div>
    </div>
  );
};

export default MasterRKATable;