import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, RefreshCw, DollarSign, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { contasChinesesService } from '../services/api';
import '../pages/ContasChinesas.css';

/**
 * ContaRow - Linha individual de conta na tabela
 * Renderiza um input/select para cada campo com auto-save ao blur
 */
const ContaRow = React.memo(({ tabela, conta, onUpdate, onDelete }) => {
  const [localData, setLocalData] = useState({
    telefone: conta.telefone || '',
    pix: conta.pix || '',
    cpf: conta.cpf || '',
    nome: conta.nome || '',
    saldo: conta.saldo || 0,
    status: conta.status || 'Ativa',
    tipo: conta.tipo || 'NOVA',
  });

  useEffect(() => {
    setLocalData({
      telefone: conta.telefone || '',
      pix: conta.pix || '',
      cpf: conta.cpf || '',
      nome: conta.nome || '',
      saldo: conta.saldo || 0,
      status: conta.status || 'Ativa',
      tipo: conta.tipo || 'NOVA',
    });
  }, [conta]);

  const handleChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveFieldToDatabase = async (field, value) => {
    try {
      const isTempId = String(conta.id).startsWith('temp');

      if (isTempId) {
        onUpdate(tabela.id, conta.id, field, value);
      } else {
        const updateData = {
          telefone: field === 'telefone' ? value : conta.telefone,
          pix: field === 'pix' ? value : conta.pix,
          cpf: field === 'cpf' ? value : conta.cpf,
          nome: field === 'nome' ? value : conta.nome,
          saldo: field === 'saldo' ? (Number(value) || 0) : Number(conta.saldo) || 0,
          status: field === 'status' ? value : conta.status,
          tipo: field === 'tipo' ? value : conta.tipo,
        };

        await contasChinesesService.updateConta(conta.id, updateData);
        onUpdate(tabela.id, conta.id, field, value);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar campo:', error);
    }
  };

  const handleBlur = (field) => {
    let finalValue = localData[field];

    if (field === 'saldo') {
      finalValue = Number(finalValue) || 0;
    }

    if (finalValue !== conta[field]) {
      saveFieldToDatabase(field, finalValue);
    }
  };

  const handleSelectChange = (field, value) => {
    handleChange(field, value);
    saveFieldToDatabase(field, value);
  };

  return (
    <tr className={Number(conta.id) % 2 === 0 ? 'zebra-par' : 'zebra-impar'}>
      <td className="celula-telefone">
        <input
          type="text"
          value={localData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          onBlur={() => handleBlur('telefone')}
          placeholder="11987654321"
          autoComplete="off"
        />
      </td>
      <td className="celula-editavel">
        <input
          type="text"
          value={localData.pix}
          onChange={(e) => handleChange('pix', e.target.value)}
          onBlur={() => handleBlur('pix')}
          placeholder="Chave PIX"
          autoComplete="off"
        />
      </td>
      <td className="celula-cpf">
        <input
          type="text"
          value={localData.cpf}
          onChange={(e) => handleChange('cpf', e.target.value)}
          onBlur={() => handleBlur('cpf')}
          placeholder="123.456.789-00"
          autoComplete="off"
        />
      </td>
      <td className="celula-nome">
        <input
          type="text"
          value={localData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          onBlur={() => handleBlur('nome')}
          placeholder="Nome do cliente"
          autoComplete="off"
        />
      </td>
      <td className={`celula-saldo celula-editavel ${Number(localData.saldo) < 0 ? 'negativo' : ''}`}>
        <input
          type="text"
          value={localData.saldo}
          onChange={(e) => handleChange('saldo', e.target.value)}
          onBlur={() => handleBlur('saldo')}
          placeholder="0.00"
          autoComplete="off"
        />
      </td>
      <td className="celula-status">
        <select
          value={localData.status}
          onChange={(e) => handleSelectChange('status', e.target.value)}
          className={`select-status ${localData.status === 'Ativa' ? 'ativa' : 'inativa'}`}
        >
          <option value="Ativa">Ativa</option>
          <option value="Inativa">Inativa</option>
        </select>
      </td>
      <td className="celula-tipo">
        <select
          value={localData.tipo}
          onChange={(e) => handleSelectChange('tipo', e.target.value)}
        >
          <option value="NOVA">NOVA</option>
          <option value="ANTIGA">ANTIGA</option>
          <option value="MÃE">MÃE</option>
        </select>
      </td>
      <td className="celula-acoes">
        <button
          className="btn-delete"
          onClick={() => onDelete(tabela.id, conta.id)}
          title="Deletar conta"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
});

ContaRow.displayName = 'ContaRow';

/**
 * TabelaContas - Renderiza uma tabela com suas contas
 */
const TabelaContas = React.memo(({ tabela, onUpdateConta, onDeleteConta, onDeleteTabela, onAddConta, formatarMoeda }) => {
  const contas = tabela.contas || [];
  const totalSaldo = contas.reduce((sum, c) => sum + Number(c.saldo || 0), 0);
  const contasAtivas = contas.filter(c => c.status === 'Ativa').length;
  const contasInativas = contas.filter(c => c.status === 'Inativa').length;

  return (
    <div className="tabela-container">
      {/* Header da tabela */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="tabela-titulo">📋 {tabela.nome}</h2>
        <button
          className="btn-delete-tabela"
          onClick={() => {
            if (window.confirm(`Deseja deletar a tabela "${tabela.nome}" e todas suas contas?`)) {
              onDeleteTabela(tabela.id);
            }
          }}
          title="Deletar tabela"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Tabela de contas */}
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
            {contas.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  ℹ️ Nenhuma conta cadastrada. Clique em "Adicionar Conta" para começar.
                </td>
              </tr>
            ) : (
              contas.map((conta) => (
                <ContaRow
                  key={conta.id}
                  tabela={tabela}
                  conta={conta}
                  onUpdate={onUpdateConta}
                  onDelete={onDeleteConta}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo da tabela */}
      <div className="resumo-totais">
        <div className="secao-resumo">
          <h3>Totais:</h3>
          <div className="linha-total">
            <span className="label">Saldo Total:</span>
            <span className={`valor ${totalSaldo < 0 ? 'negativo' : ''}`}>
              {formatarMoeda(totalSaldo)}
            </span>
          </div>
        </div>

        <div className="secao-resumo">
          <h3>Contas:</h3>
          <div className="linha-total">
            <span className="label">Cadastradas:</span>
            <span className="valor">{contas.length}</span>
          </div>
          <div className="linha-total">
            <span className="label">Ativas:</span>
            <span className="valor" style={{ color: '#22c55e' }}>{contasAtivas}</span>
          </div>
          <div className="linha-total">
            <span className="label">Inativas:</span>
            <span className="valor" style={{ color: '#ef4444' }}>{contasInativas}</span>
          </div>
        </div>

        <button className="btn-add-conta" onClick={() => onAddConta(tabela.id)}>
          <Plus size={18} /> Adicionar Conta
        </button>
      </div>
    </div>
  );
});

TabelaContas.displayName = 'TabelaContas';

/**
 * ContasChinesas - Componente principal
 * Gerencia o estado global de tabelas e contas
 */
const ContasChinesas = () => {
  const navigate = useNavigate();
  const [tabelas, setTabelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [novaTabela, setNovaTabela] = useState('');
  const [mostraFormulario, setMostraFormulario] = useState(false);

  // Verificar autenticação e carregar dados ao montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  /**
   * Carrega todas as tabelas com suas contas
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contasChinesesService.getAll();
      const tabelasData = response.data || [];

      console.log('📦 Tabelas carregadas:', tabelasData);
      setTabelas(tabelasData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setFeedback('❌ Erro ao carregar tabelas');
      setTimeout(() => setFeedback(''), 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria uma nova tabela
   */
  const handleCreateTabela = useCallback(async () => {
    if (!novaTabela.trim()) {
      setFeedback('⚠️ Digite um nome para a tabela');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    if (tabelas.some(t => t.nome === novaTabela.trim())) {
      setFeedback('⚠️ Já existe uma tabela com esse nome');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    try {
      const response = await contasChinesesService.createTabela({
        nome: novaTabela.trim()
      });

      setTabelas(prev => [...prev, { ...response.data, contas: [] }]);
      setNovaTabela('');
      setMostraFormulario(false);
      setFeedback('✅ Tabela criada com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao criar tabela:', error);
      const mensagem = error.response?.data?.error || 'Erro ao criar tabela';
      setFeedback(`❌ ${mensagem}`);
      setTimeout(() => setFeedback(''), 5000);
    }
  }, [novaTabela, tabelas]);

  /**
   * Deleta uma tabela e todas suas contas
   */
  const handleDeleteTabela = useCallback(async (tabelaId) => {
    try {
      await contasChinesesService.deleteTabela(tabelaId);
      setTabelas(prev => prev.filter(t => t.id !== tabelaId));
      setFeedback('✅ Tabela removida com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao deletar tabela:', error);
      setFeedback('❌ Erro ao deletar tabela');
      setTimeout(() => setFeedback(''), 5000);
    }
  }, []);

  /**
   * Adiciona uma nova conta à tabela
   */
  const handleAddConta = useCallback((tabelaId) => {
    const tempId = `temp-${Date.now()}`;
    const novaConta = {
      id: tempId,
      telefone: '',
      pix: '',
      cpf: '',
      nome: '',
      saldo: 0,
      status: 'Ativa',
      tipo: 'NOVA',
      tabela_id: tabelaId
    };

    setTabelas(prev => prev.map(tabela => {
      if (tabela.id === tabelaId) {
        return {
          ...tabela,
          contas: [...(tabela.contas || []), novaConta]
        };
      }
      return tabela;
    }));
  }, []);

  /**
   * Atualiza uma conta localmente
   */
  const handleUpdateConta = useCallback((tabelaId, contaId, field, value) => {
    setTabelas(prev => prev.map(tabela => {
      if (tabela.id === tabelaId) {
        return {
          ...tabela,
          contas: (tabela.contas || []).map(conta =>
            conta.id === contaId ? { ...conta, [field]: value } : conta
          )
        };
      }
      return tabela;
    }));
  }, []);

  /**
   * Deleta uma conta
   */
  const handleDeleteConta = useCallback(async (tabelaId, contaId) => {
    try {
      const isTempId = String(contaId).startsWith('temp');

      if (!isTempId) {
        await contasChinesesService.deleteConta(contaId);
      }

      setTabelas(prev => prev.map(tabela => {
        if (tabela.id === tabelaId) {
          return {
            ...tabela,
            contas: (tabela.contas || []).filter(c => c.id !== contaId)
          };
        }
        return tabela;
      }));

      setFeedback('✅ Conta removida com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao deletar conta:', error);
      setFeedback('❌ Erro ao deletar conta');
      setTimeout(() => setFeedback(''), 5000);
    }
  }, []);

  /**
   * Salva todas as contas temporárias no banco
   */
  const handleSaveData = useCallback(async () => {
    try {
      setSaving(true);

      for (const tabela of tabelas) {
        for (const conta of tabela.contas || []) {
          try {
            if (String(conta.id).startsWith('temp')) {
              const response = await contasChinesesService.addConta({
                telefone: conta.telefone,
                pix: conta.pix,
                cpf: conta.cpf,
                nome: conta.nome,
                saldo: Number(conta.saldo) || 0,
                status: conta.status,
                tipo: conta.tipo,
                tabela_id: tabela.id
              });

              // Atualizar ID temporário para ID real
              const novoId = response.data.id;
              setTabelas(prev =>
                prev.map(t => ({
                  ...t,
                  contas: (t.contas || []).map(c =>
                    c.id === conta.id ? { ...c, id: novoId } : c
                  )
                }))
              );
            }
          } catch (error) {
            console.error('❌ Erro ao salvar conta:', error);
          }
        }
      }

      setFeedback('✅ Dados salvos com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error('❌ Erro geral ao salvar:', error);
      setFeedback('❌ Erro ao salvar dados');
      setTimeout(() => setFeedback(''), 5000);
    } finally {
      setSaving(false);
    }
  }, [tabelas]);

  /**
   * Formata valor para moeda brasileira
   */
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  /**
   * Calcula totais globais
   */
  const totalGlobal = {
    tabelas: tabelas.length,
    contas: tabelas.reduce((sum, t) => sum + (t.contas?.length || 0), 0),
    saldo: tabelas.reduce((sum, t) => sum + (t.contas || []).reduce((s, c) => s + Number(c.saldo || 0), 0), 0),
    contasAtivas: tabelas.reduce((sum, t) => sum + (t.contas || []).filter(c => c.status === 'Ativa').length, 0),
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-8" data-sidebar-layout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw size={32} className="animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-400">Carregando tabelas...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <main className="flex-1 p-8" data-sidebar-layout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={32} className="text-orange-500" />
              <h1 className="text-4xl font-bold text-gray-100">Contas Chinesas</h1>
            </div>
            <p className="text-gray-400">Gerencie suas tabelas e contas de forma simples e eficiente.</p>
          </div>

          {/* Feedback messages */}
          {feedback && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              feedback.includes('✅') 
                ? 'bg-green-500/20 border-green-500 text-green-300' 
                : 'bg-orange-500/20 border-orange-500 text-orange-300'
            }`}>
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-600"
              onClick={handleSaveData}
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
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              onClick={() => setMostraFormulario(!mostraFormulario)}
            >
              <Plus size={18} />
              {mostraFormulario ? 'Cancelar' : 'Adicionar Tabela'}
            </button>
          </div>

          {/* Form to create new table */}
          {mostraFormulario && (
            <div className="mb-6 p-4 bg-zinc-800 border border-purple-500 rounded-lg">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Nome da Tabela</label>
                  <input
                    type="text"
                    value={novaTabela}
                    onChange={(e) => setNovaTabela(e.target.value)}
                    placeholder="Ex: 69B.com, WhatsApp Group, etc"
                    className="w-full px-4 py-2 bg-zinc-700 border border-purple-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTabela()}
                  />
                </div>
                <button
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  onClick={handleCreateTabela}
                >
                  <Plus size={18} />
                  Criar
                </button>
              </div>
            </div>
          )}

          {/* Tabelas */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            {tabelas.length > 0 ? (
              tabelas.map(tabela => (
                <TabelaContas
                  key={tabela.id}
                  tabela={tabela}
                  onUpdateConta={handleUpdateConta}
                  onDeleteConta={handleDeleteConta}
                  onDeleteTabela={handleDeleteTabela}
                  onAddConta={handleAddConta}
                  formatarMoeda={formatarMoeda}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
                <DollarSign size={48} className="text-zinc-600 mx-auto mb-4" />
                <p className="text-xl text-gray-300 mb-2">Nenhuma tabela criada ainda</p>
                <p className="text-gray-400">Clique em "Adicionar Tabela" para começar</p>
              </div>
            )}
          </div>

          {/* Global summary */}
          {tabelas.length > 0 && (
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-gray-100 mb-6">📊 Resumo Total</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Tabelas</div>
                  <div className="text-3xl font-bold text-gray-100 mt-2">{totalGlobal.tabelas}</div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-cyan-500">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Contas</div>
                  <div className="text-3xl font-bold text-gray-100 mt-2">{totalGlobal.contas}</div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-yellow-500">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo Total</div>
                  <div className={`text-3xl font-bold mt-2 ${totalGlobal.saldo < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatarMoeda(totalGlobal.saldo)}
                  </div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contas Ativas</div>
                  <div className="text-3xl font-bold text-green-400 mt-2">{totalGlobal.contasAtivas}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContasChinesas;
