# Stage 1: Build api-client package
FROM node:20-alpine AS api-client-builder

WORKDIR /app/packages/api-client
COPY packages/api-client/package*.json ./
RUN npm ci
COPY packages/api-client/ ./
RUN npm run build
# Stage 2: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

ARG VITE_API_BASE_URL=
ARG VITE_TURNSTILE_SITE_KEY=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

# Copy api-client built output
COPY --from=api-client-builder /app/packages/api-client/dist /app/packages/api-client/dist
COPY --from=api-client-builder /app/packages/api-client/package.json /app/packages/api-client/

WORKDIR /app/fit-mvp-frontend
COPY fit-mvp-frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY fit-mvp-frontend/ ./
RUN npm run build

# Stage 3: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy api-client built output (must match file: reference in package.json)
COPY --from=api-client-builder /app/packages/api-client/dist /app/packages/api-client/dist
COPY --from=api-client-builder /app/packages/api-client/package.json /app/packages/api-client/
COPY --from=api-client-builder /app/packages/api-client/node_modules /app/packages/api-client/node_modules

WORKDIR /app/fit-mvp-backend
COPY fit-mvp-backend/package*.json ./
RUN npm install --legacy-peer-deps
COPY fit-mvp-backend/ ./
RUN npx prisma generate
RUN npm run build

# Stage 4: Production
FROM node:20-alpine

WORKDIR /app

# Copy api-client (must match file: reference from package.json)
COPY --from=api-client-builder /app/packages/api-client/dist ./packages/api-client/dist
COPY --from=api-client-builder /app/packages/api-client/package.json ./packages/api-client/

# Copy backend from builder stage
COPY --from=backend-builder /app/fit-mvp-backend/package*.json ./fit-mvp-backend/
RUN cd fit-mvp-backend && npm install --omit=dev --legacy-peer-deps

# Move node_modules up and place api-client directly (file: creates broken symlinks)
RUN mv fit-mvp-backend/node_modules ./node_modules && rm -rf fit-mvp-backend \
    && rm -rf node_modules/@fitness/api-client \
    && cp -r packages/api-client node_modules/@fitness/api-client

# Copy built backend (nest builds to dist/src/)
COPY --from=backend-builder /app/fit-mvp-backend/dist ./dist

# Copy frontend build to be served as static files
COPY --from=frontend-builder /app/fit-mvp-frontend/dist ./frontend-dist

# Copy Prisma schema, migrations, and config
COPY --from=backend-builder /app/fit-mvp-backend/prisma ./prisma
COPY --from=backend-builder /app/fit-mvp-backend/prisma.config.ts ./prisma.config.ts
RUN npx prisma generate

# Entrypoint: migrate then start
RUN printf '#!/bin/sh\nnpx prisma migrate deploy\nnode dist/src/main.js\n' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["/app/entrypoint.sh"]
