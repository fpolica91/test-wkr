# Stage 1: Build api-client package
FROM node:20-alpine AS api-client-builder

WORKDIR /app/packages/api-client

COPY packages/api-client/package*.json ./
RUN npm ci

COPY packages/api-client/ ./
RUN npm run build

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/fit-mvp-frontend

# Copy api-client package from previous stage
COPY --from=api-client-builder /app/packages/api-client/dist /app/packages/api-client/dist
COPY --from=api-client-builder /app/packages/api-client/package.json /app/packages/api-client/

# Install frontend dependencies
COPY fit-mvp-frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY fit-mvp-frontend/ ./

# Build frontend
RUN npm run build

# Stage 3: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy api-client package from first stage
COPY --from=api-client-builder /app/packages/api-client/dist /app/packages/api-client/dist
COPY --from=api-client-builder /app/packages/api-client/package.json /app/packages/api-client/

# Install backend dependencies
COPY fit-mvp-backend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy backend source
COPY fit-mvp-backend/ ./

# Build backend
RUN npm run build

# Stage 4: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY fit-mvp-backend/package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built backend
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules

# Copy frontend build to be served as static files
COPY --from=frontend-builder /app/fit-mvp-frontend/dist ./frontend-dist

# Copy Prisma schema
COPY fit-mvp-backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Install @nestjs/serve-static for serving frontend
RUN npm install @nestjs/serve-static

# Update main.ts to serve static files (will be done via config)
# Create entrypoint script
RUN echo '#!/bin/sh
npx prisma migrate deploy
node dist/main.js' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["/app/entrypoint.sh"]
