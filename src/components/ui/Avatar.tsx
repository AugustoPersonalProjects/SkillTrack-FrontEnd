import { CorAvatar } from "../../types/interfaces";
import { AVATAR_COLOR_CLASSES } from "../../utils/avatarColor";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-base",
};

interface AvatarProps {
  name?: string;
  color?: CorAvatar;
  size?: keyof typeof SIZES;
}

// Iniciais do nome no lugar de uma foto genérica
export default function Avatar({ name, color = CorAvatar.ESMERALDA, size = "sm" }: AvatarProps) {
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${AVATAR_COLOR_CLASSES[color]} ${SIZES[size]}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
