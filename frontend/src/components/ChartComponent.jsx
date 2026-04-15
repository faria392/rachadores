import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';

// Componente de Tooltip customizado
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-zinc-900 p-2 border border-orange-500 rounded shadow-lg">
        <p className="font-semibold text-sm text-gray-300">{payload[0].payload.date}</p>
        <p className="text-orange-500 font-bold">
          R$ {Number(payload[0].value).toLocaleString('pt-BR')}
        </p>
      </div>
    );
  }
  return null;
};

function ChartComponent({ data = [], type = 'line', title = 'Faturamento ao Longo do Tempo' }) {
  if (!data || data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-80 bg-zinc-900">
        <p className="text-gray-500 text-lg">Sem dados para exibir</p>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    amount: Number(item.amount) || 0,
    date: item.date || item.name || '',
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4 text-gray-100">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'bar' ? (
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              label={{ value: 'R$', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="amount" fill="#f97316" name="Faturamento" radius={[8, 8, 0, 0]} />
          </BarChart>
        ) : (
          <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              label={{ value: 'R$', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="natural"
              dataKey="amount"
              stroke="#f97316"
              strokeWidth={3}
              fill="url(#colorAmount)"
              dot={{ fill: '#f97316', r: 6 }}
              activeDot={{ r: 8 }}
              name="Faturamento"
              isAnimationActive={true}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default ChartComponent;
