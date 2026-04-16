import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Copy, Search, Edit2, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { tablesApi } from '../services/tablesApi';
import './TableManagement.css';

const TableManagement = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Modal states
  const [showTableModal, setShowTableModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    pix_key: '',
    cpf: '',
    name: '',
    balance: '',
    status: 'ativa',
    account_type: 'normal',
  });

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadTables();
  }, [navigate]);

  // Carregar tabelas
  const loadTables = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await tablesApi.getAll();
      setTables(data);
    } catch (err) {
      setError('Erro ao carregar tabelas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ GERENCIAR TABELAS
  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim()) {
      setError('Nome da tabela é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await tablesApi.create(newTableName.trim());
      setNewTableName('');
      setShowTableModal(false);
      await loadTables();
    } catch (err) {
      setError('Erro ao criar tabela');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Tem certeza que deseja deletar esta tabela?')) {
      try {
        setLoading(true);
        await tablesApi.delete(tableId);
        await loadTables();
      } catch (err) {
        setError('Erro ao deletar tabela');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDuplicateTable = async (tableId) => {
    try {
      setLoading(true);
      await tablesApi.duplicate(tableId);
      await loadTables();
    } catch (err) {
      setError('Erro ao duplicar tabela');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ GERENCIAR USUÁRIOS
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.name) {
      setError('Telefone e nome são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const userData = {
        phone: formData.phone,
        pix_key: formData.pix_key || null,
        cpf: formData.cpf || null,
        name: formData.name,
        balance: parseFloat(formData.balance) || 0,
        status: formData.status,
        account_type: formData.account_type,
      };

      await tablesApi.addUser(selectedTable.id, userData);
      resetForm();
      setShowUserModal(false);
      await loadTables();
    } catch (err) {
      setError('Erro ao adicionar usuário');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (tableId, userId) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        setLoading(true);
        await tablesApi.deleteUser(tableId, userId);
        await loadTables();
      } catch (err) {
        setError('Erro ao deletar usuário');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateUser = async (tableId, userId, updatedData) => {
    try {
      setLoading(true);
      await tablesApi.updateUser(tableId, userId, updatedData);
      setEditingCell(null);
      setEditingValue('');
      await loadTables();
    } catch (err) {
      setError('Erro ao atualizar usuário');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInlineEdit = (user, tableId, field) => {
    setEditingCell({ userId: user.id, tableId, field });
    setEditingValue(user[field]);
  };

  const handleSaveInlineEdit = async (tableId, userId, user, field) => {
    const updatedData = { ...user, [field]: editingValue };
    await handleUpdateUser(tableId, userId, updatedData);
  };

  const resetForm = () => {
    setFormData({
      phone: '',
      pix_key: '',
      cpf: '',
      name: '',
      balance: '',
      status: 'ativa',
      account_type: 'normal',
    });
    setError('');
  };

  // ✅ CÁLCULOS E FILTROS
  const calculateTableStats = (users) => {
    const totalBalance = users.reduce((acc, u) => acc + parseFloat(u.balance || 0), 0);
    const activeCount = users.filter(u => u.status === 'ativa').length;
    const inactiveCount = users.filter(u => u.status === 'inativa').length;
    const motherAccount = users.find(u => u.account_type === 'mae');

    return {
      totalCount: users.length,
      activeCount,
      inactiveCount,
      totalBalance,
      motherAccount,
    };
  };

  const filterUsers = (users) => {
    let filtered = users;

    // Filtro por status
    if (filterStatus === 'ativas') {
      filtered = filtered.filter(u => u.status === 'ativa');
    } else if (filterStatus === 'inativas') {
      filtered = filtered.filter(u => u.status === 'inativa');
    } else if (filterStatus === 'mae') {
      filtered = filtered.filter(u => u.account_type === 'mae');
    }

    // Busca por nome
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm) ||
        (u.cpf && u.cpf.includes(searchTerm))
      );
    }

    return filtered;
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <main className="flex-1 p-8" data-sidebar-layout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-100 mb-2">Gerenciar Tabelas</h1>
            <p className="text-gray-400">Organize suas contas em múltiplas tabelas</p>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Botão Criar Tabela */}
          <button
            onClick={() => setShowTableModal(true)}
            className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            <Plus size={20} /> Nova Tabela
          </button>

          {/* Modal Criar Tabela */}
          {showTableModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 rounded-lg p-6 max-w-sm w-full border border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-100">Nova Tabela</h3>
                  <button onClick={() => setShowTableModal(false)}>
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleCreateTable}>
                  <input
                    type="text"
                    placeholder="Nome da tabela (ex: 69B.com)"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowTableModal(false)}
                      className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      Criar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabelas */}
          {loading && !tables.length ? (
            <div className="text-center text-gray-400 py-12">Carregando...</div>
          ) : tables.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Nenhuma tabela criada ainda</div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {tables.map((table) => {
                const stats = calculateTableStats(table.users || []);
                const filteredUsers = filterUsers(table.users || []);

                return (
                  <div key={table.id} className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden">
                    {/* Cabeçalho da Tabela */}
                    <div className="bg-zinc-800 p-6 border-b border-zinc-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-100">{table.table_name}</h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Criado em {new Date(table.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTable(table);
                              resetForm();
                              setShowUserModal(true);
                            }}
                            className="p-2 hover:bg-green-500/20 rounded-lg transition text-green-400"
                            title="Adicionar usuário"
                          >
                            <Plus size={20} />
                          </button>
                          <button
                            onClick={() => handleDuplicateTable(table.id)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition text-blue-400"
                            title="Duplicar tabela"
                          >
                            <Copy size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                            title="Deletar tabela"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-700">
                          <p className="text-gray-400 text-xs mb-1">Cadastradas</p>
                          <p className="text-lg font-bold text-blue-400">{stats.totalCount}</p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-700">
                          <p className="text-gray-400 text-xs mb-1">Ativas</p>
                          <p className="text-lg font-bold text-green-400">{stats.activeCount}</p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-700">
                          <p className="text-gray-400 text-xs mb-1">Inativas</p>
                          <p className="text-lg font-bold text-red-400">{stats.inactiveCount}</p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-700">
                          <p className="text-gray-400 text-xs mb-1">Saldo Total</p>
                          <p className={`text-lg font-bold ${stats.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            R$ {stats.totalBalance.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-700">
                          <p className="text-gray-400 text-xs mb-1">Conta Mãe</p>
                          <p className="text-lg font-bold text-orange-400">
                            {stats.motherAccount ? '✓' : '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Filtros e Busca */}
                    <div className="p-6 border-b border-zinc-700 bg-zinc-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <Search size={18} className="absolute left-3 top-3 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Buscar por nome, telefone ou CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          />
                        </div>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="todas">Todas as contas</option>
                          <option value="ativas">Apenas Ativas</option>
                          <option value="inativas">Apenas Inativas</option>
                          <option value="mae">Contas Mãe</option>
                        </select>
                      </div>
                    </div>

                    {/* Tabela de Usuários */}
                    <div className="p-6 overflow-x-auto">
                      {filteredUsers.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhum usuário nesta tabela</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-zinc-700">
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Telefone</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Nome</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">CPF</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Chave Pix</th>
                              <th className="text-right py-3 px-4 text-gray-400 font-semibold">Saldo</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                              <th className="text-left py-3 px-4 text-gray-400 font-semibold">Tipo</th>
                              <th className="text-center py-3 px-4 text-gray-400 font-semibold">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user) => (
                              <tr
                                key={user.id}
                                className={`border-b border-zinc-700 hover:bg-zinc-800/50 transition ${
                                  user.account_type === 'mae' ? 'bg-orange-500/10' : ''
                                }`}
                              >
                                <td className="py-3 px-4 text-gray-100">{user.phone}</td>
                                <td className="py-3 px-4 text-gray-100 font-semibold">{user.name}</td>
                                <td className="py-3 px-4 text-gray-400">{user.cpf || '—'}</td>
                                <td className="py-3 px-4 text-gray-400 text-xs">{user.pix_key ? user.pix_key.substring(0, 20) + '...' : '—'}</td>
                                <td
                                  className={`py-3 px-4 text-right font-bold ${
                                    user.balance >= 0 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  R$ {parseFloat(user.balance || 0).toFixed(2)}
                                </td>
                                <td className="py-3 px-4">
                                  <select
                                    value={user.status}
                                    onChange={(e) => {
                                      const updatedUser = { ...user, status: e.target.value };
                                      handleUpdateUser(table.id, user.id, updatedUser);
                                    }}
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      user.status === 'ativa'
                                        ? 'bg-green-500/20 text-green-300 border border-green-500'
                                        : 'bg-red-500/20 text-red-300 border border-red-500'
                                    }`}
                                  >
                                    <option value="ativa">Ativa</option>
                                    <option value="inativa">Inativa</option>
                                  </select>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      user.account_type === 'mae'
                                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500'
                                        : 'bg-gray-500/20 text-gray-300 border border-gray-500'
                                    }`}
                                  >
                                    {user.account_type === 'mae' ? 'Mãe ★' : 'Normal'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => handleDeleteUser(table.id, user.id)}
                                    className="inline-block p-1 hover:bg-red-500/20 rounded transition text-red-400"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Adicionar Usuário */}
        {showUserModal && selectedTable && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-zinc-700 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-100">Adicionar Usuário</h3>
                <button onClick={() => setShowUserModal(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do usuário"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      CPF
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Chave Pix
                    </label>
                    <input
                      type="text"
                      placeholder="Chave Pix"
                      value={formData.pix_key}
                      onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Saldo (R$)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ativa">Ativa</option>
                      <option value="inativa">Inativa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Tipo de Conta
                    </label>
                    <select
                      value={formData.account_type}
                      onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="normal">Normal</option>
                      <option value="mae">Conta Mãe ★</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TableManagement;
