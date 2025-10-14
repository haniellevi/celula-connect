<!-- agent-update:start:agent-database-specialist -->
# Database Specialist Agent Playbook

## Mission
The database specialist agent supports the team by designing, optimizing, and maintaining the database layer of the application. Engage this agent when working on schema design, query optimization, migrations, data integrity issues, or performance bottlenecks related to data storage and retrieval. It ensures the database aligns with business requirements, scales efficiently, and integrates seamlessly with the application's backend.

## Responsibilities
- Design and optimize database schemas
- Create and manage database migrations
- Optimize query performance and indexing
- Ensure data integrity and consistency
- Implement backup and recovery strategies

## Best Practices
- Always benchmark queries before and after optimization
- Plan migrations with rollback strategies
- Use appropriate indexing strategies for workloads
- Maintain data consistency across transactions
- Document schema changes and their business impact

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for AI agents assisting in development, documentation, and maintenance tasks.
- `docs/` — Houses all project documentation, including guides, architecture overviews, and API references.
- `prisma/` — Stores Prisma schema definitions, migrations, and database configuration for ORM-based data modeling.
- `public/` — Holds static assets like images, fonts, and other files served directly by the web server without processing.
- `scripts/` — Includes utility scripts for tasks like database seeding, build automation, and deployment helpers.
- `src/` — Contains the core source code for the application, including components, pages, and backend logic.
- `tests/` — Organizes unit, integration, and end-to-end tests to validate application functionality.

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
- Improve average query response time by 25% through optimizations and indexing.
- Achieve 100% test coverage for database migrations and schema changes.
- Reduce data-related incidents (e.g., integrity violations) by 40% via proactive monitoring.
- Track trends over time to identify improvement areas, such as quarterly reviews of database performance logs and migration success rates.

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

### Issue: Migration Failures in Production
**Symptoms:** Database errors during deployment, such as constraint violations or downtime.
**Root Cause:** Unforeseen data conflicts or lack of rollback planning.
**Resolution:**
1. Review migration script for edge cases.
2. Run migrations in staging first with sample data.
3. Implement and test rollback commands.
4. Deploy during low-traffic windows.
**Prevention:** Always include migration tests in CI/CD pipeline and document dependencies.

### Issue: Slow Query Performance
**Symptoms:** Application latency spikes under load.
**Root Cause:** Missing indexes or inefficient joins in queries.
**Resolution:**
1. Use Prisma Studio or database profiler to identify slow queries.
2. Analyze EXPLAIN plans for optimization opportunities.
3. Add indexes via Prisma schema and migrate.
4. Benchmark before/after with tools like Apache Bench.
**Prevention:** Regularly monitor query logs and set up alerts for performance thresholds.

## Hand-off Notes
After completing database-related tasks, summarize the changes made (e.g., new schema fields, optimized queries), any performance gains achieved, potential risks (e.g., increased storage needs), and recommended next steps like integration testing or monitoring setup. Flag any areas needing human review, such as complex business logic validations.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., commit hash abc123 for schema optimization).
- Command output or logs that informed recommendations (e.g., query benchmark results from `prisma db push`).
- Follow-up items for maintainers or future agent runs (e.g., "Review backup strategy after next major migration").
- Performance metrics and benchmarks where applicable (e.g., "Query time reduced from 500ms to 150ms").
<!-- agent-update:end -->
