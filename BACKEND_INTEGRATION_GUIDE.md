# Guía de Integración Backend - Sistema de Tracking de Tickets Jira

## 📋 Resumen Ejecutivo

Este documento proporciona una guía rápida para el equipo de backend sobre cómo implementar la API HTTP requerida por la aplicación frontend de tracking de tickets Jira.

## 🎯 Objetivo

El frontend necesita consumir datos de tickets/deployments desde una API HTTP. Los tickets se mostrarán en un tablero Kanban con tres columnas: **dev**, **testing**, y **uat**.

## 📦 Formato de Respuesta Requerido

### Objeto Principal: Deployment (Ticket)

El frontend espera recibir objetos con la siguiente estructura:

```typescript
{
  id: string;                    // UUID único del deployment
  ticket_id: string;             // ID del ticket Jira (ej: "OC-1234")
  version: string;               // Versión del deployment (ej: "1.2.3-alpha.1")
  stage: 'dev' | 'testing' | 'uat';  // Etapa del deployment (IMPORTANTE: usar estos valores exactos)
  release_date: string;          // Fecha en formato ISO 8601 (ej: "2024-01-15")
  description: string;           // Descripción del deployment/ticket
  owner: string;                 // Nombre del propietario/responsable
  status: 'activo' | 'en curso' | 'ready to qa' | 'finalizado';  // Estado (IMPORTANTE: en español)
  created_at: string;            // Timestamp ISO 8601
  updated_at: string;            // Timestamp ISO 8601
}
```

### 🚨 Valores Críticos a Respetar

#### Campo `stage` (Etapa):
**DEBE** ser uno de estos tres valores exactos:
- `"dev"` → Se mostrará en la columna "Desarrollo"
- `"testing"` → Se mostrará en la columna "Testing"
- `"uat"` → Se mostrará en la columna "UAT"

❌ **NO usar**: "develop", "development", "test", "production", etc.

#### Campo `status` (Estado):
**DEBE** ser uno de estos cuatro valores exactos (en español):
- `"activo"` → Muestra icono verde de check
- `"en curso"` → Muestra icono azul de reloj
- `"ready to qa"` → Muestra icono rojo de alerta
- `"finalizado"` → Muestra icono amarillo de alerta

❌ **NO usar**: "active", "in-progress", "finished", etc.

## 🔌 Endpoints Requeridos

### 1. GET /api/deployments - Listar Tickets con Paginación

