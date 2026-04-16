import React, { useState, useEffect } from 'react';
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
  Menu,
  X,
  DollarSign,
} from 'lucide-react';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/add-revenue', icon: PlusCircle, label: 'Adicionar Faturamento' },
    { path: '/financeiro', icon: DollarSign, label: 'Dashboard Financeiro' },
    { path: '/ranking', icon: TrendingUp, label: 'Ranking Geral' },
    { path: '/ranking-daily', icon: Calendar, label: 'Ranking Diário' },
    { path: '/history', icon: History, label: 'Histórico' },
    { path: '/achievements', icon: Trophy, label: 'Conquistas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (window.innerWidth < 768 && isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleClickOutside = (e) => {
      if (window.innerWidth < 768 && isMenuOpen) {
        const sidebar = document.querySelector('[data-sidebar]');
        const toggleBtn = document.querySelector('[data-toggle-sidebar]');

        if (
          sidebar &&
          toggleBtn &&
          !sidebar.contains(e.target) &&
          !toggleBtn.contains(e.target) &&
          !e.target.closest('[data-sidebar]') &&
          !e.target.closest('[data-toggle-sidebar]')
        ) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
        document.body.style.overflow = 'unset';
      };
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;


  return (
    <>
      {}
      <button
        type="button"
        data-toggle-sidebar
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed md:hidden top-4 left-4 z-50 p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {}
      {isMenuOpen && (
        <div
          className="fixed inset-0 md:hidden bg-black/50 z-30"
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsMenuOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Responsiva */}
      <aside
        data-sidebar
        className={`
          fixed left-0 top-0 h-screen w-64 bg-zinc-950 text-white shadow-xl border-r border-zinc-800
          z-40 transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
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
    </>
  );
}

export default Sidebar;
