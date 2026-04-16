import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddRevenue from './pages/AddRevenue';
import Ranking from './pages/Ranking';
import RankingDaily from './pages/RankingDaily';
import History from './pages/History';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import DashboardFinanceiro from './pages/DashboardFinanceiro';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas de Autenticação */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Protegidas - cada página valida seu próprio token */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-revenue" element={<AddRevenue />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/ranking-daily" element={<RankingDaily />} />
        <Route path="/history" element={<History />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/financeiro" element={<DashboardFinanceiro />} />

        {/* Redirecionamento Padrão */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
