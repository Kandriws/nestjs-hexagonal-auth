## Project: Auth API (Hexagonal Architecture)

This repository contains an authentication API built with NestJS and TypeScript following hexagonal architecture principles (ports & adapters). It integrates with Prisma (PostgreSQL), JWT, OTP (2FA) and provides utilities for sending emails.

This README is in English and explains how to run the project locally, use Docker, run Prisma, where Swagger is served and notes about project structure and architecture.

## Quick summary

- Stack: NestJS 11, TypeScript, Prisma (Postgres), JWT, Passport, Nodemailer
- Swagger docs: /api/docs (served by the application)
- Default port: 3000

## Requirements

- Node.js 20+ (recommended)
- npm
- Docker & Docker Compose (recommended for development with Postgres)
- PostgreSQL (if you prefer to run DB outside Docker)

## Key files

- `package.json` — scripts and dependencies
- `Dockerfile`, `docker-compose.yml` — container setup
- `prisma/schema.prisma` — database schema
- `src/main.ts` — application bootstrap (global pipes, Swagger)
- `docs/hexagonal-architecture.md` — explanation of the architecture used

## Environment variables (main)

The project uses environment variables (see `.env` in development). Common variables referenced by `docker-compose.yml` and Prisma include (examples):

- DATABASE_URL — connection URL for Postgres (eg. postgres://user:pass@host:5432/dbname)
- PORT — API port (default 3000)
- DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT — used by docker-compose
- Other values: JWT secrets, SMTP config, encryption keys, etc. (see `src/shared/infrastructure/config`)

Do not commit secrets to the repository. Use a `.env` file or a secret manager.

## Useful npm scripts

- npm run start:dev — Start Nest in development mode (watch)
- npm run start — Start Nest (normal)
- npm run start:prod — Start compiled app (`node dist/main`)
- npm run build — Build TypeScript with Nest
- npm run test — Run tests (Jest)
- npm run test:cov — Run tests with coverage
- npm run prisma:generate — Generate Prisma client
- npm run prisma:migrate — Run migrations (dev)

Check `package.json` for the full list.

## Run locally (without Docker)

1. Clone the repository and change into the project folder.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the required variables. Minimal example:

```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
```

4. Generate Prisma Client and run migrations (development):

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the app in development mode:

```bash
npm run start:dev
```

6. Open Swagger documentation:

```
http://localhost:3000/api/docs
```

## Run with Docker (recommended development flow)

This repository includes `docker-compose.yml` to bring up the API and a PostgreSQL instance for development. The `api` service runs Prisma migrations automatically before starting in development mode.

From the project root, create or update a `.env` with DB credentials used by `docker-compose.yml`, then:

```bash
# Start all services (build images if needed)
docker compose up --build

# Or start only the api service (and let it start depends_on postgres):
docker compose up --build api
```

Notes:
- The `api` service command runs: `npx prisma migrate dev --name auto-migration && npm run start:dev` (see `docker-compose.yml`).
- Use `docker compose down` to stop and remove containers.

## Prisma / Database

- Schema: `prisma/schema.prisma`.
- Generated client: `generated/prisma`.
- Common commands:
	- `npm run prisma:generate` — generate client
	- `npm run prisma:migrate` — create/apply migrations (dev)

## API documentation

Swagger is enabled in `src/main.ts` and is served at `/api/docs`.

Endpoints, DTOs and descriptions are generated from `@Api*` decorators in controllers and DTO classes.

## Architecture

This project follows hexagonal architecture (ports & adapters):

- `src/domain` — entities, value objects, and ports (interfaces)
- `src/application` — use-cases (business orchestration)
- `src/presentation` — controllers, DTOs and mappers
- `src/infrastructure` — concrete adapters (Prisma, email, strategies, guards)

See `docs/hexagonal-architecture.md` for a deeper guide and examples.

## Security and best practices

- Never commit secrets. Use `.env` files in `.gitignore` or a secret manager.
- Global validation is configured via `CustomValidationPipe` in `src/main.ts`.
- The application applies a global `JwtAuthGuard` in `AppModule` to protect routes by default (see `src/app.module.ts`).

## Testing

- Unit and integration tests use Jest and live under `test/`.
- Run tests:

```bash
npm run test
npm run test:cov
```

For E2E tests use `jest --config ./test/jest-e2e.json` or `npm run test:e2e` if configured.

## Project layout (summary)

```
src/
├─ auth/               # Authentication module (use-cases, guards, strategies)
├─ shared/             # Shared utilities (pipes, interceptors, config)
├─ app.module.ts
├─ main.ts             # Bootstrap: global pipes, Swagger, CORS
```

For more about organizing code in hexagonal style, see `docs/hexagonal-architecture.md`.

## Contributing

1. Open an issue describing the change or bug.
2. Create a branch with a descriptive name (`feature/`, `fix/`).
3. Add relevant tests.
4. Open a pull request targeting `development`.

## Handy commands (summary)

```bash
# install
npm install

# development
npm run start:dev

# build
npm run build

# tests
npm run test

# prisma
npm run prisma:generate
npm run prisma:migrate
```

## Final notes

- Swagger: http://localhost:3000/api/docs
- Default port: 3000
- Architecture: hexagonal (see `docs/hexagonal-architecture.md`)

If you want, I can add a `.env.example`, Postman collection or quick cURL examples for the most-used endpoints — tell me which you prefer and I'll add them.

---

Requirements covered:

- Provide README in English (updated).
- Clarify Docker start command to use `docker compose up --build` and show service-specific option.

