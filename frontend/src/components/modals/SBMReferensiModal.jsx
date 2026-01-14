import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Search,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import sbmService, { SBM_CATEGORIES } from "../../services/sbmService";
import SBMTable from "../sbm/SBMTable";

const SBMReferensiModal = ({ isOpen, onClose, fieldName, fieldLabel }) => {
  const [selectedCategory, setSelectedCategory] = useState("honorarium_28");
  const [categorySearch, setCategorySearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sbmData, setSbmData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [expandedSections, setExpandedSections] = useState(new Set(["all"]));

  // Cache untuk menyimpan data yang sudah di-fetch
  const dataCache = useRef(new Map());

  // Clear cache saat modal close
  useEffect(() => {
    if (!isOpen) {
      dataCache.current.clear();
    }
  }, [isOpen]);

  // Pop up Master SBM Di Nominatif

  // Fetch data dari Master SBM saat category berubah
  useEffect(() => {
    if (isOpen && selectedCategory) {
      fetchSbmData(selectedCategory);
    }
  }, [isOpen, selectedCategory]);

  const fetchSbmData = async (category) => {
    // Check cache dulu
    if (dataCache.current.has(category)) {
      const cached = dataCache.current.get(category);
      setSbmData(cached.data);
      setTableHeaders(cached.headers);
      return;
    }

    try {
      setLoading(true);
      const result = await sbmService.getAllByCategory(category);
      if (result.success && result.data && result.data.length > 0) {
        setSbmData(result.data);

        // Extract headers dari first item (same as SBMTable)
        const firstItem = result.data[0];
        const dataFields = firstItem.data || firstItem;
        const headers = Object.keys(dataFields).filter(
          (key) =>
            key !== "_detected_currency" &&
            key !== "_row_number" &&
            key !== "id" &&
            key !== "category" &&
            key !== "source_file" &&
            key !== "currency" &&
            key !== "sub_category" &&
            key !== "parent_section" &&
            key !== "grouping_label" &&
            key !== "no"
        );
        setTableHeaders(headers);

        // Simpan ke cache
        dataCache.current.set(category, { data: result.data, headers });
      } else {
        setSbmData([]);
        setTableHeaders([]);
      }
    } catch (error) {
      console.error("Error fetching SBM data:", error);
      setSbmData([]);
      setTableHeaders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter kategori berdasarkan search
  const filteredCategories = Object.entries(SBM_CATEGORIES).filter(
    ([key, value]) => {
      if (!categorySearch) return true;
      const searchLower = categorySearch.toLowerCase();
      return (
        value.label.toLowerCase().includes(searchLower) ||
        key.toLowerCase().includes(searchLower)
      );
    }
  );

  // Toggle section expand/collapse
  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  // Group data logic (same as SBMCategoryDetail)
  const getGroupedData = useMemo(() => {
    if (!sbmData.length) return [];

    // Check if category has grouping_label
    const hasGroupingLabel = [
      "honorarium_29",
      "honorarium_32",
      "honorarium_33",
    ].includes(selectedCategory);

    // Check if category has sub_category
    const hasSubCategory = selectedCategory === "honorarium_31";

    // Case 1: H29, H32, H33 - grouping_label
    if (hasGroupingLabel) {
      const groups = {};
      sbmData.forEach((item) => {
        const label = item.grouping_label || "Uncategorized";
        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
      });
      return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, items]) => ({
          title: label,
          data: items,
          count: items.length,
        }));
    }

    // Case 2: H31 - parent_section + sub_category
    if (hasSubCategory) {
      const groups = {};
      sbmData.forEach((item) => {
        const parent = item.parent_section || "Uncategorized";
        const sub = item.sub_category || "";
        const key = `${parent}|${sub}`;
        if (!groups[key]) {
          groups[key] = {
            title: sub ? `${parent} - ${sub}` : parent,
            items: [],
          };
        }
        groups[key].items.push(item);
      });
      return Object.values(groups)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((g) => ({
          title: g.title,
          data: g.items,
          count: g.items.length,
        }));
    }

    // Case 3: Multiple parent_sections
    const parentSections = [
      ...new Set(sbmData.map((item) => item.parent_section).filter(Boolean)),
    ];
    if (parentSections.length > 1) {
      return parentSections
        .sort((a, b) => a.localeCompare(b))
        .map((section) => ({
          title: section,
          data: sbmData.filter((item) => item.parent_section === section),
          count: sbmData.filter((item) => item.parent_section === section)
            .length,
        }));
    }

    // Case 4: Single section
    return [
      {
        title: SBM_CATEGORIES[selectedCategory]?.label || selectedCategory,
        data: sbmData,
        count: sbmData.length,
      },
    ];
  }, [sbmData, selectedCategory]);

  // Filter data by section
  const getFilteredDataBySection = (group) => {
    if (!searchTerm) return group.data;

    const searchClean = searchTerm.toLowerCase().replace(/\s+/g, "");

    return group.data.filter((item) => {
      const dataFields = item.data || item;
      return Object.values(dataFields).some((value) => {
        if (!value) return false;
        const valueClean = value.toString().toLowerCase().replace(/\s+/g, "");
        return valueClean.includes(searchClean);
      });
    });
  };

  const getMatchCount = (group) => {
    if (!searchTerm) return group.count;
    return getFilteredDataBySection(group).length;
  };

  if (!isOpen) return null;

  const selectedCategoryInfo = SBM_CATEGORIES[selectedCategory];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-2">
      {/* Modal Content - No Backdrop */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                REFERENSI MASTER SBM
              </h2>
              <p className="text-sm text-gray-500">
                Cari referensi dari Master SBM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {/* Dropdown Pilih File */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih File:
            </label>
            <div className="relative">
              {/* Combobox Input */}
              <div
                className="flex items-center w-full h-12 px-4 pr-12 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-white"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  placeholder={
                    isDropdownOpen
                      ? "Cari file..."
                      : selectedCategoryInfo?.label ||
                        "Pilih file Master SBM..."
                  }
                  className="flex-1 outline-none text-gray-900 placeholder-gray-600"
                  onClick={(e) => e.stopPropagation()}
                />
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 max-h-64 overflow-auto bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                  {filteredCategories.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      Tidak ada file yang cocok
                    </div>
                  ) : (
                    filteredCategories.map(([key, value]) => (
                      <div
                        key={key}
                        onClick={() => {
                          setSelectedCategory(key);
                          setCategorySearch("");
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          selectedCategory === key
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {value.label}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cari:
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari data..."
                className="w-full h-12 pl-12 pr-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>
          </div>

          {/* Results */}
          <div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                  Memuat data...
                </div>
              </div>
            ) : getGroupedData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Tidak ada data
              </div>
            ) : (
              <div className="space-y-4">
                {getGroupedData.map((group, index) => {
                  const sectionKey = `section-${index}`;
                  const filteredData = getFilteredDataBySection(group);
                  const matchCount = getMatchCount(group);
                  const hasMatches = !searchTerm || matchCount > 0;
                  const isExpanded =
                    expandedSections.has("all") ||
                    expandedSections.has(sectionKey);

                  // Hide sections without matches during search
                  if (searchTerm && !hasMatches) {
                    return null;
                  }

                  return (
                    <div
                      key={sectionKey}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      {/* Section Header - Clickable to Expand/Collapse */}
                      <button
                        onClick={() => toggleSection(sectionKey)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-gray-900 text-sm">
                            {group.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {searchTerm
                            ? `${matchCount} match`
                            : `${group.count} data`}
                        </span>
                      </button>

                      {/* Table Content - Only show when expanded */}
                      {isExpanded && (
                        <SBMTable
                          data={{
                            data: filteredData,
                            meta: {
                              total: matchCount,
                              current_page: 1,
                              last_page: 1,
                              per_page: matchCount,
                            },
                          }}
                          loading={false}
                          sort={{ field: "id", order: "asc" }}
                          onSort={null}
                          onPageChange={null}
                          onPerPageChange={null}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default SBMReferensiModal;
