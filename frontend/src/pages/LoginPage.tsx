import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogIn,
  AlertCircle,
  Loader2,
  CheckSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const mockCards = [
  {
    label: "A Fazer",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    wrapClass: "left-2 top-4 -rotate-6",
    delay: "-2s",
  },
  {
    label: "Fazendo",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    wrapClass: "right-0 top-24 rotate-3",
    delay: "-4.5s",
  },
  {
    label: "Concluído",
    badge: "bg-green-100 text-green-700 border border-green-200",
    wrapClass: "left-10 top-48 -rotate-2",
    delay: "0s",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Função para lidar com o envio do formulário de login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Tenta fazer login com as credenciais fornecidas, e navega para o home se for bem-sucedido
    try {
      await login({
        email: email.trim(),
        password,
      });
      navigate("/home");
    } catch (err: any) {
      // Exibe uma mensagem de erro caso o login falhe
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* PAINEL DE MARCA — visível apenas em telas grandes */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        {/* Blobs de gradiente animados */}
        <div className="absolute -top-32 -left-24 w-96 h-96 bg-amber-400/40 rounded-full blur-3xl animate-blob" />
        <div
          className="absolute top-1/3 -right-28 w-80 h-80 bg-indigo-500/40 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-72 h-72 bg-green-400/30 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: "-11s" }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-white/10 border border-white/10 rounded-xl backdrop-blur">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              TaskHub
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4 max-w-md">
            Organize tudo.
            <br />
            Em um só lugar.
          </h2>
          <p className="text-white/60 max-w-sm">
            Gerencie suas tarefas pessoais e colabore com sua equipe — tudo em
            um único espaço.
          </p>

          {/* Mockup de cards flutuando */}
          <div className="relative mt-16 h-64">
            {mockCards.map((card) => (
              <div
                key={card.label}
                className={`absolute w-52 ${card.wrapClass}`}
              >
                <div
                  className="animate-float rounded-xl bg-white shadow-xl p-4"
                  style={{ animationDelay: card.delay }}
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${card.badge}`}
                  >
                    {card.label}
                  </span>
                  <div className="mt-3 h-2.5 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-2.5 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAINEL DO FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50 lg:bg-none lg:bg-white">
        <div className="w-full max-w-md">
          {/* Ícone (mobile / telas pequenas) */}
          <div className="flex items-center justify-center mb-6 lg:hidden">
            <div className="p-3 bg-blue-100 rounded-lg">
              <LogIn className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 text-center lg:text-left mb-2">
            Bem-vindo
          </h1>
          <p className="text-gray-500 text-center lg:text-left text-sm mb-8">
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
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

          <p className="text-gray-400 text-center text-xs mt-6">
            TaskHub © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
