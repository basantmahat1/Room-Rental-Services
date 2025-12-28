import React, { useContext, useEffect } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const Toast = () => {
  const { toasts, removeToast } = useContext(NotificationContext);

  const toastTypeStyles = {
    success: 'bg-green-50 border-green-500 text-green-800 shadow-green-100',
    error: 'bg-red-50 border-red-500 text-red-800 shadow-red-100',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800 shadow-yellow-100',
    info: 'bg-blue-50 border-blue-500 text-blue-800 shadow-blue-100',
    booking: 'bg-green-50 border-green-500 text-green-800 shadow-green-100',
    payment: 'bg-blue-50 border-blue-500 text-blue-800 shadow-blue-100',
    reminder: 'bg-yellow-50 border-yellow-500 text-yellow-800 shadow-yellow-100',
    admin: 'bg-red-50 border-red-500 text-red-800 shadow-red-100',
  };

  const iconStyles = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    booking: '✅',
    payment: '💰',
    reminder: '⏰',
    admin: '📢',
  };

  return (
    <div
      className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto max-w-sm w-full mx-auto px-5 py-4 rounded-lg 
            border-l-4 shadow-lg animate-in fade-in slide-in-from-right-4 duration-300
            ${toastTypeStyles[toast.type] || toastTypeStyles.info}
            flex items-start justify-between gap-3
          `}
          role="alert"
          aria-atomic="true"
        >
          <div className="flex items-start gap-3">
            <span
              className="flex-shrink-0 text-2xl font-bold mt-0.5"
              aria-hidden="true"
            >
              {iconStyles[toast.type] || iconStyles.info}
            </span>
            <p className="text-sm font-medium leading-relaxed flex-1">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-lg font-bold hover:opacity-70 transition-opacity"
            aria-label="Close notification"
            type="button"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
