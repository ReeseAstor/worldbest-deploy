# Multi-stage Dockerfile for Next.js application
# Optimized for production deployment with health checks and proper caching

# Base stage for dependencies
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat curl
RUN npm install -g pnpm@8.10.0
WORKDIR /app

# Dependencies stage
FROM base AS deps

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui-components/package.json ./packages/ui-components/

# Install dependencies with frozen lockfile for reproducible builds
RUN pnpm install --frozen-lockfile --prefer-offline

# Builder stage
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy source code and configuration files
COPY src ./src
COPY public ./public
COPY package.json pnpm-lock.yaml* next.config.js tsconfig.json ./
COPY postcss.config.js tailwind.config.ts ./

# Set build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build shared packages first (in order)
WORKDIR /app/packages/shared-types
RUN pnpm build

WORKDIR /app/packages/ui-components
RUN pnpm build

# Build the Next.js application with standalone output
WORKDIR /app
RUN pnpm build

# Production stage - minimal runtime image
FROM base AS runner

# Production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output from Next.js build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the Next.js application
CMD ["node", "server.js"]
