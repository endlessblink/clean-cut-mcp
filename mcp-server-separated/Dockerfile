# Clean-Cut-MCP Server Container - MCP-only functionality
# Lightweight container focusing purely on MCP server and animation management

FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy MCP source and dependencies
COPY mcp-server/package*.json ./mcp-server/
COPY mcp-server/tsconfig.json ./mcp-server/
COPY mcp-server/src ./mcp-server/src

# Install MCP server dependencies (including dev dependencies for build)
WORKDIR /app/mcp-server
RUN npm install --no-audit --no-fund

# Build MCP server
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --production

# Runtime stage
FROM node:22-bookworm-slim

# Install minimal runtime dependencies
RUN apt-get update && \
    apt-get install -y \
        curl \
        ca-certificates \
        fontconfig \
        && \
    rm -rf /var/lib/apt/lists/* && \
    fc-cache -fv

WORKDIR /app

# Copy built MCP server from builder stage
COPY --from=builder /app/mcp-server/dist ./mcp-server/dist
COPY --from=builder /app/mcp-server/node_modules ./mcp-server/node_modules
COPY --from=builder /app/mcp-server/package.json ./mcp-server/package.json

# Copy shared configuration and guidelines
COPY claude-dev-guidelines ./claude-dev-guidelines
COPY .prettierrc ./.prettierrc

# Create MCP server entrypoint script
COPY mcp-server-separated/start-mcp-server.js ./start-mcp-server.js

# Create preferences directory for learned rules
RUN mkdir -p /app/mcp-server/preferences && chmod 755 /app/mcp-server/preferences

# Environment variables for MCP server
ENV NODE_ENV=production \
    DOCKER_CONTAINER=true \
    CONTAINER_ROLE=mcp-server \
    MCP_SERVER_PORT=6971 \
    REMOTION_STUDIO_PORT=6970 \
    NODE_OPTIONS="--max-old-space-size=512 --enable-source-maps"

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:6971/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Expose MCP server port
EXPOSE 6971

# Start MCP server
CMD ["node", "start-mcp-server.js"]