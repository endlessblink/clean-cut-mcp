# Clean-Cut-MCP Web App Container - Remotion Studio only
# Heavy container focusing on visual interface and video rendering

FROM node:22-bookworm-slim

# Install runtime dependencies for video rendering and Chrome
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
        w3m \
        fonts-noto-color-emoji \
        fontconfig && \
    rm -rf /var/lib/apt/lists/* && \
    fc-cache -fv && \
    ffmpeg -version

# Configure environment for proper emoji rendering in Chrome headless
ENV FONTCONFIG_PATH=/etc/fonts
ENV PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --font-render-hinting=none --disable-font-subpixel-positioning --enable-font-antialiasing"

# Install Remotion CLI globally and ensure Chrome Headless Shell is installed
RUN npm install -g @remotion/cli@4.0.347 remotion@4.0.347 && \
    npx remotion browser ensure

# Configure xdg-open to use text browser as fallback
RUN xdg-settings set default-web-browser w3m || true

WORKDIR /workspace

# Install workspace dependencies for Remotion Studio
COPY clean-cut-workspace/package*.json ./
RUN npm install --no-audit --no-fund

# Copy workspace source files
COPY clean-cut-workspace/src ./src
COPY clean-cut-workspace/public ./public
COPY clean-cut-workspace/tsconfig.json ./

# Create directories that might be missing
RUN mkdir -p src/components src/utils src/patterns src/validated-params src/assets/animations src/assets/audio src/assets/exports

# Copy web app entrypoint script
COPY web-app-separated/start-web-app.js ./start-web-app.js

# Create export directory with proper permissions
RUN mkdir -p /workspace/out && chmod 755 /workspace/out

# Create XDG runtime directory
RUN mkdir -p /tmp/runtime && chmod 700 /tmp/runtime

# Environment variables for web app
ENV NODE_ENV=production \
    DOCKER_CONTAINER=true \
    CONTAINER_ROLE=web-app \
    REMOTION_STUDIO_PORT=6970 \
    REMOTION_OUTPUT_DIR=/workspace/out \
    REMOTION_NON_INTERACTIVE=1 \
    DISPLAY=:99 \
    XDG_RUNTIME_DIR=/tmp/runtime \
    BROWSER=none \
    NODE_OPTIONS="--max-old-space-size=2048 --enable-source-maps" \
    REMOTION_CHROME_FLAGS="--disable-dev-shm-usage --no-sandbox --disable-gpu --disable-extensions --disable-plugins --disable-background-networking --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows"

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:6970/ || exit 1

# Expose Remotion Studio port
EXPOSE 6970

# Start Remotion Studio
CMD ["node", "start-web-app.js"]