import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, RefreshCw, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { contasChinesesService } from '../services/api';
import '../pages/ContasChinesas.css';

// Componente memoizado para cada linha da tabela
const ContaRow = React.memo(({ tabela, conta, onUpdate, onDelete }) => {
  const [localData, setLocalData] = useState({
    telefone: conta.telefone,
    pix: conta.pix,
    cpf: conta.cpf,
    nome: conta.nome,
    saldo: conta.saldo,
    status: conta.status,
    tipo: conta.tipo,
  });

  // Sincroniza quando a conta muda
  useEffect(() => {
    setLocalData({
      telefone: conta.telefone,
      pix: conta.pix,
      cpf: conta.cpf,
      nome: conta.nome,
      saldo: conta.saldo,
      status: conta.status,
      tipo: conta.tipo,
    });
  }, [
    conta.telefone,
    conta.pix,
    conta.cpf,
    conta.nome,
    conta.saldo,
    conta.status,
    conta.tipo
  ]);

  const handleBlur = (field) => {
    let finalValue = localData[field];
    
    // Converter para número no blur para campos que precisam
    if (field === 'saldo') {
      finalValue = Number(finalValue) || 0;
    }
    
    if (finalValue !== conta[field]) {
      onUpdate(tabela.id, conta.id, field, finalValue);
    }
  };

  const handleChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <tr className={Math.floor(conta.id) % 2 === 0 ? 'zebra-par' : 'zebra-impar'}>
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
          placeholder="Digite a chave PIX"
          className="input-pix"
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
          onChange={(e) => {
            handleChange('status', e.target.value);
            onUpdate(tabela.id, conta.id, 'status', e.target.value);
          }}
          className={`select-status ${localData.status === 'Ativa' ? 'ativa' : 'inativa'}`}
        >
          <option value="Ativa">Ativa</option>
          <option value="Inativa">Inativa</option>
        </select>
      </td>
      <td className="celula-tipo">
        <select
          value={localData.tipo}
          onChange={(e) => {
            handleChange('tipo', e.target.value);
            onUpdate(tabela.id, conta.id, 'tipo', e.target.value);
          }}
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

const ContasChinesas = () => {
  const navigate = useNavigate();
  const [tabelas, setTabelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [novaTabela, setNovaTabela] = useState('');
  const [mostraFormulario, setMostraFormulario] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contasChinesesService.getAll();
      const contas = response.data || [];
      
      // Agrupar contas por domínio (nome da tabela)
      const tabelasAgrupadas = {};
      contas.forEach(conta => {
        if (!tabelasAgrupadas[conta.dominio]) {
          tabelasAgrupadas[conta.dominio] = {
            id: conta.dominio,
            nome: conta.dominio,
            contas: []
          };
        }
        tabelasAgrupadas[conta.dominio].contas.push(conta);
      });

      setTabelas(Object.values(tabelasAgrupadas));
    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
      setTabelas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarNovaTabela = useCallback(() => {
    if (!novaTabela.trim()) {
      setFeedback('⚠️ Digite um nome para a tabela');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    // Verificar se já existe tabela com esse nome
    if (tabelas.some(t => t.nome === novaTabela.trim())) {
      setFeedback('⚠️ Já existe uma tabela com esse nome');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    const novaTab = {
      id: Date.now().toString(),
      nome: novaTabela.trim(),
      contas: []
    };

    setTabelas(prevTabelas => [...prevTabelas, novaTab]);
    setNovaTabela('');
    setMostraFormulario(false);
    setFeedback('✓ Tabela criada com sucesso!');
    setTimeout(() => setFeedback(''), 3000);
  }, [novaTabela, tabelas]);

  const deletarTabela = useCallback((tabelaId) => {
    setTabelas(prevTabelas => prevTabelas.filter(t => t.id !== tabelaId));
    setFeedback('✓ Tabela removida com sucesso!');
    setTimeout(() => setFeedback(''), 3000);
  }, []);

  const updateConta = useCallback((tabelaId, contaId, field, value) => {
    setTabelas(prevTabelas => prevTabelas.map(tabela => {
      if (tabela.id === tabelaId) {
        return {
          ...tabela,
          contas: tabela.contas.map(conta =>
            conta.id === contaId ? { ...conta, [field]: value } : conta
          )
        };
      }
      return tabela;
    }));
  }, []);

  const addConta = useCallback((tabelaId) => {
    setTabelas(prevTabelas => prevTabelas.map(tabela => {
      if (tabela.id === tabelaId) {
        const newId = Math.floor(Date.now() * 1000 + Math.random() * 1000000);
        const novaConta = {
          id: newId,
          telefone: '',
          pix: '',
          cpf: '',
          nome: '',
          saldo: 0,
          status: 'Ativa',
          tipo: 'NOVA',
          dominio: tabela.nome
        };
        return {
          ...tabela,
          contas: [...tabela.contas, novaConta]
        };
      }
      return tabela;
    }));
  }, []);

  const deleteConta = useCallback(async (tabelaId, contaId) => {
    try {
      // Se for um ID temporário, apenas remove localmente
      if (contaId > 1000000) {
        setTabelas(prevTabelas => prevTabelas.map(tabela => {
          if (tabela.id === tabelaId) {
            return {
              ...tabela,
              contas: tabela.contas.filter(c => c.id !== contaId)
            };
          }
          return tabela;
        }));
      } else {
        // Deleta da API
        await contasChinesesService.deleteConta(contaId);
        
        setTabelas(prevTabelas => prevTabelas.map(tabela => {
          if (tabela.id === tabelaId) {
            return {
              ...tabela,
              contas: tabela.contas.filter(c => c.id !== contaId)
            };
          }
          return tabela;
        }));
        
        setFeedback('✓ Conta removida com sucesso!');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      setFeedback('✗ Erro ao remover conta');
      setTimeout(() => setFeedback(''), 3000);
    }
  }, []);

  const calculateTotals = (contas) => {
    return {
      totalSaldo: contas.reduce((sum, c) => sum + Number(c.saldo || 0), 0),
      totalContas: contas.length,
      contasAtivas: contas.filter(c => c.status === 'Ativa').length,
      contasInativas: contas.filter(c => c.status === 'Inativa').length,
    };
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  const saveData = useCallback(async () => {
    try {
      setSaving(true);
      
      // Sincronizar todas as contas com a API
      for (const tabela of tabelas) {
        for (const conta of tabela.contas) {
          try {
            if (conta.id > 1000000) { // Novos registros
              const response = await contasChinesesService.addConta({
                telefone: conta.telefone,
                pix: conta.pix,
                cpf: conta.cpf,
                nome: conta.nome,
                saldo: Number(conta.saldo) || 0,
                status: conta.status,
                tipo: conta.tipo,
                dominio: tabela.nome
              });
              console.log('Conta salva:', response);
            } else {
              const response = await contasChinesesService.updateConta(conta.id, {
                telefone: conta.telefone,
                pix: conta.pix,
                cpf: conta.cpf,
                nome: conta.nome,
                saldo: Number(conta.saldo) || 0,
                status: conta.status,
                tipo: conta.tipo,
                dominio: tabela.nome
              });
              console.log('Conta atualizada:', response);
            }
          } catch (error) {
            console.error('Erro ao salvar conta individual:', conta, error);
          }
        }
      }
      
      setFeedback('✓ Dados salvos com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
      
      // Recarrega os dados após salvar para sincronizar com o servidor
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setFeedback('✗ Erro ao salvar dados');
      setTimeout(() => setFeedback(''), 3000);
    } finally {
      setSaving(false);
    }
  }, [tabelas, loadData]);

  const TabelaContas = ({ tabela }) => {
    const totals = calculateTotals(tabela.contas);

    return (
      <div className="tabela-container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="tabela-titulo">EDITAR {tabela.nome}</h2>
          <button
            className="btn-delete-tabela"
            onClick={() => deletarTabela(tabela.id)}
            title="Deletar tabela"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
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
              {tabela.contas.map((conta) => (
                <ContaRow 
                  key={conta.id} 
                  tabela={tabela} 
                  conta={conta} 
                  onUpdate={updateConta}
                  onDelete={deleteConta}
                />
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
                {formatarMoeda(totals.totalSaldo)}
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

          <button className="btn-add-conta" onClick={() => addConta(tabela.id)}>
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
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              onClick={() => setMostraFormulario(!mostraFormulario)}
            >
              <Plus size={18} />
              {mostraFormulario ? 'Cancelar' : 'Adicionar Tabela'}
            </button>
          </div>

          {/* Formulário para Nova Tabela */}
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
                    onKeyPress={(e) => e.key === 'Enter' && adicionarNovaTabela()}
                  />
                </div>
                <button 
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  onClick={adicionarNovaTabela}
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
                <TabelaContas key={tabela.id} tabela={tabela} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">Nenhuma tabela criada ainda.</p>
                <p className="text-sm">Clique em "Adicionar Tabela" para começar.</p>
              </div>
            )}
          </div>

          {/* Resumo Total */}
          {tabelas.length > 0 && (
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold text-gray-100 mb-6">Resumo Total</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Tabelas</div>
                  <div className="text-3xl font-bold text-gray-100 mt-2">
                    {tabelas.length}
                  </div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Contas</div>
                  <div className="text-3xl font-bold text-gray-100 mt-2">
                    {tabelas.reduce((sum, t) => sum + t.contas.length, 0)}
                  </div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-yellow-500">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo Total</div>
                  <div className={`text-3xl font-bold mt-2 ${
                    tabelas.reduce((sum, t) => sum + t.contas.reduce((s, c) => s + Number(c.saldo || 0), 0), 0) < 0 
                      ? 'text-red-400' 
                      : 'text-gray-100'
                  }`}>
                    {formatarMoeda(tabelas.reduce((sum, t) => sum + t.contas.reduce((s, c) => s + Number(c.saldo || 0), 0), 0))}
                  </div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contas Ativas</div>
                  <div className="text-3xl font-bold text-green-400 mt-2">
                    {tabelas.reduce((sum, t) => sum + t.contas.filter(c => c.status === 'Ativa').length, 0)}
                  </div>
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
