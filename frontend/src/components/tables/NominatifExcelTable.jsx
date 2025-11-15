import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Send, Upload, Download, CheckCircle } from 'lucide-react';

const NominatifExcelTable = ({ rkaDetail, initialData = [], onSave, onSubmit }) => {
  const [rows, setRows] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const tableRef = useRef(null);

  // Add new row
  const addRow = (personType = 'main') => {
    const newRow = {
      id: Date.now(), // temporary ID
      person_type: personType,
      nama: '',
      golongan: '',
      jabatan: '',
      eselon: '',
      asal: '',
      tujuan: '',
      tanggal: getCurrentDate(), // Default to current date
      transport_taksi_pergi_pagu: '',
      transport_taksi_pergi_aktual: '',
      transport_pergi_pagu: '',
      transport_pergi_aktual: '',
      transport_taksi_pulang_pagu: '',
      transport_taksi_pulang_aktual: '',
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
      evidence: null
    };
    setRows([...rows, newRow]);
  };

  // Delete row
  const deleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  // Update cell value
  const updateCell = (rowIndex, columnKey, value) => {
    const newRows = [...rows];
    newRows[rowIndex][columnKey] = value;
    setRows(newRows);
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '';
    const num = value.toString().replace(/[^\d]/g, '');
    return num ? parseInt(num).toLocaleString('id-ID') : '';
  };

  // Parse currency
  const parseCurrency = (value) => {
    if (!value) return 0;
    const num = value.toString().replace(/[^\d]/g, '');
    const parsed = num ? parseInt(num, 10) : 0;
    // Batasi maksimal nilai agar tidak terlalu besar (maksimal 10 miliar)
    return Math.min(parsed, 10000000000);
  };

  // Calculate row totals
  const calculateRowTotals = (row) => {
    const paguFields = [
      'transport_taksi_pergi_pagu',
      'transport_pergi_pagu',
      'transport_taksi_pulang_pagu',
      'transport_pulang_pagu',
      'penginapan_pagu',
      'uang_harian_fullboard_pagu',
      'uang_harian_pagu',
      'uang_representasi_pagu'
    ];

    const aktualFields = [
      'transport_taksi_pergi_aktual',
      'transport_pergi_aktual',
      'transport_taksi_pulang_aktual',
      'transport_pulang_aktual',
      'penginapan_aktual',
      'uang_harian_fullboard_aktual',
      'uang_harian_aktual',
      'uang_representasi_aktual'
    ];

    const totalPagu = paguFields.reduce((sum, field) => {
      const value = parseCurrency(row[field] || 0);
      return sum + value;
    }, 0);

    const totalAktual = aktualFields.reduce((sum, field) => {
      const value = parseCurrency(row[field] || 0);
      return sum + value;
    }, 0);

    return { totalPagu, totalAktual };
  };

  // Calculate grand totals
  const calculateGrandTotals = () => {
    let mainPersonPagu = 0;
    let mainPersonAktual = 0;
    let tambahanPagu = 0;
    let tambahanAktual = 0;

    rows.forEach(row => {
      const totals = calculateRowTotals(row);
      if (row.person_type === 'main') {
        mainPersonPagu += totals.totalPagu;
        mainPersonAktual += totals.totalAktual;
      } else {
        tambahanPagu += totals.totalPagu;
        tambahanAktual += totals.totalAktual;
      }
    });

    return {
      mainPersonPagu,
      mainPersonAktual,
      tambahanPagu,
      tambahanAktual,
      grandPagu: mainPersonPagu + tambahanPagu,
      grandAktual: mainPersonAktual + tambahanAktual
    };
  };

  // Handle file upload
  const handleFileUpload = (rowIndex, file) => {
    if (file && file.type.startsWith('image/')) {
      const newRows = [...rows];
      newRows[rowIndex].evidence = file;
      setRows(newRows);
    }
  };

  // Save data
  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave(rows);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Submit data
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(rows);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current date for default
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Column definitions
  const columns = [
    { key: 'delete', label: 'Aksi', width: '60px', type: 'delete' },
    { key: 'person_type', label: 'Tipe', width: '80px', type: 'select', options: ['main', 'tambahan'] },
    { key: 'nama', label: 'Nama Lengkap', width: '120px', type: 'text' },
    { key: 'golongan', label: 'Golongan', width: '80px', type: 'text' },
    { key: 'jabatan', label: 'Jabatan', width: '100px', type: 'text' },
    { key: 'eselon', label: 'Eselon', width: '70px', type: 'text' },
    { key: 'asal', label: 'Asal', width: '80px', type: 'text' },
    { key: 'tujuan', label: 'Tujuan', width: '80px', type: 'text' },
    { key: 'tanggal', label: 'Tanggal', width: '100px', type: 'date' },
    { key: 'transport_taksi_pergi_pagu', label: 'Transportasi Taksi Pergi', width: '320px', type: 'merged' },
    { key: 'transport_pergi_pagu', label: 'Transportasi Pergi', width: '300px', type: 'merged' },
    { key: 'transport_taksi_pulang_pagu', label: 'Transportasi Taksi Pulang', width: '320px', type: 'merged' },
    { key: 'transport_pulang_pagu', label: 'Transportasi Pulang', width: '300px', type: 'merged' },
    { key: 'penginapan_pagu', label: 'Penginapan', width: '300px', type: 'merged' },
    { key: 'uang_harian_fullboard_pagu', label: 'Uang Harian Fullboard', width: '340px', type: 'merged' },
    { key: 'uang_harian_pagu', label: 'Uang Harian', width: '300px', type: 'merged' },
    { key: 'uang_representasi_pagu', label: 'Uang Representasi', width: '320px', type: 'merged' },
    { key: 'evidence', label: 'Evidence', width: '100px', type: 'file' }
  ];

  const totals = calculateGrandTotals();

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Input Nominatif</h3>
          {rkaDetail && (
            <p className="text-sm text-gray-600">
              RKA: {rkaDetail.code_rka} - {rkaDetail.layanan}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 bg-white"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-800 rounded-lg disabled:opacity-50 bg-gray-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => addRow('main')}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm bg-white"
        >
          <Plus className="w-4 h-4" />
          + Main Person
        </button>
        <button
          onClick={() => addRow('tambahan')}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm bg-white"
        >
          <Plus className="w-4 h-4" />
          + Tambahan Orang
        </button>
      </div>

      {/* Excel-like Table - Completely White Design for Eye Comfort */}
      <div className="border border-gray-200 rounded-lg">
        <table className="w-full" ref={tableRef}>
          {/* Header Baris 1 - Main Headers */}
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '60px' }}>Aksi</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '80px' }}>Tipe</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '150px' }}>Nama Lengkap</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '100px' }}>Golongan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '120px' }}>Jabatan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '80px' }}>Eselon</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '120px' }}>Asal</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '120px' }}>Tujuan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '120px' }}>Tanggal</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '320px' }} colSpan="2">Transportasi Taksi Pergi</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '300px' }} colSpan="2">Transportasi Pergi</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '320px' }} colSpan="2">Transportasi Taksi Pulang</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '300px' }} colSpan="2">Transportasi Pulang</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '300px' }} colSpan="2">Penginapan</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '340px' }} colSpan="2">Uang Harian Fullboard</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '300px' }} colSpan="2">Uang Harian</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200" style={{ width: '320px' }} colSpan="2">Uang Representasi</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600" style={{ width: '120px' }}>Evidence</th>
            </tr>
            {/* Header Baris 2 - Sub Headers */}
            <tr className="bg-white border-b border-gray-200">
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200">Aksi</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 border-r border-gray-200">Tipe</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 border-r border-gray-200">Nama Lengkap</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 border-r border-gray-200">Golongan</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 border-r border-gray-200">Jabatan</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 border-r border-gray-200">Eselon</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 border-r border-gray-200">Asal</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 border-r border-gray-200">Tujuan</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 border-r border-gray-200">Tanggal</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '160px' }}>Pagu</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '160px' }}>Aktual</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '150px' }}>Pagu</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '150px' }}>Aktual</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '160px' }}>Pagu</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '160px' }}>Aktual</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '150px' }}>Pagu</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '150px' }}>Aktual</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '150px' }}>Pagu</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '150px' }}>Aktual</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '170px' }}>Pagu</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '170px' }}>Aktual</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '150px' }}>Pagu</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '150px' }}>Aktual</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '160px' }}>Pagu</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 border-r border-gray-200" style={{ width: '160px' }}>Aktual</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500">Evidence</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((row, rowIndex) => {
              const rowTotals = calculateRowTotals(row);
              return (
                <tr key={row.id}>
                  {/* Aksi */}
                  <td className="px-3 py-3 border-r border-gray-200 text-center" style={{ width: '60px' }}>
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="flex items-center justify-center w-full px-2 py-2 text-gray-500 rounded"
                      title="Hapus Baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                  {/* Tipe */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '80px' }}>
                    <select
                      value={row.person_type}
                      onChange={(e) => updateCell(rowIndex, 'person_type', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Pilih</option>
                      <option value="main">Main</option>
                      <option value="tambahan">Tambahan</option>
                    </select>
                  </td>
                  {/* Nama Lengkap */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={row.nama}
                      onChange={(e) => updateCell(rowIndex, 'nama', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Nama lengkap..."
                    />
                  </td>
                  {/* Golongan */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '100px' }}>
                    <select
                      value={row.golongan}
                      onChange={(e) => updateCell(rowIndex, 'golongan', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Pilih...</option>
                      <option value="I">Golongan I</option>
                      <option value="II">Golongan II</option>
                      <option value="III">Golongan III</option>
                      <option value="IV">Golongan IV</option>
                      <option value="non-golongan">Non Golongan</option>
                    </select>
                  </td>
                  {/* Jabatan */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '120px' }}>
                    <input
                      type="text"
                      value={row.jabatan}
                      onChange={(e) => updateCell(rowIndex, 'jabatan', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Jabatan..."
                    />
                  </td>
                  {/* Eselon */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '80px' }}>
                    <select
                      value={row.eselon}
                      onChange={(e) => updateCell(rowIndex, 'eselon', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Pilih...</option>
                      <option value="I">Eselon I</option>
                      <option value="II">Eselon II</option>
                      <option value="III">Eselon III</option>
                      <option value="IV">Eselon IV</option>
                      <option value="non-eselon">Non Eselon</option>
                    </select>
                  </td>
                  {/* Asal */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '120px' }}>
                    <input
                      type="text"
                      value={row.asal}
                      onChange={(e) => updateCell(rowIndex, 'asal', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Asal..."
                    />
                  </td>
                  {/* Tujuan */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '120px' }}>
                    <input
                      type="text"
                      value={row.tujuan}
                      onChange={(e) => updateCell(rowIndex, 'tujuan', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Tujuan..."
                    />
                  </td>
                  {/* Tanggal */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '120px' }}>
                    <input
                      type="date"
                      value={row.tanggal}
                      onChange={(e) => updateCell(rowIndex, 'tanggal', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </td>
                  {/* Transportasi Taksi Pergi - Pagu */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '160px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.transport_taksi_pergi_pagu)}
                      onChange={(e) => updateCell(rowIndex, 'transport_taksi_pergi_pagu', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Transportasi Taksi Pergi - Aktual */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '160px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.transport_taksi_pergi_aktual)}
                      onChange={(e) => updateCell(rowIndex, 'transport_taksi_pergi_aktual', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Transportasi Pergi - Pagu */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.transport_pergi_pagu)}
                      onChange={(e) => updateCell(rowIndex, 'transport_pergi_pagu', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Transportasi Pergi - Aktual */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.transport_pergi_aktual)}
                      onChange={(e) => updateCell(rowIndex, 'transport_pergi_aktual', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Transportasi Taksi Pulang - Pagu */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '160px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.transport_taksi_pulang_pagu)}
                      onChange={(e) => updateCell(rowIndex, 'transport_taksi_pulang_pagu', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Transportasi Taksi Pulang - Aktual */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '160px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.transport_taksi_pulang_aktual)}
                      onChange={(e) => updateCell(rowIndex, 'transport_taksi_pulang_aktual', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Transportasi Pulang - Pagu */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.transport_pulang_pagu)}
                      onChange={(e) => updateCell(rowIndex, 'transport_pulang_pagu', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Transportasi Pulang - Aktual */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.transport_pulang_aktual)}
                      onChange={(e) => updateCell(rowIndex, 'transport_pulang_aktual', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Penginapan - Pagu */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.penginapan_pagu)}
                      onChange={(e) => updateCell(rowIndex, 'penginapan_pagu', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Penginapan - Aktual */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.penginapan_aktual)}
                      onChange={(e) => updateCell(rowIndex, 'penginapan_aktual', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Uang Harian Fullboard - Pagu */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '170px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.uang_harian_fullboard_pagu)}
                      onChange={(e) => updateCell(rowIndex, 'uang_harian_fullboard_pagu', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Uang Harian Fullboard - Aktual */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '170px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.uang_harian_fullboard_aktual)}
                      onChange={(e) => updateCell(rowIndex, 'uang_harian_fullboard_aktual', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Uang Harian - Pagu */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.uang_harian_pagu)}
                      onChange={(e) => updateCell(rowIndex, 'uang_harian_pagu', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Uang Harian - Aktual */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '150px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.uang_harian_aktual)}
                      onChange={(e) => updateCell(rowIndex, 'uang_harian_aktual', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Uang Representasi - Pagu */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '160px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.uang_representasi_pagu)}
                      onChange={(e) => updateCell(rowIndex, 'uang_representasi_pagu', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Uang Representasi - Aktual */}
                  <td className="px-3 py-3 border-r border-gray-200" style={{ width: '160px' }}>
                    <input
                      type="text"
                      value={formatCurrency(row.uang_representasi_aktual)}
                      onChange={(e) => updateCell(rowIndex, 'uang_representasi_aktual', parseCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded text-base font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-right"
                    />
                  </td>
                  {/* Evidence */}
                  <td className="px-3 py-3 text-center" style={{ width: '120px' }}>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(rowIndex, e.target.files[0])}
                        className="hidden"
                        id={`file-${rowIndex}`}
                      />
                      <label
                        htmlFor={`file-${rowIndex}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </label>
                      {row.evidence && (
                        <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded text-xs">
                          <CheckCircle className="w-3 h-3" />
                          OK
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Main Person: </span>
            <span className="font-medium">
              Rp {formatCurrency(totals.mainPersonPagu)} / Rp {formatCurrency(totals.mainPersonAktual)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Tambahan: </span>
            <span className="font-medium">
              Rp {formatCurrency(totals.tambahanPagu)} / Rp {formatCurrency(totals.tambahanAktual)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Grand Total: </span>
            <span className="font-bold text-green-600">
              Rp {formatCurrency(totals.grandPagu)} / Rp {formatCurrency(totals.grandAktual)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Editable Cell Component
const EditableCell = ({ type, value, onChange, onFileUpload, options, rowIndex, columnKey, onDeleteRow }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(tempValue);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setEditing(false);
    }
  };

  // Gunakan fungsi formatCurrency dan parseCurrency dari parent scope

  // Render based on type
  if (type === 'delete') {
    return (
      <button
        onClick={onDeleteRow}
        className="flex items-center justify-center w-full px-2 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
        title="Hapus Baris"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  }

  if (type === 'select') {
    return (
      <select
        value={tempValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Pilih</option>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option === 'main' ? 'Main' : 'Tambahan'}
          </option>
        ))}
      </select>
    );
  }

  if (type === 'date') {
    return (
      <input
        type="date"
        value={tempValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    );
  }

  if (type === 'currency') {
    return (
      <input
        type="text"
        value={formatCurrency(tempValue)}
        onChange={(e) => onChange(parseCurrency(e.target.value))}
        placeholder="0"
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right"
      />
    );
  }

  if (type === 'file') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileUpload(e.target.files[0])}
          className="hidden"
          id={`file-${rowIndex}-${columnKey}`}
        />
        <label
          htmlFor={`file-${rowIndex}-${columnKey}`}
          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200 text-xs"
        >
          <Upload className="w-3 h-3" />
          Upload
        </label>
        {tempValue && (
          <span className="text-xs text-green-600">✓</span>
        )}
      </div>
    );
  }

  if (type === 'no') {
    return (
      <div className="text-center text-sm font-medium text-gray-600">
        {rowIndex + 1}
      </div>
    );
  }

  // Default text input
  return (
    <input
      type="text"
      value={tempValue}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setEditing(true)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Ketik..."
    />
  );
};

export default NominatifExcelTable;