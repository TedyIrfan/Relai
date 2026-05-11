import api from './api';

const dashboardService = {
  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  getDashboardDataByYear: async (year) => {
    try {
      const response = await api.get(`/dashboard/${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data for year:', year, error);
      throw error;
    }
  },

  getKPIData: async () => {
    try {
      const response = await api.get('/dashboard/kpi');
      return response.data;
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      throw error;
    }
  },

  getChartData: async () => {
    try {
      const response = await api.get('/dashboard/charts');
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }
};

export default dashboardService;
