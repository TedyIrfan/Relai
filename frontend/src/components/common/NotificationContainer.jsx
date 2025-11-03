import React from 'react';
import Notification from './Notification';

const NotificationContainer = ({ notifications, onClose }) => {
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

  if (notifications.length === 0) return null;

  return (
    <div style={getContainerStyle()}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={getNotificationWrapperStyle()}
        >
          <Notification
            {...notification}
            onClose={() => {
              if (notification.onClose) {
                notification.onClose();
              }
              onClose(notification.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;