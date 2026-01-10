FROM node:20.14.0-alpine3.19

# Create directory if not present
RUN mkdir -p /usr/src/app

# Set work directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Copy env files
COPY .env.* ./

# Install all dependencies (including dev for build)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Optionally prune dev dependencies after build to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 8081

# Start the application
CMD ["npm", "start"]
