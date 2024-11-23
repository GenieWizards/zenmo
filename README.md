# Finance Management API

A backend repository for the finance management system.

## Table of Contents

- [Finance Management API](#finance-management-api)
- [Tech Stack](#tech-stack)
- [To Setup Locally](#to-setup-locally)
- [Check API Documentation](#check-api-documentation)
- [Database Migrations](#database-migrations)

## Tech Stack

- **Language:** TypeScript ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
- **Runtime:** Bun ![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)
- **Package Manager:** Bun ![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)
- **Auth:** Lucia Auth ![Lucia Auth](https://img.shields.io/badge/Lucia_Auth-4B8BBE?style=flat&logo=auth0&logoColor=white)
- **Database:** PostgreSQL ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
- **ORM/ODM:** Drizzle ![Drizzle](https://img.shields.io/badge/Drizzle-000000?style=flat&logo=drizzle&logoColor=white)
- **Testing:** Bun ![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)
- **Documentation:** OpenAPI/Scalar ![OpenAPI](https://img.shields.io/badge/OpenAPI-6BA539?style=flat&logo=openapi-initiative&logoColor=white) ![Scalar](https://img.shields.io/badge/Scalar-000000?style=flat&logo=scalar&logoColor=white)
- **Containerization:** Docker ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) Docker Compose ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat&logo=docker&logoColor=white)

## To Setup Locally

- This project uses Bun as its package manager. You need to have Bun installed on your system.
- To install Bun, follow the official guide at [bun.sh](https://bun.sh).

```bash
git clone https://github.com/GenieWizards/finance-management-api.git # Clone the repo
cd finance-management-api # Navigate to the cloned folder
bun install # Install necessary dependencies using Bun package manager
bun dev # Start the server in development mode
```

## 🐳 Docker Development Setup

This project uses Docker for both development and production environments. Below are the instructions to get started.

### Prerequisites

- Docker and Docker Compose installed on your machine
- Make (usually pre-installed on macOS/Linux)

### Available Make Commands

```bash
# Show all available commands
make help

# Development Commands
make dev-build    # Build development environment
make dev-up       # Start development environment
make dev-down     # Stop development environment

# Production Commands
make build        # Build production environment
make up           # Start production environment
make down         # Stop production environment
make restart      # Restart the application

# Utility Commands
make logs         # View logs from all containers
make ps           # List running containers
make shell        # Open a shell in the API container
make migrate      # Run database migrations
make clean        # Stop containers, remove volumes, and prune system
```

### Quick Start (Development)

1. Clone the repository
2. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

3. Start the development environment:
   ```bash
   make dev-build
   make dev-up
   ```

The application will be available at `http://localhost:8998`

### Development Notes

- The development environment includes hot reloading. Any changes to the source code will automatically reflect in the running application.
- When adding new dependencies (`bun add <package>`), you'll need to rebuild the containers:
  ```bash
  make dev-down
  make dev-build
  make dev-up
  ```

### Database

- PostgreSQL is available at `localhost:5432`
- Default credentials (development):
  ```
  User: root
  Password: root
  Database: finance-management-api-dev
  ```
- Migrations are run automatically when the container starts

### Troubleshooting

If you encounter any issues:

1. Clean Docker resources:

   ```bash
   make clean
   ```

2. Rebuild everything:

   ```bash
   make rebuild
   ```

3. Check logs:
   ```bash
   make logs
   ```

### Production Deployment

For production deployment:

```bash
make build
make up
```

Note: Make sure to set appropriate environment variables for production use.

## Check API Documentation

- The API documentation is available at {{API_URL}}/reference

## Database Migrations

If the schema is added/updated, you need to generate and apply the migrations:

```bash
bun db:generate # Generates the migration
bun db:migrate # Applies the migration
```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
