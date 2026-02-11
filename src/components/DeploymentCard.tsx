import { Calendar, User, Package, AlertCircle, CheckCircle, Clock, Ban, Computer } from 'lucide-react';
import type { Deployment } from '../lib/api';

interface DeploymentCardProps {
  deployment: Deployment;
}

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

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const StatusIcon = statusConfig[deployment.status].icon;
  const releaseDate = new Date(deployment.release_date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - releaseDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const timeAgo = diffDays === 0 ? 'Hoy' :
                  diffDays === 1 ? 'Ayer' :
                  diffDays < 7 ? `${diffDays} días atrás` :
                  diffDays < 30 ? `${Math.floor(diffDays / 7)} semanas atrás` :
                  `${Math.floor(diffDays / 30)} meses atrás`;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <a
            href={`https://pmy.atlassian.net/browse/${deployment.ticket_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded hover:text-blue-900"
            style={{ textDecoration: 'none' }}
          >
            {deployment.ticket_id}
          </a>
          <div className={`flex items-center gap-1 ${statusConfig[deployment.status].bg} px-2 py-1 rounded`}>
            <StatusIcon className={`w-3 h-3 ${statusConfig[deployment.status].color}`} />
            <span className={`text-xs font-medium ${statusConfig[deployment.status].color}`}>
              {statusConfig[deployment.status].label}
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
        {deployment.description}
      </h3>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          <a
            href={`http://gitlab.primary/clearing-tech/one-clearing/api-caratula/-/tags/${deployment.version}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono hover:text-blue-700"
            style={{ textDecoration: 'none' }}
          >
            {deployment.version}
          </a>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{deployment.owner}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Computer className="w-4 h-4" />
          <span>{deployment.developer}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{releaseDate.toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">({timeAgo})</span>
        </div>
      </div>
    </div>
  );
}
