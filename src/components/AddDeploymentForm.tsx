import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { apiClient } from '../lib/api';

interface AddDeploymentFormProps {
  onSuccess: () => void;
}

export function AddDeploymentForm({ onSuccess }: AddDeploymentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ticket_id: '',
    version: '',
    description: '',
    owner: '',
    release_date: new Date().toISOString().split('T')[0],
    status: 'activo' as const,
  });

  const getStageFromVersion = (version: string): 'dev' | 'testing' | 'uat' => {
    if (version.includes('alpha')) return 'dev';
    if (version.includes('beta')) return 'testing';
    if (version.includes('rc')) return 'uat';
    return 'dev';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const stage = getStageFromVersion(formData.version);

      await apiClient.createDeployment({
        ticket_id: formData.ticket_id,
        version: formData.version,
        stage,
        description: formData.description,
        owner: formData.owner,
        release_date: formData.release_date,
        status: formData.status,
      });

      setFormData({
        ticket_id: '',
        version: '',
        description: '',
        owner: '',
        release_date: new Date().toISOString().split('T')[0],
        status: 'activo',
      });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error al agregar deploy:', error);
      alert('Error al agregar deploy');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Agregar Deploy
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Agregar Nuevo Deploy</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticket ID *
            </label>
            <input
              type="text"
              required
              value={formData.ticket_id}
              onChange={(e) => setFormData({ ...formData, ticket_id: e.target.value })}
              placeholder="e.j., PROJ-123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version *
            </label>
            <input
              type="text"
              required
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., 1.2.3-alpha.1, 2.0.0-beta.2, 1.5.0-rc.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Usar 'alpha' para Develop, 'beta' para Testing, 'rc' para UAT
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descripción del deploy"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner *
            </label>
            <input
              type="text"
              required
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="e.j., pepito"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={formData.release_date}
              onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'activo' | 'en curso' | 'ready to qa' | 'finalizado' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="activo">Activo</option>
              <option value="en curso">En Curso</option>
              <option value="ready to qa">Ready to QA</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Agregando...' : 'Agregar Deploy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
