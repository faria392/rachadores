import React from 'react';
import { Medal } from 'lucide-react';

const formatCurrency = (value) => {
  const numValue = Number(value ?? 0);
  
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }
  
  return `R$ ${numValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const getMedalOrPosition = (index) => {
  const medals = ['🥇', '🥈', '🥉'];
  return medals[index] || `${index + 1}º`;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
};

const getRowColor = (index) => {
  if (index === 0) return 'bg-orange-500/10 border-l-4 border-orange-500 hover:bg-orange-500/20';
  if (index === 1) return 'bg-zinc-800/50 border-l-4 border-zinc-700 hover:bg-zinc-700/50';
  if (index === 2) return 'bg-zinc-800/50 border-l-4 border-zinc-700 hover:bg-zinc-700/50';
  return 'hover:bg-zinc-800/50';
};

function RankingTable({ data = [], title = 'Ranking' }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4 text-gray-100 flex items-center gap-2">
        <Medal size={24} className="text-orange-500" />
        {title}
      </h3>
      {safeData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Nenhum dado disponível</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-zinc-700">
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Posição</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Usuário</th>
                <th className="px-4 py-3 text-right text-gray-400 font-semibold">Faturamento</th>
              </tr>
            </thead>
            <tbody>
              {safeData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`border-b border-zinc-800 transition-all ${getRowColor(index)}`}
                >
                  <td className="px-4 py-3">
                    <span className="text-2xl">{getMedalOrPosition(index)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.avatarUrl && !row.avatarUrl.startsWith('data:') ? (
                        <img
                          src={`${row.avatarUrl}?t=${Date.now()}`}
                          alt={row.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-zinc-600"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : row.avatarUrl ? (
                        <img
                          src={row.avatarUrl}
                          alt={row.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-zinc-600"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          row.avatarUrl ? 'hidden' : ''
                        } bg-gradient-to-br from-orange-500 to-orange-600 text-white`}
                        style={{ display: row.avatarUrl ? 'none' : 'flex' }}
                      >
                        {getInitials(row.name)}
                      </div>
                      <span className="font-medium text-gray-300">{row.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-orange-500">
                    {formatCurrency(row.total || row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RankingTable;
