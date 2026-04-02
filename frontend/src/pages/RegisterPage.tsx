import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  // Função para lidar com mudanças nos campos do formulário, atualizando o estado do formulário conforme o usuário preenche os dados
  function handleChange(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Função para lidar com o registro do usuário, validando os dados do formulário e fazendo uma requisição para a API de autenticação, redirecionando para o dashboard em caso de sucesso ou exibindo uma mensagem de erro em caso de falha.
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.nome || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.nome.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <UserPlus className="w-7 h-7 text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Registre-se</h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            Crie sua conta para começar a análise de crédito
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Formulário de registro, com campos para nome, email, senha e confirmação de senha, além de um botão para enviar os dados e criar a conta. */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="João Silva"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirmar Senha
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
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
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar Conta
                </>
              )}
            </button>
          </form>
          
          {/* Link para a página de login, caso o usuário já tenha uma conta, permitindo que ele navegue facilmente para a tela de autenticação. */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-slate-400 text-center text-sm mb-4">
              Já tem uma conta?
            </p>
            <Link
              to="/login"
              className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-all text-center"
            >
              Fazer Login
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