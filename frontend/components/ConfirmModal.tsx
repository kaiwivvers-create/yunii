'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-2xl p-6 max-w-md w-full animate-scale-in shadow-xl">
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              danger ? 'bg-red-500/10 text-red-500' : 'bg-[#9370DB]/10 text-[#9370DB]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-dark-text-secondary mt-1.5">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#F0EEF8] dark:border-dark-border">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-slate-600 dark:text-dark-text-secondary hover:bg-[#F4F2FA] dark:hover:bg-dark-bg-tertiary rounded-lg font-medium transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg font-medium text-white transition-colors shadow-sm ${
              danger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                : 'bg-[#9370DB] hover:bg-[#7B68EE] shadow-[#9370DB]/30'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
