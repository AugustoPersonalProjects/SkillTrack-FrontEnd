import type { ReactNode } from "react";
import { cardClass } from "../ui/styles";

interface ProfileSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function ProfileSection({ id, title, description, children }: ProfileSectionProps) {
  return (
    <section className={cardClass} aria-labelledby={id}>
      <div className="border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
        <h2 id={id} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
