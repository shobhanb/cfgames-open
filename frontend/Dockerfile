# Build stage
FROM node:20-alpine as builder 

WORKDIR /app

# Copy package files
COPY package*.json  ./

# Install dependencies
RUN npm install -g @ionic/cli
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN NODE_OPTIONS=--max-old-space-size=2048 ionic build --prod

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/www /usr/share/nginx/html/

# Copy nginx configuration
#COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
