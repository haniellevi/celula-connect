<!-- agent-update:start:agent-feature-developer -->
# Feature Developer Agent Playbook

## Mission
The Feature Developer Agent supports the development team by implementing new features based on specifications from issues, user stories, or requirements. It ensures that additions to the codebase are robust, integrated seamlessly, and tested thoroughly. Engage this agent during sprint cycles or when prioritizing feature tickets in the backlog to accelerate delivery without compromising quality.

## Responsibilities
- Implement new features according to specifications
- Design clean, maintainable code architecture
- Integrate features with existing codebase
- Write comprehensive tests for new functionality

## Best Practices
- Follow existing patterns and conventions
- Consider edge cases and error handling
- Write tests alongside implementation

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for AI agents that automate various development tasks, such as feature implementation, testing, and documentation updates.
- `docs/` — Houses all project documentation, including guides on architecture, workflows, testing strategies, and API references to ensure team alignment and onboarding.
- `prisma/` — Stores Prisma ORM schema definitions, database migrations, and configuration files for managing the application's data layer and database interactions.
- `public/` — Holds static assets like images, fonts, favicons, and other files served directly by the web server without processing.
- `scripts/` — Includes utility scripts for automation, such as build processes, database seeding, deployment tasks, and CI/CD helpers.
- `src/` — The core source code directory, organized by components, services, and modules for the application's frontend and backend logic.
- `tests/` — Contains unit, integration, and end-to-end test files, along with test utilities to validate functionality and maintain code reliability.

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
- Achieve at least 90% test coverage for all new features implemented
- Reduce average time from feature spec to merged PR by 20% through efficient integration
- Ensure zero critical bugs introduced in production from agent-led features
- Track trends over time to identify improvement areas, such as quarterly reviews of code review feedback and test failure rates

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

### Issue: Integration Errors with Existing APIs
**Symptoms:** New feature calls fail at runtime with undefined endpoints or data mismatches
**Root Cause:** Assumptions about API contracts not aligned with current implementation
**Resolution:**
1. Review [Data Flow & Integrations](../docs/data-flow.md) for current schemas
2. Use Prisma studio or API docs to validate endpoints
3. Add integration tests to catch mismatches early
**Prevention:** Always reference the latest API specs before coding and run full suite tests

### Issue: Performance Degradation in New Features
**Symptoms:** Page loads or queries slow down after feature addition
**Root Cause:** Inefficient queries or unoptimized frontend rendering
**Resolution:**
1. Profile code with browser dev tools or database query logs
2. Optimize Prisma queries with includes/selects as per [Architecture Notes](../docs/architecture.md)
3. Add performance benchmarks in tests
**Prevention:** Conduct initial load testing for features involving data-heavy operations and follow tooling best practices

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. For example: "Feature implemented with 95% test coverage; risk of edge case in high-traffic scenarios—recommend load testing. Next: Review PR #123 and update user guide in docs."

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
