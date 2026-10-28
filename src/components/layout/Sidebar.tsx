import { Home, Target, Star, LogOut, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

export default function Sidebar() {
  const { logout, user } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { to: "/skills", label: "Skills", icon: <Star className="w-5 h-5" /> },
    { to: "/goals", label: "Metas", icon: <Target className="w-5 h-5" /> },
  ];

  const handleLogout = () => logout();

  return (
    <aside className="w-80 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-blue-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SkillTrack</h1>
            <p className="text-blue-100 text-sm">Professional Growth</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-500/30 space-y-3">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl">
          <img
            src={
              user?.foto ||
              "https://i.pravatar.cc/40?img=" + ((user?.id_usuario || 1) % 70)
            }
            alt="User"
            className="w-8 h-8 rounded-lg border border-white/30"
          />
          <div className="text-sm">
            <p className="font-semibold">{user?.nome || "Usuário"}</p>
            <p className="text-blue-200 text-xs">
              {user?.perfil === "ADMIN" ? "Admin" : "Usuario"}
            </p>
          </div>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-200 w-full text-left">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Configurações</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
