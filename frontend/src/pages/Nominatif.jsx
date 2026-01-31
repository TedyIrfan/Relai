import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Calendar, CheckCircle, Clock, Eye } from 'lucide-react';
import Notifikasi from '../components/Notifikasi';
import KonfirmasiDialog from '../components/KonfirmasiDialog';
import { consoleError } from '../utils/logger';
import api from '../services/api';

const Nominatif = () => {
  const navigate = useNavigate();
  const [nominatifs, setNominatifs] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogKonfirmasi, setDialogKonfirmasi] = useState({
    isOpen: false,
    nominatifId: null,
    deskripsi: '',
    type: 'delete' // 'delete' or 'submit'
  });

  // Add deleting and submitting state for visual feedback
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch nominatif list
  useEffect(() => {
    const fetchNominatifs = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token || localStorage.getItem('token');

        if (!token) {
          consoleError('No token found');
          setNominatifs([]);
          setLoading(false);
          return;
        }

        const response = await api.get('/nominatifs-new');
        const data = response.data;

        if (true) {

          // Handle different response structures
          let nominatifArray = [];

          if (Array.isArray(data)) {
            nominatifArray = data;
          } else if (data && Array.isArray(data.data)) {
            nominatifArray = data.data;
          } else if (data && Array.isArray(data.results)) {
            nominatifArray = data.results;
          } else if (data && Array.isArray(data.nominatifs)) {
            nominatifArray = data.nominatifs;
          } else if (data && typeof data === 'object') {
            // Try to find array in nested properties (for Laravel pagination)
            if (data.data && Array.isArray(data.data.data)) {
              nominatifArray = data.data.data;
            } else if (data.data && Array.isArray(data.data.results)) {
              nominatifArray = data.data.results;
            } else {
              // Try to find array in nested properties
              const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
              if (possibleArrays.length > 0) {
                nominatifArray = possibleArrays[0];
              }
            }
          }

          if (Array.isArray(nominatifArray)) {
            setNominatifs(nominatifArray);
            setIsDataLoaded(true);
          } else {
            setNominatifs([]);
            setIsDataLoaded(true);
          }
        }
      } catch (error) {
        consoleError('Error fetching nominatifs:', error);
        setNominatifs([]);
        setIsDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNominatifs();
  }, []);

  // Tidak ada filter - langsung gunakan nominatifs asli

  // Get status badge color
  const getStatusBadge = (status) => {
    const badges = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800'
      // 🎯 REMOVED: approved status (tidak digunakan)
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

  // Handle actions
  const handleCreateNew = () => {
    navigate('/nominatif/create');
  };

  
  const handleEdit = (nominatif) => {
    // Langsung ke form edit dulu
    navigate(`/nominatif/edit/${nominatif.id}`);
  };

  const handleView = (nominatif) => {
    // Navigate ke detail page dengan view mode (read-only)
    navigate(`/nominatif/${nominatif.rka_detail_id}?id=${nominatif.id}`);
  };

  const handleDeleteClick = (id, deskripsi) => {
    setDialogKonfirmasi({
      isOpen: true,
      nominatifId: id,
      deskripsi: deskripsi,
      type: 'delete'
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const deleteId = dialogKonfirmasi.nominatifId;

      // Set loading state immediately for UI feedback
      setIsDeleting(true);

      // Close dialog immediately for better UX
      handleCloseDialog();

      await api.delete(`/nominatifs-new/${deleteId}`);

      if (true) {
        // Optimized state update - find and remove specific item
        setNominatifs(prevNominatifs => {
          const index = prevNominatifs.findIndex(nom => nom.id === deleteId);
          if (index > -1) {
            // Create new array without the deleted item for better performance
            const newNominatifs = [...prevNominatifs];
            newNominatifs.splice(index, 1);
            return newNominatifs;
          }
          return prevNominatifs;
        });

        // Tampilkan notifikasi sukses
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Data berhasil dihapus', 'success');
        }
      } else {
        // Tampilkan notifikasi error
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Gagal menghapus nominatif', 'error');
        }
      }
    } catch (error) {
      consoleError('Error deleting nominatif:', error);
      // Tampilkan notifikasi error jaringan
      if (window.tampilkanNotifikasi) {
        window.tampilkanNotifikasi('Terjadi kesalahan jaringan', 'error');
      }
    } finally {
      // Always reset loading state
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogKonfirmasi({
      isOpen: false,
      nominatifId: null,
      deskripsi: '',
      type: 'delete'
    });
  };

  const handleSubmit = (id) => {
    // Buka dialog konfirmasi
    const nominatif = nominatifs.find(n => n.id === id);
    setDialogKonfirmasi({
      isOpen: true,
      nominatifId: id,
      deskripsi: nominatif?.deskripsi_perjalanan_dinas || '',
      type: 'submit'
    });
  };

  const handleConfirmSubmit = async () => {
    const { nominatifId } = dialogKonfirmasi;

    // Set loading state immediately
    setIsSubmitting(true);

    try {
      await api.post(`/nominatifs-new/${nominatifId}/submit`);

      if (true) {
        // Tampilkan notifikasi sukses
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Nominatif berhasil dikirim', 'success');
        }

        // Update status nominatif di local state
        setNominatifs(nominatifs.map(nom =>
          nom.id === nominatifId ? { ...nom, status: 'submitted' } : nom
        ));

        // Auto refresh setelah 1 detik untuk memastikan data terbaru
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Tampilkan notifikasi error
        if (window.tampilkanNotifikasi) {
          window.tampilkanNotifikasi('Gagal mengirim nominatif', 'error');
        }
      }
    } catch (error) {
      consoleError('Error submitting nominatif:', error);
      // Tampilkan notifikasi error jaringan
      if (window.tampilkanNotifikasi) {
        window.tampilkanNotifikasi('Terjadi kesalahan jaringan', 'error');
      }
    } finally {
      // Always reset loading state
      setIsSubmitting(false);
      // Tutup dialog
      setDialogKonfirmasi({
        isOpen: false,
        nominatifId: null,
        deskripsi: '',
        type: 'delete'
      });
    }
  };

  return (
    <>
      {/* Komponen Notifikasi - di luar container utama */}
      <Notifikasi />

      {/* Komponen Dialog Konfirmasi */}
      <KonfirmasiDialog
        isOpen={dialogKonfirmasi.isOpen}
        onClose={handleCloseDialog}
        onConfirm={dialogKonfirmasi.type === 'delete' ? handleConfirmDelete : handleConfirmSubmit}
        title={dialogKonfirmasi.type === 'delete' ? 'Konfirmasi Hapus Data' : 'Konfirmasi Pengiriman Nominatif'}
        message={dialogKonfirmasi.type === 'delete'
          ? `Apakah Anda yakin ingin menghapus data nominatif ini?\n\nDeskripsi: ${dialogKonfirmasi.deskripsi}\n\nData yang sudah dihapus tidak dapat dikembalikan.`
          : `Apakah Anda yakin ingin mengirim data nominatif ini?\n\nDeskripsi: ${dialogKonfirmasi.deskripsi}\n\nSetelah nominatif dikirim, data RKA anggaran tidak akan bisa diedit lagi.\n\nPastikan semua data sudah benar sebelum melanjutkan.`
        }
        confirmText={dialogKonfirmasi.type === 'delete' ? 'Ya, Hapus' : 'Ya, Kirim'}
        cancelText="Batal"
        type={dialogKonfirmasi.type === 'delete' ? 'danger' : 'success'}
        iconType="warning"
        isLoading={dialogKonfirmasi.type === 'submit' ? isSubmitting : false}
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
                  Nominatif Perjalanan Dinas
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola nominatif perjalanan dinas
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Buat Nominatif
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
                <p className="text-sm text-gray-600">Total Nominatif</p>
                <p className="text-2xl font-bold text-gray-900">{isDataLoaded && Array.isArray(nominatifs) ? nominatifs.length : 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Draft</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isDataLoaded && Array.isArray(nominatifs) ? nominatifs.filter(n => n.status === 'draft').length : 0}
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
                  {isDataLoaded && Array.isArray(nominatifs) ? nominatifs.filter(n => n.status === 'submitted').length : 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Nominatif List - FULL WIDTH SCREEN */}
      <div className="bg-white shadow-lg rounded-xl mx-4 mt-4 border-b border-gray-200 relative">
        <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Nominatif
          </h2>
          <p className="text-sm text-gray-600">
            Total {isDataLoaded && Array.isArray(nominatifs) ? nominatifs.length : 0} nominatif
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
                  <th className="px-1 py-1 text-left text-xs font-medium text-gray-600 uppercase" style={{width: '12%'}}>
                    Deskripsi
                  </th>
                  <th className="px-1 py-1 text-right text-xs font-medium text-gray-600 uppercase" style={{width: '10%'}}>
                    Anggaran Berjalan
                  </th>
                  <th className="px-1 py-1 text-right text-xs font-medium text-gray-600 uppercase" style={{width: '10%'}}>
                    Anggaran SP2D
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
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : isDataLoaded && Array.isArray(nominatifs) && nominatifs.length > 0 ? (
                  nominatifs.map((nominatif) => {
                    // Get the first main person from detail rows for display
                    const mainPerson = nominatif.detail_rows?.find(row => row.person_type === 'main');
                    return (
                    <tr key={nominatif.id} className="hover:bg-gray-50">
                      <td className="px-1 py-1 text-sm font-mono text-gray-900">
                        {nominatif.rka_detail?.code_rka || '-'}
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-900">
                        <div className="truncate" title={nominatif.rka_detail?.layanan || '-'}>
                          {nominatif.rka_detail?.layanan || '-'}
                        </div>
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-900">
                        <div className="truncate" title={nominatif.deskripsi_perjalanan_dinas || '-'}>
                          {nominatif.deskripsi_perjalanan_dinas || '-'}
                        </div>
                      </td>
                      <td className="px-1 py-1 text-sm font-medium text-right text-gray-900">
                        {formatRupiah(
                          // 🎯 NEW: Anggaran Berjalan = Total Pagu yang diinput user (total_pagu_trip)
                          nominatif.total_pagu_trip || nominatif.total_pagu || 0
                        )}
                      </td>
                      <td className="px-1 py-1 text-sm font-medium text-right text-gray-900">
                        {formatRupiah(
                          // 🎯 SP2D: Total Pagu - Total Aktual (selisih)
                          (nominatif.total_pagu_trip || nominatif.total_pagu || 0) -
                          (nominatif.total_aktual_trip || nominatif.total_biaya_aktual || 0)
                        )}
                      </td>
                      <td className="px-1 py-1 text-sm">
                        <span className={`inline-flex items-center px-1 py-0 rounded-full text-xs font-medium ${getStatusBadge(nominatif.status)}`}>
                          {nominatif.status}
                        </span>
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-900">
                        <div className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          {formatDate(nominatif.tanggal_mulai)}
                        </div>
                      </td>
                      <td className="px-1 py-1 text-sm text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          {nominatif.status === 'submitted' && (
                            <button
                              onClick={() => handleView(nominatif)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {(nominatif.status === 'draft' || nominatif.status === 'rejected') && (
                            <button
                              onClick={() => handleEdit(nominatif)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {(nominatif.status === 'draft' || nominatif.status === 'rejected') && (
                            <button
                              onClick={() => handleDeleteClick(nominatif.id, nominatif.deskripsi_perjalanan_dinas)}
                              disabled={isDeleting}
                              className={`p-1 ${isDeleting ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                              title={isDeleting ? 'Menghapus...' : 'Hapus'}
                            >
                              <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                            </button>
                          )}
                          {(nominatif.status === 'draft' || nominatif.status === 'rejected') && (
                            <button
                              onClick={() => handleSubmit(nominatif.id)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Submit"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Belum ada nominatif
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          Buat nominatif pertama Anda dengan klik tombol "Buat Nominatif"
                        </p>
                        <button
                          onClick={handleCreateNew}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Buat Nominatif Pertama
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

export default Nominatif;