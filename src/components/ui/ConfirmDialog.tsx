import { useState } from "react";
import Dialog, { DialogFooter } from "./Dialog";
import { buttonSecondary } from "./styles";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

// Substitui o confirm() do navegador nas ações destrutivas
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} title={title} description={description} className="max-w-md">
      <DialogFooter>
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40 disabled:opacity-50"
        >
          {loading ? "Aguarde..." : confirmLabel}
        </button>
      </DialogFooter>
    </Dialog>
  );
}
