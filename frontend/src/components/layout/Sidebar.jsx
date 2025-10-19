import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { MENU_ITEMS } from '../../utils/constants';

const Sidebar = ({ isOpen, isMobile, onToggle }) => {
  const location = useLocation();

  const isActive = (route) => {
    return location.pathname === route;
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-300 ${isOpen ? 'w-56' : 'w-16'}`}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          {/* Hamburger icon */}
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
          >
            {isOpen ? <Icons.X className="h-5 w-5" /> : <Icons.Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {MENU_ITEMS.map((item) => {
          const active = isActive(item.route);
          const enabled = item.active;

          return (
            <Link
              key={item.id}
              to={enabled ? item.route : '#'}
              onClick={(e) => !enabled && e.preventDefault()}
              className={`
                flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                ${enabled
                  ? active
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-gray-400 cursor-not-allowed bg-gray-50'
                }
              `}
              title={!isOpen ? item.name : ''}
            >
              {React.createElement(Icons[item.icon] || Icons.Circle, {
                className: `text-lg flex-shrink-0 ${isOpen ? 'w-5 h-5' : 'w-5 h-5'}`
              })}
              {isOpen && (
                <span className="transition-opacity duration-300">{item.name}</span>
              )}
              {isOpen && !enabled && (
                <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded">
                  Coming Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-gray-200">
        {isOpen ? (
          <div className="text-center text-xs text-gray-500">
            <p>© 2025 RelAI</p>
            <p>Kementerian Koordinator</p>
            <p className="mt-2">Version 1.0.0</p>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-400">
            <p>RelAI</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;