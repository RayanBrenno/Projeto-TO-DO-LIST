import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Componente para proteger rotas que exigem autenticação
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  
  // Obter o estado de autenticação do contexto
  const { user, loading } = useAuth();

  // Se ainda estiver carregando, mostrar um indicador de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado, redirecionar para a página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado, renderizar os filhos (conteúdo protegido)
  return <>{children}</>;
}