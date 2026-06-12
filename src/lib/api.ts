
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-tracker.oneclearing.dev.primary';

export type DeploymentStatus = 'activo' | 'en curso' | 'ready to qa' | 'finalizado';

export type Deployment = {
  id: string;                    
  ticket_id: string;             // Jira ticket ID (e.g., "PROJ-123")
  version: string;               // Version (e.g., "1.2.3-alpha.1")
  stage: 'dev' | 'testing' | 'uat';  // Stage
  release_date: string;          
  description?: string;           
  owner?: string;            
  developer?: string;     
  status?: DeploymentStatus; 
  created_at?: string;           
  updated_at?: string;           
};

export type DeploymentDetail = {
  ticket_id: string;
  summary: string;
  status: string;
  owner: string;
  jira_url: string;
};

export type CreateDeploymentDTO = {
  ticket_id: string;             
  version: string;               
  stage: 'dev' | 'testing' | 'uat';  
  description: string;           
  owner: string;                 
  release_date: string;          
  status: DeploymentStatus;  
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
};

/**
 * Entrada del changelog de un sprint: un ticket OCL-xxx con su detalle y el
 * commit/cambios que lo incluyeron en una versión RC concreta.
 */
export type SprintChangelogEntry = {
  ticket_id: string;             // ID del ticket Jira (ej: "OCL-1234")
  summary: string;               // Descripción / título del ticket
  status?: string;               // Estado del ticket
  version: string;               // Versión RC donde se incluyó (ej: "1.2.3-rc.4")
  git_user?: string;             // Usuario git asignado al cambio
  commit_hash?: string;          // Hash del commit
  commit_message?: string;       // Descripción del commit
  release_date?: string;         // Fecha del deploy de la RC (ISO 8601)
  jira_url?: string;             // URL al ticket en Jira
  changes?: string[];            // Lista de cambios / archivos afectados
};

/**
 * Métricas de calidad y tests asociadas a una versión RC del sprint.
 * Permite graficar la evolución (mejora/empeora) a lo largo de las RC.
 */
export type SprintVersionMetrics = {
  version: string;               // Versión RC (ej: "1.2.3-rc.4")
  release_date?: string;         // Fecha del deploy (ISO 8601)
  coverage?: number;             // Cobertura de tests (%)
  line_count?: number;           // Líneas de código (line counter)
  warnings?: number;             // Cantidad de warnings del build/lint
  cyclomatic_complexity?: number;// Complejidad ciclomática promedio
  code_smells?: number;          // Code smells reportados por el análisis estático
  duplications?: number;         // Duplicación de código (%)
  tests_total?: number;          // Total de tests
  tests_passed?: number;         // Tests que pasaron
};

/**
 * Reporte de fin de sprint. Un sprint está determinado por la versión estable
 * (major.minor.patch) e incluye todas las RC desplegadas.
 */
export type SprintReport = {
  sprint: string;                // Versión estable del sprint (ej: "1.2.3")
  rc_versions: string[];         // Versiones RC incluidas, en orden de despliegue
  changelog: SprintChangelogEntry[];
  metrics: SprintVersionMetrics[];
  generated_at?: string;         // Timestamp de generación del reporte (ISO 8601)
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
    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}`);
    }
    if (!response.body) throw new Error('No stream body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const emitDeployment = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(emitDeployment);
        return;
      }
      if (!value || typeof value !== 'object') {
        return;
      }

      const candidate = value as Partial<Deployment>;
      if (!candidate.id || !candidate.ticket_id || !candidate.stage) {
        return;
      }

      onDeployment(candidate as Deployment);
    };

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
            // JSONL mode: one deployment per line
            emitDeployment(obj);
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
        // Compatibilidad con respuesta JSON normal: [] o { data: [] }
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && 'data' in obj) {
          emitDeployment((obj as PaginatedResponse<Deployment>).data);
        } else {
          emitDeployment(obj);
        }
      } catch {}
    }
  }

  /**
   * Obtiene la lista de versiones disponibles desde el backend.
   */
  async getVersions(): Promise<string[]> {
    return this.fetch<string[]>('/versions');
  }

  /**
   * Obtiene el reporte de fin de sprint para una versión estable
   * (major.minor.patch). El backend debe agregar el changelog de todos los
   * tickets incluidos en las RC de esa versión junto con las métricas de
   * tests/calidad por cada RC.
   *
   * Endpoint esperado: GET /sprint-report?version={major.minor.patch}
   */
  async getSprintReport(version: string): Promise<SprintReport> {
    const stable = version.trim();
    return this.fetch<SprintReport>(
      `/sprint-report?version=${encodeURIComponent(stable)}`
    );
  }

  /**
   * Abre un stream SSE para obtener detalles de JIRA de múltiples tickets.
   * Envía los ticket_ids como query param y recibe eventos `release-detail` con los datos.
   * Devuelve el EventSource para poder cerrarlo externamente (ej: cambio de versión).
   */
  streamDeploymentDetails(
    ticketIds: string[],
    onDetail: (detail: DeploymentDetail) => void,
    onDone?: () => void,
    onError?: (error: Event) => void
  ): EventSource {
    const ids = ticketIds.join(',');
    const url = `${this.baseUrl}/release-details-stream?ticket_ids=${encodeURIComponent(ids)}`;
    const source = new EventSource(url);

    source.addEventListener('release-detail', (e: MessageEvent) => {
      try {
        const detail = JSON.parse(e.data) as DeploymentDetail;
        onDetail(detail);
      } catch {
        // datos inválidos, ignorar
      }
    });

    source.addEventListener('done', () => {
      source.close();
      onDone?.();
    });

    source.onerror = (e) => {
      source.close();
      onError?.(e);
    };

    return source;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
