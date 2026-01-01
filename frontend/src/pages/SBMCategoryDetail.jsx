import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import sbmService, { SBM_CATEGORIES } from '../services/sbmService';
import SBMTable from '../components/sbm/SBMTable';

const SBMCategoryDetail = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Sort state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [sort, setSort] = useState({ field: 'id', order: 'asc' });

  const categoryInfo = SBM_CATEGORIES[category] || { label: category, group: 'Other' };

  useEffect(() => {
    if (category) {
      fetchData();
    }
  }, [category, currentPage, perPage, sort]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: sort.field,
        order: sort.order,
      };

      const result = await sbmService.getByCategory(category, params);
      if (result.success) {
        setData(result);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (size) => {
    setPerPage(size);
    setCurrentPage(1);
  };

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

      {/* Section Header */}
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

          {/* Data Status */}
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm">{data.meta?.total || 0} Data</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      <SBMTable
        data={data}
        loading={loading}
        sort={sort}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  );
};

export default SBMCategoryDetail;
