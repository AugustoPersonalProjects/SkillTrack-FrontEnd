import { Moon, Sun } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Tema } from "../../types/interfaces";
import { iconButton } from "./styles";

export default function ThemeToggle() {
  const { theme } = useTheme();
  const { changeTheme } = useAuth();
  const isDark = theme === "dark";
  const label = isDark ? "Ativar modo claro" : "Ativar modo escuro";

  return (
    <button
      type="button"
      onClick={() => changeTheme(isDark ? Tema.CLARO : Tema.ESCURO)}
      className={iconButton}
      title={label}
      aria-label={label}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
