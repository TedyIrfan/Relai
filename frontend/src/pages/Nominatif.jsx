import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Calendar, CheckCircle, Clock } from 'lucide-react';

const Nominatif = () => {
  const navigate = useNavigate();
  const [nominatifs, setNominatifs] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch nominatif list
  useEffect(() => {
    const fetchNominatifs = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token || localStorage.getItem('token');

        if (!token) {
          console.error('No token found');
          setNominatifs([]);
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost/api/nominatifs-new', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data); // Debug log

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
            console.log('Successfully loaded', nominatifArray.length, 'nominatifs');
          } else {
            console.warn('Unexpected data structure:', data);
            console.log('Available keys:', Object.keys(data));
            setNominatifs([]);
            setIsDataLoaded(true);
          }
        } else {
          console.error('API Error:', response.status, response.statusText);
          setNominatifs([]);
        }
      } catch (error) {
        console.error('Error fetching nominatifs:', error);
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
    // Jika nominatif punya rka_detail_id, gunakan itu. Jika tidak, fallback ke id (meski mungkin salah konteks)
    const routeId = nominatif.rka_detail_id || nominatif.rka_detail?.id;
    
    if (routeId) {
      // Kirim ID nominatif spesifik via query param untuk memastikan yang diedit benar
      navigate(`/nominatif/${routeId}?id=${nominatif.id}`);
    } else {
      console.error("Data nominatif tidak lengkap untuk navigasi:", nominatif);
      alert("Data RKA tidak ditemukan pada nominatif ini.");
    }
  };

  const handleDelete = async (id) => {
    // Find the nominatif to show better confirmation message
    const nominatifToDelete = nominatifs.find(nom => nom.id === id);
    const statusText = nominatifToDelete?.status || 'unknown';

    if (window.confirm(`Apakah Anda yakin ingin menghapus nominatif ini?`)) {
      try {
        const token = localStorage.getItem('token');
        console.log('🗑️ Attempting to delete nominatif:', id, 'Status:', statusText);

        const response = await fetch(`http://localhost/api/nominatifs-new/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Delete response status:', response.status);

        if (response.ok) {
          console.log('✅ Nominatif deleted successfully');
          setNominatifs(nominatifs.filter(nom => nom.id !== id));

          // Show success message
          alert('Nominatif berhasil dihapus');
        } else {
          // Handle server errors
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `Gagal menghapus nominatif (HTTP ${response.status})`;

          console.error('❌ Delete failed:', errorMessage);
          alert(`Error: ${errorMessage}`);
        }
      } catch (error) {
        console.error('💥 Network error deleting nominatif:', error);
        alert('Terjadi kesalahan jaringan. Silakan coba lagi.');
      }
    }
  };

  const handleSubmit = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin submit nominatif ini?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost/api/nominatifs-new/${id}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Update status nominatif di local state
          setNominatifs(nominatifs.map(nom =>
            nom.id === id ? { ...nom, status: 'submitted' } : nom
          ));
        }
      } catch (error) {
        console.error('Error submitting nominatif:', error);
      }
    }
  };

  return (
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
                              onClick={() => handleDelete(nominatif.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
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
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
  );
};

export default Nominatif;