import { Code, TestTube, CheckSquare } from 'lucide-react';
import type { Deployment } from '../lib/supabase';
import { DeploymentCard } from './DeploymentCard';

interface StageColumnProps {
  stage: 'develop' | 'testing' | 'uat';
  deployments: Deployment[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const stageConfig = {
  develop: {
    title: 'Development',
    icon: Code,
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
  },
  testing: {
    title: 'Testing',
    icon: TestTube,
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
  },
  uat: {
    title: 'UAT',
    icon: CheckSquare,
    color: 'bg-green-500',
    borderColor: 'border-green-500',
  },
};

export function StageColumn({ stage, deployments, onLoadMore, hasMore, isLoading }: StageColumnProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;

  const groupedDeployments = deployments.reduce((acc, deployment) => {
    if (!acc[deployment.ticket_id]) {
      acc[deployment.ticket_id] = [];
    }
    acc[deployment.ticket_id].push(deployment);
    return acc;
  }, {} as Record<string, Deployment[]>);

  const uniqueTickets = Object.values(groupedDeployments).map(versions => {
    const sortedVersions = versions.sort((a, b) =>
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
    return sortedVersions[0];
  });

  return (
    <div className="flex flex-col min-h-0">
      <div className={`${config.color} text-white p-4 rounded-t-lg border-b-4 ${config.borderColor}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-6 h-6" />
          <h2 className="text-xl font-bold">{config.title}</h2>
          <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
            {uniqueTickets.length}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
        {uniqueTickets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No deployments in this stage
          </div>
        ) : (
          <>
            {uniqueTickets.map((deployment) => {
              const versions = groupedDeployments[deployment.ticket_id];
              return (
                <div key={deployment.id}>
                  <DeploymentCard deployment={deployment} />
                  {versions.length > 1 && (
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-300 space-y-1">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Previous versions ({versions.length - 1}):
                      </p>
                      {versions.slice(1).map((v) => (
                        <div key={v.id} className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                          <code className="font-mono">{v.version}</code>
                          <span className="ml-2">
                            {new Date(v.release_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {hasMore && (
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
