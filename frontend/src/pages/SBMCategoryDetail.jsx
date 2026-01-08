import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Database, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import sbmService, { SBM_CATEGORIES } from '../services/sbmService';
import SBMTable from '../components/sbm/SBMTable';

const SBMCategoryDetail = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['all']));

  const categoryInfo = SBM_CATEGORIES[category] || { label: category, group: 'Other' };

  // Categories with grouping labels (H29, H32, H33)
  const hasGroupingLabel = ['honorarium_29', 'honorarium_32', 'honorarium_33'].includes(category);

  // Category with sub categories (H31)
  const hasSubCategory = category === 'honorarium_31';

  useEffect(() => {
    if (category) {
      fetchAllData();
    }
  }, [category]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Use getAllByCategory to fetch ALL data without pagination limit
      const result = await sbmService.getAllByCategory(category);
      if (result.success) {
        setAllData(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allKeys = getGroupedData().map((_, index) => `section-${index}`);
    setExpandedSections(new Set(['all', ...allKeys]));
  };

  const collapseAll = () => {
    setExpandedSections(new Set(['all']));
  };

  // Group data logic for all categories
  const getGroupedData = useMemo(() => {
    if (!allData.length) return [];

    // Case 1: H29, H32, H33 - grouping_label
    if (hasGroupingLabel) {
      const groups = {};
      allData.forEach(item => {
        const label = item.grouping_label || 'Uncategorized';
        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
      });
      return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, items]) => ({
          title: label,
          data: items,
          count: items.length
        }));
    }

    // Case 2: H31 - parent_section + sub_category
    if (hasSubCategory) {
      const groups = {};
      allData.forEach(item => {
        const parent = item.parent_section || 'Uncategorized';
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
    const parentSections = [...new Set(allData.map(item => item.parent_section).filter(Boolean))];
    if (parentSections.length > 1) {
      return parentSections
        .sort((a, b) => a.localeCompare(b))
        .map(section => ({
          title: section,
          data: allData.filter(item => item.parent_section === section),
          count: allData.filter(item => item.parent_section === section).length
        }));
    }

    // Case 4: Single section
    return [{
      title: categoryInfo.label,
      data: allData,
      count: allData.length
    }];
  }, [allData, hasGroupingLabel, hasSubCategory, categoryInfo]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/master-sbm')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Master SBM</h1>
            <p className="text-gray-600 mt-2">Standar Biaya Masukan - {categoryInfo.label}</p>
          </div>
        </div>
      </div>

      {/* Section Header with Expand/Collapse All */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{categoryInfo.label}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Kategori: <span className="font-medium text-blue-600">{categoryInfo.group}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm">{allData.length} Data</span>
            </div>

            {getGroupedData.length > 1 && (
              <>
                <button
                  onClick={expandAll}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Collapse All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
            Memuat data...
          </div>
        </div>
      )}

      {/* Vertical Tables Layout */}
      {!loading && getGroupedData.length > 0 && (
        <div className="space-y-6">
          {getGroupedData.map((group, index) => {
            const sectionKey = `section-${index}`;
            const isExpanded = expandedSections.has('all') || expandedSections.has(sectionKey);

            return (
              <div key={sectionKey} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Section Header - Clickable to Expand/Collapse */}
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{group.title}</h3>
                      <p className="text-sm text-gray-500">{group.count} Data</p>
                    </div>
                  </div>
                </button>

                {/* Table Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <SBMTable
                      data={{
                        data: group.data,
                        meta: {
                          total: group.count,
                          current_page: 1,
                          last_page: 1,
                          per_page: group.count
                        }
                      }}
                      loading={false}
                      sort={{ field: 'id', order: 'asc' }}
                      onSort={null}
                      onPageChange={null}
                      onPerPageChange={null}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && getGroupedData.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Tidak ada data
        </div>
      )}
    </div>
  );
};

export default SBMCategoryDetail;
