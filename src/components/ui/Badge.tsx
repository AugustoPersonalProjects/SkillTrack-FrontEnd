import type { ReactNode } from "react";

// Etiqueta pequena para status e níveis; as cores vêm de quem usa
export default function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
