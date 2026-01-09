# Multi-stage Dockerfile for Jira Deployment Tracker Frontend

# Stage 1: Build the application
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the application  
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing - serve index.html for all routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Healthcheck endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a script to inject environment variables at runtime
COPY <<'EOF' /docker-entrypoint.d/40-inject-env.sh
#!/bin/sh
set -e

# Replace environment variables in the built JavaScript files
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "Injecting VITE_API_BASE_URL: $VITE_API_BASE_URL"
    find /usr/share/nginx/html/assets -type f -name '*.js' -exec sed -i "s|http://localhost:3000/api|$VITE_API_BASE_URL|g" {} +
fi

echo "Environment variables injected successfully"
EOF

# Make the script executable
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
