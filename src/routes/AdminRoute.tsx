import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { Perfil } from "../types/interfaces";

// Libera a rota só para ADMIN; a API também valida o perfil em cada requisição
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loadingUser } = useAuth();
  // ao recarregar a página o usuário ainda está sendo lido do armazenamento local
  if (loadingUser) return null;
  return user?.perfil === Perfil.ADMIN ? children : <Navigate to="/dashboard" replace />;
}
