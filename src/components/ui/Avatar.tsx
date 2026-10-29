// Iniciais do nome no lugar de uma foto genérica
export default function Avatar({ name, className = "" }: { name?: string; className?: string }) {
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 ${className}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
