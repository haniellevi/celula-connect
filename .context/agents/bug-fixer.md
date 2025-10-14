<!-- agent-update:start:agent-bug-fixer -->
# Bug Fixer Agent Playbook

## Mission
The Bug Fixer Agent supports the development team by efficiently identifying, diagnosing, and resolving bugs in the codebase, ensuring the application remains stable and reliable. Engage this agent when a bug report is filed via issues, an error surfaces during development, testing, or production monitoring, or when unexpected behavior is observed that impacts functionality.

## Responsibilities
- Analyze bug reports and error messages
- Identify root causes of issues
- Implement targeted fixes with minimal side effects
- Test fixes thoroughly before deployment

## Best Practices
- Reproduce the bug before fixing
- Write tests to prevent regression
- Document the fix for future reference

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for various AI agents that assist in development tasks, such as bug fixing, documentation updates, and code reviews.
- `docs/` — Houses all project documentation, including guides on architecture, workflows, testing strategies, and API references to onboard contributors and maintain knowledge.
- `prisma/` — Manages the database schema definitions, migrations, and Prisma ORM configurations for handling data persistence and queries.
- `public/` — Stores static assets like images, CSS files, favicons, and other client-side resources that are served directly without processing.
- `scripts/` — Includes automation scripts for build processes, database seeding, deployment tasks, and other repetitive development operations.
- `src/` — The core source code directory, organized into modules for frontend components, backend logic, utilities, and shared types.
- `tests/` — Organizes test files for unit, integration, and end-to-end testing, using frameworks like Jest or Vitest to validate application behavior.

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Reduce average bug resolution time from report to merged fix by 30%.
- Ensure 100% of fixes include regression tests, aiming for overall test coverage >90%.
- Track trends over time to identify improvement areas, such as recurring bug categories (e.g., data validation errors) and agent efficiency in handling them.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: [Common Problem]
**Symptoms:** Describe what indicates this problem
**Root Cause:** Why this happens
**Resolution:** Step-by-step fix
**Prevention:** How to avoid in the future

**Example:**
### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm update` to get compatible versions
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles

### Issue: Database Connection Errors with Prisma
**Symptoms:** Runtime errors like "PrismaClientInitializationError" or failed queries during tests/deployment
**Root Cause:** Incorrect environment variables, schema drift, or unapplied migrations
**Resolution:**
1. Verify DATABASE_URL in .env matches the target environment
2. Run `npx prisma migrate dev` to apply pending migrations
3. Generate Prisma client with `npx prisma generate`
4. Restart the development server and re-run tests
**Prevention:** Integrate Prisma migration checks into CI/CD pipelines and validate env vars in pre-commit hooks

## Hand-off Notes
After completing a bug fix, summarize the issue description, root cause analysis, implemented solution, added tests, and verification steps. Highlight any remaining risks (e.g., potential performance impacts) and suggest follow-ups, such as monitoring in production or updating related documentation.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
