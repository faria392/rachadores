import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  PlusCircle,
  TrendingUp,
  Calendar,
  History,
  Trophy,
  User,
  LogOut,
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();

  const links = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/add-revenue', icon: PlusCircle, label: 'Adicionar Faturamento' },
    { path: '/ranking', icon: TrendingUp, label: 'Ranking Geral' },
    { path: '/ranking-daily', icon: Calendar, label: 'Ranking Diário' },
    { path: '/history', icon: History, label: 'Histórico' },
    { path: '/achievements', icon: Trophy, label: 'Conquistas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 text-white shadow-xl border-r border-zinc-800">
      {/* Logo/Header */}
      <div className="p-6 border-b border-zinc-800">
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="rounded-full overflow-hidden border-2 border-orange-500 shadow-lg flex-shrink-0">
            <img 
              src="/IMG_4821.jpg" 
              alt="Rachadores" 
              className="w-10 h-10 object-cover"
            />
          </div>
          <div>
            <h1 className="text-sm font-black text-orange-500 leading-tight">RACHADORES</h1>
            <p className="text-xs text-gray-400">MAKE MONEY</p>
            <p className="text-xs text-gray-400">NOT FRIENDS</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    active
                      ? 'bg-orange-500/10 text-orange-400 border-l-2 border-orange-500'
                      : 'text-gray-400 hover:bg-zinc-900 hover:text-orange-400'
                  }`}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-400 hover:bg-zinc-900 hover:text-orange-400 transition-all"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
