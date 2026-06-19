import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Activity, Filter, Users, ClipboardList } from 'lucide-react';
import { apiClient, type Deployment, type DeploymentDetail } from './lib/api';
import { StageColumn } from './components/StageColumn';
import { SearchBar } from './components/SearchBar';

const ITEMS_PER_PAGE = 100;

const extractStableVersion = (version?: string | null): string | null => {
  if (!version) return null;
  const match = version.trim().match(/\d+\.\d+\.\d+/);
  return match ? match[0] : null;
};

type Stage = 'dev' | 'testing' | 'uat';

// Orden de avance de los ambientes: dev -> testing -> uat
const STAGE_ORDER: Record<Stage, number> = { dev: 0, testing: 1, uat: 2 };

function App() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string>('(todas)');
  const [isLoading, setIsLoading] = useState(true);
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore] = useState(true);
  const [pendientesUAT, setPendientesUAT] = useState(false);
  const [stageFilters, setStageFilters] = useState<Record<Stage, boolean>>({
    dev: false,
    testing: false,
    uat: false,
  });
  const toggleStageFilter = useCallback((stage: Stage) => {
    setStageFilters(prev => ({ ...prev, [stage]: !prev[stage] }));
  }, []);
  const [detailsMap, setDetailsMap] = useState<Record<string, DeploymentDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const detailSourceRef = useRef<EventSource | null>(null);

  // Cerrar el SSE stream de detalles
  const closeDetailStream = useCallback(() => {
    if (detailSourceRef.current) {
      detailSourceRef.current.close();
      detailSourceRef.current = null;
    }
  }, []);

  const fetchDeployments = useCallback(async (pageNum: number, append: boolean = false, version: string = selectedVersion) => {
    setIsLoading(true);
    setIsStreaming(true);
    if (!append) {
      setDeployments([]);
      setDetailsMap({});
      closeDetailStream();
    }
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
  }, [selectedVersion, closeDetailStream]);

  useEffect(() => {
    fetchDeployments(1, false, selectedVersion);
    setPage(1);
  }, [fetchDeployments, selectedVersion]);

  // Abrir SSE stream para cargar detalles de JIRA cuandnoo termina el stream de deployments
  useEffect(() => {
    if (isStreaming || deployments.length === 0) return;

    const uniqueTicketIds = [...new Set(deployments.map(d => d.ticket_id).filter(Boolean))];
    if (uniqueTicketIds.length === 0) return;

    // Cerrar stream anterior si existe
    closeDetailStream();
    setLoadingDetails(true);

    const source = apiClient.streamDeploymentDetails(
      uniqueTicketIds,
      (detail) => {
        setDetailsMap(prev => ({ ...prev, [detail.ticket_id]: detail }));
      },
      () => {
        setLoadingDetails(false);
      },
      () => {
        setLoadingDetails(false);
      }
    );
    detailSourceRef.current = source;

    return () => {
      closeDetailStream();
    };
  }, [isStreaming, deployments, closeDetailStream]);

  // Cargar lista de versiones desde el backend
  useEffect(() => {
    apiClient.getVersions()
      .then(versions => setAvailableVersions(versions))
      .catch(err => console.error('Error fetching versions:', err));
  }, []);

  // Cerrar SSE al desmontar
  useEffect(() => {
    return () => closeDetailStream();
  }, [closeDetailStream]);

  useEffect(() => {
    let filtered = deployments;
    // Filtrar solo los deployments que tengan ticket_id
    filtered = filtered.filter(d => d.ticket_id);
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
      filtered = filtered.filter(d => extractStableVersion(d.version) === selectedVersion);
    }
    setFilteredDeployments(filtered);
  }, [deployments, searchQuery, selectedVersion]);

  // Lista de versiones obtenida desde el backend (/versions)
  const versionOptions = useMemo(() => {
    const normalized = Array.from(
      new Set(
        availableVersions
          .map(v => extractStableVersion(v))
          .filter((v): v is string => Boolean(v))
      )
    );
    const sorted = normalized.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
    return ['(todas)', ...sorted];
  }, [availableVersions]);

  // Ambiente más avanzado al que llegó cada ticket (dev < testing < uat)
  const ticketMaxStage = useMemo(() => {
    const map = new Map<string, number>();
    filteredDeployments.forEach(d => {
      const order = STAGE_ORDER[d.stage];
      const current = map.get(d.ticket_id);
      if (current === undefined || order > current) {
        map.set(d.ticket_id, order);
      }
    });
    return map;
  }, [filteredDeployments]);

  const developDeployments = filteredDeployments.filter(d =>
    d.stage === 'dev' &&
    (!stageFilters.dev || ticketMaxStage.get(d.ticket_id) === STAGE_ORDER.dev)
  );
  const uatDeployments = filteredDeployments.filter(d =>
    d.stage === 'uat' &&
    (!stageFilters.uat || ticketMaxStage.get(d.ticket_id) === STAGE_ORDER.uat)
  );

  const testingDeployments = filteredDeployments.filter(d =>
    d.stage === 'testing' &&
    (!(pendientesUAT || stageFilters.testing) || ticketMaxStage.get(d.ticket_id) === STAGE_ORDER.testing)
  );

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

              <button
                onClick={() => setPendientesUAT(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors duration-200 ${
                  pendientesUAT
                    ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                title="Mostrar tickets en Testing que aún no están en UAT"
              >
                <ClipboardList className="w-4 h-4" />
                Pendientes UAT
              </button>
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
            detailsMap={detailsMap}
            loadingDetails={loadingDetails}
            filterActive={stageFilters.dev}
            onToggleFilter={() => toggleStageFilter('dev')}
          />
          <StageColumn
            stage="testing"
            deployments={testingDeployments}
            detailsMap={detailsMap}
            loadingDetails={loadingDetails}
            filterActive={pendientesUAT || stageFilters.testing}
            onToggleFilter={() => toggleStageFilter('testing')}
          />
          <StageColumn
            stage="uat"
            deployments={uatDeployments}
            detailsMap={detailsMap}
            loadingDetails={loadingDetails}
            filterActive={stageFilters.uat}
            onToggleFilter={() => toggleStageFilter('uat')}
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
