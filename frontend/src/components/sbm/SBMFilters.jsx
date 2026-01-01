import React, { useState } from 'react';

const SBMFilters = ({ filterOptions, filters, onFilterChange, search, onSearchChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract metadata
  const sourceFiles = filterOptions?._source_files || [];
  const groupingFields = filterOptions?._grouping_fields || [];

  // Build filter fields from filterOptions (excluding metadata)
  const filterFields = Object.keys(filterOptions || {}).filter(
    key => !key.startsWith('_')
  );

  const handleSearchChange = (e) => {
    onSearchChange(e.target.value);
  };

  const handleFilterFieldChange = (field, value) => {
    const newFilters = { ...filters };
    if (value === '' || value === null) {
      delete newFilters[field];
    } else {
      newFilters[field] = value;
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
    onSearchChange('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || search;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari berdasarkan uraian, provinsi, atau keterangan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Object.keys(filters).length + (search ? 1 : 0)}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {/* Grouping Info */}
          {groupingFields.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Grouping:</span> {groupingFields.join(', ')}
              </p>
            </div>
          )}

          {/* Dynamic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterFields.map(field => {
              const fieldData = filterOptions[field];

              // Handle nested structure (e.g., parent_section -> sub_category -> field_options)
              const renderFilterSelect = (options, prefix = '') => {
                if (!options || typeof options !== 'object') return null;

                const entries = Array.isArray(options)
                  ? options.map(v => [v, v])
                  : Object.entries(options);

                return entries.map(([key, value]) => {
                  const fullKey = prefix ? `${prefix}.${key}` : key;
                  const hasNested = typeof value === 'object' && !Array.isArray(value);

                  if (hasNested) {
                    return (
                      <div key={fullKey} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {key}
                        </label>
                        {renderFilterSelect(value, fullKey)}
                      </div>
                    );
                  }

                  return (
                    <div key={fullKey}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key}
                      </label>
                      <select
                        value={filters[fullKey] || ''}
                        onChange={(e) => handleFilterFieldChange(fullKey, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Semua</option>
                        {Array.isArray(value)
                          ? value.map(v => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))
                          : Object.entries(value).map(([k, v]) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                      </select>
                    </div>
                  );
                });
              };

              return <div key={field}>{renderFilterSelect({ [field]: fieldData })}</div>;
            })}
          </div>

          {/* Source Files */}
          {sourceFiles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source File
              </label>
              <select
                value={filters.source_file || ''}
                onChange={(e) => handleFilterFieldChange('source_file', e.target.value)}
                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua File</option>
                {sourceFiles.map(file => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SBMFilters;
