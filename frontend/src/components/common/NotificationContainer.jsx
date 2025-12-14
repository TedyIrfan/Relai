import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import Notification from './Notification';

const NotificationContainer = () => {
  let notifications = [];
  let close = () => {};

  try {
    const hookData = useNotification();
    notifications = hookData.notifications || [];
    close = hookData.close || (() => {});
  } catch (error) {
    console.warn('NotificationContainer: useNotification hook error', error);
    return null;
  }

  const getContainerStyle = () => ({
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'none'
  });

  const getNotificationWrapperStyle = () => ({
    pointerEvents: 'auto'
  });

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  return (
    <div style={getContainerStyle()}>
      {notifications.map((notification) => {
        if (!notification || !notification.id) return null;

        return (
          <div
            key={notification.id}
            style={getNotificationWrapperStyle()}
          >
            <Notification
              {...notification}
              onClose={() => {
                if (notification.onClose && typeof notification.onClose === 'function') {
                  notification.onClose();
                }
                if (typeof close === 'function') {
                  close(notification.id);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default NotificationContainer;