**Parámetros de Query:**
```
page: number (opcional, default: 1)
per_page: number (opcional, default: 10)
sort: string (opcional, default: "release_date")
order: string (opcional, "asc" | "desc", default: "desc")
```

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "ticket_id": "OC-1234",
      "version": "1.2.3-alpha.1",
      "stage": "dev",
      "release_date": "2024-01-15",
      "description": "Implementación de nueva funcionalidad de autenticación",
      "owner": "Juan Pérez",
      "status": "activo",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "ticket_id": "OC-1235",
      "version": "2.0.0-beta.1",
      "stage": "testing",
      "release_date": "2024-01-16",
      "description": "Migración a nueva arquitectura de microservicios",
      "owner": "María García",
      "status": "en curso",
      "created_at": "2024-01-16T09:00:00Z",
      "updated_at": "2024-01-16T14:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "per_page": 10,
  "has_more": true
}
```

### 2. POST /api/deployments - Crear Nuevo Ticket

**Body de la Solicitud:**
```json
{
  "ticket_id": "OC-1236",
  "version": "1.0.0",
  "stage": "dev",
  "description": "Nueva funcionalidad de reportes",
  "owner": "Carlos López",
  "release_date": "2024-01-20",
  "status": "activo"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "ticket_id": "OC-1236",
  "version": "1.0.0",
  "stage": "dev",
  "description": "Nueva funcionalidad de reportes",
  "owner": "Carlos López",
  "release_date": "2024-01-20",
  "status": "activo",
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

### 3. GET /api/deployments/:id - Obtener Ticket Específico

**Respuesta exitosa (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticket_id": "OC-1234",
  "version": "1.2.3-alpha.1",
  "stage": "dev",
  "release_date": "2024-01-15",
  "description": "Implementación de nueva funcionalidad de autenticación",
  "owner": "Juan Pérez",
  "status": "activo",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 4. PATCH /api/deployments/:id - Actualizar Ticket

**Body de la Solicitud (campos opcionales):**
```json
{
  "status": "en curso",
  "description": "Descripción actualizada"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticket_id": "OC-1234",
  "version": "1.2.3-alpha.1",
  "stage": "dev",
  "release_date": "2024-01-15",
  "description": "Descripción actualizada",
  "owner": "Juan Pérez",
  "status": "en curso",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T11:00:00Z"
}
```

### 5. DELETE /api/deployments/:id - Eliminar Ticket

**Respuesta exitosa (204 No Content)**

### 6. GET /sprint-report - Reporte de Fin de Sprint

Genera el reporte de fin de sprint para una versión estable. Un *sprint* se
identifica por la versión `major.minor.patch` e incluye **todas las RC (`rc.x`)**
desplegadas para esa versión.

**Parámetros de Query:**
```
version: string (requerido, ej: "1.2.3")
```

El backend debe agregar, para la versión solicitada:
- **Changelog**: cada ticket `OCL-xxx` con su descripción, usuario git asignado,
  hash y mensaje del commit, la RC donde se incluyó y los archivos cambiados.
- **Métricas por RC**: cobertura de tests, conteo de líneas, warnings,
  complejidad ciclomática, code smells, duplicación y total/pasados de tests.
  El frontend grafica la evolución (mejora/empeora) entre RCs.

**Respuesta exitosa (200):**
```json
{
  "sprint": "1.2.3",
  "rc_versions": ["1.2.3-rc.1", "1.2.3-rc.2"],
  "generated_at": "2026-06-12T21:00:00Z",
  "changelog": [
    {
      "ticket_id": "OCL-1234",
      "summary": "Implementación de validación de caratula",
      "status": "finalizado",
      "version": "1.2.3-rc.2",
      "git_user": "jperez",
      "commit_hash": "a1b2c3d4e5f6",
      "commit_message": "feat(caratula): agrega validación de montos",
      "release_date": "2026-06-05",
      "jira_url": "https://pmy.atlassian.net/browse/OCL-1234",
      "changes": ["src/caratula/validator.ts"]
    }
  ],
  "metrics": [
    {
      "version": "1.2.3-rc.1",
      "release_date": "2026-06-01",
      "coverage": 72.5,
      "line_count": 18450,
      "warnings": 14,
      "cyclomatic_complexity": 3.8,
      "code_smells": 22,
      "duplications": 4.1,
      "tests_total": 320,
      "tests_passed": 318
    }
  ]
}
```

> 📌 `rc_versions` y `metrics` deben ordenarse por fecha de despliegue (más
> antiguo primero). Los campos de métricas son opcionales; omitir los que no se
> generen. Detalle completo en **API_DOCUMENTATION.es.md** (sección 6).

## ⚙️ Configuración Requerida

### CORS
El backend DEBE permitir peticiones desde el origen del frontend:

```javascript
// Ejemplo para Express.js
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
  credentials: true
}));
```

### Headers de Respuesta
Todas las respuestas deben incluir:
```
Content-Type: application/json
```

## 🗄️ Esquema de Base de Datos Sugerido

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

-- Índices para mejor rendimiento
CREATE INDEX idx_deployments_ticket_id ON deployments(ticket_id);
CREATE INDEX idx_deployments_stage ON deployments(stage);
CREATE INDEX idx_deployments_release_date ON deployments(release_date DESC);
CREATE INDEX idx_deployments_owner ON deployments(owner);
```

## ✅ Reglas de Validación

### ticket_id
- ✅ Requerido
- ✅ Máximo 255 caracteres
- ✅ Patrón alfanumérico con guiones (ej: OC-1234, PROJ-567)

### version
- ✅ Requerido
- ✅ Máximo 255 caracteres
- ✅ Se recomienda semantic versioning (1.2.3, 1.0.0-alpha.1)

### stage
- ✅ Requerido
- ✅ **SOLO** uno de: `'dev'`, `'testing'`, `'uat'`

### description
- ✅ Requerido
- ✅ Mínimo 10 caracteres
- ✅ Máximo 1000 caracteres

### owner
- ✅ Requerido
- ✅ Máximo 255 caracteres

### release_date
- ✅ Requerido
- ✅ Formato ISO 8601 (YYYY-MM-DD)
- ✅ No debe estar muy en el futuro (> 1 año)

### status
- ✅ Requerido
- ✅ **SOLO** uno de: `'activo'`, `'en curso'`, `'ready to qa'`, `'finalizado'`

## 🚫 Formato de Errores

Todas las respuestas de error deben seguir este formato:

```json
{
  "error": {
    "message": "Mensaje de error legible",
    "code": "CODIGO_ERROR",
    "details": {}
  }
}
```

### Códigos de Estado HTTP a Usar

- `200 OK` - Solicitud exitosa (GET, PATCH)
- `201 Created` - Recurso creado exitosamente (POST)
- `204 No Content` - Eliminación exitosa (DELETE)
- `400 Bad Request` - Error de validación
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## 🧪 Pruebas Rápidas

### Usando cURL

```bash
# Listar deployments
curl -X GET "http://localhost:3000/api/deployments?page=1&per_page=10"

# Crear deployment
curl -X POST "http://localhost:3000/api/deployments" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "OC-1234",
    "version": "1.0.0",
    "stage": "dev",
    "description": "Test de integración",
    "owner": "Equipo Backend",
    "release_date": "2024-01-20",
    "status": "activo"
  }'

# Actualizar deployment
curl -X PATCH "http://localhost:3000/api/deployments/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"status": "en curso"}'

# Eliminar deployment
curl -X DELETE "http://localhost:3000/api/deployments/550e8400-e29b-41d4-a716-446655440000"
```

## 📝 Ejemplo Completo de Datos

Aquí hay un ejemplo de datos de prueba que pueden usar para poblar la base de datos:

```json
[
  {
    "ticket_id": "OC-1001",
    "version": "1.0.0",
    "stage": "dev",
    "description": "Implementación del módulo de autenticación con OAuth2",
    "owner": "Juan Pérez",
    "release_date": "2024-01-15",
    "status": "activo"
  },
  {
    "ticket_id": "OC-1002",
    "version": "1.1.0-beta.1",
    "stage": "testing",
    "description": "Sistema de notificaciones en tiempo real con WebSockets",
    "owner": "María García",
    "release_date": "2024-01-16",
    "status": "en curso"
  },
  {
    "ticket_id": "OC-1003",
    "version": "2.0.0",
    "stage": "uat",
    "description": "Migración completa a arquitectura de microservicios",
    "owner": "Carlos López",
    "release_date": "2024-01-18",
    "status": "ready to qa"
  },
  {
    "ticket_id": "OC-1004",
    "version": "1.2.3",
    "stage": "dev",
    "description": "Optimización de queries de base de datos",
    "owner": "Ana Martínez",
    "release_date": "2024-01-17",
    "status": "finalizado"
  }
]
```

## 🔗 Recursos Adicionales

Para más detalles técnicos, consultar:
- **API_DOCUMENTATION.es.md** - Documentación completa de la API en español
- **API_DOCUMENTATION.md** - Documentación completa de la API en inglés

## 💡 Notas Importantes

1. **Paginación**: El frontend carga tickets de forma paginada. Es importante implementar correctamente el campo `has_more` para indicar si hay más páginas disponibles.

2. **Ordenamiento**: Por defecto, los tickets se ordenan por `release_date` descendente (más recientes primero).

3. **Filtrado**: El frontend maneja el filtrado en el lado del cliente, pero el backend puede opcionalmente implementar parámetros de filtrado adicionales.

4. **Versionamiento**: Un mismo `ticket_id` puede tener múltiples versiones. El frontend mostrará la versión más reciente y las versiones anteriores como historial.

## 📞 Contacto

Para dudas o aclaraciones sobre la integración, contactar al equipo de frontend.

---

**Última actualización:** 2024-01-20
