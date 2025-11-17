import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, FileText, AlertCircle } from 'lucide-react';
import NominatifExcelTable from '../components/tables/NominatifExcelTable';

const NominatifPage = () => {
  const { rkaId } = useParams();
  const navigate = useNavigate();
  const [rkaDetail, setRkaDetail] = useState(null);
  const [nominatifData, setNominatifData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get draft data from localStorage (from create page)
  const [draftData, setDraftData] = useState(null);

  // Get token from localStorage
  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token || localStorage.getItem('token');
      console.log('Token found:', token ? 'YES' : 'NO');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
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

        console.log('Fetching RKA list to find ID:', rkaId);
        const response = await fetch('http://localhost/api/rka-details', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('RKA List Response:', data);

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
            console.log('Found RKA:', rkaDetail);
            setRkaDetail(rkaDetail);
          } else {
            console.error('RKA not found with ID:', rkaId);
            console.log('Available RKA IDs:', rkaArray.map(r => r.id));
            setError('RKA tidak ditemukan');
          }
        } else {
          setError('Gagal memuat data RKA');
        }
      } catch (error) {
        setError('Terjadi kesalahan saat memuat data');
        console.error('Error fetching RKA:', error);
      } finally {
        setLoading(false);
      }
    };

    if (rkaId) {
      fetchRKADetail();
    }
  }, [rkaId]);

  // Load draft data from localStorage on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('nominatifDraft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        console.log('Loaded draft data:', draft);
        setDraftData(draft);

        // Clear draft from localStorage after loading
        localStorage.removeItem('nominatifDraft');
      }
    } catch (error) {
      console.error('Error loading draft data:', error);
    }
  }, []);

  // Fetch existing nominatif data
  useEffect(() => {
    const fetchNominatifData = async () => {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost/api/nominatifs-new`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API Response Structure:', data);
          console.log('Data type:', typeof data);
          console.log('Data keys:', Object.keys(data));

          // Handle different response structures
          let dataArray = [];
          if (Array.isArray(data)) {
            dataArray = data;
          } else if (data && Array.isArray(data.data)) {
            dataArray = data.data;
          } else if (data && data.data && Array.isArray(data.data.data)) {
            dataArray = data.data.data;  // Fix: handle nested pagination structure
          } else if (data && Array.isArray(data.results)) {
            dataArray = data.results;
          } else {
            console.error('Unexpected data structure:', data);
            console.log('Setting empty array as fallback');
            setNominatifData([]);
            return;
          }

          console.log('Processed dataArray length:', dataArray.length);
          console.log('Sample data item:', dataArray[0]);

          // Filter by RKA ID and transform to table format
          const filteredData = dataArray
            .filter(item => {
              console.log('Checking item.rka_detail_id:', item.rka_detail_id, 'vs rkaId:', rkaId);
              return item.rka_detail_id == rkaId;
            })
            .flatMap(item => {
              console.log('Processing item detail_rows:', item.detail_rows);
              if (!item.detail_rows || !Array.isArray(item.detail_rows)) {
                console.warn('No detail_rows found for item:', item);
                return [];
              }

              return item.detail_rows.map(row => {
                console.log('Processing row:', row);
                return {
                  id: row.id,
                  person_type: row.person_type,
                  nama_lengkap: row.nama || row.person_name || '',
                  golongan: row.golongan || '',
                  jabatan: row.jabatan || '',
                  eselon: row.eselon || '',
                  asal: row.asal || '',
                  tujuan: row.tujuan || '',
                  tanggal_pergi: row.tanggal_pergi || '',
                  tanggal_pulang: row.tanggal_pulang || '',
                  transport_taksi_pergi_pagu: row.biaya_row?.transport_taksi_pergi_pagu || '',
                  transport_taksi_pergi_aktual: row.biaya_row?.transport_taksi_pergi_aktual || '',
                  transport_pergi_pagu: row.biaya_row?.transport_pergi_pagu || '',
                  transport_pergi_aktual: row.biaya_row?.transport_pergi_aktual || '',
                  transport_taksi_pulang_pagu: row.biaya_row?.transport_taksi_pulang_pagu || '',
                  transport_taksi_pulang_aktual: row.biaya_row?.transport_taksi_pulang_aktual || '',
                  transport_pulang_pagu: row.biaya_row?.transport_pulang_pagu || '',
                  transport_pulang_aktual: row.biaya_row?.transport_pulang_aktual || '',
                  penginapan_pagu: row.biaya_row?.penginapan_pagu || '',
                  penginapan_aktual: row.biaya_row?.penginapan_aktual || '',
                  uang_harian_fullboard_pagu: row.biaya_row?.uang_harian_fullboard_pagu || '',
                  uang_harian_fullboard_aktual: row.biaya_row?.uang_harian_fullboard_aktual || '',
                  uang_harian_pagu: row.biaya_row?.uang_harian_pagu || '',
                  uang_harian_aktual: row.biaya_row?.uang_harian_aktual || '',
                  uang_representasi_pagu: row.biaya_row?.uang_representasi_pagu || '',
                  uang_representasi_aktual: row.biaya_row?.uang_representasi_aktual || '',
                  evidence: row.evidence?.[0] || null
                };
              });
            });

          console.log('Final filtered data:', filteredData);
          setNominatifData(filteredData);
        }
      } catch (error) {
        console.error('Error fetching nominatif data:', error);
      }
    };

    if (rkaId) {
      fetchNominatifData();
    }
  }, [rkaId]);

  // Save nominatif data
  const handleSave = async (data) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();

      // Get today's date as default
      const todayDate = new Date().toISOString().split('T')[0];

      // Create or update nominatif
      const nominatifPayload = {
        rka_detail_id: parseInt(rkaId),
        deskripsi_perjalanan_dinas: draftData?.deskripsi || `Nominatif RKA ${rkaDetail?.code_rka}`,
        tanggal_mulai: draftData?.tanggalMulai || data[0]?.tanggal || todayDate,
        tanggal_selesai: draftData?.tanggalSelesai || data[data.length - 1]?.tanggal || todayDate,
        status: 'draft'
      };

      // First, create or get nominatif
      const nominatifResponse = await fetch('http://localhost/api/nominatifs-new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nominatifPayload)
      });

      if (!nominatifResponse.ok) {
        throw new Error('Gagal menyimpan nominatif');
      }

      const nominatifResult = await nominatifResponse.json();
      const nominatifId = nominatifResult.data.id;

      // Save detail rows and biaya rows
      for (const row of data) {
        // Save detail row
        const detailPayload = {
          person_type: row.person_type,
          person_name: row.nama,
          nama: row.nama,
          asal: row.asal,
          tujuan: row.tujuan,
          tanggal_pergi: row.tanggal,
          tanggal_sampai: row.tanggal,
          golongan: row.golongan,
          jabatan: row.jabatan,
          eselon: row.eselon,
          no: data.indexOf(row) + 1,
          row_order: data.indexOf(row) + 1
        };

        console.log('Creating nominatif with ID:', nominatifId);
        console.log('Detail payload:', detailPayload);

        const detailResponse = await fetch(`http://localhost/api/nominatifs/${nominatifId}/details`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(detailPayload)
        });

        console.log('Detail Response Status:', detailResponse.status);
        console.log('Detail Response OK:', detailResponse.ok);

        if (!detailResponse.ok) {
          const errorText = await detailResponse.text();
          console.error('Detail Response Error:', errorText);
          throw new Error(`Failed to create detail row: ${detailResponse.status} ${errorText}`);
        }

        const detailResult = await detailResponse.json();
        const detailId = detailResult.data.id;
        console.log('Created detail ID:', detailId);

          // Save biaya row
          const biayaPayload = {
            transport_taksi_pergi_pagu: row.transport_taksi_pergi_pagu || 0,
            transport_taksi_pergi_aktual: row.transport_taksi_pergi_aktual || 0,
            transport_pergi_pagu: row.transport_pergi_pagu || 0,
            transport_pergi_aktual: row.transport_pergi_aktual || 0,
            transport_taksi_pulang_pagu: row.transport_taksi_pulang_pagu || 0,
            transport_taksi_pulang_aktual: row.transport_taksi_pulang_aktual || 0,
            transport_pulang_pagu: row.transport_pulang_pagu || 0,
            transport_pulang_aktual: row.transport_pulang_aktual || 0,
            penginapan_pagu: row.penginapan_pagu || 0,
            penginapan_aktual: row.penginapan_aktual || 0,
            uang_harian_fullboard_pagu: row.uang_harian_fullboard_pagu || 0,
            uang_harian_fullboard_aktual: row.uang_harian_fullboard_aktual || 0,
            uang_harian_pagu: row.uang_harian_pagu || 0,
            uang_harian_aktual: row.uang_harian_aktual || 0,
            uang_representasi_pagu: row.uang_representasi_pagu || 0,
            uang_representasi_aktual: row.uang_representasi_aktual || 0
          };

          await fetch(`http://localhost/api/nominatifs/details/${detailId}/biaya`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(biayaPayload)
          });

          // Handle evidence upload if exists
          if (row.evidence) {
            const formData = new FormData();
            formData.append('evidence_file', row.evidence);

            await fetch(`http://localhost/api/nominatifs/details/${detailId}/evidence`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });
          }
        }
      }

      setSuccess('Data berhasil disimpan!');
    } catch (error) {
      setError(error.message || 'Gagal menyimpan data');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Submit nominatif
  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // First save the data
      await handleSave(data);

      // Then submit
      const token = getToken();
      const response = await fetch(`http://localhost/api/nominatifs-new/1/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Nominatif berhasil dikirim!');
        setTimeout(() => {
          navigate('/nominatifs');
        }, 2000);
      } else {
        throw new Error('Gagal mengirim nominatif');
      }
    } catch (error) {
      setError(error.message || 'Gagal mengirim data');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error && !rkaDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/rka')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali ke Daftar RKA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/rka')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Input Nominatif
                </h1>
                {draftData?.deskripsi && (
                  <p className="text-sm text-gray-900 font-medium">
                    {draftData.deskripsi}
                  </p>
                )}
                {rkaDetail && (
                  <p className="text-sm text-gray-600">
                    {rkaDetail.code_rka} - {rkaDetail.layanan}
                    {draftData?.tanggalMulai && draftData?.tanggalSelesai && (
                      <span className="ml-2">
                        • {new Date(draftData.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(draftData.tanggalSelesai).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Status: <span className="font-medium">Draft</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Save className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          </div>
        )}

        {/* Excel Table */}
        <NominatifExcelTable
          rkaDetail={rkaDetail}
          initialData={nominatifData}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default NominatifPage;