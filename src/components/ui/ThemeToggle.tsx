import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { iconButton } from "./styles";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";

  return (
    <button type="button" onClick={toggleTheme} className={iconButton} title={label} aria-label={label}>
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
