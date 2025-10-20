FROM node:20-alpine

# Install debugging tools
RUN apk add --no-cache \
    curl \
    vim \
    bash \
    git

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with verbose output
RUN npm install --verbose

# Copy source code
COPY . .

# Expose application port
EXPOSE 4000

# Expose debugging port for Node.js inspector
EXPOSE 9229

# Set environment to development
ENV NODE_ENV=development

# Run with debugging enabled and watch mode
CMD ["npm", "run", "dev"]

# Alternative debug command (uncomment if needed):
# CMD ["node", "--inspect=0.0.0.0:9229", "--watch", "src/index.ts"]