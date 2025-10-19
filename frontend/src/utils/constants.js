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
  masterRja: '/master-rja',
  nominatif: '/nominatif'
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
    id: 'master-rja',
    name: 'Master RJA',
    icon: 'FileStack',
    route: ROUTES.masterRja,
    active: true
  },
  {
    id: 'nominatif',
    name: 'Nominatif',
    icon: 'Users',
    route: ROUTES.nominatif,
    active: true
  }
];

export const KPI_TYPES = {
  total: 'total',
  terpakai: 'terpakai',
  sp2d: 'sp2d',
  sisa: 'sisa'
};

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};