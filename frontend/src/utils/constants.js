// Application constants

export const APP_CONFIG = {
  name: 'RelAI',
  version: '1.0.0',
  description: 'Sistem Realisasi Keuangan'
};

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  masterSbm: '/master-sbm',
  masterRka: '/master-rka',
  nominatif: '/nominatif',
  nonNominatif: '/non-nominatif'
};

export const MENU_ITEMS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    route: ROUTES.dashboard,
    active: true
  },
  {
    id: 'master-sbm',
    name: 'Master SBM',
    icon: 'Database',
    route: ROUTES.masterSbm,
    active: true
  },
  {
    id: 'master-rka',
    name: 'Master RKA',
    icon: 'FileStack',
    route: ROUTES.masterRka,
    active: true
  },
  {
    id: 'nominatif',
    name: 'Nominatif',
    icon: 'Users',
    route: ROUTES.nominatif,
    active: true
  },
  {
    id: 'non-nominatif',
    name: 'Non Nominatif',
    icon: 'FileText',
    route: ROUTES.nonNominatif,
    active: true
  }
];

export const KPI_TYPES = {
  total: 'total',
  berjalan: 'berjalan',
  sp2d: 'sp2d',
  sisa: 'sisa'
};

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};