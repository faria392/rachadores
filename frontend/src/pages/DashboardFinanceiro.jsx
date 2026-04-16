import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Trash2, TrendingUp, DollarSign, PieChart as PieChartIcon, Edit2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const DashboardFinanceiro = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [faturamentoDia, setFaturamentoDia] = useState('');
  const [despesaValor, setDespesaValor] = useState('');
  const [despesaNome, setDespesaNome] = useState('');
  const [dados, setDados] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [editandoFaturamento, setEditandoFaturamento] = useState(false);
  const [editandoGastoId, setEditandoGastoId] = useState(null);
  const [edicaoValor, setEdicaoValor] = useState('');
  const [edicaoNome, setEdicaoNome] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Buscar dados da API
  useEffect(() => {
    const fetchDados = async () => {
      try {
        setCarregando(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/financial/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }

        const dados = await response.json();
        setDados(dados);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarFeedback('❌ Erro ao carregar dados do servidor');
      } finally {
        setCarregando(false);
      }
    };

    fetchDados();
  }, []);

  const getDadosDia = () => {
    return dados.find(d => d.data === dataSelecionada) || {
      data: dataSelecionada,
      faturamento: 0,
      gastos: [],
    };
  };

  const dadosDiaAtual = getDadosDia();
  const totalGastos = dadosDiaAtual.gastos.reduce((acc, gasto) => acc + parseFloat(gasto.valor || 0), 0);
  const lucro = (dadosDiaAtual.faturamento || 0) - totalGastos;

  // Mostrar feedback temporário
  const mostrarFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Salvar faturamento via API
  const handleSalvarFaturamento = async () => {
    if (!faturamentoDia || parseFloat(faturamentoDia) <= 0) {
      mostrarFeedback('⚠️ Digite um valor válido para faturamento');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/financial/revenue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dataSelecionada,
          amount: parseFloat(faturamentoDia),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar faturamento');
      }

      // Atualizar dados localmente
      setDados(prevDados => {
        const novosDados = [...prevDados];
        const indexDia = novosDados.findIndex(d => d.data === dataSelecionada);

        if (indexDia >= 0) {
          novosDados[indexDia].faturamento = parseFloat(faturamentoDia);
        } else {
          novosDados.push({
            data: dataSelecionada,
            faturamento: parseFloat(faturamentoDia),
            gastos: [],
          });
        }

        return novosDados.sort((a, b) => new Date(b.data) - new Date(a.data));
      });

      setFaturamentoDia('');
      mostrarFeedback('✅ Faturamento registrado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      mostrarFeedback('❌ Erro ao salvar faturamento');
    }
  };

  // Adicionar gasto via API
  const handleAdicionarGasto = async () => {
    if (!despesaValor || parseFloat(despesaValor) <= 0) {
      mostrarFeedback('⚠️ Digite um valor válido para gasto');
      return;
    }

    if (!despesaNome.trim()) {
      mostrarFeedback('⚠️ Digite um nome para o gasto');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/financial/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dataSelecionada,
          name: despesaNome.trim(),
          amount: parseFloat(despesaValor),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar gasto');
      }

      const result = await response.json();

      // Atualizar dados localmente
      setDados(prevDados => {
        const novosDados = [...prevDados];
        let indexDia = novosDados.findIndex(d => d.data === dataSelecionada);

        if (indexDia < 0) {
          novosDados.push({
            data: dataSelecionada,
            faturamento: 0,
            gastos: [],
          });
          indexDia = novosDados.length - 1;
        }

        novosDados[indexDia].gastos.push({
          id: result.id,
          valor: parseFloat(despesaValor),
          nome: despesaNome.trim(),
        });

        return novosDados;
      });

      setDespesaValor('');
      setDespesaNome('');
      mostrarFeedback('✅ Gasto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      mostrarFeedback('❌ Erro ao adicionar gasto');
    }
  };

  // Remover gasto via API
  const handleRemoverGasto = async (idGasto) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/financial/expenses/${idGasto}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao remover gasto');
      }

      setDados(prevDados => {
        const novosDados = [...prevDados];
        const indexDia = novosDados.findIndex(d => d.data === dataSelecionada);

        if (indexDia >= 0) {
          novosDados[indexDia].gastos = novosDados[indexDia].gastos.filter(g => g.id !== idGasto);
        }

        return novosDados;
      });

      mostrarFeedback('✅ Gasto removido!');
    } catch (error) {
      console.error('Erro:', error);
      mostrarFeedback('❌ Erro ao remover gasto');
    }
  };

  // Editar faturamento
  const handleEditarFaturamento = () => {
    setEdicaoValor(dadosDiaAtual.faturamento.toString());
    setEditandoFaturamento(true);
  };

  // Salvar edição de faturamento via API
  const handleSalvarEdicaoFaturamento = async () => {
    if (!edicaoValor || parseFloat(edicaoValor) <= 0) {
      mostrarFeedback('⚠️ Digite um valor válido');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/financial/revenue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dataSelecionada,
          amount: parseFloat(edicaoValor),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar faturamento');
      }

      setDados(prevDados => {
        const novosDados = [...prevDados];
        const indexDia = novosDados.findIndex(d => d.data === dataSelecionada);

        if (indexDia >= 0) {
          novosDados[indexDia].faturamento = parseFloat(edicaoValor);
        }

        return novosDados;
      });

      setEditandoFaturamento(false);
      setEdicaoValor('');
      mostrarFeedback('✅ Faturamento atualizado!');
    } catch (error) {
      console.error('Erro:', error);
      mostrarFeedback('❌ Erro ao atualizar faturamento');
    }
  };

  // Editar gasto
  const handleEditarGasto = (gasto) => {
    setEdicaoValor(gasto.valor.toString());
    setEdicaoNome(gasto.nome);
    setEditandoGastoId(gasto.id);
  };

  // Salvar edição de gasto via API
  const handleSalvarEdicaoGasto = async () => {
    if (!edicaoValor || parseFloat(edicaoValor) <= 0) {
      mostrarFeedback('⚠️ Digite um valor válido');
      return;
    }

    if (!edicaoNome.trim()) {
      mostrarFeedback('⚠️ Digite um nome válido');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/financial/expenses/${editandoGastoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: edicaoNome.trim(),
          amount: parseFloat(edicaoValor),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar gasto');
      }

      setDados(prevDados => {
        const novosDados = [...prevDados];
        const indexDia = novosDados.findIndex(d => d.data === dataSelecionada);

        if (indexDia >= 0) {
          const gasto = novosDados[indexDia].gastos.find(g => g.id === editandoGastoId);
          if (gasto) {
            gasto.valor = parseFloat(edicaoValor);
            gasto.nome = edicaoNome.trim();
          }
        }

        return novosDados;
      });

      setEditandoGastoId(null);
      setEdicaoValor('');
      setEdicaoNome('');
      mostrarFeedback('✅ Gasto atualizado!');
    } catch (error) {
      console.error('Erro:', error);
      mostrarFeedback('❌ Erro ao atualizar gasto');
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoFaturamento(false);
    setEditandoGastoId(null);
    setEdicaoValor('');
    setEdicaoNome('');
  };

  // Preparar dados para gráficos
  const prepararDadosGraficos = () => {
    return dados
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .map(d => ({
        data: d.data,
        faturamento: d.faturamento,
        gastos: d.gastos.reduce((acc, g) => acc + g.valor, 0),
        lucro: d.faturamento - d.gastos.reduce((acc, g) => acc + g.valor, 0),
      }));
  };

  const dadosGraficos = prepararDadosGraficos();

  // Se ainda estiver carregando
  if (carregando) {
    return (
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <DollarSign size={48} className="text-orange-500" />
            </div>
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8" data-sidebar-layout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={32} className="text-orange-500" />
              <h1 className="text-4xl font-bold text-gray-100">Planilha</h1>
            </div>
            <p className="text-gray-400">Controla ai cachorro</p>
          </div>

          {}
          {feedbackMsg && (
            <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500 rounded-lg text-orange-300 animate-pulse">
              {feedbackMsg}
            </div>
          )}

        {/* Resumo do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border-t-4 border-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">FATURAMENTO</p>
                <p className="text-3xl font-bold text-emerald-400">
                  R$ {(dadosDiaAtual.faturamento || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="text-emerald-400" size={32} />
                <button
                  onClick={handleEditarFaturamento}
                  className="p-2 hover:bg-emerald-500/20 rounded-lg transition text-emerald-400 hover:text-emerald-300"
                >
                  <Edit2 size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border-t-4 border-red-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">GASTOS</p>
                <p className="text-3xl font-bold text-red-400">
                  R$ {totalGastos.toFixed(2)}
                </p>
              </div>
              <PieChartIcon className="text-red-400" size={32} />
            </div>
          </div>

          <div
            className={`bg-zinc-900 rounded-lg shadow-md p-6 border-t-4 ${
              lucro >= 0 ? 'border-orange-500' : 'border-red-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">LUCRO</p>
                <p className={`text-3xl font-bold ${lucro >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                  R$ {lucro.toFixed(2)}
                </p>
              </div>
              <TrendingUp className={lucro >= 0 ? 'text-orange-400' : 'text-red-400'} size={32} />
            </div>
          </div>
        </div>

        {/* Seletor de Data */}
        <div className="bg-zinc-900 rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Selecionar Data
          </label>
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Seção de Formulários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Formulário de Faturamento */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Registrar Faturamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Valor do Faturamento
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2 text-gray-500">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={faturamentoDia}
                      onChange={(e) => setFaturamentoDia(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500"
                    />
                  </div>
                  <button
                    onClick={handleSalvarFaturamento}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Gastos */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Adicionar Gasto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nome do Gasto
                </label>
                <input
                  type="text"
                  placeholder="Ex:Anúncio, Fumo..."
                  value={despesaNome}
                  onChange={(e) => setDespesaNome(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={despesaValor}
                    onChange={(e) => setDespesaValor(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAdicionarGasto}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
              >
                Adicionar Gasto
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Gastos */}
        <div className="bg-zinc-900 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Gastos do Dia</h2>
          {dadosDiaAtual.gastos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum gasto registrado para este dia</p>
          ) : (
            <div className="space-y-3">
              {dadosDiaAtual.gastos.map((gasto) => (
                <div
                  key={gasto.id}
                  className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:border-red-500 transition"
                >
                  <div className="flex-1">
                    <p className="text-gray-100 font-semibold">{gasto.nome}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-400">
                      -R$ {gasto.valor.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleEditarGasto(gasto)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleRemoverGasto(gasto.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Edição */}
        {(editandoFaturamento || editandoGastoId) && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-sm w-full border border-zinc-700 shadow-lg">
              <h3 className="text-lg font-bold text-gray-100 mb-4">
                {editandoFaturamento ? 'Editar Faturamento' : 'Editar Gasto'}
              </h3>

              {editandoGastoId && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Nome do Gasto
                  </label>
                  <input
                    type="text"
                    value={edicaoNome}
                    onChange={(e) => setEdicaoNome(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={edicaoValor}
                    onChange={(e) => setEdicaoValor(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelarEdicao}
                  className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={editandoFaturamento ? handleSalvarEdicaoFaturamento : handleSalvarEdicaoGasto}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Coluna - Faturamento, Gastos e Lucro */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-100 mb-4">Faturamento vs Gastos vs Lucro</h3>
            {dadosGraficos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sem dados para exibir</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGraficos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="data" style={{ fontSize: '12px', fill: '#999' }} />
                  <YAxis style={{ fontSize: '12px', fill: '#999' }} />
                  <Tooltip
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#27272a', border: '1px solid #666', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="faturamento" fill="#10b981" radius={[8, 8, 0, 0]} name="Faturamento" />
                  <Bar dataKey="gastos" fill="#ef4444" radius={[8, 8, 0, 0]} name="Gastos" />
                  <Bar dataKey="lucro" fill="#f97316" radius={[8, 8, 0, 0]} name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico de Área - Lucro */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-100 mb-4">Evolução do Lucro</h3>
            {dadosGraficos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sem dados para exibir</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosGraficos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="data" style={{ fontSize: '12px', fill: '#999' }} />
                  <YAxis style={{ fontSize: '12px', fill: '#999' }} />
                  <Tooltip
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#27272a', border: '1px solid #666', color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    fill="#f97316"
                    stroke="#f97316"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardFinanceiro;
