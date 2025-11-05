// Chart configuration and data helpers

/**
 * Get colors for charts
 */
export const CHART_COLORS = {
  primary: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
  pie: ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'],
  gradient: {
    blue: ['#3B82F6', '#1D4ED8'],
    orange: ['#F59E0B', '#D97706'],
    green: ['#10B981', '#059669'],
    purple: ['#8B5CF6', '#7C3AED']
  }
};

/**
 * Format data for pie chart
 */
export const formatPieData = (total, berjalan, sp2d, sisa) => {
  // Pastikan semua values numeric dan tidak null
  const numericTotal = parseFloat(total) || 0;
  const numericBerjalan = parseFloat(berjalan) || 0;
  const numericSp2d = parseFloat(sp2d) || 0;
  const numericSisa = parseFloat(sisa) || 0;

  // Hitung persentase berdasarkan total anggaran sebenarnya
  const calculatePercentage = (value) => {
    return numericTotal > 0 ? (value / numericTotal) * 100 : 0;
  };

  // Pie chart menampilkan komponen-komponen yang membentuk total anggaran
  const data = [
    {
      name: 'Anggaran Berjalan',
      value: numericBerjalan,
      color: CHART_COLORS.pie[1],
      percentage: calculatePercentage(numericBerjalan)
    },
    {
      name: 'Anggaran SP2D',
      value: numericSp2d,
      color: CHART_COLORS.pie[2],
      percentage: calculatePercentage(numericSp2d)
    },
    {
      name: 'Sisa Anggaran',
      value: numericSisa,
      color: CHART_COLORS.pie[3],
      percentage: calculatePercentage(numericSisa)
    }
  ];

  // Filter out items yang benar-benar tidak ada data-nya
  // Tapi keep items yang nilainya 0 untuk show completeness
  return data.filter(item => {
    // Hanya filter jika value benar-benar invalid (null, undefined, atau string kosong)
    return item.value !== null && item.value !== undefined && item.value !== '';
  });
};

/**
 * Format data for bar chart
 */
export const formatBarData = (categories) => {
  return categories.map(category => ({
    name: category.nama,
    anggaran: parseFloat(category.anggaran) || 0,
    berjalan: parseFloat(category.berjalan) || 0,
    sp2d: parseFloat(category.sp2d) || 0,
    sisa: parseFloat(category.sisa) || ((parseFloat(category.anggaran) || 0) - (parseFloat(category.berjalan) || 0)),
    fill: CHART_COLORS.primary[categories.indexOf(category) % CHART_COLORS.primary.length]
  }));
};


/**
 * Custom label for pie chart - moved to component
 */
export const getLabelProps = (cx, cy, midAngle, innerRadius, outerRadius, percent, data) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Gunakan persentase yang sudah dihitung dengan benar di data
  const displayText = data.percentage ? `${data.percentage.toFixed(0)}%` : '0%';

  return {
    x,
    y,
    fill: "white",
    textAnchor: x > cx ? 'start' : 'end',
    dominantBaseline: "central",
    className: "text-xs font-medium",
    children: displayText
  };
};

/**
 * Dummy data for development - Updated dengan data real 2025
 */
export const DUMMY_DATA = {
  tahun: 2025,
  totalAnggaran: 4012497127395, // 4.012.497.127.395
  anggaranTerpakai: 0, // 0 (belum ada realisasi)
  anggaranSP2D: 0,     // 0 (belum ada SP2D)
  sisaAnggaran: 4012497127395,    // 4.012.497.127.395
  kategori: [
    { nama: 'Kategori A', anggaran: 3432039625 },      // 3.432.039.625
    { nama: 'Kategori B', anggaran: 1786105495 },      // 1.786.105.495
    { nama: 'Kategori C', anggaran: 4007278982275 }    // 4.007.278.982.275
  ]
};

/**
 * Available years for selector
 */
export const AVAILABLE_YEARS = [2023, 2024, 2025, 2026];