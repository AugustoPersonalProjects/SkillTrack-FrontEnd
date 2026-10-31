import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { profileService } from "../services/profileService";
import type { RegisterRequest, Tema, Usuario } from "../types/interfaces";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import { applyTheme } from "../utils/theme";
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

  const updateUser = (updated: Usuario) => {
    setUser(authService.saveUser(updated));
  };

  // O tema muda na hora; a conta é atualizada em segundo plano, e uma falha na rede não atrapalha o uso
  const changeTheme = (tema: Tema) => {
    applyTheme(tema);
    if (!user) return;
    updateUser({ ...user, tema });
    profileService.changeTheme(tema).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{ user, loadingUser, login, register, logout, updateUser, changeTheme }}
    >
      {children}
    </AuthContext.Provider>
  );
};
