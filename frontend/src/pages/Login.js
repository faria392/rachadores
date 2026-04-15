import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { LogIn, AlertCircle } from 'lucide-react';

/*
 * Página de Login
 * Autenticação de usuários
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Se já há token, redireciona direto para dashboard
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔑 Token encontrado! Redirecionando para dashboard...');
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Tentando fazer login com:', email);
      const response = await authService.login(email, password);
      console.log('✅ Login bem-sucedido:', response.data);
      
      if (!response.data.token) {
        throw new Error('Token não recebido do servidor');
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('💾 Dados salvos no localStorage');
      
      console.log('🚀 Redirecionando para dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Erro no login:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao fazer login';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url("/718F4136-7D1E-4E14-8D00-B424A1B4473C.png")'
      }}
    >
      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-zinc-800 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg">
            <img 
              src="/IMG_4821.jpg" 
              alt="Login" 
              className="w-32 h-32 object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Entra ai vai</h1>
          <p className="text-gray-400">Acesse sua conta rachador</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="input-field"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-field"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              loading
                ? 'bg-zinc-700 cursor-not-allowed text-gray-500'
                : 'btn-primary hover:bg-orange-600'
            }`}
          >
            <LogIn size={20} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link para Registro */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-400">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
