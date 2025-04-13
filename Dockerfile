FROM node:18-alpine

# Install required system dependencies for screenshot tools
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Create app directory
WORKDIR /app

# Install the screen-view-mcp package globally from npm
RUN npm install -g screen-view-mcp@2.0.15

# Expose port for documentation (not used for stdio transport)
EXPOSE 8080

# Run the server (the exact command will be provided by smithery.yaml)
CMD ["npx", "screen-view-mcp"] 