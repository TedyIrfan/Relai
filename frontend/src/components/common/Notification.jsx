import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Notification = ({
  type = 'success',
  message,
  duration = 5000,
  onClose,
  showIcon = true,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto close after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const getNotificationStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 9999,
      minWidth: '320px',
      maxWidth: '400px',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 10px rgba(0, 0, 0, 0.05)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    };

    // Position styles
    const positions = {
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' },
    };

    // Type styles
    const typeStyles = {
      success: {
        backgroundColor: 'rgba(34, 197, 94, 0.95)',
        borderColor: 'rgba(22, 163, 74, 1)',
        color: 'white',
      },
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        borderColor: 'rgba(220, 38, 38, 1)',
        color: 'white',
      },
      warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.95)',
        borderColor: 'rgba(217, 119, 6, 1)',
        color: 'white',
      },
      info: {
        backgroundColor: 'rgba(59, 130, 246, 0.95)',
        borderColor: 'rgba(37, 99, 235, 1)',
        color: 'white',
      },
    };

    const animationStyles = {
      transform: isExiting
        ? 'translateX(100%) scale(0.95)'
        : isVisible
          ? 'translateX(0) scale(1)'
          : 'translateX(100%) scale(0.95)',
      opacity: isExiting ? 0 : 1,
    };

    return {
      ...baseStyles,
      ...positions[position],
      ...typeStyles[type],
      ...animationStyles,
    };
  };

  const getIcon = () => {
    const iconSize = 20;
    const icons = {
      success: <CheckCircle size={iconSize} />,
      error: <XCircle size={iconSize} />,
      warning: <AlertCircle size={iconSize} />,
      info: <Info size={iconSize} />,
    };
    return icons[type] || icons.info;
  };

  const getProgressStyles = () => {
    return {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '3px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '0 0 0 12px',
      transition: `width ${duration}ms linear`,
      width: isVisible && !isExiting ? '100%' : '0%',
    };
  };

  return (
    <div style={getNotificationStyles()}>
      {/* Icon */}
      {showIcon && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {getIcon()}
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: 1,
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.5'
      }}>
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = 'rgba(255, 255, 255, 0.8)';
        }}
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      {duration > 0 && (
        <div style={getProgressStyles()} />
      )}
    </div>
  );
};

export default Notification;