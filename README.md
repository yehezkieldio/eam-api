# Enterprise Asset Management API

## Overview

A RESTful API built with [Elysia](https://elysiajs.com/) and [Bun](https://bun.sh/) for managing enterprise assets. This API provides user management functionality with role-based access control and uses PostgreSQL as the database with Prisma ORM.

> **Note:** This project is no longer being actively maintained or developed.

## Features

- RESTful API built with Elysia framework
- User management with role-based access control (Inspector, Admin, Superadmin)
- PostgreSQL database with Prisma ORM
- OpenAPI documentation with Swagger UI (Scalar)
- Docker and Docker Compose support for easy deployment
- Health check endpoint for monitoring
- Structured logging with middleware
- TypeScript for type safety
- Hot reload support for development

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [PostgreSQL](https://www.postgresql.org/) (or use Docker Compose)
- [Docker](https://www.docker.com/) and Docker Compose (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yehezkieldio/eam-api.git
cd eam-api
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your database credentials and configuration.

4. Generate Prisma client:
```bash
bun run db:generate
```

5. Push database schema:
```bash
bun run db:push
```

### Running the Application

**Development mode with hot reload:**
```bash
bun run start:hot
```

**Development mode with watch:**
```bash
bun run start:watch
```

**Production mode:**
```bash
bun run start
```

The API will be available at `http://localhost:3000` by default. OpenAPI documentation can be accessed at `http://localhost:3000/reference`.

### Using Docker Compose

**Development environment:**
```bash
bun run compose:dev:up
```

**Local environment:**
```bash
bun run compose:local:up
```

**Production environment:**
```bash
bun run compose:prod:up
```

## Building from Source

### Building an Executable

Build a standalone executable:
```bash
bun run build:exe
```

### Building a Docker Image

Build the Docker image:
```bash
bun run docker:build
```

Run the Docker container:
```bash
bun run docker:run
```

### Building with Docker Compose

The project includes Docker Compose profiles for different environments:

- `development` - For development with hot reload
- `local` - For local testing with production-like setup
- `production` - For production deployment

Example:
```bash
docker compose --profile local up -d
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /users` - List all users
- `GET /users/:id` - Get a specific user by ID
- `GET /reference` - OpenAPI documentation

## Database Schema

The application uses PostgreSQL with the following main models:

- **User** - User accounts with email, password (hashed), fullname, photo, role, and timestamps
- **RefreshToken** - JWT refresh tokens for authentication
- **Role** - Enum with INSPECTOR, ADMIN, and SUPERADMIN roles

## Development

### Code Formatting and Linting

The project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check code
bun run biome

# Fix issues automatically
bun run biome:fix
```

### Database Migrations

```bash
# Generate Prisma client
bun run db:generate

# Push schema changes
bun run db:push

# Deploy migrations (production)
bun run db:migrate:deploy

# Seed database
bun run db:seed
```

## License

This project is licensed under the MIT License - see below for details.

MIT License

Copyright (c) 2025 Yehezkiel Dio Sinolungan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
