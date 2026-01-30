
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-tracker.oneclearing.dev.primary/';

export type Deployment = {
  id: string;                    
  ticket_id: string;             // Jira ticket ID (e.g., "PROJ-123")
  version: string;               // Version (e.g., "1.2.3-alpha.1")
  stage: 'dev' | 'testing' | 'uat';  // Stage
  release_date: string;          
  description: string;           
  owner: string;            
  developer: string;     
  status: 'activo' | 'en curso' | 'ready to qa' | 'finalizado'; 
  created_at: string;           
  updated_at: string;           
};

export type CreateDeploymentDTO = {
  ticket_id: string;             
  version: string;               
  stage: 'dev' | 'testing' | 'uat';  
  description: string;           
  owner: string;                 
  release_date: string;          
  status: 'activo' | 'en curso' | 'ready to qa' | 'finalizado';  
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error inesperado al realizar la solicitud');
    }
  }

  /**
   * Obtiene deployments usando stream JSONL. Llama a onDeployment por cada deployment recibido.
   * Devuelve una promesa que resuelve cuando termina el stream.
   */
  async getDeploymentsStream(
    page: number = 1,
    perPage: number = 100,
    search: string | undefined,
    onDeployment: (deployment: Deployment) => void
  ): Promise<void> {
    let url = `/releases?page=${page}&per_page=${perPage}`;
    if (search && search !== '(todas)') {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.body) throw new Error('No stream body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) {
          try {
            const obj = JSON.parse(line);
            onDeployment(obj);
          } catch (e) {
            // línea inválida, ignorar
          }
        }
      }
    }
    // Procesar cualquier línea restante
    if (buffer.trim()) {
      try {
        const obj = JSON.parse(buffer);
        onDeployment(obj);
      } catch {}
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
