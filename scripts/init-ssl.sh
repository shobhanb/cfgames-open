#!/bin/bash

# Check if email argument is provided
if [ -z "$1" ]; then
    echo "Error: Email address is required"
    echo "Usage: $0 your-email@example.com"
    exit 1
fi

# Validate email format using regex
if ! echo "$1" | grep -E "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$" > /dev/null; then
    echo "Error: Invalid email format"
    echo "Usage: $0 your-email@example.com"
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
    --manual \
    --preferred-challenges dns \
    --email "$1" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "*.cfgames.site" \
    -d "cfgames.site"

# Restart nginx to load the new certificates
docker compose restart nginx

echo "SSL certificate initialization completed!"
echo "Important: You'll need to add DNS TXT records during the certificate request process"
