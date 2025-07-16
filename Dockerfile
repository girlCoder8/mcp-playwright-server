FROM node:18-alpine
# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    firefox \
    webkit \
    ttf-freefont \
    font-noto-emoji \
    wqy-zenhei
# Set Playwright to use system browsers
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
WORKDIR /app
# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
# Install dependencies
RUN npm ci --only=production
# Copy source code
COPY src/ ./src/
# Build application
RUN npm run build
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S playwright -u 1001
USER playwright
# Create logs directory
RUN mkdir -p logs
EXPOSE 3000
CMD ["npm", "start"]