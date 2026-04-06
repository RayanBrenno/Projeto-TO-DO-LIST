import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // Função para lidar com o envio do formulário de login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Tenta fazer login com as credenciais fornecidas, e navega para o dashboard se for bem-sucedido
    try {
      await login({
        email: email.trim(),
        password,
      });
      navigate("/dashboard");
    } catch (err: any) {
      // Exibe uma mensagem de erro caso o login falhe
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur border border-blue-100 rounded-2xl shadow-xl p-8">
          {/* Ícone */}
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <LogIn className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Bem-vindo
          </h1>
          <p className="text-gray-500 text-center text-sm mb-8">
            Acesse sua conta no TaskHub
          </p>

          {/* ERRO */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* REGISTER */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-center text-sm mb-4">
              Não tem uma conta?
            </p>
            <Link
              to="/register"
              className="block w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition-all text-center"
            >
              Criar Conta
            </Link>
          </div>
        </div>

        <p className="text-white/80 text-center text-xs mt-6">TaskHub © 2026</p>
      </div>
    </div>
  );
}
