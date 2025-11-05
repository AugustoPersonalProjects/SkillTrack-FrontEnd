import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import type { Usuario } from "../types/interfaces";

interface AuthContextType {
  user: Usuario | null;
  loadingUser: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      console.log("✅ Usuário restaurado:", savedUser);
      setUser(savedUser);
    } else {
      console.warn("⚠️ Nenhum usuário encontrado no localStorage");
    }
    setLoadingUser(false);
  }, []);

  const login = async (email: string, senha: string) => {
    await authService.login({ email, senha });
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loadingUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
