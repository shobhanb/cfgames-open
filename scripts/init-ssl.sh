#!/bin/bash

# Check if email and subdomain arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Error: Both email address and subdomain are required"
    echo "Usage: $0 your-email@example.com subdomain"
    echo "Example: $0 admin@example.com cfmf"
    echo "Example: $0 admin@example.com itcf"
    exit 1
fi

# Validate email format using regex
if ! echo "$1" | grep -E "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$" > /dev/null; then
    echo "Error: Invalid email format"
    echo "Usage: $0 your-email@example.com subdomain"
    exit 1
fi

# Validate subdomain format (alphanumeric and hyphens only)
if ! echo "$2" | grep -E "^[a-zA-Z0-9-]+$" > /dev/null; then
    echo "Error: Invalid subdomain format. Use only letters, numbers, and hyphens"
    echo "Usage: $0 your-email@example.com subdomain"
    exit 1
fi

# Create required directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Stop any running containers
docker compose down

# Start nginx
docker compose up -d nginx

# Request the wildcard certificate using DNS challenge
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$1" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$2.cfgames.site"

# Restart nginx to load the new certificates
docker compose restart nginx

echo "SSL certificate initialization completed for $2.cfgames.site!"
echo "Important: You'll need to add DNS TXT records during the certificate request process"
