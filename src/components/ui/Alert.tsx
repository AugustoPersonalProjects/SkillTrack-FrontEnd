import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface AlertMessage {
  type: "success" | "error";
  text: string;
}

interface AlertProps {
  message: AlertMessage | null;
  onClose?: () => void;
}

export default function Alert({ message, onClose }: AlertProps) {
  if (!message) return null;

  const isSuccess = message.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message.text}</p>
      {onClose && (
        <button type="button" onClick={onClose} className="opacity-70 hover:opacity-100" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
