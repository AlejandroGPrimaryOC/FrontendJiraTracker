# API Documentation - Jira Deployment Tracker Backend

## Overview

This document specifies the HTTP API endpoints required for the Jira Deployment Tracker frontend application. The backend should implement these endpoints to provide deployment management functionality.

## Base URL

All API endpoints should be prefixed with the base URL configured in the environment:
- **Development**: `http://localhost:3000/api`
- **Production**: Set via `VITE_API_BASE_URL` environment variable

## Authentication

Currently, the API does not require authentication. If you need to add authentication in the future, consider using:
- JWT tokens in the `Authorization` header
- API keys
- OAuth 2.0

## Data Transfer Objects (DTOs)

### Deployment DTO

Represents a deployment in the system.

```typescript
interface Deployment {
  id: string;                    // Unique identifier (UUID recommended)
  ticket_id: string;             // Jira ticket ID (e.g., "PROJ-123")
  version: string;               // Version string (e.g., "1.2.3-alpha.1")
  stage: 'develop' | 'testing' | 'uat';  // Deployment stage
  release_date: string;          // ISO 8601 date string (e.g., "2024-01-15")
  description: string;           // Deployment description
  owner: string;                 // Owner name (e.g., "John Doe")
  status: 'active' | 'in-progress' | 'failed' | 'rolled-back';  // Deployment status
  created_at: string;            // ISO 8601 timestamp (auto-generated)
  updated_at: string;            // ISO 8601 timestamp (auto-generated)
}
```

### CreateDeploymentDTO

Used when creating a new deployment.

```typescript
interface CreateDeploymentDTO {
  ticket_id: string;             // Required
  version: string;               // Required
  stage: 'develop' | 'testing' | 'uat';  // Required
  description: string;           // Required
  owner: string;                 // Required
  release_date: string;          // Required - ISO 8601 date string
  status: 'active' | 'in-progress' | 'failed' | 'rolled-back';  // Required
}
```

### UpdateDeploymentDTO

Used when updating an existing deployment (all fields optional).

```typescript
interface UpdateDeploymentDTO {
  ticket_id?: string;
  version?: string;
  stage?: 'develop' | 'testing' | 'uat';
  description?: string;
  owner?: string;
  release_date?: string;
  status?: 'active' | 'in-progress' | 'failed' | 'rolled-back';
}
```

### PaginatedResponse DTO

Generic paginated response wrapper.

```typescript
interface PaginatedResponse<T> {
  data: T[];                     // Array of items
  total: number;                 // Total number of items
  page: number;                  // Current page number (1-indexed)
  per_page: number;              // Items per page
  has_more: boolean;             // Whether more pages exist
}
```

## API Endpoints

### 1. Get Deployments (Paginated)

Retrieve a paginated list of deployments.

**Endpoint:** `GET /api/deployments`

**Query Parameters:**
- `page` (optional, default: 1): Page number (1-indexed)
- `per_page` (optional, default: 10): Number of items per page
- `sort` (optional, default: "release_date"): Field to sort by
- `order` (optional, default: "desc"): Sort order ("asc" or "desc")

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "ticket_id": "PROJ-123",
      "version": "1.2.3-alpha.1",
      "stage": "develop",
      "release_date": "2024-01-15",
      "description": "Added new authentication feature",
      "owner": "John Doe",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "per_page": 10,
  "has_more": true
}
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

---

### 2. Get Single Deployment

Retrieve a specific deployment by ID.

**Endpoint:** `GET /api/deployments/:id`

**URL Parameters:**
- `id`: Deployment ID

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticket_id": "PROJ-123",
  "version": "1.2.3-alpha.1",
  "stage": "develop",
  "release_date": "2024-01-15",
  "description": "Added new authentication feature",
  "owner": "John Doe",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Deployment not found
- `500 Internal Server Error`: Server error

---

### 3. Create Deployment

Create a new deployment.

**Endpoint:** `POST /api/deployments`

**Request Body:**

```json
{
  "ticket_id": "PROJ-123",
  "version": "1.2.3-alpha.1",
  "stage": "develop",
  "description": "Added new authentication feature",
  "owner": "John Doe",
  "release_date": "2024-01-15",
  "status": "active"
}
```

