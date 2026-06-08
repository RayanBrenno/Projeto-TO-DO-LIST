import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  AlertCircle,
  Loader2,
  Users,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const mockMembers = [
  {
    role: "Dono",
    badge: "bg-violet-100 text-violet-700 border border-violet-200",
    avatar: "bg-violet-500",
    initials: "AM",
    wrapClass: "left-0 top-2 -rotate-3",
    delay: "-1s",
  },
  {
    role: "Co-dono",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    avatar: "bg-blue-500",
    initials: "RL",
    wrapClass: "right-0 top-28 rotate-2",
    delay: "-3.5s",
  },
  {
    role: "Membro",
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    avatar: "bg-slate-400",
    initials: "JS",
    wrapClass: "left-12 top-52 -rotate-2",
    delay: "-5.5s",
  },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (
      !formData.nome ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
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
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  }

  const passwordChecks = [
    { label: "Mínimo 8 caracteres", met: formData.password.length >= 8 },
    { label: "Uma letra maiúscula", met: /[A-Z]/.test(formData.password) },
    { label: "Um número", met: /[0-9]/.test(formData.password) },
  ];
  const confirmTouched = formData.confirmPassword.length > 0;
  const passwordsMatch =
    confirmTouched && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen flex">
      {/* PAINEL DO FORMULÁRIO — esquerda */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-violet-50 lg:bg-none lg:bg-white">
        <div className="w-full max-w-md">
          {/* Ícone (mobile / telas pequenas) */}
          <div className="flex items-center justify-center mb-6 lg:hidden">
            <div className="p-3 bg-violet-100 rounded-lg">
              <UserPlus className="w-7 h-7 text-violet-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center lg:text-left mb-2">
            Crie sua conta
          </h1>
          <p className="text-gray-500 text-center lg:text-left text-sm mb-8">
            Comece a organizar suas tarefas no TaskHub
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="João Silva"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-sm"
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

              {/* Widget de requisitos da senha */}
              {formData.password.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.label}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {check.met ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span
                        className={
                          check.met ? "text-green-600" : "text-gray-400"
                        }
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-sm"
                />
                {confirmTouched && (
                  <span className="absolute right-11 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
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
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-lg hover:shadow-xl"
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

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-center text-sm mb-4">
              Já tem uma conta?
            </p>
            <Link
              to="/login"
              className="block w-full text-center border border-violet-600 text-violet-600 hover:bg-violet-50 font-semibold py-3 px-4 rounded-xl transition-all"
            >
              Fazer Login
            </Link>
          </div>

          <p className="text-gray-400 text-center text-xs mt-6">
            TaskHub © 2026
          </p>
        </div>
      </div>

      {/* PAINEL DE MARCA — direita, visível apenas em telas grandes */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        {/* Blobs de gradiente animados (paleta violeta/rosa) */}
        <div className="absolute -top-32 -right-24 w-96 h-96 bg-violet-500/40 rounded-full blur-3xl animate-blob" />
        <div
          className="absolute top-1/3 -left-28 w-80 h-80 bg-fuchsia-500/30 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="absolute -bottom-32 right-1/4 w-72 h-72 bg-rose-400/30 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: "-11s" }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-white/10 border border-white/10 rounded-xl backdrop-blur">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              TaskHub
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4 max-w-md">
            Trabalhe em equipe.
            <br />
            Do seu jeito.
          </h2>
          <p className="text-white/60 max-w-sm">
            Crie organizações, convide pessoas e acompanhe o progresso de tudo
            em um único lugar.
          </p>

          {/* Mockup de membros da organização flutuando */}
          <div className="relative mt-16 h-64">
            {mockMembers.map((member) => (
              <div
                key={member.role}
                className={`absolute w-56 ${member.wrapClass}`}
              >
                <div
                  className="animate-float rounded-xl bg-white shadow-xl p-3.5 flex items-center gap-3"
                  style={{ animationDelay: member.delay }}
                >
                  <div
                    className={`w-9 h-9 rounded-full ${member.avatar} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                  >
                    {member.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="h-2.5 w-3/4 rounded bg-slate-200" />
                    <div className="mt-1.5 h-2 w-1/2 rounded bg-slate-100" />
                  </div>
                  <span
                    className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${member.badge}`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
