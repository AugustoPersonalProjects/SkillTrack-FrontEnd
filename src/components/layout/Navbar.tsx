import { Menu, Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { NOTIFICATIONS_EVENT } from "../../utils/notificationHelper";
import ThemeToggle from "../ui/ThemeToggle";
import { iconButton } from "../ui/styles";

interface Notification {
  id: number;
  message: string;
  time: string;
  type: "goal" | "skill" | "info";
  read: boolean;
}

const loadNotifications = (): Notification[] => {
  try {
    return JSON.parse(localStorage.getItem("notifications") || "[]");
  } catch {
    return [];
  }
};

// Horário relativo a partir do id, que é o timestamp de criação da notificação
const formatTime = (id: number) => {
  const minutes = Math.floor((Date.now() - id) / 60000);
  if (minutes < 1) return "Agora mesmo";
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  return new Date(id).toLocaleDateString("pt-BR");
};

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reload = () => setNotifications(loadNotifications());
    window.addEventListener(NOTIFICATIONS_EVENT, reload);
    return () => window.removeEventListener(NOTIFICATIONS_EVENT, reload);
  }, []);

  // Fecha o painel ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const clearNotifications = () => {
    localStorage.removeItem("notifications");
    setNotifications([]);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6 lg:px-8">
      <button className={`${iconButton} lg:hidden`} onClick={onMenuClick} aria-label="Abrir menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-1" ref={dropdownRef}>
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className={`${iconButton} relative`}
            aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-zinc-900" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notificações</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Nenhuma notificação.
                </p>
              ) : (
                <ul className="max-h-72 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
                  {notifications.map((n) => (
                    <li key={n.id} className="flex items-start gap-3 px-4 py-3">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          n.read ? "bg-transparent" : "bg-emerald-600"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-zinc-800 dark:text-zinc-200">{n.message}</p>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{formatTime(n.id)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="w-full border-t border-zinc-200 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-emerald-400 dark:hover:bg-zinc-800/60"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
