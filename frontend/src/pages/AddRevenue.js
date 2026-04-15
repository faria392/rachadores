import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RevenueForm from '../components/RevenueForm';

function AddRevenue() {
  const navigate = useNavigate();

  const handleRevenueAdded = () => {
    navigate('/dashboard');
  };

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {}
      <Sidebar />

      {}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          {}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">Registrar Faturamento</h1>
            <p className="text-gray-400 text-sm mt-2">
              Preencha os dados abaixo para registrar um novo faturamento
            </p>
          </div>

          {}
          <RevenueForm onRevenueAdded={handleRevenueAdded} />
        </div>
      </main>
    </div>
  );
}

export default AddRevenue;
