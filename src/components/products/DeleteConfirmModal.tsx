import React from 'react';
import { Product } from '@/types/product';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  isDeleting,
}) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Product" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Are you sure you want to delete this product?
            </p>
            <p className="text-xs text-slate-500 mt-1">
              &quot;{product.title}&quot; (ID: {product.id}) will be removed from your catalog.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
