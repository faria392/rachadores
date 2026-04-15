import React from 'react';
import { AlertCircle } from 'lucide-react';

class LeaderboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error('❌ LeaderboardErrorBoundary capturou erro:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error details:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card bg-red-900/20 border-2 border-red-600/50 p-6 rounded-xl flex items-start gap-4">
          <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-red-300 font-bold mb-2">⚠️ Erro ao carregar Leaderboard</h3>
            <p className="text-red-200 text-sm mb-3">
              Houve um problema ao renderizar o leaderboard dinâmico. Sendo exibida a visualização simplificada.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-red-300 text-xs font-mono bg-red-950 p-2 rounded">
                {this.state.error?.message || 'Erro desconhecido'}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LeaderboardErrorBoundary;
