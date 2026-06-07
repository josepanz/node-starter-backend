<!-- PROJECT: node-starter-backend v1.0 -->

# node-starter-backend

## Domain

NestJS backend for merchant management, onboarding, payments, and transactions.
Two-level architecture: `/src/api` (HTTP orchestrator, calls other services in /module which can be HttpClients to other microservices or modules that connect to the database via Prisma) → `/src/modules` (reusable logic, connection to external microservices and connection, data manipulation and business logic via Prisma to PostgreSQL)

## Key Structure

- `api/*` — Controllers + DTOs + services that orchestrate modules
- `api/managment` — Exclusive endpoints for managment-backend (auth: Basic Auth api-to-api)
- `modules/auth` — Custom JWT, guards, decorators, access/refresh tokens, cookies (merchant-context)
- `modules/payments-providers` — QR codes + Checkout 
- `modules/acquiring` — Maybe HTTP client to acquiring-backend (no auth), merchant/branch/transaction data via Sequelize→DB2
- `modules/report` — Dynamic generation of xlsx/csv/pdf reports based on caller parameters
- `modules/*-db` — Prisma abstraction per domain (customers-db, merchant-db, sales-order-db, qr-payments-db)
- `modules/storage` — S3
- `modules/email` — email sending
- `core/database` — PrismaService central
- `core/config` — configuration loader, secrets/env validation
- `common/` — decorators, filters, pipes, validators, helpers, shared utilities

## Clients that consume this backend

| Client                    | Auth                                | Purpose                                                          |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
|                           | Custom JWT / Basic Auth (pre-login) |               app                                                |
|                           | Basic Auth api-to-api               | Configurations, assignments, permissions (uses Auth0 internally) |

# Service providers that are consumed

| Providers           | Auth                         | Purpose                                                                                                                                                                                  |
| ------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|            -backend | No auth                      | A service that connects to DB2 to obtain business data such as: stores, branches, transactions, MCC to list, retrieve by ID, and filter.                                                 |
|          api        | Bearer and x-merchant header | Provider of services related to checkout and payment links for: generation, queries, cancellation, link data.                                                                            |
|                     | Header api-key               | Transactional switch service to allow various types of payment, currently allowing us to generate QR codes for payments, check the status of the QR code and reverse/cancel the QR code. |

## Basic Auth — public pre-login endpoints

Onboarding, password recovery, and pre-authentication flows use Basic Auth.

Do not apply JWT guards to these endpoints.

## Auth

Custom JWT. Access token + refresh token + cookies (refresh + merchant-context).
Always use guards and decorators from `modules/auth`, never implement inline authentication.

## Acquiring

`modules/acquiring` consumes `external-data-backend` via HTTP without authentication.
`extarnal-data-backend` maybe uses Sequelize connected to DB2 — or Prisma to connect to PostgreSQL or MongoDB or any other database.
Never replicate acquiring business logic here, only consume it.

## DB

Local PostgreSQL via Prisma. Each `-db` module encapsulates its domain.

Never call PrismaService directly from `api/*` — always through the corresponding `-db` module.

## Testing

### Testing Rules in this Project

- Every new feature MUST include unit tests in the same pull request.
- Tests should be in `.spec.ts` files alongside the file they test.
- Use the AAA pattern (Arrange, Act, Assert) in all tests.
- Mock ALL external dependencies (DBs, APIs, providers).
- Name tests in Spanish, descriptively describing the expected behavior.
- Never hardcode real production IDs in tests.

### Mock Structure

Reusable mocks live in `test/mocks/`:

- `test/mocks/prisma.mock.ts` → mock of PrismaService
- `test/mocks/sequelize.mock.ts` → mock of Sequelize (acquirer-backend)
- `test/mocks/checkout.mock.ts` → mock of the checkout provider
- `test/mocks/http.mock.ts` → HttpService mock for inter-project calls

### Commands

- `pnpm run test` → run all tests
- `pnpm run test:watch` → watch mode for development
- `pnpm run test:cov` → generate coverage report
- `pnpm run test:e2e` → end-to-end tests

## Critical Rules

- Explicit DTOs in request/response — never generic types or `any`
- Auth module guards in all API controllers (except Basic Auth pre-login endpoints)
- Prisma transactions for multi-table writes
- Report module receives object + parameters — do not couple format in the caller
- Config loader in `core/config` for all secrets — never `process.env` directly outside of core
- `common/` is only for shared utilities — no business logic or database connections
- @./rules/infra.md
- @./rules/typescript.md
- @./rules/test.md

## Agents

- @./agents/code-reviewer.md
- @./agents/db-adivisor.md
- @./agents/testing-agent.md
- @./agents/tdd-refactor.md
