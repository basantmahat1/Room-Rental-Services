import React, { useContext, useEffect, useRef } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const ConfirmDialog = () => {
  const { confirmDialog, closeConfirm } = useContext(NotificationContext);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (confirmDialog) {
      confirmButtonRef.current?.focus();
    }
  }, [confirmDialog]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeConfirm();
    }
  };

  if (!confirmDialog) return null;

  const {
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning',
  } = confirmDialog;

  const typeStyles = {
    danger: 'border-red-500 bg-red-50',
    warning: 'border-yellow-500 bg-yellow-50',
    info: 'border-blue-500 bg-blue-50',
  };

  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in duration-300"
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onKeyDown={handleKeyDown}
    >
      <div
        className={`
          bg-white rounded-lg shadow-xl border-l-4 max-w-sm w-full
          ${typeStyles[type]} animate-in zoom-in-95 duration-300
        `}
      >
        <div className="p-6">
          {/* Header */}
          <h2
            id="confirm-title"
            className="text-lg font-semibold text-gray-900 mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          {message && (
            <p
              id="confirm-message"
              className="text-sm text-gray-700 mb-6 leading-relaxed"
            >
              {message}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeConfirm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') closeConfirm();
              }}
              className={`
                px-4 py-2 rounded-md font-medium text-sm
                bg-gray-200 text-gray-800 hover:bg-gray-300
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                transition-colors
              `}
              aria-label={cancelText}
              type="button"
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={onConfirm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirm();
              }}
              className={`
                px-4 py-2 rounded-md font-medium text-sm
                text-white focus:outline-none focus:ring-2 focus:ring-offset-2
                transition-colors
                ${buttonStyles[type]}
              `}
              aria-label={confirmText}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
