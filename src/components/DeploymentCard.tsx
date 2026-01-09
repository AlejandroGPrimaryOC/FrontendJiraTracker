import { Calendar, User, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { Deployment } from '../lib/api';

interface DeploymentCardProps {
  deployment: Deployment;
}

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Active' },
  'in-progress': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'In Progress' },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
  'rolled-back': { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Rolled Back' },
};

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const StatusIcon = statusConfig[deployment.status].icon;
  const releaseDate = new Date(deployment.release_date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - releaseDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const timeAgo = diffDays === 0 ? 'Today' :
                  diffDays === 1 ? 'Yesterday' :
                  diffDays < 7 ? `${diffDays} days ago` :
                  diffDays < 30 ? `${Math.floor(diffDays / 7)} weeks ago` :
                  `${Math.floor(diffDays / 30)} months ago`;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
            {deployment.ticket_id}
          </span>
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
          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
            {deployment.version}
          </code>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{deployment.owner}</span>
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
