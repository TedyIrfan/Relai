import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Success Message Component
 * Displays success feedback after save/submit operations
 */
const SuccessMessage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');

  useEffect(() => {
    // Check for success message in location state
    if (location.state?.success) {
      setMessage(location.state.message || 'Operation completed successfully!');
      setType(location.state.type || 'success');
      setVisible(true);

      // Store in sessionStorage as backup
      if (location.state.message) {
        sessionStorage.setItem('nominatifSuccessMessage', location.state.message);
        sessionStorage.setItem('nominatifSuccessType', location.state.type || 'success');
      }

      // Clear location state to prevent re-showing on refresh
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      // Check sessionStorage for backup message
      const storedMessage = sessionStorage.getItem('nominatifSuccessMessage');
      const storedType = sessionStorage.getItem('nominatifSuccessType');

      if (storedMessage) {
        setMessage(storedMessage);
        setType(storedType || 'success');
        setVisible(true);

        // Clear from sessionStorage
        sessionStorage.removeItem('nominatifSuccessMessage');
        sessionStorage.removeItem('nominatifSuccessType');
      }
    }
  }, [location.state, location.pathname, navigate]);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'submitted':
        return {
          icon: '🎯',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'draft':
        return {
          icon: '📝',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          icon: '✅',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
    }
  };

  const { icon, bgColor, borderColor, textColor, iconColor } = getIconAndColor();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-pulse">
      <div className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4 ${textColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${iconColor}`}>{icon}</span>
            <div>
              <div className="font-semibold">
                {type === 'submitted' ? 'Successfully Submitted!' :
                 type === 'draft' ? 'Draft Saved!' : 'Operation Successful!'}
              </div>
              <div className="text-sm opacity-90">{message}</div>

              {/* Additional info from location state */}
              {location.state?.savedRows && (
                <div className="text-xs opacity-75 mt-1">
                  {location.state.savedRows} rows processed
                  {location.state.timestamp && (
                    <span> at {new Date(location.state.timestamp).toLocaleTimeString()}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className={`ml-4 ${textColor} hover:opacity-70 transition-opacity`}
            title="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-green-500 h-1 rounded-full transition-all duration-5000 ease-linear"
            style={{
              width: '100%',
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SuccessMessage;