import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CopilotSummaryCards from '../components/CopilotSummaryCards';
import { financialService } from '../services/api';

function DashboardFinanceiro() {
  const navigate = useNavigate();

  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [faturamentoDia, setFaturamentoDia] = useState('');
  const [despesaNome, setDespesaNome] = useState('');
  const [despesaValor, setDespesaValor] = useState('');

  const [dados, setDados] = useState({
    faturamento: 0,
    gastos: [],
    totalGastos: 0,
    lucro: 0,
  });

  const [todosOsDados, setTodosOsDados] = useState({
    revenues: [],
    expenses: [],
  });

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [tipoFeedback, setTipoFeedback] = useState(''); // 'success' ou 'error'

  // Modais
  const [modalEditFaturamento, setModalEditFaturamento] = useState(false);
  const [modalEditGasto, setModalEditGasto] = useState(false);
  const [gastoEmEdicao, setGastoEmEdicao] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    console.log('📅 Carregando dados para a data:', dataSelecionada);
    carregarDadosDia();
    carregarTodosDados();
  }, [dataSelecionada]);

  const carregarDadosDia = async () => {
    try {
      setLoading(true);
      console.log('🔄 Requisição: GET /api/financeiro/day/' + dataSelecionada);
      const response = await financialService.getDayData(dataSelecionada);
      console.log('✅ Resposta recebida:', response.data);
      setDados({
        faturamento: response.data.faturamento || 0,
        gastos: response.data.gastos || [],
        totalGastos: response.data.totalGastos || 0,
        lucro: response.data.lucro || 0,
      });
      setFaturamentoDia(response.data.faturamento?.toString() || '');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error.response?.data || error.message);
      mostrarFeedback('❌ Erro ao carregar dados: ' + (error.response?.data?.error || error.message), 'error');
      setDados({
        faturamento: 0,
        gastos: [],
        totalGastos: 0,
        lucro: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarTodosDados = async () => {
    try {
      console.log('🔄 Requisição: GET /api/financeiro/summary');
      const response = await financialService.getSummary();
      console.log('✅ Resposta recebida:', response.data);
      
      // 🛡️ BLINDAGEM: Garante que revenues e expenses sejam arrays
      setTodosOsDados({
        revenues: Array.isArray(response.data?.revenues) ? response.data.revenues : [],
        expenses: Array.isArray(response.data?.expenses) ? response.data.expenses : [],
      });
    } catch (error) {
      console.error('❌ Erro ao carregar resumo:', error.response?.data || error.message);
      setTodosOsDados({ revenues: [], expenses: [] });
    }
  };

  const salvarFaturamento = async () => {
    if (!faturamentoDia || isNaN(faturamentoDia)) {
      mostrarFeedback('Digite um valor válido', 'error');
      return;
    }

    try {
      await financialService.addRevenue(dataSelecionada, parseFloat(faturamentoDia));
      mostrarFeedback('✅ Faturamento salvo com sucesso!', 'success');
      await carregarDadosDia();
      await carregarTodosDados();
    } catch (error) {
      console.error('Erro ao salvar faturamento:', error);
      mostrarFeedback('Erro ao salvar faturamento', 'error');
    }
  };

  const adicionarGasto = async () => {
    if (!despesaNome || !despesaValor || isNaN(despesaValor)) {
      mostrarFeedback('Preencha nome e valor válido', 'error');
      return;
    }

    try {
      await financialService.addExpense(
        dataSelecionada,
        despesaNome,
        parseFloat(despesaValor)
      );
      mostrarFeedback('✅ Gasto adicionado com sucesso!', 'success');
      setDespesaNome('');
      setDespesaValor('');
      await carregarDadosDia();
      await carregarTodosDados();
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      mostrarFeedback('Erro ao adicionar gasto', 'error');
    }
  };

  const deletarGasto = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar?')) return;

    try {
      await financialService.deleteExpense(id);
      mostrarFeedback('✅ Gasto deletado com sucesso!', 'success');
      await carregarDadosDia();
      await carregarTodosDados();
    } catch (error) {
      console.error('Erro ao deletar gasto:', error);
      mostrarFeedback('Erro ao deletar gasto', 'error');
    }
  };

  const abrirModalEditGasto = (gasto) => {
    setGastoEmEdicao({
      id: gasto.id,
      nome: gasto.name,
      valor: gasto.amount.toString(),
    });
    setModalEditGasto(true);
  };

  const editarGasto = async () => {
    if (!gastoEmEdicao.nome || !gastoEmEdicao.valor || isNaN(gastoEmEdicao.valor)) {
      mostrarFeedback('Preencha nome e valor válido', 'error');
      return;
    }

    try {
      await financialService.updateExpense(
        gastoEmEdicao.id,
        gastoEmEdicao.nome,
        parseFloat(gastoEmEdicao.valor)
      );
      mostrarFeedback('✅ Gasto atualizado com sucesso!', 'success');
      setModalEditGasto(false);
      setGastoEmEdicao(null);
      await carregarDadosDia();
      await carregarTodosDados();
    } catch (error) {
      console.error('Erro ao editar gasto:', error);
      mostrarFeedback('Erro ao editar gasto', 'error');
    }
  };

  const mostrarFeedback = (msg, tipo) => {
    setFeedback(msg);
    setTipoFeedback(tipo);
    setTimeout(() => setFeedback(''), 4000);
  };

  // Prepara dados para gráficos
  const prepararDadosGraficos = () => {
    const mapa = {};

    // 🛡️ BLINDAGEM: Sempre arrays
    const revenues = Array.isArray(todosOsDados.revenues) ? todosOsDados.revenues : [];
    const expenses = Array.isArray(todosOsDados.expenses) ? todosOsDados.expenses : [];

    // Processa receitas
    revenues.forEach((rev) => {
      if (!mapa[rev.date]) {
        mapa[rev.date] = { date: rev.date, faturamento: 0, gastos: 0 };
      }
      mapa[rev.date].faturamento = parseFloat(rev.amount || 0);
    });

    // Processa despesas
    expenses.forEach((exp) => {
      if (!mapa[exp.date]) {
        mapa[exp.date] = { date: exp.date, faturamento: 0, gastos: 0 };
      }
      mapa[exp.date].gastos += parseFloat(exp.amount || 0);
    });

    // Calcula lucro e ordena
    return Object.values(mapa)
      .map((item) => ({
        ...item,
        lucro: item.faturamento - item.gastos,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Últimos 30 dias
  };

  const dadosGraficos = prepararDadosGraficos();

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  if (loading) {
    return (
      <div className="flex h-screen bg-zinc-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Planilha</h1>
            <p className="text-zinc-400">controla ai dog</p>
          </div>

          {/* FEEDBACK */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                tipoFeedback === 'success'
                  ? 'bg-green-900 border border-green-700 text-green-100'
                  : 'bg-red-900 border border-red-700 text-red-100'
              }`}
            >
              {feedback}
            </div>
          )}

          {/* DATA SELECTOR */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-2">Selecione a Data</label>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* CARDS DE RESUMO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Faturamento */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Faturamento</p>
                  <p className="text-3xl font-bold text-green-400">
                    R$ {dados.faturamento.toFixed(2)}
                  </p>
                </div>
                <div className="text-4xl"></div>
              </div>
            </div>

            {/* Gastos */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Gastos</p>
                  <p className="text-3xl font-bold text-red-400">
                    R$ {dados.totalGastos.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Lucro */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Lucro</p>
                  <p
                    className={`text-3xl font-bold ${
                      dados.lucro >= 0 ? 'text-orange-400' : 'text-red-500'
                    }`}
                  >
                    R$ {dados.lucro.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO DE ENTRADA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* FATURAMENTO */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                Registrar Faturamento
              </h2>

              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Valor do faturamento"
                  value={faturamentoDia}
                  onChange={(e) => setFaturamentoDia(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  step="0.01"
                />

                <button
                  onClick={salvarFaturamento}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition duration-200"
                >
                  Salvar Faturamento
                </button>

                {faturamentoDia && (
                  <button
                    onClick={() => setModalEditFaturamento(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={18} /> Editar Faturamento
                  </button>
                )}
              </div>
            </div>

            {/* ADICIONAR GASTO */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 Adicionar Gasto
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome do gasto (ex: Café)"
                  value={despesaNome}
                  onChange={(e) => setDespesaNome(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />

                <input
                  type="number"
                  placeholder="Valor do gasto"
                  value={despesaValor}
                  onChange={(e) => setDespesaValor(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  step="0.01"
                />

                <button
                  onClick={adicionarGasto}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Adicionar Gasto
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE GASTOS */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Gastos do Dia</h2>

            {dados.gastos.length === 0 ? (
              <p className="text-zinc-400 text-center py-8">Nenhum gasto registrado neste dia</p>
            ) : (
              <div className="space-y-2">
                {dados.gastos.map((gasto) => (
                  <div
                    key={gasto.id}
                    className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:border-zinc-600 transition"
                  >
                    <div className="flex-1">
                      <p className="text-white font-semibold">{gasto.name}</p>
                      <p className="text-zinc-400 text-sm">
                        R$ {parseFloat(gasto.amount).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModalEditGasto(gasto)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => deletarGasto(gasto.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GRÁFICOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* GRÁFICO DE BARRAS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Faturamento vs Gastos vs Lucro</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGraficos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => `R$ ${Number(value || 0).toFixed(2)}`}
                  />
                  <Legend />
                  <Bar dataKey="faturamento" fill="#22c55e" name="Faturamento" />
                  <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
                  <Bar dataKey="lucro" fill="#f97316" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* GRÁFICO DE ÁREA */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Evolução do Lucro</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosGraficos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => `R$ ${Number(value || 0).toFixed(2)}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    fill="#f97316"
                    stroke="#ea580c"
                    name="Lucro"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CARDS DE RESUMO - COPILOT SECTION */}
          <CopilotSummaryCards todosOsDados={todosOsDados} dataSelecionada={dataSelecionada} />
        </div>
      </div>

      {/* MODAL EDITAR FATURAMENTO */}
      {modalEditFaturamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Editar Faturamento</h3>
              <button
                onClick={() => setModalEditFaturamento(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <input
              type="number"
              value={faturamentoDia}
              onChange={(e) => setFaturamentoDia(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4 focus:border-orange-500 focus:outline-none"
              step="0.01"
            />

            <div className="flex gap-2">
              <button
                onClick={salvarFaturamento}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
              >
                ✅ Salvar
              </button>
              <button
                onClick={() => setModalEditFaturamento(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-lg transition"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR GASTO */}
      {modalEditGasto && gastoEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Editar Gasto</h3>
              <button
                onClick={() => setModalEditGasto(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Nome do gasto"
              value={gastoEmEdicao.nome}
              onChange={(e) =>
                setGastoEmEdicao({ ...gastoEmEdicao, nome: e.target.value })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4 focus:border-orange-500 focus:outline-none"
            />

            <input
              type="number"
              placeholder="Valor do gasto"
              value={gastoEmEdicao.valor}
              onChange={(e) =>
                setGastoEmEdicao({ ...gastoEmEdicao, valor: e.target.value })
              }
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4 focus:border-orange-500 focus:outline-none"
              step="0.01"
            />

            <div className="flex gap-2">
              <button
                onClick={editarGasto}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
              >
                ✅ Salvar
              </button>
              <button
                onClick={() => setModalEditGasto(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-lg transition"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardFinanceiro;
