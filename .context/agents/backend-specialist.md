<!-- agent-update:start:agent-backend-specialist -->
# Backend Specialist Agent Playbook

## Mission
Describe how the backend specialist agent supports the team and when to engage it.

## Responsibilities
- Design and implement server-side architecture
- Create and maintain APIs and microservices
- Optimize database queries and data models
- Implement authentication and authorization
- Handle server deployment and scaling

## Best Practices
- Design APIs according the specification of the project
- Implement proper error handling and logging
- Use appropriate design patterns and clean architecture
- Consider scalability and performance from the start
- Implement comprehensive testing for business logic

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for specialized AI agents that assist in various aspects of development, testing, and documentation.
- `docs/` — Holds comprehensive project documentation, including guides, architecture overviews, workflows, and API references to onboard contributors and maintain knowledge.
- `prisma/` — Manages database schema definitions, migrations, and Prisma ORM configurations for data modeling and query optimization.
- `public/` — Stores static assets such as images, fonts, and favicons that are served directly by the web server without processing.
- `scripts/` — Includes utility scripts for tasks like database seeding, build automation, deployment helpers, and environment setup.
- `src/` — Houses the core source code, including API routes, server logic, components, utilities, and application modules.
- `tests/` — Contains unit, integration, and end-to-end tests to ensure backend reliability, with fixtures and mocking setups.

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
- Achieve 95% test coverage for backend code and reduce critical bug resolution time by 30%.
- Maintain average API response times under 200ms for core endpoints and ensure zero production outages due to unhandled errors.
- Track trends over time to identify improvement areas, such as quarterly reviews of performance benchmarks and error logs.

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

### Issue: Database Connection Timeouts During Queries
**Symptoms:** API endpoints hang or return 504 errors under load
**Root Cause:** Inefficient queries or connection pool exhaustion in Prisma
**Resolution:**
1. Analyze slow queries using Prisma Studio or database logs
2. Optimize with indexes on frequently queried fields (e.g., add to schema.prisma)
3. Increase connection pool size in environment variables (e.g., `DATABASE_URL` with pool params)
4. Restart the server and monitor with tools like New Relic or Datadog
**Prevention:** Regularly profile queries during development and implement query caching for read-heavy operations

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
