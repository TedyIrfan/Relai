import React from 'react';
import NominatifEntryForm from '../components/nominatif/NominatifEntryForm.jsx';

const Nominatif = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nominatif</h1>
        <p className="text-gray-600 mt-2">Entry Data Nominatif Perjalanan Dinas</p>
      </div>

      {/* Nominatif Entry Form */}
      <NominatifEntryForm />
    </div>
  );
};

export default Nominatif;