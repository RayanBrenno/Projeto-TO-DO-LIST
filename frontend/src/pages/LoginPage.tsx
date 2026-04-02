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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <LogIn className="w-7 h-7 text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Login
          </h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            Acesse sua conta de análise de crédito
          </p>

          {/* Exibe uma mensagem de erro se houver um erro de login, com um ícone de alerta e um fundo vermelho suave para destacar a mensagem */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Formulário de login com campos para email e senha, e um botão de submit que chama a função handleLogin */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-6"
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

          {/* Link para a página de registro, com um texto convidativo e um botão estilizado que leva o usuário para a página de criação de conta */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-slate-400 text-center text-sm mb-4">
              Não tem uma conta?
            </p>
            <Link
              to="/register"
              className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center"
            >
              Criar Conta
            </Link>
          </div>
        </div>

        <p className="text-slate-400 text-center text-xs mt-8">
          Sistema de Análise de Crédito © 2026
        </p>
      </div>
    </div>
  );
}
