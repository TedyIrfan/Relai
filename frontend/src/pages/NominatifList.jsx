import React from 'react';
import Layout from '../components/layout/Layout';
import NominatifList from '../components/nominatif/NominatifList';

const NominatifListPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <NominatifList />
      </div>
    </Layout>
  );
};

export default NominatifListPage;