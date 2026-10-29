const SIZES = {
  sm: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-base",
};

// Iniciais do nome no lugar de uma foto genérica
export default function Avatar({ name, size = "sm" }: { name?: string; size?: keyof typeof SIZES }) {
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 ${SIZES[size]}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
