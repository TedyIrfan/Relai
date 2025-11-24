import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, FileText, AlertCircle } from 'lucide-react';
import NominatifExcelTable from '../components/tables/NominatifExcelTable';
import { nominatifService } from '../services/nominatifService';

const NominatifPage = () => {
  const { rkaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // Add search params hook
  const specificNominatifId = searchParams.get('id'); // Get ?id=... from URL

  const [rkaDetail, setRkaDetail] = useState(null);
  const [nominatifData, setNominatifData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nominatif, setNominatif] = useState(null);

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

  // Detect edit mode and load existing nominatif - STRICT MODE
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      // SKENARIO 1: EDIT MODE (Ada ID spesifik di URL)
      if (specificNominatifId && specificNominatifId !== 'undefined') {
        console.log(`🔍 EDIT MODE: Fetching specific nominatif ID: ${specificNominatifId}`);
        try {
          const response = await fetch(`http://localhost/api/nominatifs-new/${specificNominatifId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            // Handle response structure
            const data = result.data?.nominatif || result.data;
            
            if (data && data.id) {
              console.log('✅ Data loaded successfully:', data);
              setNominatif(data);
              setIsEditMode(true);
              await loadNominatifDetailRows(data.id);
            } else {
              throw new Error('Data nominatif tidak valid atau kosong');
            }
          } else {
            const errText = await response.text();
            throw new Error(`Gagal memuat data nominatif (Status: ${response.status})`);
          }
        } catch (err) {
          console.error('❌ Fatal Error loading nominatif:', err);
          setError(`Data tidak ditemukan: ${err.message}. Silakan kembali ke daftar.`);
          setIsEditMode(false); // Fail safe
        }
      } 
      // SKENARIO 2: CREATE MODE (Tidak ada ID di URL)
      else {
        console.log('🆕 CREATE MODE: No specific ID found, initializing new form');
        setIsEditMode(false);
        setNominatif(null);
      }

      setLoading(false);
    };

    // Jalankan inisialisasi hanya jika rkaId tersedia (karena itu param wajib dari URL utama)
    if (rkaId) {
      initializePage();
    }
  }, [rkaId, specificNominatifId]); // Dependency array bersih: hanya rerun jika ID berubah

  // DISABLED: Fetch existing nominatif data - now handled in edit mode detection
  // useEffect(() => {
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

    // DISABLED: Original create mode logic - now handled in edit mode detection
    // if (rkaId) {
    //   fetchNominatifData();
    // }
  // }, [rkaId]);

  // Check if this is edit mode by trying to find nominatif with this ID
  useEffect(() => {
    const checkEditMode = async () => {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost/api/nominatifs-new/${rkaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const nominatifData = await response.json();
              setIsEditMode(true);
          setNominatif(nominatifData.data);
          // Load existing detail rows for this nominatif
          await loadNominatifDetailRows(rkaId);
          setLoading(false); // Stop loading when done
        } else {
          console.log('🆕 Create mode, nominatif not found');
          setIsEditMode(false);
          setLoading(false); // Stop loading when done
        }
      } catch (error) {
        console.log('🆕 Create mode, error checking nominatif:', error);
        setIsEditMode(false);
        setLoading(false); // Stop loading when done
      }
    };

    if (rkaId) {
      checkEditMode();
    }
  }, [rkaId]);

  // Load existing detail rows for edit mode
  const loadNominatifDetailRows = async (nominatifId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost/api/nominatifs/${nominatifId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const detailsData = await response.json();
        console.log('📋 Raw API response details:', detailsData);

        if (detailsData.data && detailsData.data.length > 0) {
          console.log('📋 Sample detail data structure:', detailsData.data[0]);
          console.log('📋 Tanggal fields in first row:', {
            id: detailsData.data[0].id,
            tanggal_pergi: detailsData.data[0].tanggal_pergi,
            tanggal_sampai: detailsData.data[0].tanggal_sampai
          });
        }

        // Transform data for table
        const tableData = await Promise.all(
          detailsData.data.map(async (detail) => {
            // Get biaya data for this detail
            const biayaResponse = await fetch(`http://localhost/api/nominatifs/details/${detail.id}/biaya`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            let biayaData = {};
            if (biayaResponse.ok) {
              const biayaResult = await biayaResponse.json();
              biayaData = biayaResult.data || {};
            }

            return {
              id: detail.id,
              person_type: detail.person_type,
              nama_lengkap: detail.person_name,
              no: detail.row_order,
              golongan: detail.golongan || '',
              jabatan: detail.jabatan || '',
              eselon: detail.eselon || '',
              asal: detail.asal || '',
              tujuan: detail.tujuan || '',
              tanggal_pergi: detail.tanggal_pergi ? detail.tanggal_pergi.split('T')[0] : '',
              tanggal_sampai: detail.tanggal_sampai ? detail.tanggal_sampai.split('T')[0] : '',

              // Transportasi fields
              transport_pesawat_non_pp_pagu: biayaData.transport_pesawat_non_pp_pagu || '',
              transport_pesawat_non_pp_aktual: biayaData.transport_pesawat_non_pp_aktual || '',
              transport_taksi_pagu: biayaData.transport_taksi_pagu || '',
              transport_taksi_aktual: biayaData.transport_taksi_aktual || '',
              // Penginapan fields
              penginapan_jumlah_malam: biayaData.penginapan_jumlah_malam || '',
              penginapan_pagu_perhari: biayaData.penginapan_pagu_perhari || '',
              penginapan_aktual_perhari: biayaData.penginapan_aktual_perhari || '',
              // Meeting fields
              uang_harian_meeting_fullboard_jumlah_hari: biayaData.uang_harian_meeting_fullboard_jumlah_hari || '',
              uang_harian_meeting_fullboard_pagu_perhari: biayaData.uang_harian_meeting_fullboard_pagu_perhari || '',
              uang_harian_meeting_fullboard_aktual_perhari: biayaData.uang_harian_meeting_fullboard_aktual_perhari || '',
              uang_harian_meeting_fullday_jumlah_hari: biayaData.uang_harian_meeting_fullday_jumlah_hari || '',
              uang_harian_meeting_fullday_pagu_perhari: biayaData.uang_harian_meeting_fullday_pagu_perhari || '',
              uang_harian_meeting_fullday_aktual_perhari: biayaData.uang_harian_meeting_fullday_aktual_perhari || '',
              // Uang Harian fields
              uang_harian_luar_kota_jumlah_hari: biayaData.uang_harian_luar_kota_jumlah_hari || '',
              uang_harian_luar_kota_pagu_perhari: biayaData.uang_harian_luar_kota_pagu_perhari || '',
              uang_harian_luar_kota_aktual_perhari: biayaData.uang_harian_luar_kota_aktual_perhari || '',
              uang_harian_dalam_kota_jumlah_hari: biayaData.uang_harian_dalam_kota_jumlah_hari || '',
              uang_harian_dalam_kota_pagu_perhari: biayaData.uang_harian_dalam_kota_pagu_perhari || '',
              uang_harian_dalam_kota_aktual_perhari: biayaData.uang_harian_dalam_kota_aktual_perhari || '',
              // Representasi fields
              representasi_luar_kota_jumlah_hari: biayaData.representasi_luar_kota_jumlah_hari || '',
              representasi_luar_kota_pagu_perhari: biayaData.representasi_luar_kota_pagu_perhari || '',
              representasi_luar_kota_aktual_perhari: biayaData.representasi_luar_kota_aktual_perhari || '',
              representasi_dalam_kota_jumlah_hari: biayaData.representasi_dalam_kota_jumlah_hari || '',
              representasi_dalam_kota_pagu_perhari: biayaData.representasi_dalam_kota_pagu_perhari || '',
              representasi_dalam_kota_aktual_perhari: biayaData.representasi_dalam_kota_aktual_perhari || '',
            };
          })
        );

        // Debug transformed data before setting state
        const debugTableData = tableData.map(row => ({
          id: row.id,
          tanggal_pergi: row.tanggal_pergi,
          tanggal_sampai: row.tanggal_sampai
        }));
        console.log('🔄 Transformed table data:', debugTableData);

        // Check if any tanggal_sampai are empty
        const emptyTanggalSampai = debugTableData.filter(row => !row.tanggal_sampai);
        if (emptyTanggalSampai.length > 0) {
          console.warn('⚠️ Rows with empty tanggal_sampai:', emptyTanggalSampai);
        }

        setNominatifData(tableData);
      }
    } catch (error) {
      console.error('Error loading detail rows:', error);
    }
  };

  // Save nominatif data - Supports both create and edit modes
  const handleSave = async (data) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();

      // Get today's date as default
      const todayDate = new Date().toISOString().split('T')[0];

      // === SAFETY NET LOGIC ===
      // Cek ID dari state atau URL params untuk memastikan mode Edit
      const urlParams = new URLSearchParams(location.search);
      const urlNominatifId = urlParams.get('id');
      const activeNominatifId = nominatif?.id || urlNominatifId;
      
      // Tentukan mode berdasarkan keberadaan ID yang valid
      const isRealEditMode = !!activeNominatifId;

      console.log('🔒 SAFETY CHECK:', {
        stateId: nominatif?.id,
        urlId: urlNominatifId,
        activeId: activeNominatifId,
        isEditModeState: isEditMode,
        DECISION: isRealEditMode ? 'EDIT (PUT)' : 'CREATE (POST)'
      });

      // Create or update nominatif
      const nominatifPayload = {
        rka_detail_id: parseInt(rkaId),
        deskripsi_perjalanan_dinas: draftData?.deskripsi || `Nominatif RKA ${rkaDetail?.code_rka}`,
        tanggal_mulai: draftData?.tanggalMulai || data[0]?.tanggal_pergi || todayDate,
        tanggal_selesai: draftData?.tanggalSelesai || data[data.length - 1]?.tanggal_sampai || todayDate,
        status: 'draft'
      };
  
      // Conditional API call based on SAFEY NET logic
      const apiMethod = isRealEditMode ? 'PUT' : 'POST';
      let apiUrl = isRealEditMode
        ? `http://localhost/api/nominatifs-new/${activeNominatifId}`  // Edit existing
        : 'http://localhost/api/nominatifs-new'; // Create new

      // CRITICAL FIX: Prevent "undefined" in URL
      if (apiUrl.includes('undefined')) {
        console.error('🚨 CRITICAL: Attempted to send request to undefined URL:', apiUrl);
        console.log('Dump state:', { isEditMode, nominatif, activeNominatifId });
        
        if (isRealEditMode && activeNominatifId) {
             // Force fix URL if ID exists
             apiUrl = `http://localhost/api/nominatifs-new/${activeNominatifId}`;
             console.log('✅ URL fixed manually:', apiUrl);
        } else {
             throw new Error('Terjadi kesalahan sistem: ID Nominatif hilang. Silakan refresh halaman.');
        }
      }

      console.log(`📡 API ${apiMethod} to: ${apiUrl}`);

      // Validate ID before PUT
      if (apiMethod === 'PUT' && !activeNominatifId) {
        throw new Error('Gagal update: ID Nominatif tidak ditemukan dalam state maupun URL');
      }

      const nominatifResponse = await fetch(apiUrl, {
        method: apiMethod,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nominatifPayload)
      });

      if (!nominatifResponse.ok) {
        const errorText = await nominatifResponse.text();
        console.error(`Nominatif ${apiMethod} failed:`, errorText);
        throw new Error(`Gagal ${isEditMode ? 'update' : 'membuat'} nominatif: ${nominatifResponse.status} - ${errorText}`);
      }

      const nominatifResult = await nominatifResponse.json();
      const nominatifId = nominatifResult.data.id;
    
      // Prepare bulk data for detail rows
      const detailRowsData = data.map((row, index) => ({
        person_type: row.person_type || 'main',
        nama: row.nama_lengkap || row.nama || '', // Fixed: backend expects 'nama'
        person_name: row.nama_lengkap || row.nama || '', // Fixed: backend expects 'person_name'
        golongan: row.golongan || '',
        jabatan: row.jabatan || '',
        eselon: row.eselon || '',
        asal: row.asal || '',
        tujuan: row.tujuan || '',
        tanggal_pergi: row.tanggal_pergi || '',
        tanggal_sampai: row.tanggal_sampai || row.tanggal_pulang || '',
        no: index + 1,
        row_order: index + 1
      }));

      console.log('📦 Preparing bulk detail rows:', detailRowsData.length);

      // Use bulk API for detail rows
      const bulkDetailResponse = await fetch(`http://localhost/api/nominatifs/${nominatifId}/details/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rows: detailRowsData })
      });

      if (!bulkDetailResponse.ok) {
        const errorText = await bulkDetailResponse.text();
        console.error('Bulk detail creation failed:', errorText);
        throw new Error(`Gagal membuat detail rows: ${bulkDetailResponse.status} - ${errorText}`);
      }

      const detailResult = await bulkDetailResponse.json();
      const createdDetailRows = detailResult.data;
      
      // Update biaya for each detail row (optimized approach)
      const biayaPromises = data.map(async (row, index) => {
        const detailId = createdDetailRows[index].id;

        // Sesuai dengan database fields yang ada
        const biayaPayload = {
          // Transportasi (sesuai database yang ada)
          transport_pesawat_non_pp_pagu: parseFloat(row.transport_pesawat_non_pp_pagu) || 0,
          transport_pesawat_non_pp_aktual: parseFloat(row.transport_pesawat_non_pp_aktual) || 0,
          transport_taksi_pagu: parseFloat(row.transport_taksi_pagu) || 0,
          transport_taksi_aktual: parseFloat(row.transport_taksi_aktual) || 0,

          // Penginapan - Send raw data untuk generated columns
          penginapan_jumlah_malam: parseInt(row.penginapan_jumlah_malam) || 0,
          penginapan_pagu_perhari: parseFloat(row.penginapan_pagu_perhari) || 0,
          penginapan_aktual_perhari: parseFloat(row.penginapan_aktual_perhari) || 0,

          // Uang Harian Meeting Fullboard - Send raw data untuk generated columns
          uang_harian_meeting_fullboard_jumlah_hari: parseInt(row.uang_harian_meeting_fullboard_jumlah_hari) || 0,
          uang_harian_meeting_fullboard_pagu_perhari: parseFloat(row.uang_harian_meeting_fullboard_pagu_perhari) || 0,
          uang_harian_meeting_fullboard_aktual_perhari: parseFloat(row.uang_harian_meeting_fullboard_aktual_perhari) || 0,

          // Uang Harian Meeting Fullday - Send raw data untuk generated columns
          uang_harian_meeting_fullday_jumlah_hari: parseInt(row.uang_harian_meeting_fullday_jumlah_hari) || 0,
          uang_harian_meeting_fullday_pagu_perhari: parseFloat(row.uang_harian_meeting_fullday_pagu_perhari) || 0,
          uang_harian_meeting_fullday_aktual_perhari: parseFloat(row.uang_harian_meeting_fullday_aktual_perhari) || 0,

          // Uang Harian Luar Kota - Send raw data untuk generated columns
          uang_harian_luar_kota_jumlah_hari: parseInt(row.uang_harian_luar_kota_jumlah_hari) || 0,
          uang_harian_luar_kota_pagu_perhari: parseFloat(row.uang_harian_luar_kota_pagu_perhari) || 0,
          uang_harian_luar_kota_aktual_perhari: parseFloat(row.uang_harian_luar_kota_aktual_perhari) || 0,

          // Uang Harian Dalam Kota - Send raw data untuk generated columns
          uang_harian_dalam_kota_jumlah_hari: parseInt(row.uang_harian_dalam_kota_jumlah_hari) || 0,
          uang_harian_dalam_kota_pagu_perhari: parseFloat(row.uang_harian_dalam_kota_pagu_perhari) || 0,
          uang_harian_dalam_kota_aktual_perhari: parseFloat(row.uang_harian_dalam_kota_aktual_perhari) || 0,

          // Representasi Luar Kota - Send raw data untuk generated columns
          representasi_luar_kota_jumlah_hari: parseInt(row.representasi_luar_kota_jumlah_hari) || 0,
          representasi_luar_kota_pagu_perhari: parseFloat(row.representasi_luar_kota_pagu_perhari) || 0,
          representasi_luar_kota_aktual_perhari: parseFloat(row.representasi_luar_kota_aktual_perhari) || 0,

          // Representasi Dalam Kota - Send raw data untuk generated columns
          representasi_dalam_kota_jumlah_hari: parseInt(row.representasi_dalam_kota_jumlah_hari) || 0,
          representasi_dalam_kota_pagu_perhari: parseFloat(row.representasi_dalam_kota_pagu_perhari) || 0,
          representasi_dalam_kota_aktual_perhari: parseFloat(row.representasi_dalam_kota_aktual_perhari) || 0
        };

      
        // Gunakan nominatifService yang sudah ada logic anti-duplikasi
        const biayaResult = await nominatifService.saveBiayaRow(detailId, biayaPayload);

        if (!biayaResult.success) {
          console.error(`Biaya creation failed for detail ${detailId}:`, biayaResult);
          throw new Error(`Gagal membuat biaya row: ${biayaResult.message}`);
        }

        return biayaResult.data;
      });

      // Execute all biaya updates in parallel
      const biayaResults = await Promise.all(biayaPromises);
      
      setSuccess('Data berhasil disimpan!');
      
      // Navigate to nominatif list page after successful save (both create and edit modes)
      if (nominatifId) {
        navigate('/nominatif', { replace: true });
      }

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
      // First save the data (this will handle both create and update)
      console.log('🔄 Submit: Saving data first...');
      await handleSave(data);

      // Use the existing nominatif ID from state (for edit) or get the latest (for create)
      const token = getToken();
      let currentNominatifId;

      if (isEditMode && nominatif) {
        // Edit mode: use existing ID
        currentNominatifId = nominatif.id;
        console.log('📤 Submitting existing nominatif ID:', currentNominatifId);
      } else {
        // Create mode: get the latest nominatif with current RKA ID
        const nominatifListResponse = await fetch('http://localhost/api/nominatifs-new', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!nominatifListResponse.ok) {
          throw new Error('Gagal mengambil data nominatif untuk submit');
        }

        const nominatifList = await nominatifListResponse.json();
        const dataArray = Array.isArray(nominatifList) ? nominatifList : nominatifList.data || [];

        // Find the nominatif with current RKA ID that's still draft
        const currentNominatif = dataArray.find(n => n.rka_detail_id == rkaId && n.status === 'draft');

        if (!currentNominatif) {
          throw new Error('Nominatif tidak ditemukan untuk disubmit');
        }

        currentNominatifId = currentNominatif.id;
        console.log('📤 Submitting newly created nominatif ID:', currentNominatifId);
      }

      // Then submit
      const response = await fetch(`http://localhost/api/nominatifs-new/${currentNominatifId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Nominatif berhasil dikirim!');
        setTimeout(() => {
          navigate('/nominatif');
        }, 2000);
      } else {
        const errorText = await response.text();
        throw new Error(`Gagal mengirim nominatif: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setError(error.message || 'Gagal mengirim data');
      console.error('❌ Submit error:', error);
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
            onClick={() => navigate('/nominatif')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali ke Daftar Nominatif
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
                onClick={() => navigate('/nominatif')}
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