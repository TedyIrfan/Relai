import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Database } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const SBMTable = ({ data, loading, sort, onSort, onPageChange, onPerPageChange }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const items = data.data || [];
  const meta = data.meta || {};

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getTableHeaders = () => {
    if (items.length === 0) return [];

    const firstItem = items[0];
    const dataFields = firstItem.data || firstItem;

    return Object.keys(dataFields).filter(key =>
      key !== '_detected_currency' && key !== '_row_number' &&
      key !== 'id' && key !== 'category' && key !== 'source_file' && key !== 'currency' &&
      key !== 'sub_category' && key !== 'parent_section' && key !== 'grouping_label' &&
      key !== 'no'
    );
  };

  const renderCellValue = (value, itemCurrency = 'IDR') => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">-</span>;
    }

    if (typeof value === 'number') {
      return formatCurrency(value, itemCurrency);
    }

    if (typeof value === 'string' && /^[\d.,]+$/.test(value.trim())) {
      const numValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numValue)) {
        return formatCurrency(numValue, itemCurrency);
      }
    }

    return <span className="text-gray-700">{value}</span>;
  };

  const getSortIcon = (field) => {
    if (sort.field !== field) return null;
    return sort.order === 'asc' ? '↑' : '↓';
  };

  const headers = getTableHeaders();

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Data SBM</h3>
            <p className="text-xs text-gray-500">Standar Biaya Masukan</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4 px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
        <span>Total: <strong>{meta.total || 0}</strong> data</span>
        <span>•</span>
        <span>Halaman: <strong>{meta.current_page || 1}</strong> dari <strong>{meta.last_page || 1}</strong></span>
        <span>•</span>
        <span>Per halaman: <strong>{meta.per_page || 15}</strong></span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center text-gray-500">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
            Memuat data...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Tidak ada data
        </div>
      )}

      {/* Table */}
      {!loading && items.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-16">No</th>
                  {headers.map(header => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => onSort && onSort(header)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{header.replace(/_/g, ' ')}</span>
                        <span className="text-gray-400">{getSortIcon(header)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => {
                  const dataFields = item.data || item;
                  const itemId = item.id;

                  return (
                    <React.Fragment key={itemId}>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRow(itemId)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            {expandedRow === itemId ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {(meta.current_page - 1) * meta.per_page + index + 1}
                        </td>
                        {headers.map(header => (
                          <td key={header} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {renderCellValue(dataFields[header], item.currency || 'IDR')}
                          </td>
                        ))}
                      </tr>
                      {expandedRow === itemId && (
                        <tr>
                          <td colSpan={headers.length + 2} className="px-4 py-4 bg-gray-50">
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div><span className="font-medium text-gray-700">ID:</span> {itemId}</div>
                                <div><span className="font-medium text-gray-700">Category:</span> {item.category}</div>
                                {item.sub_category && (
                                  <div><span className="font-medium text-gray-700">Sub Category:</span> {item.sub_category}</div>
                                )}
                                {item.parent_section && (
                                  <div><span className="font-medium text-gray-700">Parent Section:</span> {item.parent_section}</div>
                                )}
                                <div><span className="font-medium text-gray-700">Currency:</span> {item.currency || 'IDR'}</div>
                                <div className="col-span-2"><span className="font-medium text-gray-700">Source:</span> {item.source_file}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page && meta.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show:</span>
                <select
                  value={meta.per_page || 15}
                  onChange={(e) => onPerPageChange && onPerPageChange(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span>per page</span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange && onPageChange(1)}
                  disabled={meta.current_page === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onPageChange && onPageChange(meta.current_page - 1)}
                  disabled={meta.current_page === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 text-sm text-gray-600">
                  {meta.current_page} / {meta.last_page}
                </span>

                <button
                  onClick={() => onPageChange && onPageChange(meta.current_page + 1)}
                  disabled={meta.current_page === meta.last_page}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onPageChange && onPageChange(meta.last_page)}
                  disabled={meta.current_page === meta.last_page}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SBMTable;
