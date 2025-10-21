import axios from 'axios';
import { getFallbackKodeAnggaranOptions } from '../data/nominatifDummy.js';

const API_URL = 'http://localhost/api';

const rkaService = {
  /**
   * Get all RKA details with search & filter
   */
  getRKADetails: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/rka-details`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching RKA details:', error);
      throw error;
    }
  },

  /**
   * Get available kategori list
   */
  getKategoriList: async () => {
    try {
      const response = await axios.get(`${API_URL}/rka-details/kategori`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching kategori list:', error);
      throw error;
    }
  },

  /**
   * Get kode anggaran options for dropdown (filtered for perjalanan dinas)
   */
  getKodeAnggaranOptions: async () => {
    try {
      // Get all RKA details first
      const response = await axios.get(`${API_URL}/rka-details`);

      // Filter untuk data yang relevan dengan perjalanan dinas
      const perjalananData = response.data.filter(item =>
        item.layanan.toLowerCase().includes('perjalanan') ||
        item.layanan.toLowerCase().includes('dinas') ||
        item.artiKode.toLowerCase().includes('perjalanan') ||
        item.artiKode.toLowerCase().includes('dinas') ||
        item.artiKode.toLowerCase().includes('meeting') ||
        item.artiKode.toLowerCase().includes('transport') ||
        item.artiKode.toLowerCase().includes('penginapan') ||
        item.artiKode.toLowerCase().includes('uang harian')
      );

      // Format untuk dropdown dengan tambahan field untuk search
      return perjalananData.map(item => ({
        value: item.codeRka,
        label: `${item.codeRka} + ${item.artiKode}`,
        kategori: item.kategoriAnggaran,
        layanan: item.layanan,
        wilayah: item.wilayah,
        artiKode: item.artiKode, // Tambahkan untuk search
        status: item.status, // Tambahkan untuk filter tambahan
        codeRka: item.codeRka // Tambahkan untuk display
      }));
    } catch (error) {
      console.warn('API failed, using fallback data:', error);
      // Return fallback data if API fails
      return getFallbackKodeAnggaranOptions();
    }
  },

  /**
   * Import Excel file
   */
  importExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append('excel_file', file);

      const response = await axios.post(`${API_URL}/rka-details/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error importing Excel file:', error);
      throw error;
    }
  }
};

export default rkaService;