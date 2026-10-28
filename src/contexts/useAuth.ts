import { createContext, useContext } from "react";
import type { RegisterRequest, Usuario } from "../types/interfaces";

export interface AuthContextType {
  user: Usuario | null;
  loadingUser: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (
    data: RegisterRequest,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
