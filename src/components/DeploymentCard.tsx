import { Calendar, User, Package, AlertCircle, CheckCircle, Clock, Ban, Computer, Loader2 } from 'lucide-react';
import type { Deployment, DeploymentDetail } from '../lib/api';

interface DeploymentCardProps {
  deployment: Deployment;
  detail: DeploymentDetail | null;
  loadingDetail: boolean;
}

const PENDING_VALUE_TEXT = 'Dato pendiente de carga';

const isPlaceholderValue = (value?: string | null): boolean => {
  return typeof value === 'string' && value.trim().toLowerCase() === 'placeholder';
};

const getDisplayValue = (value?: string | null, fallback: string = '—'): string => {
  if (isPlaceholderValue(value)) return PENDING_VALUE_TEXT;
  if (!value || !value.trim()) return fallback;
  return value;
};

const statusConfig = {
  activo: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Activo' },
  'en curso': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'En Curso' },
  'ready to qa': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Ready to QA' },
  finalizado: { icon: CheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Finalizado' },
  finalizada: { icon: CheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Finalizada' },
  'qa in progress': { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', label: 'QA In Progress' },
  bloqued: { icon: Ban, color: 'text-gray-700', bg: 'bg-gray-200', label: 'Bloqueado' },
  blocked: { icon: Ban, color: 'text-gray-700', bg: 'bg-gray-200', label: 'Bloqueado' },
  'development completed': { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100', label: 'Development Completed' },
  'seleccionado para desarrollo': { icon: Package, color: 'text-blue-800', bg: 'bg-blue-100', label: 'Seleccionado para Desarrollo' },
  'tareas por hacer': { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Tareas por Hacer' },
  'front in progress': { icon: Clock, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Front In Progress' },
  'in analisys': { icon: User, color: 'text-cyan-700', bg: 'bg-cyan-50', label: 'In Analysis' },
  'ready for development': { icon: Package, color: 'text-indigo-700', bg: 'bg-indigo-50', label: 'Ready for Development' },
};

function SkeletonLine({ width = 'w-24' }: { width?: string }) {
  return (
    <div className={`${width} h-4 bg-gray-200 rounded animate-pulse`} />
  );
}

export function DeploymentCard({ deployment, detail, loadingDetail }: DeploymentCardProps) {
  const rawStatus = detail?.status || deployment.status;
  const isPendingStatus = isPlaceholderValue(rawStatus);
  const status = isPlaceholderValue(rawStatus) ? undefined : rawStatus;
  const description = getDisplayValue(detail?.summary || deployment.description);
  const owner = getDisplayValue(detail?.owner || deployment.owner);
  const developer = getDisplayValue(deployment.developer);
  const version = getDisplayValue(deployment.version);
  const ticketId = getDisplayValue(deployment.ticket_id);

  const jiraUrl = !isPlaceholderValue(detail?.jira_url)
    ? detail?.jira_url || `https://pmy.atlassian.net/browse/${deployment.ticket_id}`
    : undefined;
  const canLinkTicket = !isPlaceholderValue(deployment.ticket_id) && Boolean(deployment.ticket_id);
  const canLinkVersion = !isPlaceholderValue(deployment.version) && Boolean(deployment.version);

  const statusEntry = status ? (statusConfig as Record<string, typeof statusConfig['activo']>)[status] ?? null : null;
  const StatusIcon = statusEntry?.icon;

  const hasValidReleaseDate =
    !isPlaceholderValue(deployment.release_date) && !Number.isNaN(new Date(deployment.release_date).getTime());
  const releaseDate = hasValidReleaseDate ? new Date(deployment.release_date) : null;

  const now = new Date();
  const diffTime = releaseDate ? Math.abs(now.getTime() - releaseDate.getTime()) : 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const timeAgo = !releaseDate ? null : diffDays === 0 ? 'Hoy' :
                  diffDays === 1 ? 'Ayer' :
                  diffDays < 7 ? `${diffDays} días atrás` :
                  diffDays < 30 ? `${Math.floor(diffDays / 7)} semanas atrás` :
                  `${Math.floor(diffDays / 30)} meses atrás`;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {canLinkTicket && jiraUrl ? (
            <a
              href={jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded hover:text-blue-900"
              style={{ textDecoration: 'none' }}
            >
              {ticketId}
            </a>
          ) : (
            <span className="text-sm font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded">
              {ticketId}
            </span>
          )}
          {loadingDetail && !statusEntry ? (
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
              <span className="text-xs text-gray-400">Cargando...</span>
            </div>
          ) : isPendingStatus ? (
            <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded">
              <span className="text-xs font-medium text-amber-900">{PENDING_VALUE_TEXT}</span>
            </div>
          ) : statusEntry && StatusIcon ? (
            <div className={`flex items-center gap-1 ${statusEntry.bg} px-2 py-1 rounded`}>
              <StatusIcon className={`w-3 h-3 ${statusEntry.color}`} />
              <span className={`text-xs font-medium ${statusEntry.color}`}>
                {statusEntry.label}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
        {loadingDetail && !description ? (
          <SkeletonLine width="w-full" />
        ) : (
          description
        )}
      </h3>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          {canLinkVersion ? (
            <a
              href={`http://gitlab.primary/clearing-tech/one-clearing/api-caratula/-/tags/${deployment.version}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono hover:text-blue-700"
              style={{ textDecoration: 'none' }}
            >
              {version}
            </a>
          ) : (
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs">
              {version}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          {loadingDetail && !owner ? (
            <SkeletonLine width="w-20" />
          ) : (
            <span>{owner}</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Computer className="w-4 h-4" />
          <span>{developer}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {releaseDate ? (
            <>
              <span>{releaseDate.toLocaleDateString()}</span>
              {timeAgo && <span className="text-xs text-gray-500">({timeAgo})</span>}
            </>
          ) : (
            <span>{getDisplayValue(deployment.release_date)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
