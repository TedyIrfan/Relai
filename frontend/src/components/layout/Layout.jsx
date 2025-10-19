import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Function untuk handle year change dari Header
  const handleYearChange = async (year) => {
    console.log('Year changed:', year);
    setSelectedYear(year);
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Error loading year data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - kiri */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-16'}
        bg-white shadow-lg transition-all duration-300 ease-in-out
        flex-shrink-0 rounded-xl m-4
      `}>
        <Sidebar
          isOpen={sidebarOpen}
          isMobile={false}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main content - kanan */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            loading={loading}
          />
        </div>

        {/* Dashboard content */}
        <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
          <div className="max-w-full mx-auto">
            {React.cloneElement(children, {
              selectedYear: selectedYear,
              onYearChange: handleYearChange,
              loading: loading
            })}
          </div>
        </main>
      </div>

      </div>
  );
};

export default Layout;