import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>

      {user && (
        <div className="text-right">
          <p className="text-sm text-gray-500">Logado como</p>
          <p className="font-semibold text-gray-900">{user.name}</p>
        </div>
      )}
    </div>
  );
}