import api from "./api";
import { getFallbackKodeAnggaranOptions } from "../data/nominatifDummy.js";

const rkaService = {
  /**
   * Get all RKA details with search & filter
   */
  getRKADetails: async (params = {}) => {
    try {
      const response = await api.get("/rka-details", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching RKA details:", error);
      throw error;
    }
  },

  /**
   * Get available kategori list
   */
  getKategoriList: async () => {
    try {
      const response = await api.get("/rka-details/kategori");
      return response.data;
    } catch (error) {
      console.error("Error fetching kategori list:", error);
      throw error;
    }
  },

  /**
   * Get kode anggaran options for dropdown (filtered for perjalanan dinas)
   */
  getKodeAnggaranOptions: async () => {
    try {
      // Get all RKA details first
      const response = await api.get("/rka-details");

      // Tampilkan semua data tanpa filter - user bisa mencari sendiri
      const perjalananData = response.data;

      // Format untuk dropdown dengan format lengkap: LayananUmum.KodeLayanan1.KodeLayanan2.LayananTataUsaha.Kategori.CodeRKA
      return perjalananData.map((item) => {
        // Use camelCase fields from API response
        const kodeAnggaranFormat = `${item.layananUmum}.${item.kodeLayanan1}.${item.kodeLayanan2}.${item.layananTataUsaha}.${item.kategoriAnggaran}.${item.codeRka}`;
        return {
          id: item.id, // RKA Detail ID for API calls
          value: kodeAnggaranFormat, // Gunakan format lengkap sebagai value
          label: `${kodeAnggaranFormat} - ${item.layanan}`, // Tampilkan format + layanan
          kategori: item.kategoriAnggaran,
          layanan: item.layanan,
          wilayah: item.wilayah,
          artiKode: item.artiKode,
          status: item.status,
          anggaranLayanan: item.anggaranLayanan,
          anggaranAvailable: item.anggaranLayananAvailable,

          // Additional fields untuk backward compatibility dan search
          layananUmum: item.layananUmum,
          kodeLayanan1: item.kodeLayanan1,
          kodeLayanan2: item.kodeLayanan2,
          layananTataUsaha: item.layananTataUsaha,
          codeRka: item.codeRka,

          // Combined kode lengkap (sama dengan format utama)
          kodeLengkap: kodeAnggaranFormat,

          // Search terms
          searchTerms: [
            kodeAnggaranFormat,
            item.layanan,
            item.artiKode,
            item.wilayah,
            item.kategoriAnggaran,
            item.codeRka,
            `${item.layananUmum}.${item.kodeLayanan1}.${item.kodeLayanan2}`, // format pendek
            `${item.layananUmum}.${item.kodeLayanan1}.${item.kodeLayanan2}.${item.layananTataUsaha}`, // format medium
            kodeAnggaranFormat, // format lengkap
          ]
            .join(" ")
            .toLowerCase(),
        };
      });
    } catch (error) {
      console.warn("API failed, using fallback data:", error);
      // Return fallback data if API fails
      return getFallbackKodeAnggaranOptions();
    }
  },

  /**
   * Get RKA detail by ID
   */
  getRKADetailById: async (id) => {
    try {
      const response = await api.get(`/rka-details/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching RKA detail:", error);
      throw error;
    }
  },

  /**
   * Import Excel file
   */
  importExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append("excel_file", file);

      const response = await api.post("/rka-details/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error importing Excel file:", error);
      throw error;
    }
  },
};

export default rkaService;
