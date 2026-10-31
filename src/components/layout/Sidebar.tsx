import { LayoutDashboard, Layers, Target, LogOut, X, Users, Tags } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import { iconButton } from "../ui/styles";
import { Perfil } from "../../types/interfaces";

const links = [
  { to: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { to: "/skills", label: "Skills", icon: Layers },
  { to: "/goals", label: "Metas", icon: Target },
];

const adminLinks = [
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/categorias", label: "Categorias", icon: Tags },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
  }`;

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
                <NavLink to={to} onClick={onClose} className={linkClass}>
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {user?.perfil === Perfil.ADMIN && (
            <>
              <p className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Administração
              </p>
              <ul className="space-y-1">
                {adminLinks.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink to={to} onClick={onClose} className={linkClass}>
                      <Icon className="h-[18px] w-[18px]" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            <NavLink
              to="/perfil"
              onClick={onClose}
              title="Meu perfil"
              className={({ isActive }) =>
                `flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-2 transition-colors ${
                  isActive ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`
              }
            >
              <Avatar name={user?.nome} color={user?.cor_avatar} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <span className="sr-only">Meu perfil: </span>
                  {user?.nome || "Usuário"}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
              </div>
            </NavLink>
            <button onClick={logout} className={iconButton} title="Sair" aria-label="Sair">
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
