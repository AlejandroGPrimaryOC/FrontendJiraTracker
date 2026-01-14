# Multi-stage Dockerfile for Jira Deployment Tracker Frontend

# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY . .
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copia la configuración custom de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos generados en el build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia el script para inyección de env vars
COPY docker-entrypoint.d/40-inject-env.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]