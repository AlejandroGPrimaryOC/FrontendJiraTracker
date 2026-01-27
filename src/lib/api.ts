
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Deployment object returned from the API
 * Represents a ticket deployment in one of the three stages
 */
export type Deployment = {
  id: string;                    // Unique identifier (UUID)
  ticket_id: string;             // Jira ticket ID (e.g., "PROJ-123")
  version: string;               // Version string (e.g., "1.2.3-alpha.1")
  stage: 'dev' | 'testing' | 'uat';  // Deployment stage
  release_date: string;          // ISO 8601 date string
  description: string;           // Deployment description
  owner: string;                 // Owner name
  status: 'activo' | 'en curso' | 'ready to qa' | 'finalizado';  // Deployment status
  created_at: string;            // ISO 8601 timestamp (auto-generated)
  updated_at: string;            // ISO 8601 timestamp (auto-generated)
};

/**
 * Data Transfer Object for creating a new deployment
 * All fields are required
 */
export type CreateDeploymentDTO = {
  ticket_id: string;             // Jira ticket ID (required)
  version: string;               // Version string (required)
  stage: 'dev' | 'testing' | 'uat';  // Deployment stage (required)
  description: string;           // Deployment description (required)
  owner: string;                 // Owner name (required)
  release_date: string;          // ISO 8601 date string (required)
  status: 'activo' | 'en curso' | 'ready to qa' | 'finalizado';  // Deployment status (required)
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
   * Fetch deployments with pagination and sorting
   * @param page - Page number (1-indexed)
   * @param perPage - Number of items per page
   * @returns Paginated deployment response
   */
  async getDeployments(
    page: number = 1,
    perPage: number = 10
  ): Promise<PaginatedResponse<Deployment>> {
    return this.fetch<PaginatedResponse<Deployment>>(
      `/deployments?page=${page}&per_page=${perPage}&sort=release_date&order=desc`
    );
  }

  /**
   * Create a new deployment
   * @param deployment - Deployment data to create
   * @returns Created deployment
   */
  async createDeployment(
    deployment: CreateDeploymentDTO
  ): Promise<Deployment> {
    return this.fetch<Deployment>('/deployments', {
      method: 'POST',
      body: JSON.stringify(deployment),
    });
  }

  /**
   * Get a single deployment by ID
   * @param id - Deployment ID
   * @returns Deployment data
   */
  async getDeployment(id: string): Promise<Deployment> {
    return this.fetch<Deployment>(`/deployments/${id}`);
  }

  /**
   * Update a deployment
   * @param id - Deployment ID
   * @param deployment - Partial deployment data to update
   * @returns Updated deployment
   */
  async updateDeployment(
    id: string,
    deployment: Partial<CreateDeploymentDTO>
  ): Promise<Deployment> {
    return this.fetch<Deployment>(`/deployments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(deployment),
    });
  }

  /**
   * Delete a deployment
   * @param id - Deployment ID
   */
  async deleteDeployment(id: string): Promise<void> {
    return this.fetch<void>(`/deployments/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
