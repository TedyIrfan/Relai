import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sbmService, { SBM_CATEGORIES } from '../../services/sbmService';

const SBMFolderList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState('Honorarium');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await sbmService.getCategories();
      if (result.success) {
        setCategories(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (group) => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  const handleCategoryClick = (category) => {
    navigate(`/master-sbm/${category}`);
  };

  // Group categories
  const groupedCategories = categories.reduce((acc, cat) => {
    const categoryInfo = SBM_CATEGORIES[cat.category] || { group: 'Other', order: 999 };
    const group = categoryInfo.group;

    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({ ...cat, ...categoryInfo });
    return acc;
  }, {});

  // Sort categories within each group
  Object.keys(groupedCategories).forEach(group => {
    groupedCategories[group].sort((a, b) => a.order - b.order);
  });

  // Filter by search
  const filteredGroups = Object.entries(groupedCategories).reduce((acc, [group, cats]) => {
    const filtered = cats.filter(cat =>
      cat.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {});

  const groupOrder = ['Honorarium', 'Section'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Master SBM</h2>
            <p className="text-gray-600 mt-1">Standar Biaya Masukan - Pilih SBM untuk melihat detail</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-blue-700 font-medium">{categories.length} File SBM</span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-4">
        {groupOrder.map(group => {
          const groupCategories = filteredGroups[group] || [];
          if (groupCategories.length === 0) return null;

          const isExpanded = expandedGroup === group;

          return (
            <div key={group} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-800">
                    {group}
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                    {groupCategories.length} {group === 'Honorarium' ? 'Honorarium' : 'Section'}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Group Content */}
              {isExpanded && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupCategories.map(cat => (
                    <button
                      key={cat.category}
                      onClick={() => handleCategoryClick(cat.category)}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 truncate">
                          {cat.label || cat.category}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {cat.total_records || 0} data
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(filteredGroups).length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          Tidak ada kategori yang cocok dengan "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default SBMFolderList;
