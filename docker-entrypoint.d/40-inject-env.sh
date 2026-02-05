#!/bin/sh
set -e

# Replace environment variables in the built JavaScript files
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "Injecting VITE_API_BASE_URL: $VITE_API_BASE_URL"
    find /usr/share/nginx/html/assets -type f -name '*.js' -exec sed -i "s|http://localhost:3000/api|$VITE_API_BASE_URL|g" {} +
fi

echo "Environment variables injected successfully"

# Inyectar JIRATRACKER_VERSION en /usr/share/nginx/html/env.js (raíz del sitio)
if [ -n "$JIRATRACKER_VERSION" ]; then
    echo "Injecting JIRATRACKER_VERSION: $JIRATRACKER_VERSION"
    echo "window.JIRATRACKER_VERSION = \"$JIRATRACKER_VERSION\";" > /usr/share/nginx/html/env.js
else
    echo "window.JIRATRACKER_VERSION = \"unknown\";" > /usr/share/nginx/html/env.js
fi
echo "Environment variables injected successfully"