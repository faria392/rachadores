import React, { useState, useEffect } from 'react';
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
import { Trash2, TrendingUp, DollarSign, PieChart as PieChartIcon } from 'lucide-react';

const DashboardFinanceiro = () => {
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [faturamentoDia, setFaturamentoDia] = useState('');
  const [despesaValor, setDespesaValor] = useState('');
  const [despesaCategoria, setDespesaCategoria] = useState('Alimentação');
  const [despesaDescricao, setDespesaDescricao] = useState('');
  const [dados, setDados] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const categorias = ['Alimentação', 'Transporte', 'Marketing', 'Tecnologia', 'Outros'];

  // Carregar dados do localStorage
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dashboardFinanceiro');
    if (dadosSalvos) {
      try {
        setDados(JSON.parse(dadosSalvos));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('dashboardFinanceiro', JSON.stringify(dados));
  }, [dados]);

  // Obter dados do dia selecionado
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

  // Salvar faturamento
  const handleSalvarFaturamento = () => {
    if (!faturamentoDia || parseFloat(faturamentoDia) <= 0) {
      mostrarFeedback('⚠️ Digite um valor válido para faturamento');
      return;
    }

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

      return novosDados;
    });

    setFaturamentoDia('');
    mostrarFeedback('✅ Faturamento registrado com sucesso!');
  };

  // Adicionar gasto
  const handleAdicionarGasto = () => {
    if (!despesaValor || parseFloat(despesaValor) <= 0) {
      mostrarFeedback('⚠️ Digite um valor válido para gasto');
      return;
    }

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
        id: Date.now(),
        valor: parseFloat(despesaValor),
        categoria: despesaCategoria,
        descricao: despesaDescricao,
      });

      return novosDados;
    });

    setDespesaValor('');
    setDespesaDescricao('');
    mostrarFeedback('✅ Gasto adicionado com sucesso!');
  };

  // Remover gasto
  const handleRemoverGasto = (idGasto) => {
    setDados(prevDados => {
      const novosDados = [...prevDados];
      const indexDia = novosDados.findIndex(d => d.data === dataSelecionada);

      if (indexDia >= 0) {
        novosDados[indexDia].gastos = novosDados[indexDia].gastos.filter(g => g.id !== idGasto);
      }

      return novosDados;
    });

    mostrarFeedback('✅ Gasto removido!');
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

  // Preparar dados para gráfico de categorias
  const prepararDadosCategorias = () => {
    const categoriasTotais = {};
    categorias.forEach(cat => {
      categoriasTotais[cat] = 0;
    });

    dadosDiaAtual.gastos.forEach(gasto => {
      if (categoriasTotais.hasOwnProperty(gasto.categoria)) {
        categoriasTotais[gasto.categoria] += gasto.valor;
      }
    });

    return Object.entries(categoriasTotais)
      .filter(([_, valor]) => valor > 0)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
      }));
  };

  const dadosGraficos = prepararDadosGraficos();
  const dadosCategorias = prepararDadosCategorias();

  const cores = {
    faturamento: '#10b981',
    gastos: '#ef4444',
    lucro: '#3b82f6',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Dashboard Financeiro</h1>
          <p className="text-gray-600">Controle seu faturamento e gastos em tempo real</p>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 animate-pulse">
            {feedbackMsg}
          </div>
        )}

        {/* Resumo do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">FATURAMENTO</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {(dadosDiaAtual.faturamento || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">GASTOS</p>
                <p className="text-3xl font-bold text-red-600">
                  R$ {totalGastos.toFixed(2)}
                </p>
              </div>
              <PieChartIcon className="text-red-500" size={32} />
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${
              lucro >= 0 ? 'border-blue-500' : 'border-red-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">LUCRO</p>
                <p className={`text-3xl font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {lucro.toFixed(2)}
                </p>
              </div>
              <TrendingUp className={lucro >= 0 ? 'text-blue-500' : 'text-red-500'} size={32} />
            </div>
          </div>
        </div>

        {/* Seletor de Data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Selecionar Data
          </label>
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Seção de Formulários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Formulário de Faturamento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💵 Registrar Faturamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSalvarFaturamento}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Gastos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🛒 Adicionar Gasto</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={despesaCategoria}
                    onChange={(e) => setDespesaCategoria(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Almoço com cliente"
                  value={despesaDescricao}
                  onChange={(e) => setDespesaDescricao(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAdicionarGasto}
                className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
              >
                Adicionar Gasto
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Gastos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Gastos do Dia</h2>
          {dadosDiaAtual.gastos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum gasto registrado para este dia</p>
          ) : (
            <div className="space-y-3">
              {dadosDiaAtual.gastos.map(gasto => (
                <div
                  key={gasto.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-red-300 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div>
                        <p className="font-semibold text-gray-900">{gasto.categoria}</p>
                        {gasto.descricao && (
                          <p className="text-sm text-gray-600">{gasto.descricao}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-red-600">
                      -R$ {gasto.valor.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoverGasto(gasto.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Linha - Faturamento, Gastos e Lucro */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Faturamento vs Gastos vs Lucro</h3>
            {dadosGraficos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sem dados para exibir</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosGraficos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="faturamento"
                    stroke={cores.faturamento}
                    dot={{ fill: cores.faturamento, r: 4 }}
                    strokeWidth={2}
                    name="Faturamento"
                  />
                  <Line
                    type="monotone"
                    dataKey="gastos"
                    stroke={cores.gastos}
                    dot={{ fill: cores.gastos, r: 4 }}
                    strokeWidth={2}
                    name="Gastos"
                  />
                  <Line
                    type="monotone"
                    dataKey="lucro"
                    stroke={cores.lucro}
                    dot={{ fill: cores.lucro, r: 4 }}
                    strokeWidth={2}
                    name="Lucro"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico de Área - Lucro */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💹 Evolução do Lucro</h3>
            {dadosGraficos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sem dados para exibir</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosGraficos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    fill={cores.lucro}
                    stroke={cores.lucro}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico de Categorias */}
        {dadosCategorias.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Gastos por Categoria (Hoje)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosCategorias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value) => `R$ ${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}
                />
                <Bar dataKey="valor" fill={cores.gastos} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFinanceiro;
