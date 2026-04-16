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
import { financialService } from '../services/api';
import './Dashboard.css';

function DashboardFinanceiro() {
  const navigate = useNavigate();

  // ============================================
  // ESTADOS
  // ============================================
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

  // ============================================
  // EFEITOS
  // ============================================

  // Verifica autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Carrega dados do dia
  useEffect(() => {
    carregarDadosDia();
  }, [dataSelecionada]);

  // Carrega todos os dados para gráficos
  useEffect(() => {
    carregarTodosDados();
  }, []);

  // ============================================
  // FUNÇÕES DE API
  // ============================================

  const carregarDadosDia = async () => {
    try {
      setLoading(true);
      const response = await financialService.getDayData(dataSelecionada);
      setDados({
        faturamento: response.data.faturamento || 0,
        gastos: response.data.gastos || [],
        totalGastos: response.data.totalGastos || 0,
        lucro: response.data.lucro || 0,
      });
      setFaturamentoDia(response.data.faturamento?.toString() || '');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarFeedback('Erro ao carregar dados do dia', 'error');
    } finally {
      setLoading(false);
    }
  };

  const carregarTodosDados = async () => {
    try {
      const response = await financialService.getSummary();
      setTodosOsDados(response.data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
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

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const mostrarFeedback = (msg, tipo) => {
    setFeedback(msg);
    setTipoFeedback(tipo);
    setTimeout(() => setFeedback(''), 4000);
  };

  // Prepara dados para gráficos
  const prepararDadosGraficos = () => {
    const mapa = {};

    // Processa receitas
    todosOsDados.revenues.forEach((rev) => {
      if (!mapa[rev.date]) {
        mapa[rev.date] = { date: rev.date, faturamento: 0, gastos: 0 };
      }
      mapa[rev.date].faturamento = parseFloat(rev.amount);
    });

    // Processa despesas
    todosOsDados.expenses.forEach((exp) => {
      if (!mapa[exp.date]) {
        mapa[exp.date] = { date: exp.date, faturamento: 0, gastos: 0 };
      }
      mapa[exp.date].gastos += parseFloat(exp.amount);
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
            <h1 className="text-3xl font-bold text-white mb-2">💰 Dashboard Financeiro</h1>
            <p className="text-zinc-400">Gerenie seu faturamento e despesas diárias</p>
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
            <label className="block text-white font-semibold mb-2">📅 Selecione a Data</label>
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
                <div className="text-4xl">📊</div>
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
                <div className="text-4xl">💸</div>
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
                <div className="text-4xl">{dados.lucro >= 0 ? '📈' : '📉'}</div>
              </div>
            </div>
          </div>

          {/* SEÇÃO DE ENTRADA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* FATURAMENTO */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                📊 Registrar Faturamento
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
                  ✅ Salvar Faturamento
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
                ➕ Adicionar Gasto
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
            <h2 className="text-xl font-bold text-white mb-4">📋 Gastos do Dia</h2>

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
              <h2 className="text-xl font-bold text-white mb-4">📊 Faturamento vs Gastos vs Lucro</h2>
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
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
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
              <h2 className="text-xl font-bold text-white mb-4">📈 Evolução do Lucro</h2>
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
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
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
        </div>
      </div>

      {/* MODAL EDITAR FATURAMENTO */}
      {modalEditFaturamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">✏️ Editar Faturamento</h3>
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
              <h3 className="text-xl font-bold text-white">✏️ Editar Gasto</h3>
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
import { Trash2, TrendingUp, DollarSign, PieChart as PieChartIcon, Edit2, Loader } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import financeiroService from '../services/financeiroService';

const DashboardFinanceiro = () => {
  const navigate = useNavigate();

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
  const [salvando, setSalvando] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    carregarDados();
  }, [navigate]);

  // Carregar dados financeiros
  const carregarDados = async () => {
    try {
      setCarregando(true);
      const dadosAPI = await financeiroService.getDados();
      setDados(dadosAPI);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarFeedback('❌ Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  };

  // Mostrar feedback temporário
  const mostrarFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Buscar dados do dia atual
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

  // Salvar faturamento
  const handleSalvarFaturamento = async () => {
    if (!faturamentoDia || parseFloat(faturamentoDia) <= 0) {
      mostrarFeedback('⚠️ Digite um valor válido para faturamento');
      return;
    }

    try {
      setSalvando(true);
      await financeiroService.salvarFaturamento(dataSelecionada, faturamentoDia);
      
      // Recarregar dados
      await carregarDados();
      setFaturamentoDia('');
      mostrarFeedback('✅ Faturamento registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar faturamento:', error);
      mostrarFeedback('❌ Erro ao salvar faturamento');
    } finally {
      setSalvando(false);
    }
  };

  // Adicionar gasto
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
      setSalvando(true);
      await financeiroService.adicionarGasto(dataSelecionada, despesaNome, despesaValor);
      
      // Recarregar dados
      await carregarDados();
      setDespesaValor('');
      setDespesaNome('');
      mostrarFeedback('✅ Gasto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      mostrarFeedback('❌ Erro ao adicionar gasto');
    } finally {
      setSalvando(false);
    }
  };

  // Remover gasto
  const handleRemoverGasto = async (idGasto) => {
    try {
      setSalvando(true);
      await financeiroService.deletarGasto(idGasto);
      
      // Recarregar dados
      await carregarDados();
      mostrarFeedback('✅ Gasto removido!');
    } catch (error) {
      console.error('Erro ao remover gasto:', error);
      mostrarFeedback('❌ Erro ao remover gasto');
    } finally {
      setSalvando(false);
    }
  };

  // Editar faturamento
  const handleEditarFaturamento = () => {
    setEdicaoValor(dadosDiaAtual.faturamento.toString());
    setEditandoFaturamento(true);
  };

  const handleSalvarEdicaoFaturamento = async () => {
    if (!edicaoValor || parseFloat(edicaoValor) <= 0) {
      mostrarFeedback('⚠️ Digite um valor válido');
      return;
    }

    try {
      setSalvando(true);
      await financeiroService.editarFaturamento(dataSelecionada, edicaoValor);
      
      // Recarregar dados
      await carregarDados();
      setEditandoFaturamento(false);
      setEdicaoValor('');
      mostrarFeedback('✅ Faturamento atualizado!');
    } catch (error) {
      console.error('Erro ao editar faturamento:', error);
      mostrarFeedback('❌ Erro ao editar faturamento');
    } finally {
      setSalvando(false);
    }
  };

  // Editar gasto
  const handleEditarGasto = (gasto) => {
    setEdicaoValor(gasto.valor.toString());
    setEdicaoNome(gasto.nome);
    setEditandoGastoId(gasto.id);
  };

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
      setSalvando(true);
      await financeiroService.editarGasto(editandoGastoId, edicaoNome, edicaoValor);
      
      // Recarregar dados
      await carregarDados();
      setEditandoGastoId(null);
      setEdicaoValor('');
      setEdicaoNome('');
      mostrarFeedback('✅ Gasto atualizado!');
    } catch (error) {
      console.error('Erro ao editar gasto:', error);
      mostrarFeedback('❌ Erro ao editar gasto');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoFaturamento(false);
    setEditandoGastoId(null);
    setEdicaoValor('');
    setEdicaoNome('');
  };

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

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-orange-500" size={40} />
          <p className="text-gray-400">Carregando dados...</p>
        </div>
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

          {/* Feedback Message */}
          {feedbackMsg && (
            <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500 rounded-lg text-orange-300 animate-pulse">
              {feedbackMsg}
            </div>
          )}

          {/* Loading Overlay */}
          {salvando && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
              <Loader className="animate-spin text-orange-500" size={40} />
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
                  disabled={salvando}
                  className="p-2 hover:bg-emerald-500/20 rounded-lg transition text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
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
                      disabled={salvando}
                      className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleSalvarFaturamento}
                    disabled={salvando || !faturamentoDia}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {salvando ? <Loader size={20} className="animate-spin" /> : 'Salvar'}
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
                  placeholder="Ex: Anúncio, Fumo..."
                  value={despesaNome}
                  onChange={(e) => setDespesaNome(e.target.value)}
                  disabled={salvando}
                  className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50"
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
                    disabled={salvando}
                    className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                onClick={handleAdicionarGasto}
                disabled={salvando || !despesaNome || !despesaValor}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? <Loader size={20} className="animate-spin mx-auto" /> : 'Adicionar Gasto'}
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
                      disabled={salvando}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleRemoverGasto(gasto.id)}
                      disabled={salvando}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400 hover:text-red-300 disabled:opacity-50"
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
                    disabled={salvando}
                    className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                    disabled={salvando}
                    className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelarEdicao}
                  disabled={salvando}
                  className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={editandoFaturamento ? handleSalvarEdicaoFaturamento : handleSalvarEdicaoGasto}
                  disabled={salvando}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {salvando ? <Loader size={20} className="animate-spin mx-auto" /> : 'Salvar'}
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
