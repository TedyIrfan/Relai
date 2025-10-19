import React from 'react';
import { AVAILABLE_YEARS } from '../../utils/chartConfig';

const TahunSelector = ({ selectedYear, onYearChange, loading = false }) => {
  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800">Pilih Tahun Anggaran</h2>

      <div className="flex flex-wrap justify-center gap-3">
        {AVAILABLE_YEARS.map((year) => (
          <button
            key={year}
            onClick={() => onYearChange && onYearChange(year)}
            disabled={loading}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all duration-200
              ${selectedYear === year
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {year}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm">Memuat data...</span>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>Tahun yang dipilih: <span className="font-semibold text-gray-700">{selectedYear}</span></p>
      </div>
    </div>
  );
};

export default TahunSelector;