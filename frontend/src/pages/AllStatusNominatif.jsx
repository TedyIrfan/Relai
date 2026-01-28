import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Users, FileX, Globe, Clock, X } from 'lucide-react';
import Notifikasi from '../components/Notifikasi';
import { consoleError } from '../utils/logger';

const TABS = {
  NOMINATIF: 'nominatif',
  NON_NOMINATIF: 'non_nominatif',
  ALL: 'all'
};

const AllStatusNominatif = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.NOMINATIF);
  const [nominatifs, setNominatifs] = useState([]);
  const [nonNominatifs, setNonNominatifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNonNominatif, setSelectedNonNominatif] = useState(null);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token || localStorage.getItem('token');

        if (!token) {
          consoleError('No token found');
          setNominatifs([]);
          setNonNominatifs([]);
          setLoading(false);
          return;
        }

        // Fetch both data if tab is ALL or if specific tab is selected
        if (activeTab === TABS.NOMINATIF || activeTab === TABS.ALL) {
          const nomResponse = await fetch('http://localhost/api/nominatifs-new/all', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (nomResponse.ok) {
            const data = await nomResponse.json();
            let nominatifArray = [];

            if (Array.isArray(data)) {
              nominatifArray = data;
            } else if (data && Array.isArray(data.data)) {
              nominatifArray = data.data;
            } else if (data && typeof data === 'object' && data.data) {
              if (Array.isArray(data.data.data)) {
                nominatifArray = data.data.data;
              } else {
                const possibleArrays = Object.values(data.data).filter(val => Array.isArray(val));
                if (possibleArrays.length > 0) {
                  nominatifArray = possibleArrays[0];
                }
              }
            }

            setNominatifs(nominatifArray);
          }
        }

        if (activeTab === TABS.NON_NOMINATIF || activeTab === TABS.ALL) {
          const nonNomResponse = await fetch('http://localhost/api/non-nominatifs/all', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (nonNomResponse.ok) {
            const data = await nonNomResponse.json();
            let nonNominatifArray = [];

            if (Array.isArray(data)) {
              nonNominatifArray = data;
            } else if (data && Array.isArray(data.data)) {
              nonNominatifArray = data.data;
            } else if (data && typeof data === 'object' && data.data) {
              if (Array.isArray(data.data.data)) {
                nonNominatifArray = data.data.data;
              } else {
                const possibleArrays = Object.values(data.data).filter(val => Array.isArray(val));
                if (possibleArrays.length > 0) {
                  nonNominatifArray = possibleArrays[0];
                }
              }
            }

            setNonNominatifs(nonNominatifArray);
          }
        }

      } catch (error) {
        consoleError('Error fetching data:', error);
        setNominatifs([]);
        setNonNominatifs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Get status badge color
  const getStatusBadge = (status) => {
    const badges = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle view nominatif
  const handleViewNominatif = (nominatif) => {
    navigate(`/nominatif/${nominatif.rka_detail_id}?id=${nominatif.id}`);
  };

  // Handle view non-nominatif (show detail modal)
  const handleViewNonNominatif = (nonNominatif) => {
    setSelectedNonNominatif(nonNominatif);
  };

  // Handle open evidence link
  const handleOpenEvidenceLink = (e) => {
    e.stopPropagation();
    if (selectedNonNominatif?.evidence_link) {
      window.open(selectedNonNominatif.evidence_link, '_blank');
    }
  };

  // Render Nominatif Table
  const renderNominatifTable = (data, title) => (
    <div className="bg-white shadow-lg rounded-xl mx-4 mt-4 border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">Total {Array.isArray(data) ? data.length : 0} data</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <table className="w-full table-auto min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Code RKA</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">User</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Layanan</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Deskripsi</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">Anggaran</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">SP2D</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : Array.isArray(data) && data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-mono text-gray-900">{item.rka_detail?.code_rka || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{item.user?.name || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-xs" title={item.rka_detail?.layanan}>{item.rka_detail?.layanan || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-xs" title={item.deskripsi_perjalanan_dinas}>{item.deskripsi_perjalanan_dinas || '-'}</td>
                  <td className="px-3 py-2 text-sm font-medium text-right text-gray-900">{formatRupiah(item.total_pagu_trip || item.total_pagu || 0)}</td>
                  <td className="px-3 py-2 text-sm font-medium text-right text-gray-900">
                    {formatRupiah((item.total_pagu_trip || item.total_pagu || 0) - (item.total_aktual_trip || item.total_biaya_aktual || 0))}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{formatDate(item.tanggal_mulai)}</td>
                  <td className="px-3 py-2 text-sm text-right">
                    <button onClick={() => handleViewNominatif(item)} className="p-1 text-purple-600 hover:text-purple-800" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900">Belum ada data</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Non-Nominatif Table
  const renderNonNominatifTable = (data, title) => (
    <div className="bg-white shadow-lg rounded-xl mx-4 mt-4 border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">Total {Array.isArray(data) ? data.length : 0} data</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <table className="w-full table-auto min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Code RKA</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">User</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Deskripsi Kegiatan</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">Jumlah</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : Array.isArray(data) && data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-mono text-gray-900">{item.rka_detail?.code_rka || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{item.user?.name || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-xs" title={item.deskripsi_kegiatan}>{item.deskripsi_kegiatan || '-'}</td>
                  <td className="px-3 py-2 text-sm font-medium text-right text-gray-900">{formatRupiah(item.total_anggaran_terpakai)}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">{formatDate(item.tanggal)}</td>
                  <td className="px-3 py-2 text-sm text-right">
                    <button
                      onClick={() => handleViewNonNominatif(item)}
                      className="p-1 text-purple-600 hover:text-purple-800"
                      title="View Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <FileX className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900">Belum ada data</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Calculate stats
  const totalNominatif = nominatifs.length;
  const totalNonNominatif = nonNominatifs.length;
  const totalDraft = nominatifs.filter(n => n.status === 'draft').length + nonNominatifs.filter(n => n.status === 'draft').length;
  const totalSubmit = nominatifs.filter(n => n.status === 'submitted').length + nonNominatifs.filter(n => n.status === 'submitted').length;

  return (
    <>
      <Notifikasi />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl mx-4 mt-4 border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="flex items-center">
                <Globe className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">All Status</h1>
                  <p className="text-sm text-gray-600">Lihat semua data dari semua user (read-only)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-4 mt-4">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab(TABS.NOMINATIF)}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === TABS.NOMINATIF
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Nominatif
                  {totalNominatif > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {totalNominatif}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab(TABS.NON_NOMINATIF)}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === TABS.NON_NOMINATIF
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileX className="w-4 h-4 mr-2" />
                  Non-Nominatif
                  {totalNonNominatif > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {totalNonNominatif}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab(TABS.ALL)}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === TABS.ALL
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  All
                  {(totalNominatif + totalNonNominatif) > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {totalNominatif + totalNonNominatif}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white shadow-lg rounded-xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Data</p>
                  <p className="text-2xl font-bold text-gray-900">{totalNominatif + totalNonNominatif}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDraft}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Submit</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSubmit}</p>
                </div>
                <Eye className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === TABS.NOMINATIF && renderNominatifTable(nominatifs, 'Daftar Semua Nominatif')}
        {activeTab === TABS.NON_NOMINATIF && renderNonNominatifTable(nonNominatifs, 'Daftar Semua Non-Nominatif')}
        {activeTab === TABS.ALL && (
          <>
            {renderNominatifTable(nominatifs, 'Daftar Semua Nominatif')}
            {renderNonNominatifTable(nonNominatifs, 'Daftar Semua Non-Nominatif')}
          </>
        )}
      </div>

      {/* Modal Detail Non-Nominatif */}
      {selectedNonNominatif && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detail Non-Nominatif</h3>
                  <p className="text-sm text-gray-600">{selectedNonNominatif.user?.name || '-'}</p>
                </div>
                <button
                  onClick={() => setSelectedNonNominatif(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Code RKA & Layanan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Code RKA</label>
                  <p className="text-sm font-mono text-gray-900 mt-1">{selectedNonNominatif.rka_detail?.code_rka || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Layanan</label>
                  <p className="text-sm text-gray-900 mt-1 truncate" title={selectedNonNominatif.rka_detail?.layanan}>
                    {selectedNonNominatif.rka_detail?.layanan || '-'}
                  </p>
                </div>
              </div>

              {/* Deskripsi Kegiatan */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Deskripsi Kegiatan</label>
                <p className="text-sm text-gray-900 mt-1">{selectedNonNominatif.deskripsi_kegiatan || '-'}</p>
              </div>

              {/* Jumlah */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Total Anggaran Terpakai</label>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatRupiah(selectedNonNominatif.total_anggaran_terpakai)}</p>
              </div>

              {/* Status & Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedNonNominatif.status)}`}>
                      {selectedNonNominatif.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Tanggal</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedNonNominatif.tanggal)}</p>
                </div>
              </div>

              {/* Evidence Link */}
              {selectedNonNominatif.evidence_link && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Evidence Link</label>
                  <div className="mt-1">
                    <a
                      href={selectedNonNominatif.evidence_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Buka Evidence di Google Drive
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
              <button
                onClick={() => setSelectedNonNominatif(null)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllStatusNominatif;
