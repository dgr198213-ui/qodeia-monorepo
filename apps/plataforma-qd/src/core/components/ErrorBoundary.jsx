import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../../utils/logger';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error', { error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#10221f] flex items-center justify-center p-4">
          <div className="bg-[#192233] rounded-xl p-8 max-w-md w-full border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Error Crítico</h2>
                <p className="text-sm text-gray-400">Algo salió mal</p>
              </div>
            </div>

            <div className="bg-[#0d1117] rounded-lg p-3 mb-4">
              <p className="text-xs text-red-400 font-mono">
                {this.state.error?.message || 'Error desconocido'}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full bg-[#13ecc8] text-[#10221f] px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#0fc9a8] transition-colors"
            >
              <RefreshCw size={18} />
              Reiniciar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
