import { useState, useEffect, useCallback } from 'react';
import { Activity, Filter, Users } from 'lucide-react';
import { apiClient, type Deployment } from './lib/api';
import { StageColumn } from './components/StageColumn';
import { SearchBar } from './components/SearchBar';

const ITEMS_PER_PAGE = 100;

function App() {
    const [isStreaming, setIsStreaming] = useState(false);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string>('1.0.8');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchDeployments = useCallback(async (pageNum: number, append: boolean = false, version: string = selectedVersion) => {
    setIsLoading(true);
    setIsStreaming(true);
    if (!append) setDeployments([]); // Limpiar si no es append
    try {
      await apiClient.getDeploymentsStream(
        pageNum,
        ITEMS_PER_PAGE,
        version,
        (deployment) => {
          setDeployments(prev => [...prev, deployment]);
        }
      );
    } catch (error) {
      console.error('Error fetching deployments:', error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [selectedVersion]);

  useEffect(() => {
    fetchDeployments(1, false, selectedVersion);
    setPage(1);
  }, [fetchDeployments, selectedVersion]);

  useEffect(() => {
    let filtered = deployments;
    // Excluir cards cuya descripción no siga el patrón OCL-xxxx - usuario
    const regex = /^OCL-\d+\s-\s\S+/;
    filtered = filtered.filter(d => d.description && regex.test(d.description));
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        (d.ticket_id && d.ticket_id.toLowerCase().includes(query)) ||
        (d.description && d.description.toLowerCase().includes(query)) ||
        (d.owner && d.owner.toLowerCase().includes(query)) ||
        (d.developer && d.developer.toLowerCase().includes(query)) ||
        (d.version && d.version.toLowerCase().includes(query))
      );
    }
    if (selectedVersion && selectedVersion !== '(todas)') {
      filtered = filtered.filter(d => d.version && d.version.startsWith(selectedVersion));
    }
    setFilteredDeployments(filtered);
  }, [deployments, searchQuery, selectedVersion]);

  // Generar lista de versiones dinámicamente a partir de los deployments
  const versionOptions = ['(todas)', '1.0.3', '1.0.4', '1.0.5', '1.0.6', '1.0.7', '1.0.8'];

  const developDeployments = filteredDeployments.filter(d => d.stage === 'dev');
  const testingDeployments = filteredDeployments.filter(d => d.stage === 'testing');
  const uatDeployments = filteredDeployments.filter(d => d.stage === 'uat');

  const totalDeployments = deployments.length;
  const uniqueTickets = new Set(deployments.map(d => d.ticket_id)).size;

  // Carga automática de más páginas si hay más de 99, 198, 297...
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeployments(nextPage, true);
  };

  // Efecto para cargar más automáticamente si hay más de 99, 198, 297...
  useEffect(() => {
    if (hasMore && totalDeployments > 0 && totalDeployments % 99 === 0) {
      loadMore();
    }
  }, [totalDeployments, hasMore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Progress bar arriba */}
      {isStreaming && (
        <div className="fixed top-0 left-0 w-full h-1 z-50">
          <div className="h-full bg-blue-500 animate-pulse transition-all duration-300" style={{ width: '100%' }} />
        </div>
      )}
      {/* Overlay de loading solo si no hay datos */}
      {isLoading && deployments.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-blue-700 font-semibold text-lg">Cargando datos...</span>
          </div>
        </div>
      )}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tickets Jira</h1>
                <p className="text-sm text-gray-600">Estado de tickets One-Clearing</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {versionOptions.map(version => (
                    <option key={version} value={version}>{version}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 bg-blue-500 rounded-full${isStreaming ? ' animate-pulse' : ''}`}></div>
              <span className="text-gray-600">Deploys totales: <strong>{totalDeployments}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Tickets Únicos: <strong>{uniqueTickets}</strong></span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
          <StageColumn
            stage="dev"
            deployments={developDeployments}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
          <StageColumn
            stage="testing"
            deployments={testingDeployments}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
          <StageColumn
            stage="uat"
            deployments={uatDeployments}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        </div>
      </main>

      <footer className="w-full text-center py-4 text-xs text-gray-500 bg-transparent">
        Versión: {typeof window !== 'undefined' && (window as any).JIRATRACKER_VERSION ? (window as any).JIRATRACKER_VERSION : 'unknown'}
      </footer>
    </div>
  );
}

export default App;
