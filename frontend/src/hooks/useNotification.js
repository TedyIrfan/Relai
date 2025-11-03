import { useState, useCallback, useRef } from 'react';

let notificationId = 0;

const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const notificationRefs = useRef({});

  const showNotification = useCallback((options) => {
    const id = ++notificationId;
    const notification = {
      id,
      ...options,
      timestamp: Date.now()
    };

    // Add to state
    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, options.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return showNotification({
      type: 'success',
      message,
      duration: 5000,
      ...options
    });
  }, [showNotification]);

  const error = useCallback((message, options = {}) => {
    return showNotification({
      type: 'error',
      message,
      duration: 8000,
      ...options
    });
  }, [showNotification]);

  const warning = useCallback((message, options = {}) => {
    return showNotification({
      type: 'warning',
      message,
      duration: 6000,
      ...options
    });
  }, [showNotification]);

  const info = useCallback((message, options = {}) => {
    return showNotification({
      type: 'info',
      message,
      duration: 5000,
      ...options
    });
  }, [showNotification]);

  const close = useCallback((id) => {
    removeNotification(id);
  }, [removeNotification]);

  const closeAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    success,
    error,
    warning,
    info,
    close,
    closeAll
  };
};

export default useNotification;