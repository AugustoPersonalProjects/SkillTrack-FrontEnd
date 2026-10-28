import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import type { RegisterRequest, Usuario } from "../types/interfaces";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface AuthContextType {
  user: Usuario | null;
  loadingUser: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (
    data: RegisterRequest,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser && authService.getToken()) {
      setUser(savedUser);
    }
    setLoadingUser(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const currentUser = await authService.login({ email, senha });
    setUser(currentUser);
  };

  const register = async (data: RegisterRequest) => {
    try {
      const novoUsuario = await authService.register(data);
      setUser(novoUsuario);
      return { success: true };
    } catch (error: unknown) {
      console.error("Erro ao criar meta:", error);
      setError(getApiErrorMessage(error, "Erro ao criar meta"));
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loadingUser, login, register, logout }}
    >
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
