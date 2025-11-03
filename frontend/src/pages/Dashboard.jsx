import React, { useState, useEffect } from 'react';
import KPICard from '../components/dashboard/KPICard';
import PieChart from '../components/dashboard/PieChart';
import BarChart from '../components/dashboard/BarChart';
import { KPI_TYPES } from '../utils/constants';
import dashboardService from '../services/dashboardService';

const Dashboard = ({ selectedYear: propSelectedYear, onYearChange: propOnYearChange, loading: propLoading }) => {
  const [selectedYear, setSelectedYear] = useState(propSelectedYear || 2025);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    tahun: selectedYear,
    totalAnggaran: 0,
    anggaranBerjalan: 0,
    anggaranSP2D: 0,
    sisaAnggaran: 0,
    kategori: []
  });

  // Sync dengan props dari Layout
  useEffect(() => {
    if (propSelectedYear !== selectedYear) {
      setSelectedYear(propSelectedYear);
      handleYearChange(propSelectedYear);
    }
  }, [propSelectedYear]);

  // Sync loading state
  useEffect(() => {
    setLoading(propLoading || false);
  }, [propLoading]);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      setDashboardData(response.data);
      setSelectedYear(response.data.tahun);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set fallback data (2 MILIAR!)
      setDashboardData({
        tahun: 2025,
        totalAnggaran: 2000000000,
        anggaranBerjalan: 500000000,
        anggaranSP2D: 300000000,
        sisaAnggaran: 1200000000,
        kategori: [
          { nama: 'Kategori A', anggaran: 700000000 },
          { nama: 'Kategori B', anggaran: 650000000 },
          { nama: 'Kategori C', anggaran: 650000000 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle year change - call API for specific year
  const handleYearChange = async (year) => {
    setLoading(true);
    setSelectedYear(year);

    try {
      // Call API for specific year data
      const response = await dashboardService.getDashboardDataByYear(year);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data for year:', year, error);
      // Fallback to simulated data
      const fallbackData = {
        tahun: year,
        totalAnggaran: year === 2025 ? 2000000000 : year === 2024 ? 1800000000 : year === 2023 ? 1500000000 : 2200000000,
        anggaranBerjalan: year === 2025 ? 500000000 : year === 2024 ? 720000000 : year === 2023 ? 900000000 : 0,
        anggaranSP2D: year === 2025 ? 300000000 : year === 2024 ? 540000000 : year === 2023 ? 750000000 : 0,
        sisaAnggaran: year === 2025 ? 1500000000 : year === 2024 ? 1080000000 : year === 2023 ? 600000000 : 2200000000,
        kategori: [
          { nama: 'Kategori A', anggaran: 700000000 },
          { nama: 'Kategori B', anggaran: 650000000 },
          { nama: 'Kategori C', anggaran: 650000000 }
        ]
      };
      setDashboardData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Calculate derived values with fallbacks
  const {
    totalAnggaran = 0,
    anggaranBerjalan = 0,
    anggaranSP2D = 0,
    sisaAnggaran = 0,
    kategori = []
  } = dashboardData;

  useEffect(() => {
    // Initial load from API
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Sistem Realisasi Keuangan Kementerian Koordinator</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard
          type={KPI_TYPES.total}
          title="Total Anggaran"
          value={totalAnggaran}
          showProgress={false}
          loading={loading}
        />

        <KPICard
          type={KPI_TYPES.berjalan}
          title="Anggaran Berjalan"
          value={anggaranBerjalan}
          total={totalAnggaran}
          loading={loading}
        />

        <KPICard
          type={KPI_TYPES.sp2d}
          title="Anggaran SP2D"
          value={anggaranSP2D}
          total={totalAnggaran}
          loading={loading}
        />

        <KPICard
          type={KPI_TYPES.sisa}
          title="Sisa Anggaran"
          value={sisaAnggaran}
          total={totalAnggaran}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart
          total={totalAnggaran}
          berjalan={anggaranBerjalan}
          sp2d={anggaranSP2D}
          sisa={sisaAnggaran}
          loading={loading}
        />

        <BarChart
          categories={kategori}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;