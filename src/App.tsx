import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/useAuth";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Goals from "./pages/Goals";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminCategories from "./pages/admin/AdminCategories";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import Spinner from "./components/ui/Spinner";

// O painel carrega a biblioteca de gráficos, que só é baixada por quem abre esta página
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Componente de rotas que usa o hook useAuth
function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas - redireciona para dashboard se já estiver logado */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* Rota raiz */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />

        {/* Rotas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="skills" element={<Skills />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="perfil" element={<Profile />} />
                  {/* Administração (perfil ADMIN) */}
                  <Route path="admin" element={<Navigate to="/admin/painel" replace />} />
                  <Route
                    path="admin/painel"
                    element={
                      <AdminRoute>
                        <ErrorBoundary message="Não foi possível abrir o painel. Recarregue a página para tentar de novo.">
                          <Suspense fallback={<Spinner />}>
                            <AdminDashboard />
                          </Suspense>
                        </ErrorBoundary>
                      </AdminRoute>
                    }
                  />
                  <Route path="admin/usuarios" element={<AdminRoute><AdminOverview /></AdminRoute>} />
                  <Route path="admin/usuarios/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
                  <Route path="admin/categorias" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                  {/* Fallback para rotas não encontradas */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

// Componente principal
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}