# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build the app
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:stable-alpine AS runtime

# Replace default nginx site with a SPA-friendly config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
