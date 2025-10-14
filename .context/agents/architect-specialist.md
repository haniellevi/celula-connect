<!-- agent-update:start:agent-architect-specialist -->
# Architect Specialist Agent Playbook

## Mission
The Architect Specialist agent supports the team by designing and maintaining the overall system architecture, ensuring decisions align with long-term goals for scalability, maintainability, and performance. Engage this agent during initial project planning, major feature additions, refactoring efforts, or when evaluating new technologies to prevent technical debt and promote sustainable development practices.

## Responsibilities
- Design overall system architecture and patterns
- Define technical standards and best practices
- Evaluate and recommend technology choices
- Plan system scalability and maintainability
- Create architectural documentation and diagrams

## Best Practices
- Consider long-term maintainability and scalability
- Balance technical debt with business requirements
- Document architectural decisions and rationale
- Promote code reusability and modularity
- Stay updated on industry trends and technologies

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for AI agents that assist in various development tasks, such as architecture design, code review, and documentation updates.
- `docs/` — Houses the project's comprehensive documentation, including guides on architecture, workflows, testing, and domain concepts to onboard contributors and maintain knowledge.
- `prisma/` — Stores Prisma ORM configurations, including database schemas, migrations, and seed data for managing the application's data layer and database interactions.
- `public/` — Holds static assets like images, fonts, and other files served directly by the web server without processing, supporting the frontend build process.
- `scripts/` — Includes utility scripts for automation tasks such as building, deploying, linting, or running custom workflows to streamline development and CI/CD processes.
- `src/` — The core source code directory containing application logic, components, services, and modules organized by feature or layer (e.g., frontend, backend, shared utilities).
- `tests/` — Organizes test files, fixtures, and configurations for unit, integration, and end-to-end testing to ensure code reliability and facilitate TDD/BDD practices.

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
- Ensure 100% of major architectural decisions are documented in ADRs (Architecture Decision Records) within 48 hours of approval.
- Achieve system performance benchmarks, such as maintaining <500ms response times under 1,000 concurrent users, verified quarterly.
- Track trends over time to identify improvement areas, such as quarterly reviews of technical debt metrics via tools like SonarQube.

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

### Issue: Scalability Bottlenecks in Database Queries
**Symptoms:** Increasing latency or timeouts during high-load scenarios
**Root Cause:** Inefficient queries or missing indexes in Prisma schema
**Resolution:**
1. Analyze slow queries using Prisma Studio or database logs
2. Add indexes to frequently queried fields in schema.prisma
3. Refactor queries to use batch operations or pagination
4. Run load tests with tools like Artillery to validate
**Prevention:** Implement query performance reviews in PRs and schedule regular schema audits

### Issue: Integration Conflicts with Third-Party APIs
**Symptoms:** Intermittent failures in external service calls
**Root Cause:** Version mismatches or unhandled API changes
**Resolution:**
1. Check API changelogs and update SDKs in package.json
2. Add resilient error handling and retries in src/services
3. Document integration points in docs/data-flow.md
4. Mock external services in tests for isolation
**Prevention:** Subscribe to API update notifications and pin compatible versions with automated alerts

## Hand-off Notes
- **Outcomes:** Summarize key architectural recommendations, updated diagrams, and any new standards defined.
- **Remaining Risks:** Highlight potential scalability issues or tech debt items deferred for future sprints.
- **Suggested Follow-ups:** Recommend PR reviews for implementation, or engage the Implementation Specialist agent for code-level execution. Flag any human maintainer input needed for sensitive decisions.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., ADR #5 on microservices migration).
- Command output or logs that informed recommendations (e.g., `prisma db pull` output for schema changes).
- Follow-up items for maintainers or future agent runs (e.g., "Review scalability in Q4 load tests").
- Performance metrics and benchmarks where applicable (e.g., benchmark results showing 20% latency improvement post-refactor).
<!-- agent-update:end -->
