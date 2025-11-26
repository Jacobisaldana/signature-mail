# Multi-stage Dockerfile for Vite + React production deployment
# Optimized for Dokploy and other container platforms

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
# These will be injected at build time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SUPABASE_AVATARS_BUCKET=avatars
ARG VITE_SUPABASE_ICONS_BUCKET=icons

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_AVATARS_BUCKET=$VITE_SUPABASE_AVATARS_BUCKET
ENV VITE_SUPABASE_ICONS_BUCKET=$VITE_SUPABASE_ICONS_BUCKET

# Build the application
RUN npm run build

# Stage 2: Production server with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