**Response:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticket_id": "PROJ-123",
  "version": "1.2.3-alpha.1",
  "stage": "develop",
  "release_date": "2024-01-15",
  "description": "Added new authentication feature",
  "owner": "John Doe",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or validation error
- `500 Internal Server Error`: Server error

---

### 4. Update Deployment

Update an existing deployment.

**Endpoint:** `PATCH /api/deployments/:id`

**URL Parameters:**
- `id`: Deployment ID

**Request Body:** (all fields optional)

```json
{
  "status": "in-progress",
  "description": "Updated description"
}
```

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticket_id": "PROJ-123",
  "version": "1.2.3-alpha.1",
  "stage": "develop",
  "release_date": "2024-01-15",
  "description": "Updated description",
  "owner": "John Doe",
  "status": "in-progress",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or validation error
- `404 Not Found`: Deployment not found
- `500 Internal Server Error`: Server error

---

### 5. Delete Deployment

Delete a deployment.

**Endpoint:** `DELETE /api/deployments/:id`

**URL Parameters:**
- `id`: Deployment ID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: Deployment not found
- `500 Internal Server Error`: Server error

---

## Database Schema

### Deployments Table

```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(255) NOT NULL,
  version VARCHAR(255) NOT NULL,
  stage VARCHAR(50) NOT NULL CHECK (stage IN ('develop', 'testing', 'uat')),
  release_date DATE NOT NULL,
  description TEXT NOT NULL,
  owner VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'in-progress', 'failed', 'rolled-back')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_deployments_ticket_id ON deployments(ticket_id);
CREATE INDEX idx_deployments_stage ON deployments(stage);
CREATE INDEX idx_deployments_release_date ON deployments(release_date DESC);
CREATE INDEX idx_deployments_owner ON deployments(owner);
```

## Error Response Format

All error responses should follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {}  // Optional additional details
  }
}
```

## Implementation Notes

### Backend Technology Recommendations

You can implement this API using any backend framework. Here are some recommendations:

1. **Node.js + Express**
   - Fast development
   - Great ecosystem
   - Easy to deploy

2. **Node.js + NestJS**
   - TypeScript by default
   - Built-in validation with class-validator
   - Modular architecture

3. **Python + FastAPI**
   - Automatic OpenAPI documentation
   - Type hints and validation
   - High performance

4. **Go + Gin/Echo**
   - High performance
   - Compiled binary
   - Great for containerization

### Validation Rules

Implement the following validation rules:

- `ticket_id`: 
  - Required
  - Max length: 255 characters
  - Pattern: Alphanumeric with hyphens (e.g., PROJ-123)

- `version`:
  - Required
  - Max length: 255 characters
  - Semantic versioning pattern recommended

- `stage`:
  - Required
  - Enum: 'develop', 'testing', 'uat'

- `description`:
  - Required
  - Min length: 10 characters
  - Max length: 1000 characters

- `owner`:
  - Required
  - Max length: 255 characters

- `release_date`:
  - Required
  - Valid ISO 8601 date format
  - Cannot be in the far future (e.g., > 1 year from now)

- `status`:
  - Required
  - Enum: 'active', 'in-progress', 'failed', 'rolled-back'

### CORS Configuration

Enable CORS to allow the frontend to communicate with the backend:

```javascript
// Express example
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
  credentials: true
}));
```

### Rate Limiting

Consider implementing rate limiting to prevent abuse:

```javascript
// Express example with express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Testing the API

### Using cURL

```bash
# Get deployments
curl -X GET "http://localhost:3000/api/deployments?page=1&per_page=10"

# Create deployment
curl -X POST "http://localhost:3000/api/deployments" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "PROJ-123",
    "version": "1.2.3-alpha.1",
    "stage": "develop",
    "description": "Test deployment",
    "owner": "John Doe",
    "release_date": "2024-01-15",
    "status": "active"
  }'

# Update deployment
curl -X PATCH "http://localhost:3000/api/deployments/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'

# Delete deployment
curl -X DELETE "http://localhost:3000/api/deployments/550e8400-e29b-41d4-a716-446655440000"
```

### Using Postman

Import the following collection to test all endpoints:

1. Create a new collection in Postman
2. Add the base URL variable: `{{base_url}}` = `http://localhost:3000/api`
3. Add requests for each endpoint as documented above

## Changelog

- **v1.0.0** (2024-01-15): Initial API specification
