# Jira Deployment Tracker - Frontend

A modern, responsive web application for tracking and visualizing Jira deployments across different stages (Development, Testing, UAT). Built with React, TypeScript, and Vite.

![Jira Wallboard](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Docker Deployment](#docker-deployment)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Kanban-style Board**: Visualize deployments across three stages (Develop, Testing, UAT)
- **Real-time Updates**: Add new deployments through an intuitive form
- **Advanced Filtering**: Search by ticket ID, description, owner, or version
- **Owner Filter**: Filter deployments by owner
- **Pagination**: Efficient loading of large deployment datasets
- **Version History**: View previous versions of each ticket
- **Status Tracking**: Track deployment status (Active, In Progress, Failed, Rolled Back)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean interface with Tailwind CSS and Lucide icons

## 🏗️ Architecture

This is a **frontend-only** application that communicates with a backend API via HTTP. The application:

- Uses React for the UI layer
- TypeScript for type safety
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- HTTP/REST API for data fetching and mutations

### Tech Stack

- **Framework**: React 18.3
- **Language**: TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Backend API**: The application requires a backend API (see [API Documentation](./API_DOCUMENTATION.md))

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/AlejandroGPrimaryOC/FrontendJiraTracker.git
cd FrontendJiraTracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` | No |

### Customization

- **Items per page**: Edit `ITEMS_PER_PAGE` constant in `src/App.tsx`
- **Stage names**: Modify `stageConfig` in `src/components/StageColumn.tsx`
- **Status types**: Update status types in `src/lib/api.ts`

## 💻 Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run typecheck` | Run TypeScript type checking |

### Development Workflow

1. **Make changes** to source files in `src/`
2. **Hot reload** will automatically update the browser
3. **Type checking** runs automatically in your IDE
4. **Lint your code** before committing: `npm run lint`
5. **Type check** before committing: `npm run typecheck`

### Code Quality

The project uses:
- **ESLint** for code linting
- **TypeScript** for static type checking
- **Prettier** compatible formatting (configure in your IDE)

## 🏭 Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Production Optimizations

The production build includes:
- Minified JavaScript and CSS
- Tree shaking to remove unused code
- Code splitting for optimal loading
- Asset optimization (images, fonts, etc.)
- Gzip-ready compression

## 🐳 Docker Deployment

### Building the Docker Image

```bash
docker build -t jira-deployment-tracker:latest .
```

### Running the Container

```bash
docker run -d \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://api.example.com/api \
  --name jira-tracker \
  jira-deployment-tracker:latest
```

### Docker Compose (Optional)

Create a `docker-compose.yml`:

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

Then run:

```bash
docker-compose up -d
```

### Deployment to Production

1. **Build the image**
   ```bash
   docker build -t registry.example.com/jira-tracker:v1.0.0 .
   ```

2. **Push to registry**
   ```bash
   docker push registry.example.com/jira-tracker:v1.0.0
   ```

3. **Deploy to your host**
   ```bash
   docker pull registry.example.com/jira-tracker:v1.0.0
   docker run -d -p 80:80 registry.example.com/jira-tracker:v1.0.0
   ```

### Environment Variables in Docker

You can pass environment variables at runtime:

```bash
docker run -d \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://api.production.com/api \
  jira-deployment-tracker:latest
```

Or use an env file:

```bash
docker run -d -p 80:80 --env-file .env.production jira-deployment-tracker:latest
```

## 📁 Project Structure

```
FrontendJiraTracker/
├── src/
│   ├── components/          # React components
│   │   ├── AddDeploymentForm.tsx    # Form for adding deployments
│   │   ├── DeploymentCard.tsx       # Card displaying deployment info
│   │   ├── SearchBar.tsx            # Search input component
│   │   └── StageColumn.tsx          # Column for each deployment stage
│   ├── lib/                 # Utility libraries
│   │   └── api.ts          # API client and types
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Vite type definitions
├── public/                  # Static assets
├── dist/                    # Production build output (generated)
├── node_modules/            # Dependencies (generated)
├── .gitignore              # Git ignore rules
├── Dockerfile              # Docker configuration
├── .dockerignore           # Docker ignore rules
├── API_DOCUMENTATION.md    # Backend API specification
├── README.md               # This file
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── eslint.config.js        # ESLint configuration
```

### Key Files

- **`src/App.tsx`**: Main application component with state management and data fetching
- **`src/lib/api.ts`**: HTTP API client with TypeScript types
- **`src/components/`**: Reusable React components
- **`Dockerfile`**: Multi-stage Docker build configuration
- **`API_DOCUMENTATION.md`**: Complete backend API specification

## 🔌 API Integration

This application requires a backend API. See documentation:

- **[BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)** - Quick start guide for backend developers (Spanish) 🚀
- **[API_DOCUMENTATION.es.md](./API_DOCUMENTATION.es.md)** - Complete API specification (Spanish)
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API specification (English)

### Key Points for Backend Team

The backend must implement 5 RESTful endpoints that return JSON data. The most critical aspects are:

1. **Stage values**: Must be exactly `'dev'`, `'testing'`, or `'uat'`
2. **Status values**: Must be exactly `'activo'`, `'en curso'`, `'ready to qa'`, or `'finalizado'` (in Spanish)
3. **Pagination**: Implement proper pagination with `has_more` field
4. **CORS**: Enable CORS for frontend origin

See the [Backend Integration Guide](./BACKEND_INTEGRATION_GUIDE.md) for a complete quick-start guide.

### Quick Start with API

1. Ensure your backend API is running
2. Configure `VITE_API_BASE_URL` to point to your API
3. The API must implement the endpoints specified in the documentation
4. Verify CORS is properly configured on the backend

## 📚 Documentation

### How to Document This Application

This project follows modern documentation practices:

#### 1. Code Documentation

- **Use TypeScript types**: Self-documenting code through interfaces and types
- **JSDoc comments**: For complex functions and components
- **Clear naming**: Use descriptive variable and function names

Example:

```typescript
/**
 * Fetch deployments with pagination
 * @param page - Page number (1-indexed)
 * @param perPage - Number of items per page
 * @returns Paginated deployment response
 */
async getDeployments(page: number, perPage: number): Promise<PaginatedResponse<Deployment>>
```

#### 2. Component Documentation

Document React components with:

```typescript
/**
 * DeploymentCard component displays a single deployment
 * 
 * @param deployment - Deployment object to display
 * @returns Rendered deployment card
 */
```

#### 3. API Documentation

- Maintain `API_DOCUMENTATION.md` for backend specifications
- Use OpenAPI/Swagger for interactive API documentation (backend)
- Keep DTOs synchronized between frontend and backend

#### 4. README Updates

When adding features:

1. Update the Features section
2. Add configuration options if needed
3. Update the project structure if files are added
4. Add usage examples

#### 5. Version Documentation

Use semantic versioning and maintain a CHANGELOG:

```markdown
## [1.1.0] - 2024-01-20
### Added
- New filtering capabilities
- Export to CSV feature

### Changed
- Improved pagination performance

### Fixed
- Bug in date formatting
```

#### 6. Inline Comments

Use comments sparingly and only when:
- The code is complex or non-obvious
- There's a specific business rule being implemented
- There's a workaround for a known issue

```typescript
// Convert stage from version string
// alpha -> develop, beta -> testing, rc -> uat
const stage = getStageFromVersion(version);
```

## 🤝 Contributing

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the coding standards
4. **Test your changes**: Run lint and type check
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Add types for all functions and components
- Write meaningful commit messages
- Keep components small and focused
- Use functional components with hooks

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the API_DOCUMENTATION.md if API changes are required
3. The PR will be merged once you have approval from maintainers

## 📝 License

This project is proprietary software. All rights reserved.

## 🔧 Troubleshooting

### Common Issues

**Issue**: Application won't start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: API connection errors

- Verify `VITE_API_BASE_URL` is correct
- Check that the backend API is running
- Verify CORS is enabled on the backend
- Check browser console for specific errors

**Issue**: Build fails

```bash
# Clear build cache
rm -rf dist
npm run build
```

**Issue**: TypeScript errors

```bash
# Run type check to see all errors
npm run typecheck
```

## 📞 Support

For issues, questions, or contributions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Built with ❤️ using React, TypeScript, and Vite**
