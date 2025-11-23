import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing nominatif biaya data
 * Handles API calls, loading states, and error handling
 */
export const useNominatifBiaya = (detailRowId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Generic API call helper
  const apiCall = useCallback(async (url, options = {}) => {
    const token = getAuthToken();

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }, []);

  // Fetch biaya rows data
  const fetchData = useCallback(async () => {
    if (!detailRowId) {
      setError('Detail Row ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // API endpoint: /api/nominatifs/{detailRowId}/biaya-rows
      const response = await apiCall(`/api/nominatifs/${detailRowId}/biaya-rows`);

      // Handle different response formats
      const biayaData = response.data || response || [];

      if (Array.isArray(biayaData)) {
        setData(biayaData);
        console.log(`📊 Loaded ${biayaData.length} biaya rows for detailRowId: ${detailRowId}`);
      } else {
        console.warn('Unexpected data format:', response);
        setData([]);
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [detailRowId, apiCall]);

  // Save single biaya row
  const saveBiayaRow = useCallback(async (rowId, rowData) => {
    try {
      setError(null);

      // API endpoint: PUT /api/nominatif-biaya-rows/{rowId}
      const response = await apiCall(`/api/nominatif-biaya-rows/${rowId}`, {
        method: 'PUT',
        body: JSON.stringify(rowData),
      });

      console.log(`✅ Saved biaya row ${rowId}:`, response);
      return { success: true, data: response.data || response };

    } catch (err) {
      console.error(`❌ Save error for row ${rowId}:`, err);
      const errorMessage = err.message || 'Failed to save row';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [apiCall]);

  // Create new biaya row
  const createBiayaRow = useCallback(async (detailRowId, rowData) => {
    try {
      setError(null);

      // API endpoint: POST /api/nominatifs/{detailRowId}/biaya-rows
      const response = await apiCall(`/api/nominatifs/${detailRowId}/biaya-rows`, {
        method: 'POST',
        body: JSON.stringify(rowData),
      });

      console.log(`✅ Created biaya row:`, response);
      return { success: true, data: response.data || response };

    } catch (err) {
      console.error('❌ Create error:', err);
      const errorMessage = err.message || 'Failed to create row';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [apiCall]);

  // Delete biaya row
  const deleteBiayaRow = useCallback(async (rowId) => {
    try {
      setError(null);

      // API endpoint: DELETE /api/nominatif-biaya-rows/{rowId}
      const response = await apiCall(`/api/nominatif-biaya-rows/${rowId}`, {
        method: 'DELETE',
      });

      console.log(`✅ Deleted biaya row ${rowId}:`, response);
      return { success: true, data: response };

    } catch (err) {
      console.error(`❌ Delete error for row ${rowId}:`, err);
      const errorMessage = err.message || 'Failed to delete row';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [apiCall]);

  // Save all table data (batch save)
  const saveAllData = useCallback(async (tableData) => {
    if (!tableData || tableData.length === 0) {
      console.warn('⚠️ No data to save');
      return { success: false, error: 'No data to save' };
    }

    console.log(`💾 Starting batch save for ${tableData.length} rows...`);
    setError(null);

    try {
      // Save each row
      const savePromises = tableData.map(async (row) => {
        if (row.id) {
          // Update existing row
          return await saveBiayaRow(row.id, row);
        } else {
          // Create new row (should have nominatif_detail_row_id)
          return await createBiayaRow(row.nominatif_detail_row_id || detailRowId, row);
        }
      });

      const results = await Promise.allSettled(savePromises);

      // Check if any saves failed
      const failedSaves = results.filter(result =>
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      );

      if (failedSaves.length > 0) {
        const errors = failedSaves.map(save =>
          save.status === 'rejected' ? save.reason.message : save.value.error
        );
        throw new Error(`Some rows failed to save: ${errors.join(', ')}`);
      }

      console.log(`✅ Successfully saved all ${tableData.length} rows`);
      setLastSaved(new Date());

      // Refresh data after save
      await fetchData();

      return { success: true, savedCount: tableData.length };

    } catch (err) {
      console.error('❌ Batch save error:', err);
      setError(err.message || 'Failed to save data');
      return { success: false, error: err.message || 'Failed to save data' };
    }
  }, [detailRowId, saveBiayaRow, createBiayaRow, fetchData]);

  // Auto-save function (debounced)
  const autoSave = useCallback(async (tableData, delay = 2000) => {
    if (!tableData || tableData.length === 0) return;

    console.log(`⏰ Scheduling auto-save in ${delay}ms...`);

    const timeoutId = setTimeout(async () => {
      console.log('🔄 Auto-saving...');
      await saveAllData(tableData);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [saveAllData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    if (detailRowId) {
      fetchData();
    }
  }, [detailRowId, fetchData]);

  return {
    // Data
    data,
    loading,
    error,
    lastSaved,

    // Actions
    fetchData,
    saveBiayaRow,
    createBiayaRow,
    deleteBiayaRow,
    saveAllData,
    autoSave,
    refresh,
    clearError,

    // State helpers
    hasData: data.length > 0,
    hasError: !!error,
    canSave: !loading && !error && data.length > 0,
  };
};

/**
 * Hook for nominatif detail rows management
 */
export const useNominatifDetailRows = (nominatifId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const apiCall = useCallback(async (url, options = {}) => {
    const token = getAuthToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }, []);

  const fetchDetailRows = useCallback(async () => {
    if (!nominatifId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiCall(`/api/nominatifs/${nominatifId}/details`);
      setData(response.data || response || []);

    } catch (err) {
      console.error('❌ Fetch detail rows error:', err);
      setError(err.message || 'Failed to fetch detail rows');
    } finally {
      setLoading(false);
    }
  }, [nominatifId, apiCall]);

  useEffect(() => {
    if (nominatifId) {
      fetchDetailRows();
    }
  }, [nominatifId, fetchDetailRows]);

  return {
    data,
    loading,
    error,
    refresh: fetchDetailRows,
    clearError: () => setError(null),
  };
};

export default useNominatifBiaya;