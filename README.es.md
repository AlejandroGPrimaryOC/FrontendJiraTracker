# Jira Deployment Tracker - Frontend

Una aplicación web moderna y responsiva para rastrear y visualizar despliegues de Jira a través de diferentes etapas (Desarrollo, Pruebas, UAT). Construida con React, TypeScript y Vite.

![Jira Wallboard](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Desarrollo](#desarrollo)
- [Construcción para Producción](#construcción-para-producción)
- [Despliegue con Docker](#despliegue-con-docker)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Integración con API](#integración-con-api)
- [Documentación](#documentación)
- [Contribución](#contribución)
- [Licencia](#licencia)

## ✨ Características

- **Tablero Estilo Kanban**: Visualiza despliegues a través de tres etapas (Desarrollo, Pruebas, UAT)
- **Actualizaciones en Tiempo Real**: Agrega nuevos despliegues a través de un formulario intuitivo
- **Filtrado Avanzado**: Busca por ID de ticket, descripción, propietario o versión
- **Filtro por Propietario**: Filtra despliegues por propietario
- **Paginación**: Carga eficiente de grandes conjuntos de datos de despliegues
- **Historial de Versiones**: Ve versiones anteriores de cada ticket
- **Seguimiento de Estado**: Rastrea el estado del despliegue (Activo, En Progreso, Fallido, Revertido)
- **Diseño Responsivo**: Funciona perfectamente en escritorio, tableta y dispositivos móviles
- **UI Moderna**: Interfaz limpia con Tailwind CSS e iconos Lucide

## 🏗️ Arquitectura

Esta es una aplicación **solo frontend** que se comunica con una API backend vía HTTP. La aplicación:

- Usa React para la capa de interfaz de usuario
- TypeScript para seguridad de tipos
- Vite para desarrollo rápido y construcciones optimizadas
- Tailwind CSS para estilos
- HTTP/REST API para obtención de datos y mutaciones

### Stack Tecnológico

- **Framework**: React 18.3
- **Lenguaje**: TypeScript 5.5
- **Herramienta de Construcción**: Vite 5.4
- **Estilos**: Tailwind CSS 3.4
- **Iconos**: Lucide React
- **Cliente HTTP**: API Fetch Nativa

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Node.js**: Versión 18.x o superior
- **npm**: Versión 9.x o superior (viene con Node.js)
- **API Backend**: La aplicación requiere una API backend (ver [Documentación de API](./API_DOCUMENTATION.es.md))

## 🚀 Instalación

1. **Clona el repositorio**

```bash
git clone https://github.com/AlejandroGPrimaryOC/FrontendJiraTracker.git
cd FrontendJiraTracker
```

2. **Instala las dependencias**

```bash
npm install
```

3. **Configura las variables de entorno**

Crea un archivo `.env` en el directorio raíz:

```env
# URL de la API Backend
VITE_API_BASE_URL=http://localhost:3000/api
```

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Por Defecto | Requerido |
|----------|-------------|-------------|-----------|
| `VITE_API_BASE_URL` | URL base de la API Backend | `http://localhost:3000/api` | No |

### Personalización

- **Elementos por página**: Edita la constante `ITEMS_PER_PAGE` en `src/App.tsx`
- **Nombres de etapas**: Modifica `stageConfig` en `src/components/StageColumn.tsx`
- **Tipos de estado**: Actualiza los tipos de estado en `src/lib/api.ts`

## 💻 Desarrollo

### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con recarga en caliente |
| `npm run build` | Construye para producción |
| `npm run preview` | Previsualiza la construcción de producción localmente |
| `npm run lint` | Ejecuta ESLint para verificar la calidad del código |
| `npm run typecheck` | Ejecuta verificación de tipos de TypeScript |

### Flujo de Trabajo de Desarrollo

1. **Realiza cambios** en archivos fuente en `src/`
2. **Recarga en caliente** actualizará automáticamente el navegador
3. **Verificación de tipos** se ejecuta automáticamente en tu IDE
4. **Verifica tu código** antes de hacer commit: `npm run lint`
5. **Verifica tipos** antes de hacer commit: `npm run typecheck`

### Calidad del Código

El proyecto usa:
- **ESLint** para verificación de código
- **TypeScript** para verificación estática de tipos
- **Prettier** formateo compatible (configura en tu IDE)

## 🏭 Construcción para Producción

### Crear Construcción de Producción

```bash
npm run build
```

Esto crea una construcción optimizada en el directorio `dist/`.

### Previsualizar Construcción de Producción

```bash
npm run preview
```

### Optimizaciones de Producción

La construcción de producción incluye:
- JavaScript y CSS minificados
- Tree shaking para eliminar código no utilizado
- División de código para carga óptima
- Optimización de activos (imágenes, fuentes, etc.)
- Compresión lista para Gzip

## 🐳 Despliegue con Docker

### Construir la Imagen Docker

```bash
docker build -t jira-deployment-tracker:latest .
```

### Ejecutar el Contenedor

```bash
docker run -d \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://api.example.com/api \
  --name jira-tracker \
  jira-deployment-tracker:latest
```

### Docker Compose (Opcional)

Crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:3000/api
    depends_on:
      - backend

  backend:
    image: your-backend-image:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/deployments
```

Luego ejecuta:

```bash
docker-compose up -d
```

### Despliegue a Producción

1. **Construye la imagen**
   ```bash
   docker build -t registry.example.com/jira-tracker:v1.0.0 .
   ```

2. **Sube al registro**
   ```bash
   docker push registry.example.com/jira-tracker:v1.0.0
   ```

3. **Despliega en tu host**
   ```bash
   docker pull registry.example.com/jira-tracker:v1.0.0
   docker run -d -p 80:80 registry.example.com/jira-tracker:v1.0.0
   ```

### Variables de Entorno en Docker

Puedes pasar variables de entorno en tiempo de ejecución:

```bash
docker run -d \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://api.production.com/api \
  jira-deployment-tracker:latest
```

O usar un archivo de variables de entorno:

```bash
docker run -d -p 80:80 --env-file .env.production jira-deployment-tracker:latest
```

## 📁 Estructura del Proyecto

```
FrontendJiraTracker/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AddDeploymentForm.tsx    # Formulario para agregar despliegues
│   │   ├── DeploymentCard.tsx       # Tarjeta que muestra información del despliegue
│   │   ├── SearchBar.tsx            # Componente de entrada de búsqueda
│   │   └── StageColumn.tsx          # Columna para cada etapa de despliegue
│   ├── lib/                 # Librerías de utilidad
│   │   └── api.ts          # Cliente API y tipos
│   ├── App.tsx             # Componente principal de la aplicación
│   ├── main.tsx            # Punto de entrada de la aplicación
│   ├── index.css           # Estilos globales
│   └── vite-env.d.ts       # Definiciones de tipos de Vite
├── public/                  # Activos estáticos
├── dist/                    # Salida de construcción de producción (generado)
├── node_modules/            # Dependencias (generado)
├── .gitignore              # Reglas de ignore de Git
├── Dockerfile              # Configuración de Docker
├── .dockerignore           # Reglas de ignore de Docker
├── API_DOCUMENTATION.es.md # Especificación de la API backend
├── README.es.md            # Este archivo
├── package.json            # Metadatos del proyecto y dependencias
├── tsconfig.json           # Configuración de TypeScript
├── vite.config.ts          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind CSS
├── postcss.config.js       # Configuración de PostCSS
└── eslint.config.js        # Configuración de ESLint
```

### Archivos Clave

- **`src/App.tsx`**: Componente principal de la aplicación con gestión de estado y obtención de datos
- **`src/lib/api.ts`**: Cliente HTTP API con tipos de TypeScript
- **`src/components/`**: Componentes React reutilizables
- **`Dockerfile`**: Configuración de construcción multi-etapa de Docker
- **`API_DOCUMENTATION.es.md`**: Especificación completa de la API backend

## 🔌 Integración con API

Esta aplicación requiere una API backend. Ver documentación:

- **[BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)** - Guía rápida para desarrolladores backend (Español) 🚀
- **[API_DOCUMENTATION.es.md](./API_DOCUMENTATION.es.md)** - Especificación completa de API (Español)
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Especificación completa de API (Inglés)

### Puntos Clave para el Equipo Backend

El backend debe implementar 5 endpoints RESTful que devuelvan datos JSON. Los aspectos más críticos son:

1. **Valores de stage**: Deben ser exactamente `'dev'`, `'testing'`, o `'uat'`
2. **Valores de status**: Deben ser exactamente `'activo'`, `'en curso'`, `'ready to qa'`, o `'finalizado'` (en español)
3. **Paginación**: Implementar paginación adecuada con el campo `has_more`
4. **CORS**: Habilitar CORS para el origen del frontend

Ver la [Guía de Integración Backend](./BACKEND_INTEGRATION_GUIDE.md) para una guía completa de inicio rápido.

### Inicio Rápido con API

1. Asegúrate de que tu API backend esté ejecutándose
2. Configura `VITE_API_BASE_URL` para apuntar a tu API
3. La API debe implementar los endpoints especificados en la documentación
4. Verifica que CORS esté configurado correctamente en el backend

## 📚 Documentación

### Cómo Documentar Esta Aplicación

Este proyecto sigue prácticas modernas de documentación:

#### 1. Documentación de Código

- **Usa tipos TypeScript**: Código auto-documentado a través de interfaces y tipos
- **Comentarios JSDoc**: Para funciones y componentes complejos
- **Nomenclatura clara**: Usa nombres descriptivos de variables y funciones

Ejemplo:

```typescript
/**
 * Obtiene despliegues con paginación
 * @param page - Número de página (indexado desde 1)
 * @param perPage - Número de elementos por página
 * @returns Respuesta de despliegue paginada
 */
async getDeployments(page: number, perPage: number): Promise<PaginatedResponse<Deployment>>
```

#### 2. Documentación de Componentes

Documenta componentes React con:

```typescript
/**
 * Componente DeploymentCard muestra un solo despliegue
 * 
 * @param deployment - Objeto de despliegue a mostrar
 * @returns Tarjeta de despliegue renderizada
 */
```

#### 3. Documentación de API

- Mantén `API_DOCUMENTATION.es.md` para especificaciones del backend
- Usa OpenAPI/Swagger para documentación interactiva de API (backend)
- Mantén los DTOs sincronizados entre frontend y backend

#### 4. Actualizaciones de README

Al agregar características:

1. Actualiza la sección de Características
2. Agrega opciones de configuración si es necesario
3. Actualiza la estructura del proyecto si se agregan archivos
4. Agrega ejemplos de uso

#### 5. Documentación de Versiones

Usa versionado semántico y mantén un CHANGELOG:

```markdown
## [1.1.0] - 2024-01-20
### Agregado
- Nuevas capacidades de filtrado
- Función de exportación a CSV

### Cambiado
- Rendimiento de paginación mejorado

### Corregido
- Error en formato de fecha
```

#### 6. Comentarios en Línea

Usa comentarios con moderación y solo cuando:
- El código es complejo o no obvio
- Hay una regla de negocio específica siendo implementada
- Hay una solución alternativa para un problema conocido

```typescript
// Convierte etapa desde cadena de versión
// alpha -> develop, beta -> testing, rc -> uat
const stage = getStageFromVersion(version);
```

## 🤝 Contribución

### Guías de Desarrollo

1. **Haz fork del repositorio**
2. **Crea una rama de características**: `git checkout -b feature/caracteristica-increible`
3. **Realiza tus cambios**: Sigue los estándares de código
4. **Prueba tus cambios**: Ejecuta lint y verificación de tipos
5. **Haz commit**: `git commit -m 'Agrega característica increíble'`
6. **Haz push**: `git push origin feature/caracteristica-increible`
7. **Abre un Pull Request**

### Estándares de Código

- Usa TypeScript para todo el código nuevo
- Sigue el estilo de código existente
- Agrega tipos para todas las funciones y componentes
- Escribe mensajes de commit significativos
- Mantén los componentes pequeños y enfocados
- Usa componentes funcionales con hooks

### Proceso de Pull Request

1. Actualiza el README.es.md con detalles de cambios si es necesario
2. Actualiza el API_DOCUMENTATION.es.md si se requieren cambios en la API
3. El PR será fusionado una vez que tengas aprobación de los mantenedores

## 📝 Licencia

Este proyecto es software propietario. Todos los derechos reservados.

## 🔧 Solución de Problemas

### Problemas Comunes

**Problema**: La aplicación no inicia

```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

**Problema**: Errores de conexión con la API

- Verifica que `VITE_API_BASE_URL` sea correcto
- Verifica que la API backend esté ejecutándose
- Verifica que CORS esté habilitado en el backend
- Revisa la consola del navegador para errores específicos

**Problema**: Falla la construcción

```bash
# Limpia caché de construcción
rm -rf dist
npm run build
```

**Problema**: Errores de TypeScript

```bash
# Ejecuta verificación de tipos para ver todos los errores
npm run typecheck
```

## 📞 Soporte

Para problemas, preguntas o contribuciones:
- Crea un issue en el repositorio de GitHub
- Contacta al equipo de desarrollo

---

**Construido con ❤️ usando React, TypeScript y Vite**
