import React, { useState, useEffect } from 'react';
import NominatifEntryForm from '../components/nominatif/NominatifEntryForm.jsx';
import NominatifList from '../components/nominatif/NominatifList.jsx';

const Nominatif = () => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    // Check if URL has id parameter for editing
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
      setEditId(id);
      setShowForm(true);
    }
  }, []);

  const handleCreateNew = () => {
    setEditId(null);
    setShowForm(true);
    // Clear URL parameters
    window.history.pushState({}, '', '/nominatif');
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditId(null);
    // Clear URL parameters
    window.history.pushState({}, '', '/nominatif');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nominatif</h1>
          <p className="text-gray-600 mt-2">
            {showForm ? (editId ? 'Edit Data Nominatif' : 'Entry Data Nominatif Perjalanan Dinas') : 'Daftar Nominatif Perjalanan Dinas'}
          </p>
        </div>

        {showForm ? (
          <button
            onClick={handleBackToList}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali</span>
          </button>
        ) : (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-xs shadow-sm flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Buat Baru</span>
          </button>
        )}
      </div>

      {/* Content */}
      {showForm ? (
        <NominatifEntryForm editId={editId} onCancel={handleBackToList} />
      ) : (
        <NominatifList />
      )}
    </div>
  );
};

export default Nominatif;