import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, Send, RefreshCw, CheckCircle, Upload, Eye } from 'lucide-react';

const NominatifExcelTable = ({ rkaDetail, initialData = [], onSave, onSubmit }) => {
  // Ensure initialData has person_type, default to 'main' for existing rows
  const processedInitialData = initialData.map(row => ({
    ...row,
    person_type: row.person_type || 'main'
  }));

  const [rows, setRows] = useState(processedInitialData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const tableRef = useRef(null);

  // Initialize with one empty row if no data
  React.useEffect(() => {
    if (rows.length === 0) {
      addRow();
    }
  }, []);

  // Add new row
  const addRow = (personType = 'main') => {
    // Find the first main row and first tambahan row to use as references
    const firstMainRow = rows.find(row => row.person_type === 'main');
    const firstTambahanRow = rows.find(row => row.person_type === 'tambahan');

    console.log('addRow called:', {
        personType,
        firstMainRow: firstMainRow ? 'found' : 'not found',
        firstTambahanRow: firstTambahanRow ? 'found' : 'not found'
    });

    // Determine which reference row to copy from
    let referenceRow = null;
    if (personType === 'main' && firstMainRow) {
        // Adding new main row - copy from first main row
        referenceRow = firstMainRow;
        console.log('New main row will copy from first main row');
    } else if (personType === 'tambahan' && firstTambahanRow) {
        // Adding new tambahan row - copy from first tambahan row
        referenceRow = firstTambahanRow;
        console.log('New tambahan row will copy from first tambahan row');
    } else if (personType === 'tambahan' && firstMainRow) {
        // First tambahan row - copy from first main row
        referenceRow = firstMainRow;
        console.log('First tambahan row will copy from first main row');
    }

    const newRow = {
      id: Date.now(),
      person_type: personType,
      // Copy reference fields if we have a reference row
      nama_lengkap: referenceRow ? (console.log('Copying nama_lengkap:', referenceRow.nama_lengkap), referenceRow.nama_lengkap) : '',
      golongan: referenceRow ? (console.log('Copying golongan:', referenceRow.golongan), referenceRow.golongan) : '',
      jabatan: referenceRow ? (console.log('Copying jabatan:', referenceRow.jabatan), referenceRow.jabatan) : '',
      eselon: referenceRow ? (console.log('Copying eselon:', referenceRow.eselon), referenceRow.eselon) : '',
      // Other fields are always empty for new rows
      asal: '',
      tujuan: '',
      tanggal_pergi: '',
      tanggal_sampai: '',
      // Transportasi (4 fields baru)
      transport_pesawat_non_pp_pagu: '',
      transport_pesawat_non_pp_aktual: '',
      transport_taksi_pagu: '',
      transport_taksi_aktual: '',
      // Penginapan (3 fields baru)
      penginapan_jumlah_malam: '',
      penginapan_pagu_perhari: '',
      penginapan_aktual_perhari: '',
      // Uang Harian Meeting Fullboard (3 fields)
      uang_harian_meeting_fullboard_jumlah_hari: '',
      uang_harian_meeting_fullboard_pagu_perhari: '',
      uang_harian_meeting_fullboard_aktual_perhari: '',
      // Uang Harian Meeting Fullday (3 fields)
      uang_harian_meeting_fullday_jumlah_hari: '',
      uang_harian_meeting_fullday_pagu_perhari: '',
      uang_harian_meeting_fullday_aktual_perhari: '',
      // Uang Harian Luar Kota (3 fields)
      uang_harian_luar_kota_jumlah_hari: '',
      uang_harian_luar_kota_pagu_perhari: '',
      uang_harian_luar_kota_aktual_perhari: '',
      // Uang Harian Dalam Kota (3 fields)
      uang_harian_dalam_kota_jumlah_hari: '',
      uang_harian_dalam_kota_pagu_perhari: '',
      uang_harian_dalam_kota_aktual_perhari: '',
      // Representasi Luar Kota (3 fields)
      representasi_luar_kota_jumlah_hari: '',
      representasi_luar_kota_pagu_perhari: '',
      representasi_luar_kota_aktual_perhari: '',
      // Representasi Dalam Kota (3 fields)
      representasi_dalam_kota_jumlah_hari: '',
      representasi_dalam_kota_pagu_perhari: '',
      representasi_dalam_kota_aktual_perhari: '',
      evidence_url: null
    };

    console.log('New row created:', newRow);
    setRows([...rows, newRow]);
  };

  // Update row data
  const updateRow = (id, field, value) => {
    const referenceFields = ['nama_lengkap', 'golongan', 'jabatan', 'eselon'];

    console.log('updateRow called:', { id, field, value, currentRows: rows.length });

    // Find the target row that's being updated
    const targetRow = rows.find(r => r.id === id);

    // Find the first main row and first tambahan row (the acuans)
    const firstMainRow = rows.find(r => r.person_type === 'main');
    const firstTambahanRow = rows.find(r => r.person_type === 'tambahan');

    // Check which type of update this is
    const isFirstMainRowUpdate = firstMainRow && firstMainRow.id === id && referenceFields.includes(field);
    const isFirstTambahanRowUpdate = firstTambahanRow && firstTambahanRow.id === id && referenceFields.includes(field);

    const updatedRows = rows.map(row => {
      if (row.id === id) {
        // Always update the target row
        console.log('Updating target row:', row.id, field, value);
        return { ...row, [field]: value };
      } else if (isFirstMainRowUpdate && row.person_type === 'main') {
        // If updating first main row reference field, sync all other main rows
        console.log('Syncing main row to first main row:', row.id, field, value);
        return { ...row, [field]: value };
      } else if (isFirstTambahanRowUpdate && row.person_type === 'tambahan') {
        // If updating first tambahan row reference field, sync all other tambahan rows
        console.log('Syncing tambahan row to first tambahan row:', row.id, field, value);
        return { ...row, [field]: value };
      }
      return row;
    });

    setRows(updatedRows);
  };

  // Delete row
  const deleteRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  // Handle file upload
  const handleFileUpload = (rowId, file) => {
    if (file) {
      // Create file URL for preview
      const fileUrl = URL.createObjectURL(file);
      updateRow(rowId, 'evidence_url', fileUrl);
      updateRow(rowId, 'evidence_file', file);
    }
  };

  
  // Calculate totals
  const totals = React.useMemo(() => {
    return rows.reduce((acc, row) => {
      // Transportasi (2 fields baru)
      const transport_pesawat_non_pp_pagu = acc.transport_pesawat_non_pp_pagu + (parseFloat(row.transport_pesawat_non_pp_pagu) || 0);
      const transport_pesawat_non_pp_aktual = acc.transport_pesawat_non_pp_aktual + (parseFloat(row.transport_pesawat_non_pp_aktual) || 0);
      const transport_taksi_pagu = acc.transport_taksi_pagu + (parseFloat(row.transport_taksi_pagu) || 0);
      const transport_taksi_aktual = acc.transport_taksi_aktual + (parseFloat(row.transport_taksi_aktual) || 0);

      // Penginapan - Hitung total dari jumlah_malam × perhari
      const penginapan_pagu = acc.penginapan_pagu + ((parseFloat(row.penginapan_jumlah_malam) || 0) * (parseFloat(row.penginapan_pagu_perhari) || 0));
      const penginapan_aktual = acc.penginapan_aktual + ((parseFloat(row.penginapan_jumlah_malam) || 0) * (parseFloat(row.penginapan_aktual_perhari) || 0));

      // Uang Harian Meeting Fullboard - Hitung total dari jumlah_hari × perhari
      const uang_harian_meeting_fullboard_pagu = acc.uang_harian_meeting_fullboard_pagu + ((parseFloat(row.uang_harian_meeting_fullboard_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullboard_pagu_perhari) || 0));
      const uang_harian_meeting_fullboard_aktual = acc.uang_harian_meeting_fullboard_aktual + ((parseFloat(row.uang_harian_meeting_fullboard_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullboard_aktual_perhari) || 0));

      // Uang Harian Meeting Fullday - Hitung total dari jumlah_hari × perhari
      const uang_harian_meeting_fullday_pagu = acc.uang_harian_meeting_fullday_pagu + ((parseFloat(row.uang_harian_meeting_fullday_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullday_pagu_perhari) || 0));
      const uang_harian_meeting_fullday_aktual = acc.uang_harian_meeting_fullday_aktual + ((parseFloat(row.uang_harian_meeting_fullday_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullday_aktual_perhari) || 0));

      // Uang Harian Luar Kota - Hitung total dari jumlah_hari × perhari
      const uang_harian_luar_kota_pagu = acc.uang_harian_luar_kota_pagu + ((parseFloat(row.uang_harian_luar_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_luar_kota_pagu_perhari) || 0));
      const uang_harian_luar_kota_aktual = acc.uang_harian_luar_kota_aktual + ((parseFloat(row.uang_harian_luar_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_luar_kota_aktual_perhari) || 0));

      // Uang Harian Dalam Kota - Hitung total dari jumlah_hari × perhari
      const uang_harian_dalam_kota_pagu = acc.uang_harian_dalam_kota_pagu + ((parseFloat(row.uang_harian_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_dalam_kota_pagu_perhari) || 0));
      const uang_harian_dalam_kota_aktual = acc.uang_harian_dalam_kota_aktual + ((parseFloat(row.uang_harian_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_dalam_kota_aktual_perhari) || 0));

      // Representasi Luar Kota - Hitung total dari jumlah_hari × perhari
      const representasi_luar_kota_pagu = acc.representasi_luar_kota_pagu + ((parseFloat(row.representasi_luar_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_luar_kota_pagu_perhari) || 0));
      const representasi_luar_kota_aktual = acc.representasi_luar_kota_aktual + ((parseFloat(row.representasi_luar_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_luar_kota_aktual_perhari) || 0));

      // Representasi Dalam Kota - Hitung total dari jumlah_hari × perhari
      const representasi_dalam_kota_pagu = acc.representasi_dalam_kota_pagu + ((parseFloat(row.representasi_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_dalam_kota_pagu_perhari) || 0));
      const representasi_dalam_kota_aktual = acc.representasi_dalam_kota_aktual + ((parseFloat(row.representasi_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_dalam_kota_aktual_perhari) || 0));

      // Total keseluruhan
      const total_pagu_row = transport_pesawat_non_pp_pagu + transport_taksi_pagu + penginapan_pagu + uang_harian_meeting_fullboard_pagu + uang_harian_meeting_fullday_pagu + uang_harian_luar_kota_pagu + uang_harian_dalam_kota_pagu + representasi_luar_kota_pagu + representasi_dalam_kota_pagu;
      const total_aktual_row = transport_pesawat_non_pp_aktual + transport_taksi_aktual + penginapan_aktual + uang_harian_meeting_fullboard_aktual + uang_harian_meeting_fullday_aktual + uang_harian_luar_kota_aktual + uang_harian_dalam_kota_aktual + representasi_luar_kota_aktual + representasi_dalam_kota_aktual;

      return {
        transport_pesawat_non_pp_pagu,
        transport_pesawat_non_pp_aktual,
        transport_taksi_pagu,
        transport_taksi_aktual,
        penginapan_pagu,
        penginapan_aktual,
        uang_harian_meeting_fullboard_pagu,
        uang_harian_meeting_fullboard_aktual,
        uang_harian_meeting_fullday_pagu,
        uang_harian_meeting_fullday_aktual,
        uang_harian_luar_kota_pagu,
        uang_harian_luar_kota_aktual,
        uang_harian_dalam_kota_pagu,
        uang_harian_dalam_kota_aktual,
        representasi_luar_kota_pagu,
        representasi_luar_kota_aktual,
        representasi_dalam_kota_pagu,
        representasi_dalam_kota_aktual,
        total_pagu_row,
        total_aktual_row,
        total_pagu: acc.total_pagu + total_pagu_row,
        total_aktual: acc.total_aktual + total_aktual_row,
        total_anggaran_berjalan: acc.total_anggaran_berjalan + (total_pagu_row - total_aktual_row)
      };
    }, {
      transport_pesawat_non_pp_pagu: 0,
      transport_pesawat_non_pp_aktual: 0,
      transport_taksi_pagu: 0,
      transport_taksi_aktual: 0,
      penginapan_pagu: 0,
      penginapan_aktual: 0,
      uang_harian_meeting_fullboard_pagu: 0,
      uang_harian_meeting_fullboard_aktual: 0,
      uang_harian_meeting_fullday_pagu: 0,
      uang_harian_meeting_fullday_aktual: 0,
      uang_harian_luar_kota_pagu: 0,
      uang_harian_luar_kota_aktual: 0,
      uang_harian_dalam_kota_pagu: 0,
      uang_harian_dalam_kota_aktual: 0,
      representasi_luar_kota_pagu: 0,
      representasi_luar_kota_aktual: 0,
      representasi_dalam_kota_pagu: 0,
      representasi_dalam_kota_aktual: 0,
      total_pagu_row: 0,
      total_aktual_row: 0,
      total_pagu: 0,
      total_aktual: 0,
      total_anggaran_berjalan: 0
    });
  }, [rows]);

  // Save draft
  const saveDraft = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave(rows);
      }
      console.log('Draft saved:', rows);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  // Submit
  const submitNominatif = async () => {
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(rows);
      }
      console.log('Nominatif submitted:', rows);
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Load draft (placeholder)
  const loadDraft = () => {
    console.log('Loading draft...');
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Mobile/Tablet Info */}
      <div className="md:hidden lg:hidden bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">Table best viewed on desktop. Swipe horizontally to view all columns.</p>
        </div>
      </div>
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
            <button
              onClick={addRow}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baris</span>
            </button>
            <button
              onClick={() => addRow('tambahan')}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Orang</span>
            </button>
          </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadDraft}
            disabled={!rkaDetail || loading}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Draft</span>
          </button>
          <button
            onClick={saveDraft}
            disabled={loading || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Draft'}</span>
          </button>
          <button
            onClick={submitNominatif}
            disabled={loading || submitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{submitting ? 'Mengirim...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto overflow-y-visible max-h-[80vh]">
        <table className="w-full min-w-[9216px]" ref={tableRef}>
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            {/* Main Categories Row */}
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50">Aksi</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50">Tipe</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">Nama Lengkap</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">Golongan</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">Jabatan</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">Eselon</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">Asal</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">Tujuan</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32 bg-gray-50">Tgl Pergi</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32 bg-gray-50">Tgl Sampai</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="6">Transportasi</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="3">Penginapan</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="8">Uang Harian Meeting</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="8">Uang Harian</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="8">Representasi</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50" colSpan="5">Evidence</th>
            </tr>
            {/* Subcategories Row */}
            <tr className="bg-gray-100 border-b border-gray-300">
              <td colSpan="10" className="px-4 py-2 border-r border-gray-200"></td>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu Tiket Pesawat NON PP</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual Tiket Pesawat NON PP</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Total</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu Taksi</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual Taksi</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Total</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Jumlah Malam</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Jumlah Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Total</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Jumlah Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Total</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Jumlah Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Total</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Jumlah Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Total</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Jumlah Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Total</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Jumlah Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual/Hari</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Total</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Eviden</th>
            </tr>
            {/* Meeting Types Row */}
            <tr className="bg-gray-100 border-b border-gray-300">
              <td colSpan="10" className="px-4 py-2 border-r border-gray-200"></td>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="1"></th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="1"></th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="1"></th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="1"></th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="1"></th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="1"></th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="1"></th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="1"></th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="4">Meeting Fullboard</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="4">Meeting Fullday</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="4">Luar Kota</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="4">Dalam Kota</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="4">Representasi Luar Kota</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="4">Representasi Dalam Kota</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Hapus Baris"
                      disabled={rows.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  <select
                    value={row.person_type}
                    onChange={(e) => updateRow(row.id, 'person_type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="main">Utama</option>
                    <option value="tambahan">Tambahan</option>
                  </select>
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <input
                    type="text"
                    value={row.nama_lengkap}
                    onChange={(e) => updateRow(row.id, 'nama_lengkap', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Nama lengkap"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <select
                    value={row.golongan}
                    onChange={(e) => updateRow(row.id, 'golongan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 bg-white"
                  >
                    <option value="">Pilih Golongan</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="Non Golongan">Non Golongan</option>
                  </select>
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <input
                    type="text"
                    value={row.jabatan}
                    onChange={(e) => updateRow(row.id, 'jabatan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Jabatan"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <select
                    value={row.eselon}
                    onChange={(e) => updateRow(row.id, 'eselon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 bg-white"
                  >
                    <option value="">Pilih Eselon</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="Non Eselon">Non Eselon</option>
                  </select>
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <input
                    type="text"
                    value={row.asal}
                    onChange={(e) => updateRow(row.id, 'asal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Asal"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <input
                    type="text"
                    value={row.tujuan}
                    onChange={(e) => updateRow(row.id, 'tujuan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Tujuan"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-32">
                  <input
                    type="date"
                    value={row.tanggal_pergi}
                    onChange={(e) => updateRow(row.id, 'tanggal_pergi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-32">
                  <input
                    type="date"
                    value={row.tanggal_pulang}
                    onChange={(e) => updateRow(row.id, 'tanggal_pulang', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  />
                </td>

                {/* Transportasi - Pesawat Non-PP */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={row.transport_pesawat_non_pp_pagu ? `Rp ${parseFloat(row.transport_pesawat_non_pp_pagu).toLocaleString('id-ID')}` : ''}
                    onChange={(e) => updateRow(row.id, 'transport_pesawat_non_pp_pagu', e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={row.transport_pesawat_non_pp_aktual ? `Rp ${parseFloat(row.transport_pesawat_non_pp_aktual).toLocaleString('id-ID')}` : ''}
                    onChange={(e) => updateRow(row.id, 'transport_pesawat_non_pp_aktual', e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp {((parseFloat(row.transport_pesawat_non_pp_pagu) || 0) - (parseFloat(row.transport_pesawat_non_pp_aktual) || 0)).toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Transportasi - Taksi */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={row.transport_taksi_pagu ? `Rp ${parseFloat(row.transport_taksi_pagu).toLocaleString('id-ID')}` : ''}
                    onChange={(e) => updateRow(row.id, 'transport_taksi_pagu', e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={row.transport_taksi_aktual ? `Rp ${parseFloat(row.transport_taksi_aktual).toLocaleString('id-ID')}` : ''}
                    onChange={(e) => updateRow(row.id, 'transport_taksi_aktual', e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp {((parseFloat(row.transport_taksi_pagu) || 0) - (parseFloat(row.transport_taksi_aktual) || 0)).toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Penginapan */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.penginapan_jumlah_malam}
                    onChange={(e) => updateRow(row.id, 'penginapan_jumlah_malam', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.penginapan_pagu_perhari}
                    onChange={(e) => updateRow(row.id, 'penginapan_pagu_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.penginapan_aktual_perhari}
                    onChange={(e) => updateRow(row.id, 'penginapan_aktual_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Uang Harian Fullboard */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_meeting_fullboard_jumlah_hari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_meeting_fullboard_jumlah_hari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_meeting_fullboard_pagu_perhari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_meeting_fullboard_pagu_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_meeting_fullboard_aktual_perhari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_meeting_fullboard_aktual_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    {((parseFloat(row.uang_harian_meeting_fullboard_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullboard_pagu_perhari) || 0)).toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Uang Harian Meeting Fullday */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_meeting_fullday_jumlah_hari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_meeting_fullday_jumlah_hari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_meeting_fullday_pagu_perhari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_meeting_fullday_pagu_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_meeting_fullday_aktual_perhari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_meeting_fullday_aktual_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    {((parseFloat(row.uang_harian_meeting_fullday_jumlah_hari) || 0) * (parseFloat(row.uang_harian_meeting_fullday_pagu_perhari) || 0)).toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Uang Harian Luar Kota */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_luar_kota_jumlah_hari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_luar_kota_jumlah_hari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_luar_kota_pagu_perhari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_luar_kota_pagu_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_luar_kota_aktual_perhari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_luar_kota_aktual_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    {((parseFloat(row.uang_harian_luar_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_luar_kota_pagu_perhari) || 0)).toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Uang Harian Dalam Kota */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_dalam_kota_jumlah_hari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_dalam_kota_jumlah_hari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_dalam_kota_pagu_perhari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_dalam_kota_pagu_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.uang_harian_dalam_kota_aktual_perhari}
                    onChange={(e) => updateRow(row.id, 'uang_harian_dalam_kota_aktual_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    {((parseFloat(row.uang_harian_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.uang_harian_dalam_kota_pagu_perhari) || 0)).toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Representasi Luar Kota */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.representasi_luar_kota_jumlah_hari}
                    onChange={(e) => updateRow(row.id, 'representasi_luar_kota_jumlah_hari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.representasi_luar_kota_pagu_perhari}
                    onChange={(e) => updateRow(row.id, 'representasi_luar_kota_pagu_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.representasi_luar_kota_aktual_perhari}
                    onChange={(e) => updateRow(row.id, 'representasi_luar_kota_aktual_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    {((parseFloat(row.representasi_luar_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_luar_kota_pagu_perhari) || 0)).toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Representasi Dalam Kota */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.representasi_dalam_kota_jumlah_hari}
                    onChange={(e) => updateRow(row.id, 'representasi_dalam_kota_jumlah_hari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.representasi_dalam_kota_pagu_perhari}
                    onChange={(e) => updateRow(row.id, 'representasi_dalam_kota_pagu_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    value={row.representasi_dalam_kota_aktual_perhari}
                    onChange={(e) => updateRow(row.id, 'representasi_dalam_kota_aktual_perhari', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    {((parseFloat(row.representasi_dalam_kota_jumlah_hari) || 0) * (parseFloat(row.representasi_dalam_kota_pagu_perhari) || 0)).toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Evidence Column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(row.id, e.target.files[0])}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-blue-400 transition-colors">
                        <Upload className="w-4 h-4 text-gray-400" />
                      </div>
                    </label>
                    {row.evidence_url && (
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Belum ada data. Klik "Tambah Baris" untuk menambahkan data.</p>
        </div>
      )}

      {/* Summary Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Baris:</span> {rows.length}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Utama:</span> {rows.filter(r => r.person_type === 'main').length}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Tambahan:</span> {rows.filter(r => r.person_type === 'tambahan').length}
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-gray-600">
              <span className="font-medium">Total Pagu:</span>
              <span className="ml-2 font-semibold text-blue-600">Rp {totals.total_pagu.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Total Aktual:</span>
              <span className="ml-2 font-semibold text-green-600">Rp {totals.total_aktual.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominatifExcelTable;