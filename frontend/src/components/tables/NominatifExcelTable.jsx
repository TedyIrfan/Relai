import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, Send, RefreshCw, CheckCircle, Upload, Eye } from 'lucide-react';

const NominatifExcelTable = ({ rkaDetail, initialData = [], onSave, onSubmit }) => {
  const [rows, setRows] = useState(initialData);
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
    const newRow = {
      id: Date.now(),
      person_type: personType,
      nama_lengkap: '',
      golongan: '',
      jabatan: '',
      eselon: '',
      asal: '',
      tujuan: '',
      tanggal_pergi: '',
      tanggal_pulang: '',
      transport_taksi_pergi_pagu: '',
      transport_taksi_pergi_aktual: '',
      transport_taksi_pulang_pagu: '',
      transport_taksi_pulang_aktual: '',
      transport_pergi_pagu: '',
      transport_pergi_aktual: '',
      transport_pulang_pagu: '',
      transport_pulang_aktual: '',
      penginapan_pagu: '',
      penginapan_aktual: '',
      uang_harian_fullboard_pagu: '',
      uang_harian_fullboard_aktual: '',
      uang_harian_pagu: '',
      uang_harian_aktual: '',
      uang_representasi_pagu: '',
      uang_representasi_aktual: '',
      evidence_url: null
    };
    setRows([...rows, newRow]);
  };

  // Update row data
  const updateRow = (id, field, value) => {
    const updatedRows = rows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    );
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
    return rows.reduce((acc, row) => ({
      transport_taksi_pergi_pagu: acc.transport_taksi_pergi_pagu + (parseFloat(row.transport_taksi_pergi_pagu) || 0),
      transport_taksi_pergi_aktual: acc.transport_taksi_pergi_aktual + (parseFloat(row.transport_taksi_pergi_aktual) || 0),
      transport_taksi_pulang_pagu: acc.transport_taksi_pulang_pagu + (parseFloat(row.transport_taksi_pulang_pagu) || 0),
      transport_taksi_pulang_aktual: acc.transport_taksi_pulang_aktual + (parseFloat(row.transport_taksi_pulang_aktual) || 0),
      transport_pergi_pagu: acc.transport_pergi_pagu + (parseFloat(row.transport_pergi_pagu) || 0),
      transport_pergi_aktual: acc.transport_pergi_aktual + (parseFloat(row.transport_pergi_aktual) || 0),
      transport_pulang_pagu: acc.transport_pulang_pagu + (parseFloat(row.transport_pulang_pagu) || 0),
      transport_pulang_aktual: acc.transport_pulang_aktual + (parseFloat(row.transport_pulang_aktual) || 0),
      penginapan_pagu: acc.penginapan_pagu + (parseFloat(row.penginapan_pagu) || 0),
      penginapan_aktual: acc.penginapan_aktual + (parseFloat(row.penginapan_aktual) || 0),
      uang_harian_fullboard_pagu: acc.uang_harian_fullboard_pagu + (parseFloat(row.uang_harian_fullboard_pagu) || 0),
      uang_harian_fullboard_aktual: acc.uang_harian_fullboard_aktual + (parseFloat(row.uang_harian_fullboard_aktual) || 0),
      uang_harian_pagu: acc.uang_harian_pagu + (parseFloat(row.uang_harian_pagu) || 0),
      uang_harian_aktual: acc.uang_harian_aktual + (parseFloat(row.uang_harian_aktual) || 0),
      uang_representasi_pagu: acc.uang_representasi_pagu + (parseFloat(row.uang_representasi_pagu) || 0),
      uang_representasi_aktual: acc.uang_representasi_aktual + (parseFloat(row.uang_representasi_aktual) || 0),
      total_pagu: acc.total_pagu +
        (parseFloat(row.transport_taksi_pergi_pagu) || 0) +
        (parseFloat(row.transport_taksi_pulang_pagu) || 0) +
        (parseFloat(row.transport_pergi_pagu) || 0) +
        (parseFloat(row.transport_pulang_pagu) || 0) +
        (parseFloat(row.penginapan_pagu) || 0) +
        (parseFloat(row.uang_harian_fullboard_pagu) || 0) +
        (parseFloat(row.uang_harian_pagu) || 0) +
        (parseFloat(row.uang_representasi_pagu) || 0),
      total_aktual: acc.total_aktual +
        (parseFloat(row.transport_taksi_pergi_aktual) || 0) +
        (parseFloat(row.transport_taksi_pulang_aktual) || 0) +
        (parseFloat(row.transport_pergi_aktual) || 0) +
        (parseFloat(row.transport_pulang_aktual) || 0) +
        (parseFloat(row.penginapan_aktual) || 0) +
        (parseFloat(row.uang_harian_fullboard_aktual) || 0) +
        (parseFloat(row.uang_harian_aktual) || 0) +
        (parseFloat(row.uang_representasi_aktual) || 0)
    }), {
      transport_taksi_pergi_pagu: 0,
      transport_taksi_pergi_aktual: 0,
      transport_taksi_pulang_pagu: 0,
      transport_taksi_pulang_aktual: 0,
      transport_pergi_pagu: 0,
      transport_pergi_aktual: 0,
      transport_pulang_pagu: 0,
      transport_pulang_aktual: 0,
      penginapan_pagu: 0,
      penginapan_aktual: 0,
      uang_harian_fullboard_pagu: 0,
      uang_harian_fullboard_aktual: 0,
      uang_harian_pagu: 0,
      uang_harian_aktual: 0,
      uang_representasi_pagu: 0,
      uang_representasi_aktual: 0,
      total_pagu: 0,
      total_aktual: 0
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50">Aksi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50">Tipe</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[32rem] bg-gray-50">Nama Lengkap</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[32rem] bg-gray-50">Golongan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[32rem] bg-gray-50">Jabatan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[32rem] bg-gray-50">Eselon</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[32rem] bg-gray-50">Asal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[32rem] bg-gray-50">Tujuan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[32rem] bg-gray-50">Tgl Pergi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[32rem] bg-gray-50">Tgl Pulang</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="8">Transportasi</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="2">Penginapan</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="4">Uang Harian</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50" colSpan="2">Representasi</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Evidence</th>
            </tr>
            {/* Subcategories Row */}
            <tr className="bg-gray-100 border-b border-gray-300">
              <td colSpan="10" className="px-4 py-2 border-r border-gray-200"></td>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="2">Taksi Pergi</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="2">Transport Pergi</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="2">Taksi Pulang</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="2">Transport Pulang</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="2">Full Board</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200" colSpan="2">Regular</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">Aktual</th>
              <td className="px-4 py-2"></td>
            </tr>
            {/* Pagu/Aktual Row */}
            <tr className="bg-gray-100 border-b border-gray-300">
              <td colSpan="10" className="px-4 py-2 border-r border-gray-200"></td>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Aktual</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Aktual</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Aktual</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Aktual</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Aktual</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Aktual</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Pagu</th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200 w-[32rem]">Aktual</th>
              <td className="px-4 py-2"></td>
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
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="main">Utama</option>
                    <option value="tambahan">Tambahan</option>
                  </select>
                </td>
                <td className="px-6 py-4 border-r border-gray-200 w-[32rem]">
                  <input
                    type="text"
                    value={row.nama_lengkap}
                    onChange={(e) => updateRow(row.id, 'nama_lengkap', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nama lengkap"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 w-[32rem]">
                  <input
                    type="text"
                    value={row.golongan}
                    onChange={(e) => updateRow(row.id, 'golongan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Golongan"
                  />
                </td>
                <td className="px-6 py-4 border-r border-gray-200 w-[32rem]">
                  <input
                    type="text"
                    value={row.jabatan}
                    onChange={(e) => updateRow(row.id, 'jabatan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Jabatan"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 w-[32rem]">
                  <input
                    type="text"
                    value={row.eselon}
                    onChange={(e) => updateRow(row.id, 'eselon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Eselon"
                  />
                </td>
                <td className="px-6 py-4 border-r border-gray-200 w-[32rem]">
                  <input
                    type="text"
                    value={row.asal}
                    onChange={(e) => updateRow(row.id, 'asal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Asal"
                  />
                </td>
                <td className="px-6 py-4 border-r border-gray-200 w-[32rem]">
                  <input
                    type="text"
                    value={row.tujuan}
                    onChange={(e) => updateRow(row.id, 'tujuan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tujuan"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 w-[32rem]">
                  <input
                    type="date"
                    value={row.tanggal_pergi}
                    onChange={(e) => updateRow(row.id, 'tanggal_pergi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 w-[32rem]">
                  <input
                    type="date"
                    value={row.tanggal_pulang}
                    onChange={(e) => updateRow(row.id, 'tanggal_pulang', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>

                {/* Transportasi - Taksi Pergi */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.transport_taksi_pergi_pagu}
                    onChange={(e) => updateRow(row.id, 'transport_taksi_pergi_pagu', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.transport_taksi_pergi_aktual}
                    onChange={(e) => updateRow(row.id, 'transport_taksi_pergi_aktual', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Transportasi - Taksi Pulang */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.transport_taksi_pulang_pagu}
                    onChange={(e) => updateRow(row.id, 'transport_taksi_pulang_pagu', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.transport_taksi_pulang_aktual}
                    onChange={(e) => updateRow(row.id, 'transport_taksi_pulang_aktual', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Transportasi - Lainnya Pergi */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.transport_pergi_pagu}
                    onChange={(e) => updateRow(row.id, 'transport_pergi_pagu', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.transport_pergi_aktual}
                    onChange={(e) => updateRow(row.id, 'transport_pergi_aktual', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Transportasi - Lainnya Pulang */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.transport_pulang_pagu}
                    onChange={(e) => updateRow(row.id, 'transport_pulang_pagu', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.transport_pulang_aktual}
                    onChange={(e) => updateRow(row.id, 'transport_pulang_aktual', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Penginapan */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.penginapan_pagu}
                    onChange={(e) => updateRow(row.id, 'penginapan_pagu', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.penginapan_aktual}
                    onChange={(e) => updateRow(row.id, 'penginapan_aktual', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Uang Harian - Full Board */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.uang_harian_fullboard_pagu}
                    onChange={(e) => updateRow(row.id, 'uang_harian_fullboard_pagu', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.uang_harian_fullboard_aktual}
                    onChange={(e) => updateRow(row.id, 'uang_harian_fullboard_aktual', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Uang Harian - Regular */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.uang_harian_pagu}
                    onChange={(e) => updateRow(row.id, 'uang_harian_pagu', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.uang_harian_aktual}
                    onChange={(e) => updateRow(row.id, 'uang_harian_aktual', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Uang Representasi */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.uang_representasi_pagu}
                    onChange={(e) => updateRow(row.id, 'uang_representasi_pagu', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 w-[32rem]">
                  <input
                    type="number"
                    value={row.uang_representasi_aktual}
                    onChange={(e) => updateRow(row.id, 'uang_representasi_aktual', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
                    placeholder="0"
                  />
                </td>

                {/* Evidence */}
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

            {/* Total Row */}
            <tr className="bg-gray-50 font-semibold">
              <td colSpan="10" className="px-6 py-4 text-right text-sm text-gray-900 border-r border-gray-200">
                Total:
              </td>

              {/* Transportasi - Taksi Pergi */}
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.transport_taksi_pergi_pagu.toLocaleString('id-ID')}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.transport_taksi_pergi_aktual.toLocaleString('id-ID')}
              </td>

              {/* Transportasi - Lainnya Pergi */}
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.transport_pergi_pagu.toLocaleString('id-ID')}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.transport_pergi_aktual.toLocaleString('id-ID')}
              </td>

              {/* Transportasi - Taksi Pulang */}
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.transport_taksi_pulang_pagu.toLocaleString('id-ID')}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.transport_taksi_pulang_aktual.toLocaleString('id-ID')}
              </td>

              {/* Transportasi - Lainnya Pulang */}
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.transport_pulang_pagu.toLocaleString('id-ID')}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.transport_pulang_aktual.toLocaleString('id-ID')}
              </td>

              {/* Penginapan */}
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.penginapan_pagu.toLocaleString('id-ID')}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.penginapan_aktual.toLocaleString('id-ID')}
              </td>

              {/* Uang Harian - Full Board */}
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.uang_harian_fullboard_pagu.toLocaleString('id-ID')}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.uang_harian_fullboard_aktual.toLocaleString('id-ID')}
              </td>

              {/* Uang Harian - Regular */}
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.uang_harian_pagu.toLocaleString('id-ID')}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.uang_harian_aktual.toLocaleString('id-ID')}
              </td>

              {/* Uang Representasi */}
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.uang_representasi_pagu.toLocaleString('id-ID')}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 text-right">
                {totals.uang_representasi_aktual.toLocaleString('id-ID')}
              </td>

              {/* Total Overall */}
              <td colSpan="2" className="px-6 py-4 text-sm text-gray-900 text-right">
                <div className="space-y-1">
                  <div>Total Pagu: Rp {totals.total_pagu.toLocaleString('id-ID')}</div>
                  <div>Total Aktual: Rp {totals.total_aktual.toLocaleString('id-ID')}</div>
                </div>
              </td>
            </tr>
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