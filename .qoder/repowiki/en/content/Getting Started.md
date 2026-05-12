# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [next.config.js](file://next.config.js)
- [tsconfig.json](file://tsconfig.json)
- [Dockerfile](file://Dockerfile)
- [DEPLOYMENT.md](file://DEPLOYMENT.md)
- [deploy.sh](file://deploy.sh)
- [packages/shared-types/package.json](file://packages/shared-types/package.json)
- [packages/ui-components/package.json](file://packages/ui-components/package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Installation](#step-by-step-installation)
4. [Environment Variables](#environment-variables)
5. [Local Development Server](#local-development-server)
6. [Available Scripts](#available-scripts)
7. [Docker Setup](#docker-setup)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

## Introduction
Welcome to the WorldBest development environment setup guide. This document walks you through everything needed to get the project running locally, including prerequisites, installation, environment configuration, and development workflows. Whether you're a beginner or an experienced developer, you'll find clear instructions and helpful tips to avoid common pitfalls.

## Prerequisites
Before installing WorldBest, ensure your machine meets the following requirements:
- Node.js 18 or higher
- Package manager: pnpm (recommended) or npm
- Git for version control
- Docker (optional, for containerized builds and local services)

These requirements are confirmed by the project configuration and scripts.

**Section sources**
- [README.md](file://README.md#L110-L116)
- [package.json](file://package.json#L77-L80)
- [packages/shared-types/package.json](file://packages/shared-types/package.json#L1-L17)
- [packages/ui-components/package.json](file://packages/ui-components/package.json#L47-L54)

## Step-by-Step Installation
Follow these steps to clone the repository, install dependencies, and prepare your environment:

1. Clone the repository
   - Use Git to clone the repository to your local machine.
   - Change into the project directory after cloning.

2. Install dependencies
   - Install all project dependencies using your preferred package manager (pnpm recommended).

3. Prepare environment variables
   - Copy the example environment file to create your local configuration.
   - Edit the copied file to add your credentials and service keys.

4. Start the development server
   - Launch the Next.js development server to begin local work.

5. Access the application
   - Open the application in your browser at the development URL.

These steps are designed for a smooth developer experience and are aligned with the project’s scripts and configuration.

**Section sources**
- [README.md](file://README.md#L117-L144)

## Environment Variables
Environment variables are essential for connecting to external services and enabling features. The project expects a local environment file for secrets and configuration.

- Local configuration file
  - Create a local environment file by copying the example template.
  - Add your service credentials and keys to the local file.

- Publicly exposed variables
  - Some variables are intended for the browser and are prefixed accordingly.
  - These are safe to include in the frontend build.

- Database and authentication
  - The deployment guide lists the environment variables required for Supabase integration.
  - These include database connection strings, service keys, and public URLs.

- API and WebSocket endpoints
  - The Next.js configuration defines default public API and WebSocket URLs.
  - Override these in your environment file if your backend runs on a different host/port.

- Example variables to configure
  - Database connection strings and pooler URLs
  - Supabase service role key and anonymous public key
  - Public Supabase URLs for the frontend

- Variable naming and scoping
  - Keep sensitive keys out of version control.
  - Use the provided prefixes for variables intended for the browser.

- Verification
  - Confirm that your environment variables match the deployment guide and Next.js configuration.

**Section sources**
- [README.md](file://README.md#L130-L134)
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L14-L56)
- [next.config.js](file://next.config.js#L24-L27)

## Local Development Server
Once dependencies are installed and environment variables are configured, start the development server:

- Start the development server
  - Use the development script to launch the Next.js server with hot reloading.

- Access the application
  - Open the development URL in your browser to view the application.

- Redirect behavior
  - The Next.js configuration includes a redirect rule that sends authenticated users to the dashboard.

- API proxying
  - Requests to the API prefix are rewritten to your configured backend URL.

- WebSocket connections
  - The Next.js configuration sets a default WebSocket URL for real-time features.

- Port and host
  - The development server listens on the standard Next.js port and host.

- Troubleshooting
  - If the server fails to start, verify your environment variables and ensure the backend is reachable.

**Section sources**
- [README.md](file://README.md#L136-L144)
- [next.config.js](file://next.config.js#L28-L51)

## Available Scripts
The project provides a set of scripts to streamline development, building, and maintenance tasks. Use these commands in your terminal to manage the application lifecycle.

- Development
  - Start the Next.js development server with hot reloading.

- Production build
  - Build the application for production deployment.

- Production start
  - Start the production server using the compiled build.

- Linting
  - Run the linter to check for code quality issues.

- Type checking
  - Run TypeScript checks to validate types.

- Testing (when implemented)
  - Run the test suite when tests are configured.

These scripts are defined in the project configuration and are the standard way to operate the application during development and deployment.

**Section sources**
- [README.md](file://README.md#L146-L155)
- [package.json](file://package.json#L6-L12)

## Docker Setup
Docker is optional but useful for consistent builds and local service runs. The repository includes a multi-stage Dockerfile tailored for this Next.js application.

- Base image and tools
  - The base stage uses a Node.js 18 Alpine image and installs pnpm globally.

- Dependency stages
  - Copies package manifests for the workspace and shared packages.
  - Installs dependencies with a lockfile to ensure reproducible builds.

- Build stages
  - Builds shared packages first, then the web application.
  - Sets environment variables for production builds.

- Production stage
  - Creates a non-root user for security.
  - Copies the standalone Next.js build artifacts with correct ownership.
  - Exposes the application port and starts the server.

- Running the container
  - Build the image and run it, mapping the exposed port to localhost.
  - The container listens on the standard Next.js port.

- Notes
  - The Dockerfile targets a specific application path and uses a filter to build the web package.
  - Ensure your environment variables are configured appropriately for the container runtime.

**Section sources**
- [Dockerfile](file://Dockerfile#L1-L73)

## Troubleshooting
Encounter an issue? Try these steps to diagnose and resolve common problems during setup and development.

- Node.js version mismatch
  - Ensure you are using Node.js 18 or higher as required by the project.

- Dependency installation failures
  - Reinstall dependencies using the recommended package manager.
  - Verify your network allows access to package registries.

- Environment variable errors
  - Confirm that your local environment file exists and contains the required variables.
  - Match the variable names and formats described in the deployment guide.

- Database connectivity
  - Verify database connection strings and SSL settings.
  - Ensure the database service is reachable from your machine.

- Build failures
  - Check build logs for TypeScript or dependency errors.
  - Confirm all environment variables are set before building.

- Development server issues
  - Ensure the development server is listening on the expected port.
  - Verify that API and WebSocket URLs are correctly configured.

- Docker build or run issues
  - Confirm the Dockerfile stages are executed in order.
  - Check that the application port is not blocked by another service.

- Additional resources
  - Consult the deployment guide for environment-specific troubleshooting.
  - Review the Next.js configuration for proxy and redirect behavior.

**Section sources**
- [README.md](file://README.md#L110-L116)
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L116-L134)

## Next Steps
With the development environment ready, you can now contribute effectively to the project. Use the provided scripts, follow the configuration guidance, and leverage the included documentation to accelerate your workflow.

- Explore the project structure
  - Review the Next.js app router pages, components, and shared packages.

- Begin feature development
  - Use the scripts to run, build, and lint the application.
  - Reference the deployment guide for production preparation.

- Stay informed
  - Keep an eye on the project’s status and roadmap for upcoming changes.

[No sources needed since this section summarizes without analyzing specific files]