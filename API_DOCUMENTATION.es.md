# Documentación de API - Backend Jira Deployment Tracker

## Descripción General

Este documento especifica los endpoints de API HTTP requeridos para la aplicación frontend del Rastreador de Despliegues de Jira. El backend debe implementar estos endpoints para proporcionar funcionalidad de gestión de despliegues.

## URL Base

Todos los endpoints de API deben tener como prefijo la URL base configurada en el entorno:
- **Desarrollo**: `http://localhost:3000/api`
- **Producción**: Configurado vía variable de entorno `VITE_API_BASE_URL`

## Autenticación

Actualmente, la API no requiere autenticación. Si necesitas agregar autenticación en el futuro, considera usar:
- Tokens JWT en el encabezado `Authorization`
- Claves API
- OAuth 2.0

## Objetos de Transferencia de Datos (DTOs)

### DTO de Despliegue

Representa un despliegue en el sistema.

```typescript
interface Deployment {
  id: string;                    // Identificador único (se recomienda UUID)
  ticket_id: string;             // ID del ticket de Jira (ej., "PROJ-123")
  version: string;               // Cadena de versión (ej., "1.2.3-alpha.1")
  stage: 'dev' | 'testing' | 'uat';  // Etapa de despliegue
  release_date: string;          // Cadena de fecha ISO 8601 (ej., "2024-01-15")
  description: string;           // Descripción del despliegue
  owner: string;                 // Nombre del propietario (ej., "John Doe")
  status: 'activo' | 'en curso' | 'ready to qa' | 'finalizado';  // Estado del despliegue (Español)
  created_at: string;            // Timestamp ISO 8601 (generado automáticamente)
  updated_at: string;            // Timestamp ISO 8601 (generado automáticamente)
}
```

### DTO de Creación de Despliegue

Se usa al crear un nuevo despliegue.

```typescript
interface CreateDeploymentDTO {
  ticket_id: string;             // Requerido
  version: string;               // Requerido
  stage: 'dev' | 'testing' | 'uat';  // Requerido
  description: string;           // Requerido
  owner: string;                 // Requerido
  release_date: string;          // Requerido - Cadena de fecha ISO 8601
  status: 'activo' | 'en curso' | 'ready to qa' | 'finalizado';  // Requerido (Español)
}
```

### DTO de Actualización de Despliegue

Se usa al actualizar un despliegue existente (todos los campos opcionales).

```typescript
interface UpdateDeploymentDTO {
  ticket_id?: string;
  version?: string;
  stage?: 'dev' | 'testing' | 'uat';
  description?: string;
  owner?: string;
  release_date?: string;
  status?: 'activo' | 'en curso' | 'ready to qa' | 'finalizado';
}
```

### DTO de Respuesta Paginada

Envoltorio genérico de respuesta paginada.

```typescript
interface PaginatedResponse<T> {
  data: T[];                     // Array de elementos
  total: number;                 // Número total de elementos
  page: number;                  // Número de página actual (indexado desde 1)
  per_page: number;              // Elementos por página
  has_more: boolean;             // Si existen más páginas
}
```

## Endpoints de API

### 1. Obtener Despliegues (Paginado)

Recupera una lista paginada de despliegues.

**Endpoint:** `GET /api/deployments`

**Parámetros de Consulta:**
- `page` (opcional, por defecto: 1): Número de página (indexado desde 1)
- `per_page` (opcional, por defecto: 10): Número de elementos por página
- `sort` (opcional, por defecto: "release_date"): Campo por el cual ordenar
- `order` (opcional, por defecto: "desc"): Orden de clasificación ("asc" o "desc")

**Respuesta:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "ticket_id": "PROJ-123",
      "version": "1.2.3-alpha.1",
      "stage": "develop",
      "release_date": "2024-01-15",
      "description": "Se agregó nueva función de autenticación",
      "owner": "John Doe",
      "status": "activo",
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

**Respuestas de Error:**
- `400 Bad Request`: Parámetros de consulta inválidos
- `500 Internal Server Error`: Error del servidor

---

### 2. Obtener Despliegue Individual

Recupera un despliegue específico por ID.

**Endpoint:** `GET /api/deployments/:id`

**Parámetros de URL:**
- `id`: ID del despliegue

**Respuesta:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticket_id": "PROJ-123",
  "version": "1.2.3-alpha.1",
  "stage": "develop",
  "release_date": "2024-01-15",
  "description": "Se agregó nueva función de autenticación",
  "owner": "John Doe",
  "status": "activo",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Respuestas de Error:**
- `404 Not Found`: Despliegue no encontrado
- `500 Internal Server Error`: Error del servidor

---

### 3. Crear Despliegue

Crea un nuevo despliegue.

**Endpoint:** `POST /api/deployments`

**Cuerpo de la Solicitud:**

```json
{
  "ticket_id": "PROJ-123",
  "version": "1.2.3-alpha.1",
  "stage": "develop",
  "description": "Se agregó nueva función de autenticación",
  "owner": "John Doe",
  "release_date": "2024-01-15",
  "status": "activo"
}
```

**Respuesta:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticket_id": "PROJ-123",
  "version": "1.2.3-alpha.1",
  "stage": "develop",
  "release_date": "2024-01-15",
  "description": "Se agregó nueva función de autenticación",
  "owner": "John Doe",
  "status": "activo",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Respuestas de Error:**
- `400 Bad Request`: Cuerpo de solicitud inválido o error de validación
- `500 Internal Server Error`: Error del servidor

