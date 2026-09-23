import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/80 dark:border-indigo-800 dark:text-indigo-200',
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgStyles[type]} animate-in slide-in-from-bottom-5 duration-200`}>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100 text-lg leading-none cursor-pointer"
        aria-label="Dismiss alert"
      >
        &times;
      </button>
    </div>
  );
};
