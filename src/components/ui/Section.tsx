import { useId, type ReactNode } from "react";
import { cardClass } from "./styles";

interface SectionProps {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function Section({ title, description, action, children }: SectionProps) {
  const titleId = useId();

  return (
    <section className={cardClass} aria-labelledby={titleId}>
      <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
        <div className="min-w-0">
          <h2 id={titleId} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
