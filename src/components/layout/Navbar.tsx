import { Menu, Bell, Search } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { useEffect, useState, useRef } from "react";
import { NOTIFICATIONS_EVENT } from "../../utils/notificationHelper";

interface Notification {
  id: number;
  message: string;
  time: string;
  type: "goal" | "skill" | "info";
  read: boolean;
}

export default function Navbar() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Simulação de notificações dinâmicas (poderia vir da API futuramente)
  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      const initial: Notification[] = [
        {
          id: 1,
          message: "Bem-vindo ao SkillTrack!",
          time: "Agora mesmo",
          type: "info",
          read: false,
        },
      ];
      localStorage.setItem("notifications", JSON.stringify(initial));
      setNotifications(initial);
    }

    const reload = () =>
      setNotifications(JSON.parse(localStorage.getItem("notifications") || "[]"));
    window.addEventListener(NOTIFICATIONS_EVENT, reload);
    return () => window.removeEventListener(NOTIFICATIONS_EVENT, reload);
  }, []);

  // Fechar popover clicando fora
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
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm relative">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 🔍 Pesquisa */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none w-64"
            />
          </div>
        </div>

        {/* Notificações e usuário */}
        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          {/* Botão de notificações */}
          <button
            onClick={() => setOpen(!open)}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Popover de notificações */}
          {open && (
            <div className="absolute right-14 top-12 w-80 bg-white rounded-xl shadow-xl border p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Notificações ({notifications.length})
                </h3>
                <button
                  onClick={clearNotifications}
                  className="text-xs text-gray-500 hover:text-red-500 transition"
                >
                  Limpar
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma notificação no momento.
                </p>
              ) : (
                <ul className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition ${
                        n.read ? "opacity-70" : ""
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                          n.type === "goal"
                            ? "bg-green-500"
                            : n.type === "skill"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-500">{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="w-full mt-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-lg transition"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          )}

          {/* Perfil */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.nome || "Usuário"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.perfil === "ADMIN" ? "Admin" : "User"}
              </p>
            </div>
            <img
              src={
                user?.foto ||
                "https://i.pravatar.cc/40?img=" + ((user?.id_usuario || 1) % 70)
              }
              alt="User avatar"
              className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
