import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";
import type { LoginRequest, Usuario } from "../types/skill";

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Erro ao parsear usuário do localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, senha: string) {
    try {
      const loginData: LoginRequest = { email, senha };
      const response = await authService.login(loginData);
      
      localStorage.setItem("token", response.token);
      const userData: Usuario = {
        id_usuario: response.id,
        nome: response.name,
        email: response.email,
        perfil: "USER" as any, // Será atualizado pelo backend
        data_criacao: new Date().toISOString()
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro no login:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Email ou senha inválidos" 
      };
    }
  }

  async function register(userData: any) {
    try {
      const response = await authService.register(userData);
      
      localStorage.setItem("token", response.token);
      const userDataToStore: Usuario = {
        id_usuario: response.id,
        nome: response.name,
        email: response.email,
        perfil: "USER" as any,
        data_criacao: new Date().toISOString()
      };
      localStorage.setItem("user", JSON.stringify(userDataToStore));
      setUser(userDataToStore);
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Erro ao criar conta" 
      };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}