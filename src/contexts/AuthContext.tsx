import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import type { RegisterRequest, Usuario } from "../types/interfaces";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { AuthContext } from "./useAuth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser && authService.getToken()) {
      setUser(savedUser);
      // atualiza em segundo plano; um token expirado já leva ao login pelo interceptor da API
      authService
        .refreshSession()
        .then((freshUser) => freshUser && setUser(freshUser))
        .catch(() => {});
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
      return {
        success: false,
        message: getApiErrorMessage(error, "Erro ao criar conta. Tente novamente."),
      };
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
