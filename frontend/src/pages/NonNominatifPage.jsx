import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, FileText, AlertCircle, Plus, X, Link2, Loader2 } from 'lucide-react';
import useNotification from '../hooks/useNotification';
import { consoleLog, consoleError, consoleWarn } from '../utils/logger';
import api from '../services/api';

const NonNominatifPage = () => {
  const { rkaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const specificNominatifId = searchParams.get('id');

  const { success: showSuccess, error: showError, notifications, close } = useNotification();

  const [rkaDetail, setRkaDetail] = useState(null);
  const [nonNominatif, setNonNominatif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // State untuk form data
  const [formData, setFormData] = useState({
    deskripsi_kegiatan: '',
    tanggal_kegiatan: '',
    dana_anggaran: ''
  });

  // State untuk evidence
  const [evidenceList, setEvidenceList] = useState([]);

  // Get draft data from localStorage (from create page)
  const [draftData, setDraftData] = useState(null);

  // Get token from localStorage
  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token || localStorage.getItem('token');
      consoleLog('Token found:', token ? 'YES' : 'NO');
      return token;
    } catch (error) {
      consoleError('Error getting token:', error);
      return localStorage.getItem('token');
    }
  };

  // Fetch RKA detail from list
  useEffect(() => {
    const fetchRKADetail = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Token tidak ditemukan. Silakan login kembali.');
          setLoading(false);
          return;
        }

        consoleLog('Fetching RKA list to find ID:', rkaId);
        const response = await api.get('/rka-details');

        // Axios returns data directly
        const data = response.data;
        consoleLog('RKA List Response:', data);

        // Handle different response structures
        let rkaArray = [];
        if (Array.isArray(data)) {
          rkaArray = data;
        } else if (data && Array.isArray(data.data)) {
          rkaArray = data.data;
        } else if (data && Array.isArray(data.results)) {
          rkaArray = data.results;
        }

          // Find RKA by ID
          const rkaDetail = rkaArray.find(rka => rka.id == rkaId);

          if (rkaDetail) {
            consoleLog('Found RKA:', rkaDetail);
            setRkaDetail(rkaDetail);
          } else {
            consoleError('RKA not found with ID:', rkaId);
            consoleLog('Available RKA IDs:', rkaArray.map(r => r.id));
            setError('RKA tidak ditemukan');
          }
        } else {
          setError('Gagal memuat data RKA');
        }
      } catch (error) {
        setError('Terjadi kesalahan saat memuat data');
        consoleError('Error fetching RKA:', error);
      } finally {
        setLoading(false);
      }
    };

    if (rkaId) {
      fetchRKADetail();
    }
  }, [rkaId]);

  // Load draft data from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('nonNominatifDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setDraftData(draft);
      consoleLog('📝 Loaded draft data:', draft);

      // If rkaId matches, populate form
      if (draft.rkaId == rkaId) {
        consoleLog('✅ RKA ID matches draft:', draft.rkaId);
        setFormData({
          deskripsi_kegiatan: draft.deskripsi || '',
          tanggal_kegiatan: draft.tanggal || '',
          dana_anggaran: draft.danaAnggaran || ''
        });
        setSuccess('Draft berhasil dimuat');
      } else {
        consoleLog('❌ RKA ID does not match. Expected:', rkaId, 'Got:', draft.rkaId);
      }
    }
  }, [rkaId]);

  // Fetch existing non-nominatif if in edit mode
  useEffect(() => {
    if (specificNominatifId) {
      consoleLog('🔍 EDIT MODE: Fetching specific non-nominatif ID:', specificNominatifId);
      setIsEditMode(true);
      fetchNonNominatif(specificNominatifId);
    } else {
      consoleLog('🚀 CREATE MODE: Initializing new non-nominatif for RKA ID:', rkaId);
      setIsEditMode(false);
      // Load draft data if exists
      if (draftData) {
        setFormData({
          deskripsi_kegiatan: draftData.deskripsi || '',
          tanggal_kegiatan: draftData.tanggal || '',
          dana_anggaran: draftData.danaAnggaran || ''
        });
      }
    }
  }, [specificNominatifId, rkaId]);

  // Fetch specific non-nominatif data
  const fetchNonNominatif = async (id) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Token tidak ditemukan');
        return;
      }

      // TODO: Update API endpoint when backend is ready
      const response = await fetch(`http://localhost/api/non-nominatifs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        consoleLog('✅ Data loaded successfully:', data);
        setNonNominatif(data);

        // Populate form with existing data
        setFormData({
          deskripsi_kegiatan: data.deskripsi_kegiatan || '',
          tanggal_kegiatan: data.tanggal_kegiatan || '',
          dana_anggaran: data.dana_anggaran || ''
        });

        // TODO: Load evidence list when backend is ready
        // setEvidenceList(data.evidences || []);
      } else {
        consoleError('Failed to fetch non-nominatif:', response.status);
        setError('Gagal memuat data non-nominatif');
      }
    } catch (error) {
      consoleError('Error fetching non-nominatif:', error);
      setError('Terjadi kesalahan saat memuat data');
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle currency input
  const handleCurrencyInput = (field, value) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    handleInputChange(field, numericValue);
  };

  // Format currency for display
  const formatCurrency = (value) => {
    const numValue = parseInt(value) || 0;
    return new Intl.NumberFormat('id-ID').format(numValue);
  };

  // Add evidence
  const addEvidence = () => {
    setEvidenceList(prev => [...prev, {
      id: Date.now(),
      evidence_link: '',
      evidence_name: '',
      keterangan: ''
    }]);
  };

  // Remove evidence
  const removeEvidence = (id) => {
    setEvidenceList(prev => prev.filter(e => e.id !== id));
  };

  // Update evidence
  const updateEvidence = (id, field, value) => {
    setEvidenceList(prev => prev.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!formData.deskripsi_kegiatan || !formData.dana_anggaran) {
      showError('Deskripsi kegiatan dan dana anggaran wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const token = getToken();
      if (!token) {
        showError('Token tidak ditemukan');
        return;
      }

      const payload = {
        rka_detail_id: rkaId,
        deskripsi_kegiatan: formData.deskripsi_kegiatan,
        tanggal_kegiatan: formData.tanggal_kegiatan,
        dana_anggaran: formData.dana_anggaran,
        status: 'draft',
        evidences: evidenceList
      };

      // TODO: Update API endpoint when backend is ready
      const url = isEditMode
        ? `http://localhost/api/non-nominatifs/${specificNominatifId}`
        : 'http://localhost/api/non-nominatifs';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Non-nominatif berhasil disimpan sebagai draft');

        // Redirect to list after save
        setTimeout(() => {
          navigate('/non-nominatif');
        }, 1000);
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Gagal menyimpan draft');
      }
    } catch (error) {
      consoleError('Error saving draft:', error);
      showError('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  // Submit non-nominatif with anti-spam protection
  const handleSubmit = async () => {
    if (submitting) {
      return; // ⛔️ PREVENT SPAM
    }

    if (!formData.deskripsi_kegiatan || !formData.dana_anggaran) {
      showError('Deskripsi kegiatan dan dana anggaran wajib diisi');
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin mengirim non-nominatif ini? Setelah dikirim, data tidak dapat diubah lagi.'
    );

    if (!confirmed) return;

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        showError('Token tidak ditemukan');
        return;
      }

      const payload = {
        rka_detail_id: rkaId,
        deskripsi_kegiatan: formData.deskripsi_kegiatan,
        tanggal_kegiatan: formData.tanggal_kegiatan,
        dana_anggaran: formData.dana_anggaran,
        status: 'submitted',
        evidences: evidenceList
      };

      // TODO: Update API endpoint when backend is ready
      const url = isEditMode
        ? `http://localhost/api/non-nominatifs/${specificNominatifId}/submit`
        : `http://localhost/api/non-nominatifs/${specificNominatifId}/submit`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showSuccess('Non-nominatif berhasil dikirim');

        // Redirect to list after submit
        setTimeout(() => {
          navigate('/non-nominatif');
        }, 1000);
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Gagal mengirim non-nominatif');
      }
    } catch (error) {
      consoleError('Error submitting:', error);
      showError('Terjadi kesalahan saat mengirim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/non-nominatif')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <p>{notification.message}</p>
            <button
              onClick={() => close(notification.id)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
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
                    {isEditMode ? 'Edit Non-Nominatif' : 'Buat Non-Nominatif Baru'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {rkaDetail ? `${rkaDetail.code_rka} - ${rkaDetail.layanan}` : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Form */}
          <div className="space-y-6">
            {/* Deskripsi Kegiatan */}
            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Kegiatan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deskripsi"
                value={formData.deskripsi_kegiatan}
                onChange={(e) => handleInputChange('deskripsi_kegiatan', e.target.value)}
                placeholder="Contoh: Pembelian ATK untuk operasional kantor..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>

            {/* Tanggal dan Dana */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Kegiatan
                </label>
                <input
                  type="date"
                  id="tanggal"
                  value={formData.tanggal_kegiatan}
                  onChange={(e) => handleInputChange('tanggal_kegiatan', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="dana-anggaran" className="block text-sm font-medium text-gray-700 mb-2">
                  Dana Anggaran <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="text"
                    id="dana-anggaran"
                    value={formatCurrency(formData.dana_anggaran)}
                    onChange={(e) => handleCurrencyInput('dana_anggaran', e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Evidence Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Evidence</h3>
                <button
                  onClick={addEvidence}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Evidence
                </button>
              </div>

              {evidenceList.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada evidence</p>
                  <p className="text-sm text-gray-500 mt-1">Tambahkan evidence untuk mendukung dokumen ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evidenceList.map((evidence, index) => (
                    <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Evidence {index + 1}</h4>
                        <button
                          onClick={() => removeEvidence(evidence.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link Google Drive
                          </label>
                          <input
                            type="url"
                            value={evidence.evidence_link}
                            onChange={(e) => updateEvidence(evidence.id, 'evidence_link', e.target.value)}
                            placeholder="https://drive.google.com/file/d/..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama File
                          </label>
                          <input
                            type="text"
                            value={evidence.evidence_name}
                            onChange={(e) => updateEvidence(evidence.id, 'evidence_name', e.target.value)}
                            placeholder="Nama evidence"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Keterangan
                        </label>
                        <input
                          type="text"
                          value={evidence.keterangan}
                          onChange={(e) => updateEvidence(evidence.id, 'keterangan', e.target.value)}
                          placeholder="Keterangan evidence"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan Draft'}
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonNominatifPage;