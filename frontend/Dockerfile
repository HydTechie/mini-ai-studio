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

RUN npm install --include=dev
# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Set environment to development
ENV NODE_ENV=development

# Run Vite with host exposure for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]