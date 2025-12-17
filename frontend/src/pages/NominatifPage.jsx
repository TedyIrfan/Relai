import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, FileText, AlertCircle } from 'lucide-react';
import NominatifExcelTable from '../components/tables/NominatifExcelTable';
import { nominatifService } from '../services/nominatifService';
import useNotification from '../hooks/useNotification';
import { consoleLog, consoleError, consoleWarn } from '../utils/logger';

const NominatifPage = () => {
  const { rkaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // Add search params hook
  const specificNominatifId = searchParams.get('id'); // Get ?id=... from URL

  const tableRef = useRef(null);
  const { success: showSuccess, error: showError, notifications, close } = useNotification();

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
      consoleLog('Token found:', token ? 'YES' : 'NO');
      return token;
    } catch (error) {
      consoleError('Error getting token:', error);
      return localStorage.getItem('token');
    }
  };

  // Format currency helper
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
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
        const response = await fetch('http://localhost/api/rka-details', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
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

  // Load draft data from localStorage on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('nominatifDraft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        consoleLog('Loaded draft data:', draft);
        setDraftData(draft);

        // Clear draft from localStorage after loading
        localStorage.removeItem('nominatifDraft');
      }
    } catch (error) {
      consoleError('Error loading draft data:', error);
    }
  }, []);

  // Detect edit mode and load existing nominatif - STRICT MODE
  useEffect(() => {
    const initializePage = async () => {
      consoleLog('🚀 Initializing page with:', {
        rkaId,
        specificNominatifId,
        url: location.search
      });

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
        consoleLog(`🔍 EDIT MODE: Fetching specific nominatif ID: ${specificNominatifId}`);
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
              consoleLog('✅ Data loaded successfully:', data);
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
          consoleError('❌ Fatal Error loading nominatif:', err);
          setError(`Data tidak ditemukan: ${err.message}. Silakan kembali ke daftar.`);
          setIsEditMode(false); // Fail safe
        }
      } 
      // SKENARIO 2: CREATE MODE (Tidak ada ID di URL)
      else {
        consoleLog('🆕 CREATE MODE: No specific ID found, initializing new form');
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
          consoleLog('API Response Structure:', data);
          consoleLog('Data type:', typeof data);
          consoleLog('Data keys:', Object.keys(data));

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
            consoleError('Unexpected data structure:', data);
            consoleLog('Setting empty array as fallback');
            setNominatifData([]);
            return;
          }

          consoleLog('Processed dataArray length:', dataArray.length);
          consoleLog('Sample data item:', dataArray[0]);

          // Filter by RKA ID and transform to table format
          const filteredData = dataArray
            .filter(item => {
              consoleLog('Checking item.rka_detail_id:', item.rka_detail_id, 'vs rkaId:', rkaId);
              return item.rka_detail_id == rkaId;
            })
            .flatMap(item => {
              consoleLog('Processing item detail_rows:', item.detail_rows);
              if (!item.detail_rows || !Array.isArray(item.detail_rows)) {
                consoleWarn('No detail_rows found for item:', item);
                return [];
              }

              return item.detail_rows.map(row => {
                consoleLog('Processing row:', row);
                return {
                  id: row.id,
                  nama_lengkap: row.nama || row.person_name || '',
                  golongan: row.golongan || '',
                  jabatan: row.jabatan || '',
                  eselon: row.eselon || '',
                  asal: row.asal || '',
                  tujuan: row.tujuan || '',
                  tanggal_pergi: row.tanggal_pergi || '',
                  tanggal_sampai: row.tanggal_sampai || '',
                  transport_taksi_pergi_pagu: row.biaya_row?.transport_pesawat_non_pp_pagu || '',
                  transport_taksi_pergi_aktual: row.biaya_row?.transport_pesawat_non_pp_aktual || '',
                  transport_pergi_pagu: row.biaya_row?.transport_pesawat_non_pp_pagu || '',
                  transport_pergi_aktual: row.biaya_row?.transport_pesawat_non_pp_aktual || '',
                  transport_taksi_pulang_pagu: row.biaya_row?.transport_taksi_pagu || '',
                  transport_taksi_pulang_aktual: row.biaya_row?.transport_taksi_aktual || '',
                  transport_pulang_pagu: row.biaya_row?.transport_taksi_pagu || '',
                  transport_pulang_aktual: row.biaya_row?.transport_taksi_aktual || '',
                  penginapan_pagu: row.biaya_row?.penginapan_pagu || '',
                  penginapan_aktual: row.biaya_row?.penginapan_aktual || '',
                  uang_harian_fullboard_pagu: row.biaya_row?.uang_harian_fullboard_pagu || '',
                  uang_harian_fullboard_aktual: row.biaya_row?.uang_harian_fullboard_aktual || '',
                  uang_harian_pagu: row.biaya_row?.uang_harian_pagu || '',
                  uang_harian_aktual: row.biaya_row?.uang_harian_aktual || '',
                  uang_representasi_pagu: row.biaya_row?.uang_representasi_pagu || '',
                  uang_representasi_aktual: row.biaya_row?.uang_representasi_aktual || '',
                  evidence_url: row.evidence?.[0]?.evidence_foto_path ? `http://127.0.0.1:8000/storage/${row.evidence[0].evidence_foto_path}` : null,
                  evidence_filename: row.evidence?.[0]?.evidence_foto_name || "",
                  evidence_filesize: row.evidence?.[0]?.evidence_foto_size ? `${(row.evidence[0].evidence_foto_size / 1024).toFixed(2)} KB` : ""
                };
              });
            });

          consoleLog('Final filtered data:', filteredData);
          setNominatifData(filteredData);
        }
      } catch (error) {
        consoleError('Error fetching nominatif data:', error);
      }
    };

    // DISABLED: Original create mode logic - now handled in edit mode detection
    // if (rkaId) {
    //   fetchNominatifData();
    // }
  // }, [rkaId]);

  
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
        consoleLog('📋 Raw API response details:', detailsData);

        if (detailsData.data && detailsData.data.length > 0) {
          consoleLog('📋 Sample detail data structure:', detailsData.data[0]);
          consoleLog('📋 Tanggal fields in first row:', {
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
              consoleLog(`🔍 DEBUG: Biaya data for detail ${detail.id}:`, biayaResult);
              biayaData = biayaResult.data || {};
              consoleLog(`🔍 DEBUG: Extracted biayaData:`, biayaData);
              consoleLog(`🔍 DEBUG: Transport fields:`, {
                pesawat_non_pp_pagu: biayaData.transport_pesawat_non_pp_pagu,
                taksi_pagu: biayaData.transport_taksi_pagu,
                pesawat_non_pp_aktual: biayaData.transport_pesawat_non_pp_aktual,
                taksi_aktual: biayaData.transport_taksi_aktual
              });
            } else {
              consoleError(`❌ DEBUG: Failed to load biaya for detail ${detail.id}:`, biayaResponse.status);
            }

            // Get evidence data for this detail
            let evidenceData = [];
            if (detail.evidence && Array.isArray(detail.evidence)) {
              evidenceData = detail.evidence.map(ev => ({
                id: ev.id,
                evidence_link: ev.evidence_link,
                evidence_name: ev.evidence_name,
                keterangan: ev.keterangan
              }));
            }

            return {
              id: detail.id,
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

              // Evidence data
              evidence_files: evidenceData,
            };

            consoleLog(`🔍 DEBUG: Final table data for detail ${detail.id}:`, {
              id: detail.id,
              nama_lengkap: detail.person_name,
              transport_pesawat_non_pp_pagu: biayaData.transport_pesawat_non_pp_pagu,
              transport_taksi_pagu: biayaData.transport_taksi_pagu
            });
          })
        );

        // Debug transformed data before setting state
        const debugTableData = tableData.map(row => ({
          id: row.id,
          tanggal_pergi: row.tanggal_pergi,
          tanggal_sampai: row.tanggal_sampai,
          evidence_count: row.evidence_files?.length || 0
        }));
        consoleLog('🔄 Transformed table data:', debugTableData);

        // Debug evidence data specifically
        const rowsWithEvidence = tableData.filter(row => row.evidence_files && row.evidence_files.length > 0);
        if (rowsWithEvidence.length > 0) {
          consoleLog('🔍 Evidence data loaded:', rowsWithEvidence.map(row => ({
            id: row.id,
            evidence_count: row.evidence_files.length,
            first_evidence: row.evidence_files[0]
          })));
        }

        // Check if any tanggal_sampai are empty
        const emptyTanggalSampai = debugTableData.filter(row => !row.tanggal_sampai);
        if (emptyTanggalSampai.length > 0) {
          consoleWarn('⚠️ Rows with empty tanggal_sampai:', emptyTanggalSampai);
        }

        setNominatifData(tableData);
      }
    } catch (error) {
      consoleError('Error loading detail rows:', error);
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
      const urlNominatifId = specificNominatifId; // Already parsed from URL
      const activeNominatifId = nominatif?.id || urlNominatifId;

      // Tentukan mode berdasarkan keberadaan ID yang valid
      const isRealEditMode = !!activeNominatifId;

      consoleLog('🔒 SAFETY CHECK:', {
        rkaId,
        specificNominatifId,
        stateId: nominatif?.id,
        urlId: urlNominatifId,
        activeId: activeNominatifId,
        isEditModeState: isEditMode,
        DECISION: isRealEditMode ? 'EDIT (PUT)' : 'CREATE (POST)'
      });

      // Create or update nominatif
      const nominatifPayload = {
        rka_detail_id: parseInt(rkaId),
        deskripsi_perjalanan_dinas: isRealEditMode
          ? (nominatif?.deskripsi_perjalanan_dinas || `Nominatif RKA ${rkaDetail?.code_rka}`)
          : (draftData?.deskripsi || `Nominatif RKA ${rkaDetail?.code_rka}`),
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
        consoleError('🚨 CRITICAL: Attempted to send request to undefined URL:', apiUrl);
        consoleLog('Dump state:', { isEditMode, nominatif, activeNominatifId });
        
        if (isRealEditMode && activeNominatifId) {
             // Force fix URL if ID exists
             apiUrl = `http://localhost/api/nominatifs-new/${activeNominatifId}`;
             consoleLog('✅ URL fixed manually:', apiUrl);
        } else {
             throw new Error('Terjadi kesalahan sistem: ID Nominatif hilang. Silakan refresh halaman.');
        }
      }

      consoleLog(`📡 API ${apiMethod} to: ${apiUrl}`);

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
        consoleError(`Nominatif ${apiMethod} failed:`, errorText);
        throw new Error(`Gagal ${isEditMode ? 'update' : 'membuat'} nominatif: ${nominatifResponse.status} - ${errorText}`);
      }

      const nominatifResult = await nominatifResponse.json();
      const nominatifId = nominatifResult.data.id;
    
      // 🔥 COLLECT EVIDENCE FROM INPUT FIELDS - Get current evidence data
      const dataWithEvidence = tableRef.current ? tableRef.current.collectEvidenceFromInputs() : data;

      // 🔥 FRONTEND AUTO-SORT: Sort data by person_name alphabetically before sending to backend
      const sortedData = [...dataWithEvidence].sort((a, b) => {
        const nameA = (a.nama_lengkap || a.nama || '').toLowerCase();
        const nameB = (b.nama_lengkap || b.nama || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      consoleLog('🔄 Frontend Auto-Sort Results:', {
        originalOrder: data.map(row => row.nama_lengkap || row.nama || 'Unnamed'),
        sortedOrder: sortedData.map(row => row.nama_lengkap || row.nama || 'Unnamed'),
        withEvidence: dataWithEvidence.map(row => ({
          name: row.nama_lengkap || row.nama || 'Unnamed',
          hasEvidence: row.evidence_files && row.evidence_files.length > 0
        }))
      });

      // Prepare bulk data for detail rows with sorted order
      const detailRowsData = sortedData.map((row, index) => ({
        person_name: row.nama_lengkap || row.nama || '', // Backend expects person_name only
        golongan: row.golongan || '',
        jabatan: row.jabatan || '',
        eselon: row.eselon || '',
        asal: row.asal || '',
        tujuan: row.tujuan || '',
        tanggal_pergi: row.tanggal_pergi || '',
        tanggal_sampai: row.tanggal_sampai || '',
        no: index + 1,
        row_order: index + 1
      }));

      consoleLog('📦 Preparing bulk detail rows (sorted):', detailRowsData.length);

      // FIX: Separate CREATE vs EDIT mode logic for detail rows
      let createdDetailRows = [];

      if (specificNominatifId && isEditMode) {
        // EDIT MODE: Update existing detail rows with auto-sort
        consoleLog('EDIT MODE: Updating existing detail rows with auto-sort');

        // 🔥 FRONTEND AUTO-SORT: Update existing detail rows with their IDs using sorted data
        const updatedDetailRowsData = sortedData.map((row, index) => ({
          id: row.id, // Include existing ID
          nama_lengkap: row.nama_lengkap || row.nama || '', // For validation
          person_name: row.nama_lengkap || row.nama || '', // Database field
          golongan: row.golongan || '',
          jabatan: row.jabatan || '',
          eselon: row.eselon || '',
          asal: row.asal || '',
          tujuan: row.tujuan || '',
          tanggal_pergi: row.tanggal_pergi || '',
          tanggal_sampai: row.tanggal_sampai || '',
          no: index + 1,
          row_order: index + 1
        }));

        // Debug: Log data yang akan dikirim ke bulk update API
        consoleLog('📦 Preparing bulk update data:', {
          nominatifId: nominatifId,
          rowsCount: updatedDetailRowsData.length,
          rowsData: updatedDetailRowsData
        });

        // 🔥 NEW TWO-STEP API PATTERN: First validate, then execute
        consoleLog('🔍 VALIDATION STEP: Validating draft data...');

        // Step 1: Validate draft data (no database changes)
        const validateResponse = await fetch(`http://localhost/api/nominatifs/${nominatifId}/details/validate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rows: updatedDetailRowsData,
            deleted_rows: tableRef.current?.getDeletedRows() || [] // 🔥 SEND DELETED ROWS TO BACKEND
          })
        });

        if (!validateResponse.ok) {
          const errorText = await validateResponse.text();
          consoleError('❌ Validation FAILED:', {
            status: validateResponse.status,
            statusText: validateResponse.statusText,
            errorText: errorText
          });
          throw new Error(`Gagal validasi data: ${validateResponse.status} - ${errorText}`);
        }

        const validationResult = await validateResponse.json();
        consoleLog('✅ Validation result:', validationResult);

        if (!validationResult.success) {
          consoleError('❌ Backend validation failed:', validationResult);
          consoleError('❌ Validation errors details:', JSON.stringify(validationResult.validation_errors, null, 2));
          throw new Error(`Error validasi: ${validationResult.message || 'Data tidak valid'}`);
        }

        // Step 2: Execute draft data (actual database changes)
        consoleLog('💾 EXECUTION STEP: Saving validated data to database...');
        const executeResponse = await fetch(`http://localhost/api/nominatifs/${nominatifId}/details/execute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rows: updatedDetailRowsData,
            deleted_rows: tableRef.current?.getDeletedRows() || [] // 🔥 SEND DELETED ROWS TO BACKEND
          })
        });

        if (!executeResponse.ok) {
          const errorText = await executeResponse.text();
          consoleError('❌ Execution FAILED:', {
            status: executeResponse.status,
            statusText: executeResponse.statusText,
            errorText: errorText
          });
          throw new Error(`Gagal menyimpan data: ${executeResponse.status} - ${errorText}`);
        }

        const executeResult = await executeResponse.json();
        consoleLog('✅ Execution result:', executeResult);

        if (!executeResult.success) {
          consoleError('❌ Backend execution failed:', executeResult);
          throw new Error(`Error penyimpanan: ${executeResult.message || 'Gagal menyimpan data'}`);
        }

        createdDetailRows = executeResult.data || [];
        consoleLog('✅ Successfully saved rows:', createdDetailRows);
      } else {
        // CREATE MODE: Create new detail rows
        consoleLog('CREATE MODE: Creating new detail rows');

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
          consoleError('Bulk detail creation failed:', errorText);
          throw new Error(`Gagal membuat detail rows: ${bulkDetailResponse.status} - ${errorText}`);
        }

        const detailResult = await bulkDetailResponse.json();
        createdDetailRows = detailResult.data;
      }

      // Update biaya for each detail row (optimized approach)
      const biayaPromises = data.map(async (row, index) => {
        // 🔥 ENHANCED: Separate CREATE vs EDIT mode logic with better error handling
        let detailId;
        if (specificNominatifId && row.id) {
          // EDIT MODE: Use existing detail row ID
          detailId = row.id;
          consoleLog(`✅ EDIT MODE: Using existing detail ID ${detailId} for row ${index}`);
        } else {
          // CREATE MODE: Use newly created detail row ID with validation
          if (!createdDetailRows[index] || !createdDetailRows[index].id) {
            consoleError(`❌ CREATE MODE ERROR: No valid detail row ID found for row ${index}`);
            throw new Error(`Gagal membuat detail row untuk baris ke-${index + 1}. ID tidak valid.`);
          }
          detailId = createdDetailRows[index].id;
          consoleLog(`✅ CREATE MODE: Using new detail ID ${detailId} for row ${index}`);
        }

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
          consoleError(`Biaya creation failed for detail ${detailId}:`, biayaResult);
          throw new Error(`Gagal membuat biaya row: ${biayaResult.message}`);
        }

        return biayaResult.data;
      });

      // Execute all biaya updates in parallel
      const biayaResults = await Promise.all(biayaPromises);

      // Handle evidence uploads
      const evidencePromises = data.map(async (row, index) => {
        // Check if there are evidence files to upload
        if (row.evidence_files && Array.isArray(row.evidence_files) && row.evidence_files.length > 0) {
          consoleLog(`📤 Uploading ${row.evidence_files.length} evidence files for row ${index}`);

          try {
            // Get detail row ID for evidence association
            let detailRowId;
            if (specificNominatifId && row.id) {
              // EDIT MODE: Use existing detail row ID
              detailRowId = row.id;
              consoleLog(`📤 EDIT MODE: Using detail row ID ${detailRowId} for evidence upload`);
            } else {
              // CREATE MODE: Use newly created detail row ID
              detailRowId = createdDetailRows[index]?.id;
              consoleLog(`📤 CREATE MODE: Using new detail row ID ${detailRowId} for evidence upload`);
            }

            if (!detailRowId) {
              consoleError(`❌ No detail row ID found for row ${index}, skipping evidence upload`);
              return [];
            }

            // 🔥 REMOVED: Manual evidence clear tidak diperlukan
            // Backend storeWithDetailRow sudah handle create/update evidence secara otomatis
            consoleLog(`🔧 Processing evidence for detail row ${detailRowId}`);

            // Save each evidence (Google Drive links)
            const uploadPromises = row.evidence_files.map(async (evidence, fileIndex) => {
              if (evidence.evidence_link) {
                const evidenceData = {
                  evidence_link: evidence.evidence_link,
                  evidence_name: evidence.evidence_name,
                  keterangan: evidence.keterangan || `Evidence ${fileIndex + 1} untuk ${row.person_name || row.nama_lengkap || row.nama || 'Row ' + (index + 1)}`,
                  nominatif_detail_row_id: detailRowId,
                };

                const token = getToken();
                const evidenceResponse = await fetch(`http://localhost/api/nominatifs/${nominatifId}/details/${detailRowId}/evidence`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(evidenceData)
                });

                if (!evidenceResponse.ok) {
                  const errorText = await evidenceResponse.text();
                  consoleError(`Evidence save failed for row ${index}, evidence ${fileIndex + 1}:`, errorText);
                  return null;
                }

                const result = await evidenceResponse.json();
                consoleLog(`✅ Evidence ${fileIndex + 1} saved successfully for row ${index}:`, result);
                return result;
              }
              return null;
            });

            const saveResults = await Promise.all(uploadPromises);
            consoleLog(`📊 All evidence saves completed for row ${index}:`, saveResults);
            return saveResults.filter(result => result !== null);
          } catch (error) {
            consoleError(`Evidence upload error for row ${index}:`, error);
            return [];
          }
        }
        return [];
      });

  
      // Execute all evidence saves in parallel
      const evidenceResults = await Promise.all(evidencePromises);

      setSuccess('Data berhasil disimpan! 🔄 Data telah diurutkan berdasarkan nama secara otomatis.');

      // Navigate to nominatif list page after successful save (both create and edit modes)
      if (nominatifId) {
        // Brief delay to allow user to see the success message with auto-sort notification
        setTimeout(() => {
          navigate('/nominatif', { replace: true });
        }, 1500); // 1.5 second delay
      }

    } catch (error) {
      setError(error.message || 'Gagal menyimpan data');
      consoleError('Save error:', error);
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
      consoleLog('🔄 Submit: Saving data first...');
      await handleSave(data);

      // Use the existing nominatif ID from state (for edit) or get the latest (for create)
      const token = getToken();
      let currentNominatifId;

      if (isEditMode && nominatif) {
        // Edit mode: use existing ID
        currentNominatifId = nominatif.id;
        consoleLog('📤 Submitting existing nominatif ID:', currentNominatifId);
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
        consoleLog('📤 Submitting newly created nominatif ID:', currentNominatifId);
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
        const result = await response.json();

        // Show success notification with details
        showSuccess('Nominatif berhasil dikirim!', {
          duration: 3000
        });

        // Show budget details in notification
        if (result.anggaran_updated) {
          showSuccess(
            `SP2D: ${formatRupiah(result.anggaran_updated.sp2d_amount)} | ` +
            `Tersisa: ${formatRupiah(result.anggaran_updated.rka_anggaran_tersisa)}`,
            { duration: 5000 }
          );
        }

        // Auto refresh dan redirect
        setTimeout(() => {
          navigate('/nominatif');
          // Force refresh RKA data by triggering a custom event
          window.dispatchEvent(new CustomEvent('rkaDataUpdated'));
        }, 2000);
      } else {
        const errorText = await response.text();
        showError(`Gagal mengirim nominatif: ${response.status} - ${errorText}`, {
          duration: 0 // Don't auto-close error notifications
        });
        throw new Error(`Gagal mengirim nominatif: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setError(error.message || 'Gagal mengirim data');
      consoleError('❌ Submit error:', error);

      // Show error notification
      showError(error.message || 'Gagal mengirim data', {
        duration: 0 // Don't auto-close error notifications
      });
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
                {/* Show deskripsi for both create and edit mode */}
                {(draftData?.deskripsi || nominatif?.deskripsi_perjalanan_dinas) && (
                  <p className="text-sm text-gray-900 font-medium">
                    {draftData?.deskripsi || nominatif?.deskripsi_perjalanan_dinas}
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
          ref={tableRef}
          rkaDetail={rkaDetail}
          initialData={nominatifData}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-2 min-w-[320px] max-w-[400px]"
            style={{
              opacity: notification.timestamp ? 1 : 0,
              transform: notification.timestamp ? 'translateX(0)' : 'translateX(100%)',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  notification.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => close(notification.id)}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NominatifPage;