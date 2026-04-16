import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, RefreshCw, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { contasChinesesService } from '../services/api';
import '../pages/ContasChinesas.css';

const ContasChinesas = () => {
  const navigate = useNavigate();
  const [contas69B, setContas69B] = useState([]);
  const [contas69A, setContas69A] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const MOCK_DATA_69B = [];

  const MOCK_DATA_69A = [];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await contasChinesesService.getAll();
      const contas = response.data || [];
      
      const contas69B = contas.filter(c => c.dominio === '69B');
      const contas69A = contas.filter(c => c.dominio === '69A');
      
      setContas69B(contas69B.length > 0 ? contas69B : MOCK_DATA_69B);
      setContas69A(contas69A.length > 0 ? contas69A : MOCK_DATA_69A);
    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
      // Se falhar, usa dados mockados
      setContas69B(MOCK_DATA_69B);
      setContas69A(MOCK_DATA_69A);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      setSaving(true);
      
      // Sincronizar dados com a API
      for (const conta of contas69B) {
        if (conta.id > 1000000) { // Novos registros têm IDs temporários
          await contasChinesesService.addConta({
            ...conta,
            dominio: '69B'
          });
        } else {
          await contasChinesesService.updateConta(conta.id, {
            ...conta,
            dominio: '69B'
          });
        }
      }
      
      for (const conta of contas69A) {
        if (conta.id > 1000000) { // Novos registros têm IDs temporários
          await contasChinesesService.addConta({
            ...conta,
            dominio: '69A'
          });
        } else {
          await contasChinesesService.updateConta(conta.id, {
            ...conta,
            dominio: '69A'
          });
        }
      }
      
      setFeedback('✓ Dados salvos com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
      
      // Recarregar para sincronizar IDs
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setFeedback('✗ Erro ao salvar dados');
      setTimeout(() => setFeedback(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateConta = (tipo, id, field, value) => {
    const setter = tipo === '69B' ? setContas69B : setContas69A;
    const data = tipo === '69B' ? contas69B : contas69A;

    const updated = data.map(conta =>
      conta.id === id ? { ...conta, [field]: value } : conta
    );
    setter(updated);
  };

  const addConta = (tipo) => {
    const setter = tipo === '69B' ? setContas69B : setContas69A;
    const data = tipo === '69B' ? contas69B : contas69A;

    // Gerar um ID temporário para novos registros
    const newId = Date.now() + Math.random() * 1000000;
    const novaConta = {
      id: newId,
      telefone: '',
      pix: '',
      cpf: '',
      nome: '',
      saldo: 0,
      status: 'Ativa',
      tipo: 'NOVA',
      dominio: tipo === '69B' ? '69B' : '69A'
    };
    setter([...data, novaConta]);
  };

  const deleteConta = async (tipo, id) => {
    try {
      // Se for um ID temporário, apenas remove localmente
      if (id > 1000000) {
        const setter = tipo === '69B' ? setContas69B : setContas69A;
        const data = tipo === '69B' ? contas69B : contas69A;
        setter(data.filter(conta => conta.id !== id));
      } else {
        // Deleta da API
        await contasChinesesService.deleteConta(id);
        
        const setter = tipo === '69B' ? setContas69B : setContas69A;
        const data = tipo === '69B' ? contas69B : contas69A;
        setter(data.filter(conta => conta.id !== id));
        
        setFeedback('✓ Conta removida com sucesso!');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      setFeedback('✗ Erro ao remover conta');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const calculateTotals = (contas) => {
    return {
      totalSaldo: contas.reduce((sum, c) => sum + Number(c.saldo || 0), 0),
      totalContas: contas.length,
      contasAtivas: contas.filter(c => c.status === 'Ativa').length,
      contasInativas: contas.filter(c => c.status === 'Inativa').length,
    };
  };

  const totals69B = calculateTotals(contas69B);
  const totals69A = calculateTotals(contas69A);

  const TabelaContas = ({ titulo, dominio, contas, tipo }) => {
    const totals = tipo === '69B' ? totals69B : totals69A;

    return (
      <div className="tabela-container">
        <h2 className="tabela-titulo">EDITAR {titulo} - {dominio}</h2>
        
        <div className="tabela-wrapper">
          <table className="tabela-contas">
            <thead>
              <tr>
                <th>Telefone</th>
                <th>Chave Pix</th>
                <th>CPF</th>
                <th>Nome</th>
                <th>Saldo (R$)</th>
                <th>Status</th>
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta, idx) => (
                <tr key={conta.id} className={idx % 2 === 0 ? 'zebra-par' : 'zebra-impar'}>
                  <td className="celula-telefone">
                    <input
                      type="text"
                      value={conta.telefone}
                      onChange={(e) => updateConta(tipo, conta.id, 'telefone', e.target.value)}
                      placeholder="11987654321"
                    />
                  </td>
                  <td className="celula-editavel">
                    <input
                      type="text"
                      value={conta.pix}
                      onChange={(e) => updateConta(tipo, conta.id, 'pix', e.target.value)}
                      placeholder="Digite a chave PIX"
                      className="input-pix"
                    />
                  </td>
                  <td className="celula-cpf">
                    <input
                      type="text"
                      value={conta.cpf}
                      onChange={(e) => updateConta(tipo, conta.id, 'cpf', e.target.value)}
                      placeholder="123.456.789-00"
                    />
                  </td>
                  <td className="celula-nome">
                    <input
                      type="text"
                      value={conta.nome}
                      onChange={(e) => updateConta(tipo, conta.id, 'nome', e.target.value)}
                      placeholder="Nome do cliente"
                    />
                  </td>
                  <td className={`celula-saldo celula-editavel ${Number(conta.saldo) < 0 ? 'negativo' : ''}`}>
                    <input
                      type="number"
                      value={conta.saldo}
                      onChange={(e) => updateConta(tipo, conta.id, 'saldo', Number(e.target.value))}
                      placeholder="0.00"
                      step="0.01"
                      className="input-saldo"
                    />
                  </td>
                  <td className="celula-status">
                    <select
                      value={conta.status}
                      onChange={(e) => updateConta(tipo, conta.id, 'status', e.target.value)}
                      className={`select-status ${conta.status === 'Ativa' ? 'ativa' : 'inativa'}`}
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                    </select>
                  </td>
                  <td className="celula-tipo">
                    <select
                      value={conta.tipo}
                      onChange={(e) => updateConta(tipo, conta.id, 'tipo', e.target.value)}
                    >
                      <option value="NOVA">NOVA</option>
                      <option value="ANTIGA">ANTIGA</option>
                    </select>
                  </td>
                  <td className="celula-acoes">
                    <button
                      className="btn-delete"
                      onClick={() => deleteConta(tipo, conta.id)}
                      title="Deletar conta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo e Totais */}
        <div className="resumo-totais">
          <div className="secao-resumo">
            <h3>Totais:</h3>
            <div className="linha-total">
              <span className="label">Total Saldo:</span>
              <span className={`valor ${totals.totalSaldo < 0 ? 'negativo' : ''}`}>
                R$ {totals.totalSaldo.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <div className="secao-resumo">
            <h3>Contas:</h3>
            <div className="linha-total">
              <span className="label">Cadastradas:</span>
              <span className="valor">{totals.totalContas}</span>
            </div>
            <div className="linha-total">
              <span className="label">Ativas:</span>
              <span className="valor" style={{ color: '#22c55e' }}>{totals.contasAtivas}</span>
            </div>
            <div className="linha-total">
              <span className="label">Inativas:</span>
              <span className="valor" style={{ color: '#ef4444' }}>{totals.contasInativas}</span>
            </div>
          </div>

          <button className="btn-add-conta" onClick={() => addConta(tipo)}>
            <Plus size={18} /> Adicionar Conta
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-8" data-sidebar-layout>
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Carregando...</p>
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
              <h1 className="text-4xl font-bold text-gray-100">Contas Chinesas</h1>
            </div>
            <p className="text-gray-400">Preencha os campos em azul. O saldo total e os resumos são automáticos.</p>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500 rounded-lg text-orange-300">
              {feedback}
            </div>
          )}

          {/* Controles */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-600"
              onClick={saveData} 
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              onClick={loadData}
            >
              <RefreshCw size={18} />
              Recarregar
            </button>
          </div>

          {/* Tabelas lado a lado */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            <TabelaContas
              titulo="TABELA"
              dominio="69B.com"
              contas={contas69B}
              tipo="69B"
            />
          </div>

          {/* Resumo Geral */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Resumo Geral 69B.com</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Contas</div>
                <div className="text-3xl font-bold text-gray-100 mt-2">
                  {totals69B.totalContas}
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo Total 69B</div>
                <div className={`text-3xl font-bold mt-2 ${totals69B.totalSaldo < 0 ? 'text-red-400' : 'text-gray-100'}`}>
                  R$ {totals69B.totalSaldo.toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contas Ativas</div>
                <div className="text-3xl font-bold text-green-400 mt-2">
                  {totals69B.contasAtivas}
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-red-500">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contas Inativas</div>
                <div className="text-3xl font-bold text-red-400 mt-2">
                  {totals69B.contasInativas}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContasChinesas;
