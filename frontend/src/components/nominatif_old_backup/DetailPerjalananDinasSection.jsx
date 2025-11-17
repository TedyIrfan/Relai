import React from 'react';

const DetailPerjalananDinasSection = ({ data, onChange, isEditable }) => {

  const handleInputChange = (value) => {
    onChange('detailPerjalananDinas', { deskripsi: value });
  };

  return (
    <div className="space-y-4">
      {/* Header dengan icon dan karakter counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Deskripsi Perjalanan Dinas
            </label>
            <p className="text-xs text-gray-500">
              Jelaskan tujuan dan kegiatan perjalanan dinas
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {(data?.deskripsi?.length || 0)}/500 karakter
        </div>
      </div>

      {/* Textarea dengan design yang enhanced */}
      <div className="relative">
        <textarea
          value={data?.deskripsi || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 500) {
              handleInputChange(value);
            }
          }}
          disabled={!isEditable}
          placeholder="Contoh: Perjalanan dinas dalam rangka koordinasi dan monitoring pelaksanaan program di Provinsi DKI Jakarta..."
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200  disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 resize-none text-sm leading-relaxed transition-colors duration-200 shadow-sm hover:shadow-md focus:shadow-gray-100"
          rows={6}
          maxLength={500}
        />

        {/* Helper text */}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Deskripsikan secara jelas dan informatif
            </span>
          </p>
          {data?.deskripsi && (
            <button
              onClick={() => handleInputChange('')}
              disabled={!isEditable}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Hapus deskripsi"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPerjalananDinasSection;