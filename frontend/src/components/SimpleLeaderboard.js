import React from 'react';
import { Medal } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
};

function SimpleLeaderboard({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <p className="text-gray-400 text-center">Nenhum dado recebido</p>
        <p className="text-gray-600 text-xs text-center mt-2">(Abra F12 → Console para ver logs)</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <Medal size={24} className="text-orange-500" />
        Ranking ({data.length} participantes)
      </h2>

      <div className="space-y-2">
        {data.map((user, idx) => (
          <div
            key={user.id || idx}
            className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl font-bold text-orange-500 w-8">{idx + 1}º</span>
              
              {/* Avatar */}
              {user.avatarUrl && !user.avatarUrl.startsWith('data:') ? (
                <img
                  src={`${user.avatarUrl}?t=${Date.now()}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-600"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-600"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                  user.avatarUrl ? 'hidden' : ''
                } bg-gradient-to-br from-orange-500 to-orange-600 text-white`}
                style={{ display: user.avatarUrl ? 'none' : 'flex' }}
              >
                {getInitials(user.name)}
              </div>
              
              <div>
                <p className="text-gray-100 font-semibold">{user.name}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-500">
                R$ {Number(user.total || 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <p className="text-blue-300 text-sm">
          💡 Este é um leaderboard simplificado para teste. Verifique o console (F12) para logs de carregamento.
        </p>
      </div>
    </div>
  );
}

export default SimpleLeaderboard;
