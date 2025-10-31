import React from 'react';

const DetailPerjalananDinasSection = ({ data, onChange, isEditable }) => {
  const handleInputChange = (value) => {
    onChange('detailPerjalananDinas', { deskripsi: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Detail Perjalanan Dinas
      </h3>

      {/* Form Detail Perjalanan */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Deskripsi Perjalanan Dinas <span className="text-red-500">*</span>
          </label>
          <textarea
            value={data?.deskripsi || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={!isEditable}
            placeholder="Masukkan deskripsi perjalanan dinas"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500 resize-none text-sm"
            rows={6}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailPerjalananDinasSection;