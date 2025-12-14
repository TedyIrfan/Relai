import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Calendar, CheckCircle, Clock } from 'lucide-react';
import Notifikasi from '../components/Notifikasi';
import KonfirmasiDialog from '../components/KonfirmasiDialog';

const NonNominatif = () => {
  const navigate = useNavigate();
  const [nonNominatifs, setNonNominatifs] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogKonfirmasi, setDialogKonfirmasi] = useState({
    isOpen: false,
    nonNominatifId: null
  });

  // Fetch non-nominatif list
  useEffect(() => {
    const fetchNonNominatifs = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token || localStorage.getItem('token');

        if (!token) {
          console.error('No token found');
          setNonNominatifs([]);
          setLoading(false);
          return;
        }

        // TODO: Ganti API endpoint ketika backend sudah ada
        const response = await fetch('http://localhost/api/non-nominatifs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);

          // Handle different response structures
          let nonNominatifArray = [];

          if (Array.isArray(data)) {
            nonNominatifArray = data;
          } else if (data && Array.isArray(data.data)) {
            nonNominatifArray = data.data;
          } else if (data && Array.isArray(data.results)) {
            nonNominatifArray = data.results;
          } else if (data && Array.isArray(data.non_nominatifs)) {
            nonNominatifArray = data.non_nominatifs;
          } else if (data && typeof data === 'object') {
            // Try to find array in nested properties (for Laravel pagination)
            if (data.data && Array.isArray(data.data.data)) {
              nonNominatifArray = data.data.data;
            } else if (data.data && Array.isArray(data.data.results)) {
              nonNominatifArray = data.data.results;
            } else {
              // Try to find array in nested properties
              const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
              if (possibleArrays.length > 0) {
                nonNominatifArray = possibleArrays[0];
              }
            }
          }

          if (Array.isArray(nonNominatifArray)) {
            setNonNominatifs(nonNominatifArray);
            setIsDataLoaded(true);
            console.log('Successfully loaded', nonNominatifArray.length, 'non-nominatifs');
          } else {
            console.warn('Unexpected data structure:', data);
            console.log('Available keys:', Object.keys(data));
            setNonNominatifs([]);
            setIsDataLoaded(true);
          }
        } else {
          console.error('API Error:', response.status, response.statusText);
          setNonNominatifs([]);
        }
      } catch (error) {
        console.error('Error fetching non-nominatifs:', error);
        setNonNominatifs([]);
        setIsDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNonNominatifs();
  }, []);

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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle actions
  const handleCreateNew = () => {
    navigate('/non-nominatif/create');
  };

  const handleEdit = (nonNominatif) => {
    // TODO: Implement inline edit atau modal edit
    alert('Fitur edit akan segera hadir');
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');

      // TODO: Ganti API endpoint ketika backend sudah ada
      const response = await fetch(`http://localhost/api/non-nominatifs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Tampilkan notifikasi sukses
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Non-Nominatif berhasil dihapus', 'success');
        }

        setNonNominatifs(nonNominatifs.filter(nom => nom.id !== id));
      } else {
        // Tampilkan notifikasi error
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Gagal menghapus non-nominatif', 'error');
        }
      }
    } catch (error) {
      console.error('Error deleting non-nominatif:', error);
      // Tampilkan notifikasi error jaringan
      if (window.tampilkanNotifikasi) {
        window.tampilkanNotifikasi('Terjadi kesalahan jaringan', 'error');
      }
    }
  };

  const handleSubmit = (id) => {
    // Buka dialog konfirmasi
    setDialogKonfirmasi({
      isOpen: true,
      nonNominatifId: id
    });
  };

  const handleConfirmSubmit = async () => {
    const { nonNominatifId } = dialogKonfirmasi;

    try {
      const token = localStorage.getItem('token');

      // TODO: Ganti API endpoint ketika backend sudah ada
      const response = await fetch(`http://localhost/api/non-nominatifs/${nonNominatifId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Tampilkan notifikasi sukses
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Non-Nominatif berhasil dikirim', 'success');
        }

        // Update status non-nominatif di local state
        setNonNominatifs(nonNominatifs.map(nom =>
          nom.id === nonNominatifId ? { ...nom, status: 'submitted' } : nom
        ));

        // Auto refresh setelah 1 detik untuk memastikan data terbaru
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Tampilkan notifikasi error
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Gagal mengirim non-nominatif', 'error');
        }
      }
    } catch (error) {
      console.error('Error submitting non-nominatif:', error);
      // Tampilkan notifikasi error jaringan
      if (window.tampilkanNotifikasi) {
        window.tampilkanNotifikasi('Terjadi kesalahan jaringan', 'error');
      }
    }

    // Tutup dialog
    setDialogKonfirmasi({ isOpen: false, nonNominatifId: null });
  };

  const handleCloseDialog = () => {
    setDialogKonfirmasi({ isOpen: false, nonNominatifId: null });
  };

  return (
    <>
      {/* Komponen Notifikasi - di luar container utama */}
      <Notifikasi />

      {/* Komponen Dialog Konfirmasi */}
      <KonfirmasiDialog
        isOpen={dialogKonfirmasi.isOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Pengiriman Non-Nominatif"
        message="Setelah non-nominatif dikirim, data RKA anggaran tidak akan bisa diedit lagi.\n\nPastikan semua data sudah benar sebelum melanjutkan."
        confirmText="Ya, Kirim"
        cancelText="Batal"
        type="success"
        iconType="warning"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header - Full Width */}
        <div className="bg-white shadow-lg rounded-xl mx-4 mt-4 border-b border-gray-200 relative">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Non-Nominatif
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola pengeluaran non-nominatif
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Buat Non-Nominatif
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Full Width */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow-lg rounded-xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Non-Nominatif</p>
                <p className="text-2xl font-bold text-gray-900">{isDataLoaded && Array.isArray(nonNominatifs) ? nonNominatifs.length : 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Draft</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isDataLoaded && Array.isArray(nonNominatifs) ? nonNominatifs.filter(n => n.status === 'draft').length : 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isDataLoaded && Array.isArray(nonNominatifs) ? nonNominatifs.filter(n => n.status === 'submitted').length : 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Non-Nominatif List - FULL WIDTH SCREEN */}
      <div className="bg-white shadow-lg rounded-xl mx-4 mt-4 border-b border-gray-200 relative">
        <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Non-Nominatif
          </h2>
          <p className="text-sm text-gray-600">
            Total {isDataLoaded && Array.isArray(nonNominatifs) ? nonNominatifs.length : 0} non-nominatif
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 overflow-hidden">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-1 py-1 text-left text-xs font-medium text-gray-600 uppercase" style={{width: '8%'}}>
                    Code RKA
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-medium text-gray-600 uppercase" style={{width: '15%'}}>
                    Layanan
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-medium text-gray-600 uppercase" style={{width: '30%'}}>
                    Deskripsi Kegiatan
                  </th>
                  <th className="px-1 py-1 text-right text-xs font-medium text-gray-600 uppercase" style={{width: '15%'}}>
                    Dana Anggaran
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-medium text-gray-600 uppercase" style={{width: '6%'}}>
                    Status
                  </th>
                  <th className="px-1 py-1 text-left text-xs font-medium text-gray-600 uppercase" style={{width: '8%'}}>
                    Tanggal
                  </th>
                  <th className="px-1 py-1 text-right text-xs font-medium text-gray-600 uppercase" style={{width: '6%'}}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : isDataLoaded && Array.isArray(nonNominatifs) && nonNominatifs.length > 0 ? (
                  nonNominatifs.map((nonNominatif) => (
                    <tr key={nonNominatif.id} className="hover:bg-gray-50">
                      <td className="px-1 py-1 text-sm font-mono text-gray-900">
                        {nonNominatif.rka_detail?.code_rka || '-'}
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-900">
                        <div className="truncate" title={nonNominatif.rka_detail?.layanan || '-'}>
                          {nonNominatif.rka_detail?.layanan || '-'}
                        </div>
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-900">
                        <div className="truncate" title={nonNominatif.deskripsi_kegiatan || '-'}>
                          {nonNominatif.deskripsi_kegiatan || '-'}
                        </div>
                      </td>
                      <td className="px-1 py-1 text-sm font-medium text-right text-gray-900">
                        {formatRupiah(nonNominatif.dana_anggaran || 0)}
                      </td>
                      <td className="px-1 py-1 text-sm">
                        <span className={`inline-flex items-center px-1 py-0 rounded-full text-xs font-medium ${getStatusBadge(nonNominatif.status)}`}>
                          {nonNominatif.status}
                        </span>
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-900">
                        <div className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          {formatDate(nonNominatif.tanggal_kegiatan)}
                        </div>
                      </td>
                      <td className="px-1 py-1 text-sm text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          {(nonNominatif.status === 'draft' || nonNominatif.status === 'rejected') && (
                            <button
                              onClick={() => handleEdit(nonNominatif)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {(nonNominatif.status === 'draft' || nonNominatif.status === 'rejected') && (
                            <button
                              onClick={() => handleDelete(nonNominatif.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {(nonNominatif.status === 'draft' || nonNominatif.status === 'rejected') && (
                            <button
                              onClick={() => handleSubmit(nonNominatif.id)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Submit"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Belum ada non-nominatif
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          Buat non-nominatif pertama Anda dengan klik tombol "Buat Non-Nominatif"
                        </p>
                        <button
                          onClick={handleCreateNew}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Buat Non-Nominatif Pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default NonNominatif;