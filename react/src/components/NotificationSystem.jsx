import React from 'react';
import { useError } from '../contexts/ErrorContext.jsx';

export default function NotificationSystem() {
  const { notifications, removeNotification } = useError();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'success':
        return 'notification--success';
      case 'error':
        return 'notification--error';
      case 'warning':
        return 'notification--warning';
      case 'info':
        return 'notification--info';
      default:
        return 'notification--info';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${getNotificationClass(notification.type)}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification__icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="notification__content">
            <div className="notification__title">{notification.title}</div>
            <div className="notification__message">{notification.message}</div>
          </div>
          <button
            className="notification__close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

