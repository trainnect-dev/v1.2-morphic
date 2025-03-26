# Morphic Docker Development Guide

This guide provides instructions for running Morphic in Docker containers for both development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment](#development-environment)
  - [Starting the Development Environment](#starting-the-development-environment)
  - [Hot Reloading](#hot-reloading)
  - [Stopping the Development Environment](#stopping-the-development-environment)
- [Production Environment](#production-environment)
  - [Building for Production](#building-for-production)
  - [Starting the Production Environment](#starting-the-production-environment)
  - [Stopping the Production Environment](#stopping-the-production-environment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git repository cloned locally

## Development Environment

The development environment is configured to support hot reloading, allowing you to see your changes in real-time without rebuilding the Docker container.

### Starting the Development Environment

1. Navigate to the project root directory:
   ```bash
   cd /path/to/morphic
   ```

2. Start the development environment:
   ```bash
   docker compose -f docker-compose.dev.yaml up -d
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000)

### Hot Reloading

The development environment is configured to automatically detect changes to your source files and reload the application. Here's how it works:

- Local files are mounted into the container using volumes
- The Next.js development server runs with hot reloading enabled
- Changes to files in the project directory will trigger a reload

When you make changes to any file in the project:
1. Save the file
2. Wait a moment for the development server to detect the change
3. The application will automatically reload with your changes

### Stopping the Development Environment

To stop the development environment:

```bash
docker compose -f docker-compose.dev.yaml down
```

## Production Environment

The production environment builds an optimized version of the application for deployment.

### Building for Production

1. Navigate to the project root directory:
   ```bash
   cd /path/to/morphic
   ```

2. Build the production image:
   ```bash
   docker compose build
   ```

### Starting the Production Environment

To start the production environment:

```bash
docker compose up -d
```

Access the application at [http://localhost:3000](http://localhost:3000)

### Stopping the Production Environment

To stop the production environment:

```bash
docker compose down
```

## Troubleshooting

### Container fails to start

If the container fails to start, check the logs:

```bash
docker compose -f docker-compose.dev.yaml logs morphic-dev
```

### Hot reloading not working

If hot reloading isn't working:

1. Ensure `WATCHPACK_POLLING=true` is set in the environment variables
2. Try restarting the container:
   ```bash
   docker compose -f docker-compose.dev.yaml restart morphic-dev
   ```

3. Check if your file changes are being properly mounted into the container:
   ```bash
   docker compose -f docker-compose.dev.yaml exec morphic-dev ls -la /app
   ```

### Port conflicts

If you encounter port conflicts:

1. Check if other services are using the required ports (3000, 6379, 8080)
2. Modify the port mappings in the docker-compose files if needed

### Cache issues

If you're experiencing caching issues:

1. Rebuild the development container without cache:
   ```bash
   docker compose -f docker-compose.dev.yaml build --no-cache morphic-dev
   ```

2. Start the containers again:
   ```bash
   docker compose -f docker-compose.dev.yaml up -d
   ```
