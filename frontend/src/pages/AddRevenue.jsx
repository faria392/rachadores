import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RevenueForm from '../components/RevenueForm';

function AddRevenue() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingData, setEditingData] = useState(null);

  const handleRevenueAdded = () => {
    // Limpar localStorage
    localStorage.removeItem('editingRevenue');
    navigate('/dashboard');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Verificar se há dados de edição no location state ou localStorage
    if (location.state?.editing) {
      setEditingData(location.state.editing);
    } else {
      const stored = localStorage.getItem('editingRevenue');
      if (stored) {
        setEditingData(JSON.parse(stored));
      }
    }
  }, [navigate, location]);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {}
      <Sidebar />

      {}
      <main className="flex-1 p-8" data-sidebar-layout>
        <div className="max-w-2xl mx-auto">
          {}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">
              {editingData ? 'Editar Faturamento' : 'Registrar Faturamento'}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {editingData 
                ? 'Atualize os dados do faturamento'
                : 'Preencha os dados abaixo para registrar um novo faturamento'
              }
            </p>
          </div>

          {}
          <RevenueForm onRevenueAdded={handleRevenueAdded} initialData={editingData} />
        </div>
      </main>
    </div>
  );
}

export default AddRevenue;
