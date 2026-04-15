import React, { useState } from 'react';
import { revenueService } from '../services/api';
import { Check, AlertCircle, Plus } from 'lucide-react';

function RevenueForm({ onRevenueAdded }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar valor
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0 || isNaN(numAmount)) {
      setError('Digite um valor válido');
      return;
    }

    setLoading(true);

    try {
      await revenueService.addRevenue(numAmount, date);
      setSuccess('Faturamento registrado com sucesso!');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      
      setTimeout(() => {
        onRevenueAdded?.();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar faturamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-6 text-gray-100 flex items-center gap-2">
        <Plus size={24} className="text-orange-500" />
        Adicionar Faturamento
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de Data */}
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-gray-300 mb-2">
            Data
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input-field"
          />
        </div>

        {/* Campo de Valor */}
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-300 mb-2">
            Valor (R$)
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            required
            className="input-field"
          />
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {success && (
          <div className="flex items-center gap-3 p-3 bg-green-950 border border-green-800 rounded-lg text-green-400">
            <Check size={20} />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            loading
              ? 'bg-zinc-700 cursor-not-allowed text-gray-500'
              : 'btn-primary hover:bg-orange-600'
          }`}
        >
          <Plus size={20} />
          {loading ? 'Registrando...' : 'Registrar Faturamento'}
        </button>
      </form>
    </div>
  );
}

export default RevenueForm;
