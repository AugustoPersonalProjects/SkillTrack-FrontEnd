import { LayoutDashboard, Layers, Target, LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import { iconButton } from "../ui/styles";

const links = [
  { to: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { to: "/skills", label: "Skills", icon: Layers },
  { to: "/goals", label: "Metas", icon: Target },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { logout, user } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-zinc-950/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button className={`${iconButton} lg:hidden`} onClick={onClose} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={user?.nome} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{user?.nome || "Usuário"}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
            </div>
            <button onClick={logout} className={iconButton} title="Sair" aria-label="Sair">
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
