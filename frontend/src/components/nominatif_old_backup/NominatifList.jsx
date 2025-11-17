import React, { useState, useEffect } from 'react';
import { nominatifService } from '../../services/nominatifService';
import { formatCurrency } from '../../utils/formatters';
import useNotification from '../../hooks/useNotification';
import ConfirmDialog from '../common/ConfirmDialog';
import NotificationContainer from '../common/NotificationContainer';

const NominatifList = () => {
  const [nominatifs, setNominatifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, draft, submitted
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Notification and Dialog states
  const notification = useNotification();
  const [submittingId, setSubmittingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  const fetchNominatifs = async (page = 1, status = 'all') => {
    setLoading(true);
    setError(null);

    try {
      const params = { page };
      if (status !== 'all') {
        params.status = status;
      }

      const response = await nominatifService.getAll(params);

      if (response.success) {
        setNominatifs(response.data.data.data);
        setCurrentPage(response.data.data.current_page);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      console.error('Error fetching nominatifs:', error);
      setError('Gagal memuat data nominatif');
      notification.error('Gagal memuat data nominatif. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominatifs(currentPage, filter);
  }, [currentPage, filter]);

  const handleEdit = (id) => {
    window.location.href = `/nominatif?id=${id}`;
  };

  const handleDelete = async (id) => {
    const nominatif = nominatifs.find(n => n.id === id);
    if (!nominatif) return;

    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Hapus Nominatif',
      message: `Apakah Anda yakin ingin menghapus draft "${nominatif.deskripsi_perjalanan_dinas}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));

        try {
          const response = await nominatifService.delete(id);
          if (response.success) {
            notification.success('Draft berhasil dihapus! 🗑️');
            fetchNominatifs(currentPage, filter); // Refresh list
          } else {
            notification.error(response.message || 'Gagal menghapus draft');
          }
        } catch (error) {
          console.error('Error deleting nominatif:', error);
          notification.error('Gagal menghapus draft. Silakan coba lagi.');
        } finally {
          setConfirmDialog(prev => ({ ...prev, loading: false, isOpen: false }));
        }
      },
      loading: false
    });
  };

  const handleSubmit = async (id) => {
    const nominatif = nominatifs.find(n => n.id === id);
    if (!nominatif) return;

    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: 'Submit Nominatif',
      message: `Apakah Anda yakin ingin submit "${nominatif.deskripsi_perjalanan_dinas}"?

      • Anggaran Berjalan (Rp${formatCurrency(nominatif.anggaran_berjalan)}) akan berpindah ke Anggaran SP2D
      • Total Pagu: Rp${formatCurrency(nominatif.total_pagu)}
      • Total Aktual: Rp${formatCurrency(nominatif.total_biaya_aktual)}
      • Data tidak dapat diedit setelah submit`,
      confirmText: 'Ya, Submit',
      onConfirm: async () => {
        setSubmittingId(id);
        setConfirmDialog(prev => ({ ...prev, loading: true }));

        try {
          const response = await nominatifService.submit(id);
          if (response.success) {
            notification.success(
              `✅ Nominatif "${nominatif.deskripsi_perjalanan_dinas}" berhasil disubmit! Anggaran Berjalan (Rp${formatCurrency(nominatif.anggaran_berjalan)}) telah dipindahkan ke SP2D.`,
              {
                duration: 6000
              }
            );
            fetchNominatifs(currentPage, filter); // Refresh list
          } else {
            notification.error(response.message || 'Gagal submit nominatif');
          }
        } catch (error) {
          console.error('Error submitting nominatif:', error);
          notification.error('Gagal submit nominatif. Silakan coba lagi.');
        } finally {
          setSubmittingId(null);
          setConfirmDialog(prev => ({ ...prev, loading: false, isOpen: false }));
        }
      },
      loading: false
    });
  };

  const handleView = (id) => {
    window.location.href = `/nominatif?id=${id}`;
  };

  const getStatusBadge = (status) => {
    return (
      <span className="text-xs font-medium text-gray-700">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">Kelola semua data nominatif perjalanan dinas</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-400 text-white border-2 border-blue-500'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'draft'
                ? 'bg-yellow-400 text-white border-2 border-yellow-500'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'submitted'
                ? 'bg-green-400 text-white border-2 border-green-500'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            Submitted
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {nominatifs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Belum ada data nominatif</div>
            <button
              onClick={() => window.location.href = '/nominatif'}
              className="mt-4 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Buat Nominatif Pertama</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Pagu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Aktual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anggaran Berjalan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anggaran SP2D
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nominatifs.map((nominatif) => (
                  <tr key={nominatif.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {nominatif.deskripsi_perjalanan_dinas}
                        </div>
                        <div className="text-xs text-gray-500">
                          {nominatif.rka_detail?.layanan}
                        </div>
                        {/* Tambahkan nama dan jabatan tambahan orang */}
                        {nominatif.tambahan_orang && nominatif.tambahan_orang.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {nominatif.tambahan_orang.map((orang, index) => (
                              orang.nama_peserta && orang.jabatan_peserta ? (
                                <div key={index} className="text-xs text-blue-600 font-medium">
                                  • {orang.nama_peserta} - {orang.jabatan_peserta}
                                </div>
                              ) : null
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {(() => {
                          // Try hierarchical structure first, then fallback to direct access
                          const tanggalMulai = nominatif.rute_perjalanan?.tanggal_mulai ||
                                            nominatif.tanggal_mulai;
                          const tanggalSelesai = nominatif.rute_perjalanan?.tanggal_selesai ||
                                              nominatif.tanggal_selesai;

                          if (tanggalMulai && tanggalSelesai) {
                            return `${formatDate(tanggalMulai)} - ${formatDate(tanggalSelesai)}`;
                          } else if (tanggalMulai) {
                            return formatDate(tanggalMulai);
                          } else {
                            return '-';
                          }
                        })()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          // Try hierarchical structure first, then fallback to direct access
                          const jumlahHari = nominatif.rute_perjalanan?.total_hari ||
                                            nominatif.jumlah_hari;
                          return jumlahHari ? `${jumlahHari} hari` : '-';
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(nominatif.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(nominatif.total_pagu)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(nominatif.total_biaya_aktual)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {nominatif.status === 'draft' && (
                        <div className="text-sm font-medium text-blue-600">
                          {formatCurrency(nominatif.anggaran_berjalan)}
                        </div>
                      )}
                      {nominatif.status === 'submitted' && (
                        <div className="text-sm font-medium text-gray-400">
                          {formatCurrency(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {nominatif.status === 'draft' && (
                        <div className="text-sm font-medium text-gray-400">
                          {formatCurrency(0)}
                        </div>
                      )}
                      {nominatif.status === 'submitted' && (
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(nominatif.anggaran_sp2d)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(nominatif.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {nominatif.status === 'draft' ? (
                          <>
                            <button
                              onClick={() => handleEdit(nominatif.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleSubmit(nominatif.id)}
                              disabled={submittingId === nominatif.id}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                              {submittingId === nominatif.id ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Submitting...
                                </>
                              ) : (
                                'Submit'
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(nominatif.id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              Hapus
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleView(nominatif.id)}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            Lihat
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 text-sm font-medium rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
        loading={confirmDialog.loading}
      />

      {/* Notification Container */}
      <NotificationContainer
        notifications={notification.notifications}
        onClose={notification.close}
      />
    </div>
  );
};

export default NominatifList;