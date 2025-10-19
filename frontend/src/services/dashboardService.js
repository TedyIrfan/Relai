import axios from 'axios';

const API_URL = 'http://localhost/api';

const dashboardService = {
  /**
   * Get complete dashboard data
   */
  getDashboardData: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  /**
   * Get dashboard data by specific year
   */
  getDashboardDataByYear: async (year) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/${year}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data for year:', year, error);
      throw error;
    }
  },

  /**
   * Get KPI metrics only
   */
  getKPIData: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/kpi`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      throw error;
    }
  },

  /**
   * Get chart data only
   */
  getChartData: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/charts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }
};

export default dashboardService;