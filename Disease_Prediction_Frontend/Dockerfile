# Stage 1: Build static assets with Node.js
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency definitions and install
COPY package*.json ./
RUN npm ci

# Copy application source and build production package
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
