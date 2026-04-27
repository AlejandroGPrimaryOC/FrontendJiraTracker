#!/bin/sh
set -e

# Replace environment variables in the built JavaScript files
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "Injecting VITE_API_BASE_URL: $VITE_API_BASE_URL"
    find /usr/share/nginx/html/assets -type f -name '*.js' -exec sed -i "s|http://localhost:3000/api|$VITE_API_BASE_URL|g" {} +
fi

echo "Environment variables injected successfully"

# Inyectar variables en /usr/share/nginx/html/env.js (raíz del sitio)
ENV_JS="/usr/share/nginx/html/env.js"

# JIRATRACKER_VERSION
if [ -n "$JIRATRACKER_VERSION" ]; then
    echo "Injecting JIRATRACKER_VERSION: $JIRATRACKER_VERSION"
    echo "window.JIRATRACKER_VERSION = \"$JIRATRACKER_VERSION\";" > "$ENV_JS"
else
    echo "window.JIRATRACKER_VERSION = \"unknown\";" > "$ENV_JS"
fi

# JIRATRACKER_VERSION_OPTIONS (comma-separated list of versions for the filter)
if [ -n "$JIRATRACKER_VERSION_OPTIONS" ]; then
    echo "Injecting JIRATRACKER_VERSION_OPTIONS: $JIRATRACKER_VERSION_OPTIONS"
    echo "window.JIRATRACKER_VERSION_OPTIONS = \"$JIRATRACKER_VERSION_OPTIONS\";" >> "$ENV_JS"
fi

# JIRATRACKER_DEFAULT_VERSION (default selected version in the filter)
if [ -n "$JIRATRACKER_DEFAULT_VERSION" ]; then
    echo "Injecting JIRATRACKER_DEFAULT_VERSION: $JIRATRACKER_DEFAULT_VERSION"
    echo "window.JIRATRACKER_DEFAULT_VERSION = \"$JIRATRACKER_DEFAULT_VERSION\";" >> "$ENV_JS"
fi

echo "Environment variables injected successfully"