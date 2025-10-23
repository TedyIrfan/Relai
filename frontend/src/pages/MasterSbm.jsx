import React, { useState, useEffect } from 'react';
import { Database, Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, FileText, Search, Filter, Eye, File, ChevronLeft, Trash, AlertTriangle } from 'lucide-react';

const MasterSBM = ({ selectedYear, onYearChange, loading }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [sbmFiles, setSbmFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [viewMode, setViewMode] = useState('files'); // files, sheets, data
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [sheets, setSheets] = useState([]);
  const [sheetData, setSheetData] = useState([]);

  // Delete modal states
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [showDeleteSheetModal, setShowDeleteSheetModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load SBM files on component mount
  useEffect(() => {
    loadSBMFiles();
  }, []);

  const loadSBMFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch('http://localhost/api/sbm/files');
      const data = await response.json();
      if (response.ok) {
        setSbmFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error loading SBM files:', error);
      // Mock data untuk development
      setSbmFiles([
        {
          id: 1,
          file_name: 'SBM_Tahun_2025_Complete.xlsx',
          total_sheets: 15,
          total_rows: 1250,
          uploaded_by: 'Admin',
          upload_date: '2025-10-23',
          status: 'active'
        },
        {
          id: 2,
          file_name: 'SBM_2024_Revisi.xlsx',
          total_sheets: 12,
          total_rows: 980,
          uploaded_by: 'Admin',
          upload_date: '2025-10-20',
          status: 'active'
        }
      ]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadSheets = async (fileId) => {
    try {
      const response = await fetch(`http://localhost/api/sbm/sheets/${fileId}`);
      const data = await response.json();
      if (response.ok) {
        setSheets(data.sheets || []);
      }
    } catch (error) {
      console.error('Error loading sheets:', error);
      // Mock data untuk development
      setSheets([
        {
          id: 1,
          sheet_name: 'Honorarium Dalam Kota',
          total_rows: 45,
          sheet_order: 1,
          status: 'active'
        },
        {
          id: 2,
          sheet_name: 'Honorarium Luar Kota',
          total_rows: 23,
          sheet_order: 2,
          status: 'active'
        },
        {
          id: 3,
          sheet_name: 'Transportasi Udara',
          total_rows: 67,
          sheet_order: 3,
          status: 'active'
        },
        {
          id: 4,
          sheet_name: 'Transportasi Darat',
          total_rows: 89,
          sheet_order: 4,
          status: 'active'
        },
        {
          id: 5,
          sheet_name: 'Akomodasi Hotel',
          total_rows: 34,
          sheet_order: 5,
          status: 'active'
        },
        {
          id: 6,
          sheet_name: 'Konsumsi Rapat',
          total_rows: 156,
          sheet_order: 6,
          status: 'active'
        },
        {
          id: 7,
          sheet_name: 'Alat Tulis Kantor',
          total_rows: 95,
          sheet_order: 7,
          status: 'active'
        },
        {
          id: 8,
          sheet_name: 'Cetak Dokumen',
          total_rows: 60,
          sheet_order: 8,
          status: 'active'
        }
      ]);
    }
  };

  const loadSheetData = async (sheetId) => {
    try {
      const response = await fetch(`http://localhost/api/sbm/data/${sheetId}`);
      const data = await response.json();
      if (response.ok) {
        setSheetData(data.data || []);
      }
    } catch (error) {
      console.error('Error loading sheet data:', error);
      // Mock data untuk development - dynamic columns
      setSheetData([
        {
          id: 1,
          row_number: 1,
          data: {
            'Kode SBM': 'SBM-HDK-001',
            'Nama Satuan Biaya': 'Honorarium Narasumber Dalam Kota',
            'Satuan': 'orang',
            'Nilai': '1500000',
            'Kategori': 'Honorarium',
            'Deskripsi': 'Honorarium untuk narasumber kegiatan dalam kota'
          }
        },
        {
          id: 2,
          row_number: 2,
          data: {
            'Kode SBM': 'SBM-HDK-002',
            'Nama Satuan Biaya': 'Honorarium Fasilitator',
            'Satuan': 'orang',
            'Nilai': '1000000',
            'Kategori': 'Honorarium',
            'Deskripsi': 'Honorarium untuk fasilitator kegiatan'
          }
        },
        {
          id: 3,
          row_number: 3,
          data: {
            'Kode SBM': 'SBM-HDK-003',
            'Nama Satuan Biaya': 'Honorarium Moderator',
            'Satuan': 'orang',
            'Nilai': '750000',
            'Kategori': 'Honorarium',
            'Deskripsi': 'Honorarium untuk moderator kegiatan'
          }
        }
      ]);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Pilih file Excel terlebih dahulu!');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('excel_file', importFile);

      const response = await fetch('http://localhost/api/sbm/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          message: result.message || 'File berhasil diimport!',
          fileName: result.file_name || importFile.name,
          totalSheets: result.total_sheets || 15,
          totalRows: result.total_rows || 1250,
          sheets: result.sheets || []
        });

        // Refresh files list
        await loadSBMFiles();

        // Auto-select the imported file
        if (result.file_id) {
          setSelectedFile(result.file_id);
          setViewMode('sheets');
          await loadSheets(result.file_id);
        }
      } else {
        setImportResult({
          success: false,
          message: result.message || 'Import gagal'
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Error: ' + error.message
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelectFromList = async (fileId) => {
    setSelectedFile(fileId);
    setSelectedSheet(null);
    setViewMode('sheets');
    await loadSheets(fileId);
  };

  const handleSheetSelect = async (sheetId) => {
    setSelectedSheet(sheetId);
    setViewMode('data');
    await loadSheetData(sheetId);
  };

  const handleBackToFiles = () => {
    setViewMode('files');
    setSelectedFile(null);
    setSelectedSheet(null);
    setSheets([]);
    setSheetData([]);
  };

  const handleBackToSheets = () => {
    setViewMode('sheets');
    setSelectedSheet(null);
    setSheetData([]);
  };

  // Get dynamic columns from sheet data
  const getTableColumns = () => {
    if (sheetData.length === 0) return [];
    return Object.keys(sheetData[0].data || {});
  };

  // Delete handler functions
  const handleDeleteFile = (file) => {
    setFileToDelete(file);
    setShowDeleteFileModal(true);
  };

  const handleDeleteSheet = (sheet) => {
    setSheetToDelete(sheet);
    setShowDeleteSheetModal(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`http://localhost/api/sbm/file/${fileToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Remove file from state
        setSbmFiles(sbmFiles.filter(file => file.id !== fileToDelete.id));
        setShowDeleteFileModal(false);
        setFileToDelete(null);

        // If we're currently viewing this file, go back to files view
        if (selectedFile === fileToDelete.id) {
          handleBackToFiles();
        }
      } else {
        alert('Gagal menghapus file: ' + (result.message || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Gagal menghapus file. Periksa koneksi internet Anda.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteSheet = async () => {
    if (!sheetToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`http://localhost/api/sbm/sheet/${sheetToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Remove sheet from state
        setSheets(sheets.filter(sheet => sheet.id !== sheetToDelete.id));
        setShowDeleteSheetModal(false);
        setSheetToDelete(null);

        // If we're currently viewing this sheet, go back to sheets view
        if (selectedSheet === sheetToDelete.id) {
          handleBackToSheets();
        }

        // Refresh files data to update statistics
        await loadSBMFiles();
      } else {
        alert('Gagal menghapus sheet: ' + (result.message || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error('Error deleting sheet:', error);
      alert('Gagal menghapus sheet. Periksa koneksi internet Anda.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master SBM</h1>
          <p className="text-gray-600 mt-2">Master Satuan Biaya Manajemen - Tahun {selectedYear}</p>
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button
          onClick={handleBackToFiles}
          className={`hover:text-gray-900 ${viewMode === 'files' ? 'text-gray-900 font-medium' : ''}`}
        >
          <File className="w-4 h-4 inline mr-1" />
          Daftar File
        </button>
        {viewMode !== 'files' && (
          <>
            <span>/</span>
            <button
              onClick={handleBackToSheets}
              className={`hover:text-gray-900 ${viewMode === 'sheets' ? 'text-gray-900 font-medium' : ''}`}
            >
              {selectedFile && sbmFiles.find(f => f.id === selectedFile)?.file_name}
            </button>
          </>
        )}
        {viewMode === 'data' && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {selectedSheet && (sheets.find(s => s.id === selectedSheet)?.sheet_name || sheets.find(s => s.id === selectedSheet)?.name)}
            </span>
          </>
        )}
      </div>

      {/* Master SBM Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {viewMode === 'files' && 'Daftar File SBM'}
                  {viewMode === 'sheets' && 'Daftar Sheet'}
                  {viewMode === 'data' && 'Data SBM'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {viewMode === 'files' && 'Semua file Excel SBM yang diupload (multi-sheet support)'}
                  {viewMode === 'sheets' && `Sheet dalam file: ${selectedFile && sbmFiles.find(f => f.id === selectedFile)?.file_name}`}
                  {viewMode === 'data' && `Detail data dari sheet: ${selectedSheet && (sheets.find(s => s.id === selectedSheet)?.sheet_name || sheets.find(s => s.id === selectedSheet)?.name)}`}
                </p>
              </div>
            </div>

            {/* Search Bar - Only show in files and sheets view */}
            {(viewMode === 'files' || viewMode === 'sheets') && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={viewMode === 'files' ? 'Cari file...' : 'Cari sheet...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            )}

            {/* Import Button - Only show in files view */}
            {viewMode === 'files' && (
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import Excel</span>
              </button>
            )}

            {/* Back Button - Show in sheets and data view */}
            {viewMode !== 'files' && (
              <button
                onClick={viewMode === 'data' ? handleBackToSheets : handleBackToFiles}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Content Based on View Mode */}
        {viewMode === 'files' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {loadingFiles ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat daftar file...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File SBM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Sheets
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sbmFiles
                      .filter(file =>
                        file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        file.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileSpreadsheet className="w-5 h-5 text-green-600 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {file.file_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                oleh {file.uploaded_by}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {file.total_sheets} sheets
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {file.total_rows.toLocaleString()} data
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(file.upload_date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {file.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFileSelectFromList(file.id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View Sheets
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            >
                              <Trash className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sbmFiles.length === 0 && (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada file SBM yang diupload</p>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload File Pertama
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === 'sheets' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {sheets
                .filter(sheet =>
                  (sheet.sheet_name || sheet.name || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((sheet) => (
                <div key={sheet.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Sheet {sheet.sheet_order}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSheet(sheet);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{sheet.sheet_name || sheet.name}</h3>
                  <p className="text-sm text-gray-600">{sheet.total_rows} data</p>
                  <div className="mt-3 flex items-center text-blue-600 text-sm cursor-pointer hover:text-blue-800"
                       onClick={() => handleSheetSelect(sheet.id)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View Data
                  </div>
                </div>
              ))}
            </div>
            {sheets.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada sheet yang ditemukan</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'data' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    {getTableColumns().map((column, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sheetData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      {getTableColumns().map((column, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.data[column] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {sheetData.length === 0 && (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada data dalam sheet ini</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      {viewMode === 'files' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 rounded-lg p-2">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Tentang Master SBM</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                Master Satuan Biaya Manajemen (SBM) adalah database yang berisi informasi lengkap mengenai
                standar satuan biaya untuk berbagai jenis kegiatan. Setiap file Excel dapat berisi multiple sheets
                dengan format yang berbeda-beda sesuai jenis SBM-nya. System akan otomatis mendeteksi semua sheet
                yang ada dan menyimpannya dengan struktur yang dinamis.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Multi-Sheet Support
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Dynamic Columns
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Search All Sheets
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Import Excel SBM (Multi-Sheet)
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih File Excel (Multi-Sheet)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {importFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    File: {importFile.name}
                  </div>
                )}
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`rounded-lg p-4 ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {importResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                      {importResult.message}
                    </span>
                  </div>
                  {importResult.success && (
                    <div className="mt-2 text-sm text-green-700">
                      <div>File: {importResult.fileName}</div>
                      <div>Total Sheets: {importResult.totalSheets}</div>
                      <div>Total Rows: {importResult.totalRows.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? 'Mengimport...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete File Confirmation Modal */}
      {showDeleteFileModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus File</h3>
              <button
                onClick={() => {
                  setShowDeleteFileModal(false);
                  setFileToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-900">
                  <p className="font-medium">Perhatian!</p>
                  <p>File dan semua sheet di dalamnya akan dihapus permanen.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700">File yang akan dihapus:</p>
                <p className="text-sm text-gray-900 mt-1">{fileToDelete.file_name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {fileToDelete.total_sheets} sheet • {fileToDelete.total_rows.toLocaleString()} data
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteFileModal(false);
                    setFileToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteFile}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? 'Menghapus...' : 'Hapus File'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sheet Confirmation Modal */}
      {showDeleteSheetModal && sheetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus Sheet</h3>
              <button
                onClick={() => {
                  setShowDeleteSheetModal(false);
                  setSheetToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-900">
                  <p className="font-medium">Perhatian!</p>
                  <p>Sheet dan semua data di dalamnya akan dihapus permanen.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Sheet yang akan dihapus:</p>
                <p className="text-sm text-gray-900 mt-1">{sheetToDelete.sheet_name || sheetToDelete.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {sheetToDelete.total_rows} data
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteSheetModal(false);
                    setSheetToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteSheet}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? 'Menghapus...' : 'Hapus Sheet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterSBM;