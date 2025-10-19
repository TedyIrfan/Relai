import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, LogOut, User } from 'lucide-react';

const Header = ({ toggleSidebar, sidebarOpen, selectedYear, onYearChange, loading }) => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTahunDropdown, setShowTahunDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-lg rounded-xl mx-4 mt-4 border-b border-gray-200 relative">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Logo_Kementerian_Koordinator_Bidang_Infrastruktur_dan_Pembangunan_Kewilayahan_Republik_Indonesia_%282024%29.png/330px-Logo_Kementerian_Koordinator_Bidang_Infrastruktur_dan_Pembangunan_Kewilayahan_Republik_Indonesia_%282024%29.png"
                alt="Logo Kementerian"
                className="w-10 h-10 object-contain"
              />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">RelAI</h1>
                <p className="text-xs text-gray-500">Realisasi Keuangan</p>
              </div>
            </div>

            {/* Tahun Selector */}
            <div className="hidden md:block">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTahunDropdown(!showTahunDropdown);
                  }}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Tahun {selectedYear}</span>
                  <svg className={`w-4 h-4 transition-transform ${showTahunDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {showTahunDropdown && (
                  <>
                    <div
                      className="fixed inset-0"
                      style={{ zIndex: 65 }}
                      onClick={() => setShowTahunDropdown(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200" style={{ zIndex: 70 }}>
                      <div className="p-2">
                        {[2023, 2024, 2025, 2026].map((year) => (
                          <button
                            key={year}
                            onClick={(e) => {
                              e.stopPropagation();
                              onYearChange && onYearChange(year);
                              setShowTahunDropdown(false);
                            }}
                            disabled={loading}
                            className={`
                              w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                              ${selectedYear === year ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* User avatar dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserDropdown(!showUserDropdown);
                }}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.nama || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.jabatan || 'Eselon 1'}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {/* User dropdown */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0"
                    style={{ zIndex: 65 }}
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200" style={{ zIndex: 70 }}>
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.nama || 'User'}</p>
                          <p className="text-xs text-gray-500">{user?.jabatan || 'Eselon 1'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-600">
                        <p className="font-medium">Login Info</p>
                        <p className="text-xs text-gray-500">Login: {new Date().toLocaleString('id-ID')}</p>
                      </div>

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;