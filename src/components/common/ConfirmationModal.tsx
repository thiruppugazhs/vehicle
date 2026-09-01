import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete Record',
  cancelLabel = 'Cancel',
  isDestructive = true
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
    >
      <div className="space-y-4 text-left">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-rose-900 mb-1">Destructive Action</h4>
            <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer shadow-xs ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700'
            }`}
          >
            {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
