<!-- agent-update:start:testing-strategy -->
# Testing Strategy

This document outlines how quality is maintained across the codebase through comprehensive testing practices, including unit, integration, and end-to-end tests, enforced via CI/CD pipelines and local development workflows.

## Test Types
- **Unit Tests**: These focus on individual functions, components, and utilities in isolation. The project uses Jest as the primary framework for unit testing. Test files follow the naming convention `*.test.ts` or `*.spec.ts` and are colocated within the `src/` directory or in the dedicated `tests/` folder for shared utilities. Mocking is handled via Jest's built-in features or libraries like `@jest-mock` for external dependencies such as Prisma.
- **Integration Tests**: These validate interactions between multiple modules, such as API endpoints with database operations using Prisma. Scenarios include testing service layers with mocked or real database connections (via an in-memory SQLite for CI). Tooling includes Jest for execution and `supertest` for API integration where applicable. Tests are organized in `tests/integration/` and require a setup script to initialize the test database.
- **End-to-End (E2E) Tests**: These simulate full user workflows across the application stack. Currently, E2E testing uses Playwright for browser automation, targeting key user journeys like authentication and data CRUD operations. Tests run in a dedicated `tests/e2e/` directory against a staging-like environment spun up via Docker Compose. Harnesses include environment variables for test data seeding.

## Running Tests
- Execute all tests with `npm run test`.
- Use watch mode locally: `npm run test -- --watch`.
- Add coverage runs before releases: `npm run test -- --coverage`.
- For specific test types: Run unit/integration with `npm run test:unit` or `npm run test:integration`; E2E tests via `npm run test:e2e` which starts the app in test mode.

## Quality Gates
- **Coverage Expectations**: Maintain at least 80% statement coverage across the codebase, measured via Jest's coverage reports. Branch and function coverage should exceed 70%. These thresholds are enforced in CI via the `jest.config.js` configuration.
- **Linting and Formatting**: All code must pass ESLint (using the `@typescript-eslint` ruleset with custom extensions for React/Next.js) and Prettier formatting checks before merging. Required checks include `eslint` and `prettier --check` in pull requests. Husky pre-commit hooks run these locally to prevent violations.

## Troubleshooting
- **Flaky Suites**: The integration tests involving Prisma database seeding can occasionally fail due to connection timeouts in CI environments; mitigate by retrying with `jest --runInBand` or checking GitHub Actions logs for network issues (see [issue #45](https://github.com/repo/issues/45) for ongoing tracking).
- **Long-Running Tests**: E2E tests with Playwright may take 5-10 minutes on slower CI runners; optimize by running them in parallel where possible and excluding from quick PR checks.
- **Environment Quirks**: Ensure Node.js version matches `.nvmrc` (v18.x) to avoid Jest compatibility issues. For local DB tests, run `npm run db:setup:test` to reset the Prisma schema.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Review test scripts and CI workflows to confirm command accuracy.
2. Update Quality Gates with current thresholds (coverage %, lint rules, required checks).
3. Document new test categories or suites introduced since the last update.
4. Record known flaky areas and link to open issues for visibility.
5. Confirm troubleshooting steps remain valid with current tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- `package.json` scripts and testing configuration files.
- CI job definitions (GitHub Actions, CircleCI, etc.).
- Issue tracker items labelled “testing” or “flaky” with maintainer confirmation.

<!-- agent-update:end -->
