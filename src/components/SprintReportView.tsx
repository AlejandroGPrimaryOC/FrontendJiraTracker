import { useState, useEffect, useCallback, useMemo } from 'react';
import { FileBarChart, RefreshCw, AlertTriangle, ListChecks, Hash } from 'lucide-react';
import { apiClient, type SprintReport, type SprintVersionMetrics } from '../lib/api';
import { MetricTrendChart, type MetricDirection, type MetricPoint } from './MetricTrendChart';
import { ChangelogList } from './ChangelogList';

interface SprintReportViewProps {
  versionOptions: string[];
}

interface MetricDef {
  key: keyof SprintVersionMetrics;
  title: string;
  unit?: string;
  betterDirection: MetricDirection;
  decimals?: number;
}

const METRIC_DEFS: MetricDef[] = [
  { key: 'coverage', title: 'Cobertura de tests', unit: '%', betterDirection: 'up', decimals: 1 },
  { key: 'line_count', title: 'Líneas de código', betterDirection: 'neutral' },
  { key: 'warnings', title: 'Warnings', betterDirection: 'down' },
  { key: 'cyclomatic_complexity', title: 'Complejidad ciclomática', betterDirection: 'down', decimals: 1 },
  { key: 'code_smells', title: 'Code smells', betterDirection: 'down' },
  { key: 'duplications', title: 'Duplicación de código', unit: '%', betterDirection: 'down', decimals: 1 },
];

const shortVersionLabel = (version: string): string => {
  const rc = version.match(/rc\.?(\d+)/i);
  if (rc) return `rc.${rc[1]}`;
  const last = version.split(/[.\-+]/).pop();
  return last || version;
};

export function SprintReportView({ versionOptions }: SprintReportViewProps) {
  const sprints = useMemo(
    () => versionOptions.filter(v => v && v !== '(todas)'),
    [versionOptions]
  );

  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [report, setReport] = useState<SprintReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seleccionar el primer sprint disponible automáticamente.
  useEffect(() => {
    if (!selectedSprint && sprints.length > 0) {
      setSelectedSprint(sprints[0]);
    }
  }, [sprints, selectedSprint]);

  const fetchReport = useCallback((sprint: string) => {
    if (!sprint) return;
    setIsLoading(true);
    setError(null);
    apiClient
      .getSprintReport(sprint)
      .then(data => setReport(data))
      .catch((err: unknown) => {
        setReport(null);
        setError(err instanceof Error ? err.message : 'Error al obtener el reporte de sprint');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSprint) {
      fetchReport(selectedSprint);
    }
  }, [selectedSprint, fetchReport]);

  const sortedMetrics = useMemo(() => {
    if (!report?.metrics) return [];
    return [...report.metrics].sort((a, b) => {
      if (a.release_date && b.release_date) {
        return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
      }
      return a.version.localeCompare(b.version, undefined, { numeric: true });
    });
  }, [report]);

  const buildPoints = useCallback(
    (key: keyof SprintVersionMetrics): MetricPoint[] =>
      sortedMetrics.map(m => ({
        label: shortVersionLabel(m.version),
        value: m[key] as number | undefined,
      })),
    [sortedMetrics]
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sprint (versión):</span>
          <select
            value={selectedSprint}
            onChange={e => setSelectedSprint(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sprints.length === 0}
          >
            {sprints.length === 0 ? (
              <option value="">Sin versiones disponibles</option>
            ) : (
              sprints.map(v => (
                <option key={v} value={v}>{v}</option>
              ))
            )}
          </select>
        </div>
        <button
          onClick={() => fetchReport(selectedSprint)}
          disabled={!selectedSprint || isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>

        {report?.rc_versions && report.rc_versions.length > 0 && (
          <div className="sm:ml-auto flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-4 h-4 text-gray-400" />
            <span>RCs incluidas: <strong>{report.rc_versions.length}</strong></span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-blue-700 font-medium">Generando reporte de sprint...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">No se pudo generar el reporte</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 text-amber-700">
              Verifica que el backend exponga el endpoint <code>GET /sprint-report?version={selectedSprint || 'x.y.z'}</code>.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && report && (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileBarChart className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Avance de tests y calidad de código</h2>
            </div>
            {sortedMetrics.length === 0 ? (
              <p className="text-sm text-gray-500">No hay métricas disponibles para este sprint.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {METRIC_DEFS.map(def => (
                  <MetricTrendChart
                    key={String(def.key)}
                    title={def.title}
                    unit={def.unit}
                    points={buildPoints(def.key)}
                    betterDirection={def.betterDirection}
                    decimals={def.decimals}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Changelog del sprint</h2>
              <span className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-semibold">
                {report.changelog?.length ?? 0}
              </span>
            </div>
            <ChangelogList entries={report.changelog ?? []} />
          </section>
        </div>
      )}
    </main>
  );
}
