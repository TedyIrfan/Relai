import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NominatifTable from '../components/NominatifTable';
import { useNominatifBiaya, useNominatifDetailRows } from '../hooks/useNominatifBiaya';
import { calculateNominatifBiayaRow, debugCalculations } from '../utils/calculations';

/**
 * Main Nominatif Detail Page
 * Integrates all components for complete nominatif biaya management
 */
const NominatifDetailPage = () => {
  const { nominatifId, detailRowId } = useParams();
  const navigate = useNavigate();

  // Hooks for data management
  const {
    data: biayaData,
    loading: biayaLoading,
    error: biayaError,
    lastSaved,
    saveAllData,
    refresh: refreshBiaya,
    clearError: clearBiayaError,
    canSave
  } = useNominatifBiaya(detailRowId);

  const {
    data: detailRows,
    loading: detailLoading,
    error: detailError,
    refresh: refreshDetails
  } = useNominatifDetailRows(nominatifId);

  // Local state
  const [tableData, setTableData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false); // Disabled by default for better UX
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [currentDetailRow, setCurrentDetailRow] = useState(null);
  const [redirectPath, setRedirectPath] = useState('/nominatifs'); // Configurable redirect path

  // Initialize table data
  useEffect(() => {
    if (biayaData && Array.isArray(biayaData)) {
      setTableData(biayaData);
    }
  }, [biayaData]);

  // Handle data changes from table
  const handleDataChange = useCallback((newData) => {
    setTableData(newData);
  }, []);

  // Success message handler
  const showSuccessMessage = useCallback((message) => {
    // Store success message for display on next page
    sessionStorage.setItem('nominatifSuccessMessage', message);
  }, []);

  // Handle save with auto-redirect for better UX
  const handleSave = useCallback(async (dataToSave) => {
    if (!dataToSave || dataToSave.length === 0) {
      alert('No data to save');
      return;
    }

    setSaving(true);

    try {
      console.log(`🚀 Starting save operation for ${dataToSave.length} rows...`);

      const result = await saveAllData(dataToSave);

      if (result.success) {
        // ✅ Show success message and redirect for better UX
        const successMessage = `✅ Data berhasil disimpan! (${result.savedCount} rows)`;
        showSuccessMessage(successMessage);

        console.log('🎉 Save successful, redirecting to:', redirectPath);

        // Auto-redirect to main list after successful save
        setTimeout(() => {
          navigate(redirectPath, {
            state: {
              success: true,
              message: successMessage,
              savedRows: result.savedCount,
              timestamp: new Date().toISOString()
            }
          });
        }, 500); // Small delay for user to see success indication

      } else {
        // ❌ Stay on page for error fixing
        alert(`❌ Save failed: ${result.error}`);
      }

    } catch (error) {
      console.error('💥 Save operation failed:', error);
      alert(`❌ Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [saveAllData, navigate, redirectPath, showSuccessMessage]);

  // Handle save draft with auto-redirect
  const handleSaveDraft = useCallback(async () => {
    if (!tableData || tableData.length === 0) {
      alert('No data to save as draft');
      return;
    }

    setSaving(true);

    try {
      console.log('📝 Saving as draft...');

      const result = await saveAllData(tableData);

      if (result.success) {
        // ✅ Show draft success message and redirect
        const successMessage = `✅ Draft berhasil disimpan! (${result.savedCount} rows)`;
        showSuccessMessage(successMessage);

        console.log('📝 Draft saved successfully, redirecting to:', redirectPath);

        setTimeout(() => {
          navigate(redirectPath, {
            state: {
              success: true,
              message: successMessage,
              type: 'draft',
              savedRows: result.savedCount,
              timestamp: new Date().toISOString()
            }
          });
        }, 500);

      } else {
        alert(`❌ Draft save failed: ${result.error}`);
      }

    } catch (error) {
      console.error('💥 Draft save failed:', error);
      alert(`❌ Draft save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [tableData, saveAllData, navigate, redirectPath, showSuccessMessage]);

  // Handle submit (final submission)
  const handleSubmit = useCallback(async () => {
    if (!tableData || tableData.length === 0) {
      alert('No data to submit');
      return;
    }

    // Confirmation before final submission
    const confirmSubmit = confirm('Apakah Anda yakin ingin submit data ini? Data yang sudah submit tidak dapat diubah lagi.');
    if (!confirmSubmit) return;

    setSubmitting(true);

    try {
      console.log('🎯 Submitting final data...');

      // For submit, you might want to update the nominatif status to 'submitted'
      const result = await saveAllData(tableData);

      if (result.success) {
        // ✅ Show submit success message and redirect
        const successMessage = `✅ Data berhasil di-submit! (${result.savedCount} rows)`;
        showSuccessMessage(successMessage);

        console.log('🎯 Submit successful, redirecting to:', redirectPath);

        setTimeout(() => {
          navigate(redirectPath, {
            state: {
              success: true,
              message: successMessage,
              type: 'submitted',
              savedRows: result.savedCount,
              timestamp: new Date().toISOString()
            }
          });
        }, 500);

      } else {
        alert(`❌ Submit failed: ${result.error}`);
      }

    } catch (error) {
      console.error('💥 Submit failed:', error);
      alert(`❌ Submit failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [tableData, saveAllData, navigate, redirectPath, showSuccessMessage]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || tableData.length === 0) return;

    const timeoutId = setTimeout(async () => {
      console.log('⏰ Auto-saving...');
      await handleSave(tableData);
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [tableData, autoSaveEnabled, handleSave]);

  // Refresh all data
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refreshBiaya(),
      refreshDetails()
    ]);
  }, [refreshBiaya, refreshDetails]);

  // Navigate back
  const handleBack = useCallback(() => {
    navigate(-1); // Go back to previous page
  }, [navigate]);

  // Get current detail row info
  useEffect(() => {
    if (detailRows && detailRowId) {
      const currentRow = detailRows.find(row => row.id == detailRowId);
      setCurrentDetailRow(currentRow);
    }
  }, [detailRows, detailRowId]);

  // Loading state
  const isLoading = biayaLoading || detailLoading || saving;
  const hasError = biayaError || detailError;

  // Calculate summary statistics
  const calculateSummary = useCallback(() => {
    if (!tableData || tableData.length === 0) return null;

    const summary = tableData.reduce((acc, row) => {
      acc.totalPagu += row.total_pagu_row || 0;
      acc.totalAktual += row.total_aktual_row || 0;
      acc.totalAnggaranBerjalan += row.total_anggaran_berjalan_row || 0;
      acc.overBudgetCount += (row.total_anggaran_berjalan_row || 0) < 0 ? 1 : 0;
      acc.rowCount++;
      return acc;
    }, {
      totalPagu: 0,
      totalAktual: 0,
      totalAnggaranBerjalan: 0,
      overBudgetCount: 0,
      rowCount: 0
    });

    return summary;
  }, [tableData]);

  const summary = calculateSummary();

  if (isLoading && !tableData.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Loading nominatif data...</div>
          <div className="text-sm text-gray-400">Please wait...</div>
        </div>
      </div>
    );
  }

  if (hasError && !tableData.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-xl font-bold mb-2">❌ Error Loading Data</h2>
          <p className="text-red-600 mb-4">{biayaError || detailError}</p>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detail Biaya Nominatif
                </h1>
                <div className="text-sm text-gray-600">
                  {currentDetailRow ? (
                    <span>
                      Person: <strong>{currentDetailRow.person_name}</strong> |
                      Position: <strong>{currentDetailRow.jabatan}</strong>
                    </span>
                  ) : (
                    <span>Loading person details...</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-save toggle */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded"
                />
                Auto-save (5s)
              </label>

              {/* Debug toggle */}
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className={`px-3 py-1 text-sm rounded ${showDebugInfo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
              </button>

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Summary Statistics */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-600 font-medium">Total Rows</div>
                <div className="text-xl font-bold text-blue-800">{summary.rowCount}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-green-600 font-medium">Total Pagu</div>
                <div className="text-xl font-bold text-green-800">
                  Rp {summary.totalPagu.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-sm text-yellow-600 font-medium">Total Aktual</div>
                <div className="text-xl font-bold text-yellow-800">
                  Rp {summary.totalAktual.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-purple-600 font-medium">Sisa Anggaran</div>
                <div className="text-xl font-bold text-purple-800">
                  Rp {summary.totalAnggaranBerjalan.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-sm text-red-600 font-medium">Over Budget</div>
                <div className="text-xl font-bold text-red-800">{summary.overBudgetCount} rows</div>
              </div>
            </div>
          )}

          {/* Status indicators */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              {saving && <span className="text-blue-600">🔄 Saving...</span>}
              {lastSaved && !saving && (
                <span className="text-green-600">
                  ✅ Last saved: {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
              {!canSave && !saving && (
                <span className="text-gray-500">💾 Ready to save</span>
              )}
            </div>

            {biayaError && (
              <div className="text-red-600">
                ⚠️ {biayaError}
                <button
                  onClick={clearBiayaError}
                  className="ml-2 text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Debug Information */}
        {showDebugInfo && tableData.length > 0 && (
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">🐛 Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>First Row Sample:</strong>
                <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                  {JSON.stringify(tableData[0], null, 2)}
                </pre>
              </div>
              <div>
                <strong>Calculated First Row:</strong>
                <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                  {JSON.stringify(debugCalculations(tableData[0]), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Excel-like Table */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Instructions:</span> Fill in the biaya data below.
              Use <strong>💾 Simpan</strong> to save as draft, or <strong>📝 Submit</strong> for final submission.
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Save Button (Draft) */}
              <button
                onClick={handleSaveDraft}
                disabled={saving || submitting || !tableData.length}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  saving || submitting || !tableData.length
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {saving ? '⏳ Saving...' : '💾 Simpan'}
              </button>

              {/* Submit Button (Final) */}
              <button
                onClick={handleSubmit}
                disabled={saving || submitting || !tableData.length}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  saving || submitting || !tableData.length
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                }`}
              >
                {saving ? '⏳ Submitting...' : '📝 Submit'}
              </button>
            </div>
          </div>

          {/* Table Component */}
          <NominatifTable
            data={tableData}
            onDataChange={handleDataChange}
            onSave={handleSave} // For manual save if needed
            loading={saving}
          />

          {/* Footer Information */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                <strong>💡 UX Tip:</strong> After saving, you will be automatically redirected to the main list.
                This provides a complete workflow experience - save task done → return to overview.
              </div>
              <div className="flex gap-4">
                <span>Rows: {tableData.length}</span>
                <span>Auto-redirect: ✅ Enabled</span>
                <span>Target: {redirectPath}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominatifDetailPage;