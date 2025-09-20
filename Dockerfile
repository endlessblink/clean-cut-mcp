# Clean-Cut-MCP - Container with MCP HTTP server + Remotion Studio
# Multi-stage build: compile TypeScript in Docker, then create runtime image

# Stage 1: Build stage
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy MCP source and dependencies
COPY mcp-server/package*.json ./mcp-server/
COPY mcp-server/tsconfig.json ./mcp-server/
COPY mcp-server/src ./mcp-server/src

# Install all dependencies and build
WORKDIR /app/mcp-server
RUN npm install --no-audit --no-fund
RUN npm run build

# Stage 2: Runtime image
FROM node:22-bookworm-slim

# Install runtime deps: ffmpeg, Chrome dependencies, and minimal browser tools for xdg-open fallback
RUN apt-get update && \
    apt-get install -y \
        curl \
        gnupg \
        ca-certificates \
        ffmpeg \
        libnss3 \
        libdbus-1-3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libgbm-dev \
        libxss1 \
        libasound2 \
        libxdamage1 \
        libxrandr2 \
        libxcomposite1 \
        libxcursor1 \
        libgtk-3-0 \
        xdg-utils \
        w3m && \
    rm -rf /var/lib/apt/lists/* && \
    ffmpeg -version

# Install Remotion CLI globally, prettier, and ensure Chrome Headless Shell is installed
RUN npm install -g @remotion/cli@4.0.347 remotion@4.0.347 prettier@3.6.2 && \
    npx remotion browser ensure

# Configure xdg-open to use text browser as fallback (prevents "no method available" errors)
RUN xdg-settings set default-web-browser w3m || true

WORKDIR /app

# Copy built MCP server from builder stage
COPY --from=builder /app/mcp-server/dist ./mcp-server/dist
COPY --from=builder /app/mcp-server/node_modules ./mcp-server/node_modules
COPY --from=builder /app/mcp-server/package.json ./mcp-server/package.json

# Copy supervisor script that initializes workspace and launches both services
COPY start.js ./start.js
COPY cleanup-service.js ./cleanup-service.js

# Copy tsconfig and prettier config to workspace
COPY clean-cut-workspace/tsconfig.json ./tsconfig.json
COPY .prettierrc ./.prettierrc

# Copy guidelines directory for MCP tools
COPY claude-dev-guidelines ./claude-dev-guidelines

# Environment variables for headless Remotion operation with memory optimization
ENV NODE_ENV=production \
    DOCKER_CONTAINER=true \
    MCP_SERVER_PORT=6971 \
    REMOTION_STUDIO_PORT=6970 \
    REMOTION_NON_INTERACTIVE=1 \
    REMOTION_OUTPUT_DIR=/workspace/out \
    DISPLAY=:99 \
    XDG_RUNTIME_DIR=/tmp/runtime \
    BROWSER=none \
    NODE_OPTIONS="--max-old-space-size=2048 --enable-source-maps" \
    REMOTION_CHROME_FLAGS="--disable-dev-shm-usage --no-sandbox --disable-gpu --disable-extensions --disable-plugins --disable-background-networking --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows"

# Create export directory, XDG runtime directory, and volume mount point for Remotion renders
RUN mkdir -p /workspace/out && chmod 755 /workspace/out && \
    mkdir -p /tmp/runtime && chmod 700 /tmp/runtime

# PERMANENT: Install prettier properly at build time for Remotion Studio deletion
WORKDIR /workspace
RUN npm init -y && \
    npm install prettier@3.6.2 --save-dev && \
    mkdir -p node_modules/prettier && \
    cp -r /usr/local/lib/node_modules/prettier/* node_modules/prettier/ 2>/dev/null || true && \
    npm rebuild


# Document exposed ports
EXPOSE 6970
EXPOSE 6971

# Volume mount point for cross-platform video exports
VOLUME ["/workspace/out"]

# Healthcheck for MCP server
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:6971/health || exit 1

# Start both services: background cleanup + main Studio service
CMD ["sh", "-c", "node /app/cleanup-service.js & node /app/start.js"]
