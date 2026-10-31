import { Monitor, Moon, Sun } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Tema } from "../../types/interfaces";
import Section from "../ui/Section";

const THEME_OPTIONS = [
  { value: Tema.CLARO, label: "Claro", icon: Sun },
  { value: Tema.ESCURO, label: "Escuro", icon: Moon },
  { value: Tema.SISTEMA, label: "Sistema", icon: Monitor },
];

export default function ThemeForm() {
  const { preference } = useTheme();
  const { changeTheme } = useAuth();

  return (
    <Section
      title="Aparência"
      description="Claro e Escuro ficam salvos na conta e valem em todos os dispositivos. Sistema segue a configuração deste dispositivo."
    >
      <fieldset>
        <legend className="sr-only">Tema</legend>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = preference === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-3 py-3 text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-emerald-600/40 ${
                  selected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  name="tema"
                  value={value}
                  checked={selected}
                  onChange={() => changeTheme(value)}
                  className="sr-only"
                />
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>
    </Section>
  );
}
