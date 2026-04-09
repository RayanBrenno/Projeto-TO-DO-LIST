import { Home, CheckSquare, Users, Plus, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type Page = "home" | "my-tasks" | "organization" | "create-task";


interface SidebarProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const { logout } = useAuth();

  const menuItems = [
    { id: "home" as Page, label: "Início", icon: Home },
    { id: "my-tasks" as Page, label: "Minhas Tarefas", icon: CheckSquare },
    { id: "organization" as Page, label: "Organização", icon: Users },
    { id: "create-task" as Page, label: "Criar Tarefa", icon: Plus },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* HEADER */}
      <div className="p-6 border-b border-blue-500">
        <h1 className="text-2xl font-bold">TaskHub</h1>
        <p className="text-blue-100 text-sm mt-1">Organize suas tarefas</p>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-white text-blue-600 shadow-lg"
                  : "text-blue-100 hover:bg-blue-500/50"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* LOGOUT FIXO EMBAIXO */}
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-blue-100 hover:bg-blue-500/50 transition-all"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
