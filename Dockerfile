# Clean-Cut-MCP - Container with MCP HTTP server + Remotion Studio
# Multi-stage build: compile TypeScript in Docker, then create runtime image

# Stage 1: Build stage
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy MCP source and dependencies
COPY mcp-server/package*.json ./mcp-server/
COPY mcp-server/tsconfig.json ./mcp-server/
COPY mcp-server/src ./mcp-server/src

# Install all dependencies (including dev) and build
WORKDIR /app/mcp-server
RUN npm install --no-audit --no-fund
RUN npm run build

# Stage 2: Runtime image
FROM node:22-bookworm-slim

# Install runtime deps: ffmpeg and Google Chrome (for Remotion renders)
RUN apt-get update \
    && apt-get install -y curl gnupg ca-certificates ffmpeg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-linux.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-linux.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >/etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built MCP server from builder stage
COPY --from=builder /app/mcp-server/dist ./mcp-server/dist
COPY --from=builder /app/mcp-server/node_modules ./mcp-server/node_modules
COPY --from=builder /app/mcp-server/package.json ./mcp-server/package.json

# Startup supervisor script that initializes /workspace and launches both services
COPY start.js ./start.js

ENV NODE_ENV=production \
    DOCKER_CONTAINER=true \
    MCP_SERVER_PORT=6961 \
    REMOTION_STUDIO_PORT=6960 \
    REMOTION_NON_INTERACTIVE=1

EXPOSE 6960 6961

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:6961/health || exit 1

CMD ["node", "/app/start.js"]
