import { GitCommit, User, Package, FileText } from 'lucide-react';
import type { SprintChangelogEntry } from '../lib/api';

interface ChangelogListProps {
  entries: SprintChangelogEntry[];
}

const isPlaceholderValue = (value?: string | null): boolean =>
  typeof value === 'string' && value.trim().toLowerCase() === 'placeholder';

const getDisplayValue = (value?: string | null, fallback = '—'): string => {
  if (isPlaceholderValue(value)) return fallback;
  if (!value || !value.trim()) return fallback;
  return value;
};

export function ChangelogList({ entries }: ChangelogListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No hay tickets registrados para este sprint.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const jiraUrl =
          !isPlaceholderValue(entry.jira_url) && entry.jira_url
            ? entry.jira_url
            : entry.ticket_id
            ? `https://pmy.atlassian.net/browse/${entry.ticket_id}`
            : undefined;

        return (
          <div
            key={`${entry.ticket_id}-${entry.version}-${index}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {jiraUrl ? (
                <a
                  href={jiraUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded hover:text-blue-900"
                  style={{ textDecoration: 'none' }}
                >
                  {getDisplayValue(entry.ticket_id)}
                </a>
              ) : (
                <span className="text-sm font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                  {getDisplayValue(entry.ticket_id)}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono">
                <Package className="w-3 h-3" />
                {getDisplayValue(entry.version)}
              </span>
              {entry.status && !isPlaceholderValue(entry.status) && (
                <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {entry.status}
                </span>
              )}
              {entry.release_date && !isPlaceholderValue(entry.release_date) &&
                !Number.isNaN(new Date(entry.release_date).getTime()) && (
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(entry.release_date).toLocaleDateString()}
                  </span>
                )}
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">
              {getDisplayValue(entry.summary)}
            </h4>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>{getDisplayValue(entry.git_user)}</span>
              </div>

              {(entry.commit_message || entry.commit_hash) && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <GitCommit className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span>
                    {entry.commit_hash && !isPlaceholderValue(entry.commit_hash) && (
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">
                        {entry.commit_hash.slice(0, 8)}
                      </code>
                    )}
                    {getDisplayValue(entry.commit_message)}
                  </span>
                </div>
              )}

              {entry.changes && entry.changes.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                  <ul className="list-disc list-inside space-y-0.5">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="text-xs text-gray-600 break-all">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
