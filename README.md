# Finance Management API

A backend repository for the finance management system.

## Table of Contents

- [Finance Management API](#finance-management-api)
- [Tech Stack](#tech-stack)
- [To Setup Locally](#to-setup-locally)
- [Check API Documentation](#check-api-documentation)
- [Database Migrations](#database-migrations)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) ![Drizzle](https://img.shields.io/badge/Drizzle-000000?style=flat&logo=drizzle&logoColor=white) ![OpenAPI](https://img.shields.io/badge/OpenAPI-6BA539?style=flat&logo=openapi-initiative&logoColor=white) ![Scalar](https://img.shields.io/badge/Scalar-000000?style=flat&logo=scalar&logoColor=white)

## Tech Stack

- **Language:** TypeScript <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white"/>
- **Runtime:** Bun
- **Package Manager:** Bun
- **Database:** PostgreSQL
- **ORM/ODM:** Drizzle
- **Testing:** Bun
- **Documentation:** OpenAPI/Scalar

## To Setup Locally

- This project uses Bun as its package manager. You need to have Bun installed on your system.
- To install Bun, follow the official guide at [bun.sh](https://bun.sh).

```bash
git clone https://github.com/GenieWizards/finance-management-api.git # Clone the repo
cd finance-management-api # Navigate to the cloned folder
bun install # Install necessary dependencies using Bun package manager
bun dev # Start the server in development mode
```

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
