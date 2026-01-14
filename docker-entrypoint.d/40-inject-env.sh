#!/bin/sh
set -e

# Replace environment variables in the built JavaScript files
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "Injecting VITE_API_BASE_URL: $VITE_API_BASE_URL"
    find /usr/share/nginx/html/assets -type f -name '*.js' -exec sed -i "s|http://localhost:3000/api|$VITE_API_BASE_URL|g" {} +
fi

echo "Environment variables injected successfully"