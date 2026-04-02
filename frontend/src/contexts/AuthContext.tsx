import { createContext, useContext, useEffect, useState} from "react";
import type { ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
};

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const API_URL = "http://localhost:8000";
const API_URL = import.meta.env.VITE_API_URL;

// Provedor de autenticação para envolver a aplicação e fornecer o estado de autenticação e as funções de login, registro e logout
export function AuthProvider({ children }: { children: ReactNode }) {

  // Estado para armazenar o usuário autenticado e o estado de carregamento
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para carregar o usuário autenticado usando o token armazenado no sessionStorage
  async function loadUser() {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token inválido");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      sessionStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Carregar o usuário autenticado quando o componente for montado, sempre verificando o token armazenado no sessionStorage para manter a sessão ativa mesmo após recarregar a página ou ao abrir 
  useEffect(() => {
    loadUser();
  }, []);

  // Função para fazer login, enviando os dados para a API e armazenando o token e as informações do usuário no estado e no sessionStorage
  async function login(data: LoginData) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Erro ao fazer login");
    }

    sessionStorage.setItem("token", result.access_token);
    setUser(result.user);
  }

  // Função para fazer registro, enviando os dados para a API e armazenando o token e as informações do usuário no estado e no sessionStorage
  async function register(data: RegisterData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Erro ao cadastrar");
    }

    sessionStorage.setItem("token", result.access_token);
    setUser(result.user);
  }

  // Função para fazer logout, removendo o token do sessionStorage e limpando as informações do usuário do estado
  function logout() {
    sessionStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}