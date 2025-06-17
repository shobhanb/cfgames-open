#!/bin/bash

# Stop nginx temporarily
docker-compose stop nginx

# Renew the certificates
docker-compose run --rm certbot renew

# Start nginx again
docker-compose start nginx

echo "SSL certificate renewal completed!"
