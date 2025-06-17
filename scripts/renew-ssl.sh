#!/bin/bash

# Check if certificates need renewal (default 30 days before expiry)
docker compose run --rm certbot renew --webroot --webroot-path /var/www/certbot

# Only restart Nginx if certificates were actually renewed
if [ $? -eq 0 ]; then
    echo "Certificates were renewed, restarting Nginx..."
    docker compose restart nginx
else
    echo "No certificates were renewed."
fi
