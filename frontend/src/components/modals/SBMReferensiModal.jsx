import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, FileText, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import sbmService from '../../services/sbmService';
import SBMTable from '../sbm/SBMTable';

const SBMReferensiModal = ({ isOpen, onClose, fieldName, fieldLabel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const abortControllerRef = useRef(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      setLoading(false);
      setError(null);
      setExpandedSections(new Set());
    }
  }, [isOpen]);

  // Perform search
  const performSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setResults([]);
      return;
    }

    // Abort previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await sbmService.searchMasterSBM(term);

      if (response.success) {
        // DEBUG: Log search results for verification
        console.log('🔍 Search Results:', {
          term: term,
          categories: response.data?.length || 0,
          totalRecords: response.data?.reduce((sum, r) => sum + (r.filteredCount || 0), 0) || 0
        });

        setResults(response.data || []);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mencari data';
        setError(errorMsg);
        console.error('Search error:', err);
        console.error('Error response:', err.response?.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen || !searchTerm) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      performSearch(searchTerm);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isOpen, performSearch]);

  // Toggle section expand/collapse
  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  }, []);

  // Get grouped data (same logic as Master SBM)
  const getGroupedData = useCallback((categoryData, categoryKey) => {
    if (!categoryData || categoryData.length === 0) return [];

    // Hardcode grouping type per category (same as Master SBM page)
    const hasGroupingLabel = ['honorarium_29', 'honorarium_32', 'honorarium_33'].includes(categoryKey);
    const hasSubCategory = categoryKey === 'honorarium_31';

    // Case 1: grouping_label (H29, H32, H33)
    if (hasGroupingLabel) {
      const groups = {};
      categoryData.forEach(item => {
        const label = item.grouping_label;
        if (label) {
          if (!groups[label]) groups[label] = [];
          groups[label].push(item);
        }
      });
      return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, items]) => ({
          title: label,
          data: items,
          count: items.length
        }));
    }

    // Case 2: parent_section + sub_category (H31)
    if (hasSubCategory) {
      const groups = {};
      categoryData.forEach(item => {
        const parent = item.parent_section || '';
        const sub = item.sub_category || '';
        const key = `${parent}|${sub}`;
        if (!groups[key]) {
          groups[key] = {
            title: sub ? `${parent} - ${sub}` : parent,
            items: []
          };
        }
        groups[key].items.push(item);
      });
      return Object.values(groups)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(g => ({
          title: g.title,
          data: g.items,
          count: g.items.length
        }));
    }

    // Case 3: Multiple parent_sections
    const parentSections = [...new Set(categoryData.map(item => item.parent_section).filter(Boolean))];
    if (parentSections.length > 1) {
      return parentSections
        .sort((a, b) => a.localeCompare(b))
        .map(section => ({
          title: section,
          data: categoryData.filter(item => item.parent_section === section),
          count: categoryData.filter(item => item.parent_section === section).length
        }));
    }

    // Case 4: Single section - no title (direct table)
    return [{
      title: '',
      data: categoryData,
      count: categoryData.length
    }];
  }, []);

  // Calculate totals - use filteredCount from backend
  const totalResults = results.reduce((sum, r) => sum + (r.filteredCount || 0), 0);
  const totalCategories = results.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-2 z-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">REFERENSI MASTER SBM</h2>
                <p className="text-xs text-gray-500 mt-0.5">Cari referensi dari MASTER SBM</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari data Master SBM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Status */}
          <div className="mt-3">
            {!searchTerm || searchTerm.length < 2 ? (
              <p className="text-sm text-gray-500">
                Mulai ketik untuk mencari data Master SBM
              </p>
            ) : loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sedang mencari di Master SBM...
              </div>
            ) : error ? (
              <p className="text-sm text-red-600">⚠️ {error}</p>
            ) : totalResults > 0 ? (
              <p className="text-sm text-green-600">
                ✓ Ditemukan <strong>{totalResults}</strong> data dari <strong>{totalCategories}</strong> SBM
              </p>
            ) : (
              <p className="text-sm text-orange-600">⚠️ Tidak ada data yang cocok</p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!searchTerm || searchTerm.length < 2 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Cari Data Master SBM</p>
              <p className="text-sm">Ketik untuk memulai pencarian</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
              <p>Sedang mencari...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Tidak ada data yang cocok</p>
              <p className="text-sm mt-2">Coba kata kunci lain</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((result, idx) => {
                const uiKey = `category-${idx}`;
                // Auto-expand categories by default
                const isExpanded = !expandedSections.has(uiKey);

                // Use grouping from backend
                const grouping = result.grouping || [];

                // Filter sections - show all sections with data (ignore match_count bug)
                const visibleSections = grouping.filter(g => g.total_count > 0);

                return (
                  <div key={uiKey} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleSection(uiKey)}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 text-sm">{result.categoryName}</h3>
                          <p className="text-xs text-gray-500">{result.group}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {result.filteredCount}/{result.totalCount} data
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Sections - using backend grouping */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        {visibleSections.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            Tidak ada data yang cocok dalam SBM ini
                          </div>
                        ) : (
                          visibleSections.map((section, sectionIdx) => {
                            const sectionKey = `section-${idx}-${sectionIdx}`;
                            // Sections default to expanded (can be collapsed by user)
                            const sectionExpanded = !expandedSections.has(sectionKey);

                            // Filter data for this section
                            const sectionData = result.data.filter(item => {
                              // "all" key - show all data
                              if (section.key === 'all') {
                                return true;
                              }

                              // parent|sub format (H31)
                              if (section.key.includes('|')) {
                                const [parent, sub] = section.key.split('|', 2);
                                const itemParent = item.parent_section || '';
                                const itemSub = item.sub_category || '';
                                return itemParent === parent && itemSub === sub;
                              }

                              // grouping_label (H29, H32, H33)
                              if (item.grouping_label === section.key) {
                                return true;
                              }

                              // parent_section (H28, H30, etc)
                              if (item.parent_section === section.key) {
                                return true;
                              }

                              return false;
                            });

                            return (
                              <div key={sectionKey}>
                                {/* Section Header */}
                                <button
                                  onClick={() => toggleSection(sectionKey)}
                                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                                >
                                  {sectionExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                  <span className="text-sm font-medium text-gray-700">{section.label}</span>
                                  <span className="text-xs text-green-600">
                                    ✓ {section.match_count}/{section.total_count} data
                                  </span>
                                </button>

                                {/* Section Data */}
                                {sectionExpanded && (
                                  <div className="p-4">
                                    {sectionData.length === 0 ? (
                                      <div className="text-center text-gray-500 text-sm">
                                        ⚠️ Data tidak ditemukan (filter issue)
                                      </div>
                                    ) : (
                                      <SBMTable
                                        data={{
                                          data: sectionData,
                                          meta: {
                                            total: section.match_count,
                                            current_page: 1,
                                            last_page: 1,
                                            per_page: section.match_count
                                          }
                                        }}
                                        loading={false}
                                        sort={{ field: 'id', order: 'asc' }}
                                        onSort={null}
                                        onPageChange={null}
                                        onPerPageChange={null}
                                        enableRowExpand={false}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default SBMReferensiModal;
