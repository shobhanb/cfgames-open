# Build stage
FROM node:20-alpine as builder 

WORKDIR /app

# Copy package files
COPY package*.json  ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html/

# Copy nginx configuration
#COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
