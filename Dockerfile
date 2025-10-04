# Multi-stage Dockerfile: build Vite app, serve with Nginx

FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build-time args for Jitsi configuration
ARG VITE_JITSI_EXTERNAL_API_URL=https://meet.jit.si/external_api.js
ARG VITE_JITSI_DOMAIN=meet.ffmuc.net
ARG VITE_JITSI_JWT=

# Generate .env.production for Vite from build args
RUN printf "VITE_JITSI_EXTERNAL_API_URL=%s\nVITE_JITSI_DOMAIN=%s\nVITE_JITSI_JWT=%s\n" "$VITE_JITSI_EXTERNAL_API_URL" "$VITE_JITSI_DOMAIN" "$VITE_JITSI_JWT" > .env.production

# Build static assets
ENV NODE_ENV=production
RUN npm run build


FROM nginx:1.25-alpine AS runner

# Replace default server config with SPA-friendly config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]