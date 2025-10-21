# Use the official Node.js image as the base image
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Create a non-root user early
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Set the working directory inside the container
WORKDIR /usr/src/app

# Change ownership of the working directory
RUN chown nestjs:nodejs /usr/src/app

# Switch to the non-root user for dependency installation
USER nestjs

# Copy package.json and pnpm-lock.yaml to the working directory
COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml ./

# Install the application dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY --chown=nestjs:nodejs . .

# Build the NestJS application
RUN pnpm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]