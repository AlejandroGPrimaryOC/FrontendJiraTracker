import { useState, useEffect, useCallback } from 'react';
import { Activity, Filter, Users } from 'lucide-react';
import { apiClient, type Deployment } from './lib/api';
import { StageColumn } from './components/StageColumn';
import { SearchBar } from './components/SearchBar';

const ITEMS_PER_PAGE = 10;

function App() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchDeployments = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setIsLoading(true);

      const response = await apiClient.getDeployments(pageNum, ITEMS_PER_PAGE);

      if (response.data) {
        setDeployments(prev => append ? [...prev, ...response.data] : response.data);
        setHasMore(response.has_more);
      }
    } catch (error) {
      console.error('Error fetching deployments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeployments(1);
  }, [fetchDeployments]);

  useEffect(() => {
    let filtered = deployments;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.ticket_id.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.owner.toLowerCase().includes(query) ||
        d.version.toLowerCase().includes(query)
      );
    }

    if (selectedOwner !== 'all') {
      filtered = filtered.filter(d => d.owner === selectedOwner);
    }

    setFilteredDeployments(filtered);
  }, [deployments, searchQuery, selectedOwner]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeployments(nextPage, true);
  };

  const uniqueOwners = Array.from(new Set(deployments.map(d => d.owner))).sort();

  const developDeployments = filteredDeployments.filter(d => d.stage === 'dev');
  const testingDeployments = filteredDeployments.filter(d => d.stage === 'testing');
  const uatDeployments = filteredDeployments.filter(d => d.stage === 'uat');

  const totalDeployments = deployments.length;
  const uniqueTickets = new Set(deployments.map(d => d.ticket_id)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los propietarios</option>
                  {uniqueOwners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
    </div>
  );
}

export default App;
