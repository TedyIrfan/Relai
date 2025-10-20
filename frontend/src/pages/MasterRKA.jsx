import React, { useState } from 'react';
import { Calculator, Database, Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import MasterRKATable from '../components/tables/MasterRKATable';

const MasterRKA = ({ selectedYear, onYearChange, loading }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

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

      const response = await fetch('http://localhost:80/api/rka-details/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          message: result.message,
          importedCount: result.imported_count,
          errors: result.errors || []
        });

        // Refresh table data
        window.location.reload();
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master RKA</h1>
          <p className="text-gray-600 mt-2">Master Rencana Kerja Anggaran - Tahun {selectedYear}</p>
        </div>
      </div>

      {/* Master RKA Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-3">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Semua Data Anggaran</h2>
                <p className="text-sm text-gray-500 mt-1">Data lengkap Anggaran A, B, dan C tahun {selectedYear}</p>
              </div>
            </div>

            {/* Import Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
          </div>
        </div>

        {/* Master RKA Table */}
        <MasterRKATable />
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="bg-green-100 rounded-lg p-2">
            <Calculator className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Tentang Master RKA</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              Master Rencana Kerja Anggaran (RKA) adalah database yang berisi informasi lengkap mengenai
              perencanaan dan penganggaran untuk berbagai jenis program dan kegiatan. Data ini mencakup
              informasi program, layanan, wilayah, dan rincian anggaran yang digunakan untuk perencanaan
              keuangan tahun berjalan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Anggaran A: Dinas Pimpinan
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Anggaran B: Pengelolaan Tata Usaha Sekretaris Menko
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Anggaran C: Konferensi Infrastruktur Internasional
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Import Excel RKA Details
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
                  Pilih File Excel
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
                  {importResult.success && importResult.importedCount && (
                    <div className="mt-2 text-sm text-green-700">
                      {importResult.importedCount} data berhasil diimport
                    </div>
                  )}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      <div className="font-medium">Errors:</div>
                      <ul className="mt-1 space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-xs">• {error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li className="text-xs">... dan {importResult.errors.length - 5} error lainnya</li>
                        )}
                      </ul>
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? 'Mengimport...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterRKA;