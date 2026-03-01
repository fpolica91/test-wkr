FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files (if any) and backend package
COPY package*.json ./
COPY packages/api-client/package*.json ./packages/api-client/

# Install dependencies for backend
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build api-client package
WORKDIR /app/packages/api-client
RUN npm run build

# Build backend
WORKDIR /app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/api-client/package*.json ./packages/api-client/

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api-client/dist ./packages/api-client/dist
COPY --from=builder /app/packages/api-client/package.json ./packages/api-client/

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/main.js"]