---

### 4. Actualizar Despliegue

Actualiza un despliegue existente.

**Endpoint:** `PATCH /api/deployments/:id`

**Parámetros de URL:**
- `id`: ID del despliegue

**Cuerpo de la Solicitud:** (todos los campos opcionales)

```json
{
  "status": "en curso",
  "description": "Descripción actualizada"
}
```

**Respuesta:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticket_id": "PROJ-123",
  "version": "1.2.3-alpha.1",
  "stage": "develop",
  "release_date": "2024-01-15",
  "description": "Descripción actualizada",
  "owner": "John Doe",
  "status": "en curso",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z"
}
```

**Respuestas de Error:**
- `400 Bad Request`: Cuerpo de solicitud inválido o error de validación
- `404 Not Found`: Despliegue no encontrado
- `500 Internal Server Error`: Error del servidor

---

### 5. Eliminar Despliegue

Elimina un despliegue.

**Endpoint:** `DELETE /api/deployments/:id`

**Parámetros de URL:**
- `id`: ID del despliegue

**Respuesta:** `204 No Content`

**Respuestas de Error:**
- `404 Not Found`: Despliegue no encontrado
- `500 Internal Server Error`: Error del servidor

---

## Esquema de Base de Datos

### Tabla de Despliegues

```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(255) NOT NULL,
  version VARCHAR(255) NOT NULL,
  stage VARCHAR(50) NOT NULL CHECK (stage IN ('dev', 'testing', 'uat')),
  release_date DATE NOT NULL,
  description TEXT NOT NULL,
  owner VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('activo', 'en curso', 'ready to qa', 'finalizado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejor rendimiento de consultas
CREATE INDEX idx_deployments_ticket_id ON deployments(ticket_id);
CREATE INDEX idx_deployments_stage ON deployments(stage);
CREATE INDEX idx_deployments_release_date ON deployments(release_date DESC);
CREATE INDEX idx_deployments_owner ON deployments(owner);
```

## Formato de Respuesta de Error

Todas las respuestas de error deben seguir este formato:

```json
{
  "error": {
    "message": "Mensaje de error legible para humanos",
    "code": "CODIGO_ERROR",
    "details": {}  // Detalles adicionales opcionales
  }
}
```

## Notas de Implementación

### Recomendaciones de Tecnología Backend

Puedes implementar esta API usando cualquier framework backend. Aquí hay algunas recomendaciones:

1. **Node.js + Express**
   - Desarrollo rápido
   - Gran ecosistema
   - Fácil de desplegar

2. **Node.js + NestJS**
   - TypeScript por defecto
   - Validación incorporada con class-validator
   - Arquitectura modular

3. **Python + FastAPI**
   - Documentación OpenAPI automática
   - Type hints y validación
   - Alto rendimiento

4. **Go + Gin/Echo**
   - Alto rendimiento
   - Binario compilado
   - Excelente para contenerización

### Reglas de Validación

Implementa las siguientes reglas de validación:

- `ticket_id`: 
  - Requerido
  - Longitud máxima: 255 caracteres
  - Patrón: Alfanumérico con guiones (ej., PROJ-123)

- `version`:
  - Requerido
  - Longitud máxima: 255 caracteres
  - Patrón de versionado semántico recomendado

- `stage`:
  - Requerido
  - Enum: 'dev', 'testing', 'uat'

- `description`:
  - Requerido
  - Longitud mínima: 10 caracteres
  - Longitud máxima: 1000 caracteres

- `owner`:
  - Requerido
  - Longitud máxima: 255 caracteres

- `release_date`:
  - Requerido
  - Formato de fecha ISO 8601 válido
  - No puede estar en un futuro lejano (ej., > 1 año desde ahora)

- `status`:
  - Requerido
  - Enum: 'activo', 'en curso', 'ready to qa', 'finalizado'
  - Nota: Estos valores están en español y deben mantenerse exactamente como se especifica

### Configuración de CORS

Habilita CORS para permitir que el frontend se comunique con el backend:

```javascript
// Ejemplo Express
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
  credentials: true
}));
```

### Limitación de Tasa

Considera implementar limitación de tasa para prevenir abuso:

```javascript
// Ejemplo Express con express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limita cada IP a 100 solicitudes por ventana
});

app.use('/api/', limiter);
```

## Pruebas de la API

### Usando cURL

```bash
# Obtener despliegues
curl -X GET "http://localhost:3000/api/deployments?page=1&per_page=10"

# Crear despliegue
curl -X POST "http://localhost:3000/api/deployments" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "PROJ-123",
    "version": "1.2.3-alpha.1",
    "stage": "develop",
    "description": "Despliegue de prueba",
    "owner": "John Doe",
    "release_date": "2024-01-15",
    "status": "activo"
  }'

# Actualizar despliegue
curl -X PATCH "http://localhost:3000/api/deployments/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"status": "en curso"}'

# Eliminar despliegue
curl -X DELETE "http://localhost:3000/api/deployments/550e8400-e29b-41d4-a716-446655440000"
```

### Usando Postman

Importa la siguiente colección para probar todos los endpoints:

1. Crea una nueva colección en Postman
2. Agrega la variable de URL base: `{{base_url}}` = `http://localhost:3000/api`
3. Agrega solicitudes para cada endpoint como se documenta arriba

## Registro de Cambios

- **v1.0.0** (2024-01-15): Especificación inicial de API
