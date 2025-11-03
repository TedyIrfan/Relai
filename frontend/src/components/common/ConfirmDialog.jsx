import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  type = 'warning', // warning, success, info, danger
  loading = false
}) => {
  if (!isOpen) return null;

  const getDialogStyles = () => {
    const typeStyles = {
      warning: {
        icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
        iconBg: 'bg-yellow-100',
        confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
        confirmText: 'text-white'
      },
      danger: {
        icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
        iconBg: 'bg-red-100',
        confirmBg: 'bg-red-600 hover:bg-red-700',
        confirmText: 'text-white'
      },
      success: {
        icon: <CheckCircle className="w-12 h-12 text-green-500" />,
        iconBg: 'bg-green-100',
        confirmBg: 'bg-green-600 hover:bg-green-700',
        confirmText: 'text-white'
      },
      info: {
        icon: <AlertTriangle className="w-12 h-12 text-blue-500" />,
        iconBg: 'bg-blue-100',
        confirmBg: 'bg-blue-600 hover:bg-blue-700',
        confirmText: 'text-white'
      }
    };

    return typeStyles[type] || typeStyles.warning;
  };

  const styles = getDialogStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${styles.iconBg}`}>
              {styles.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 ${styles.confirmBg} ${styles.confirmText}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;