<!-- agent-update:start:agent-performance-optimizer -->
# Performance Optimizer Agent Playbook

## Mission
The Performance Optimizer Agent supports the development team by proactively identifying and resolving performance bottlenecks in the codebase, ensuring the application runs efficiently across various environments. It focuses on optimizing code execution, resource consumption, and user-facing metrics like load times. Engage this agent during code reviews, after feature integrations, when user feedback highlights slowness, or as part of periodic audits to maintain high performance standards.

## Responsibilities
- Identify performance bottlenecks
- Optimize code for speed and efficiency
- Implement caching strategies
- Monitor and improve resource usage

## Best Practices
- Measure before optimizing
- Focus on actual bottlenecks
- Don't sacrifice readability unnecessarily

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for AI agents that automate and assist with various development tasks, such as optimization, testing, and documentation updates.
- `docs/` — Houses all project documentation, including guides on architecture, workflows, testing strategies, and contributor resources to ensure knowledge sharing.
- `prisma/` — Manages database-related configurations using Prisma ORM, including schema definitions, migrations, and seed data for the application's data layer.
- `public/` — Stores static assets served directly to clients, such as images, CSS/JS bundles, favicons, and the entry-point HTML file for the web application.
- `scripts/` — Includes utility scripts for automation, such as build processes, linting, testing runners, and deployment helpers to streamline development workflows.
- `src/` — Core source code directory containing the application's logic, including components, services, API routes, utilities, and business rules implemented in TypeScript/JavaScript.
- `tests/` — Dedicated to test files, covering unit tests, integration tests, and end-to-end tests using frameworks like Jest or Playwright to validate functionality and performance.

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
- Improve average page load time by 20% in key user flows, measured via tools like Google Lighthouse.
- Reduce CPU and memory usage in production environments by 15%, tracked through monitoring dashboards.
- Ensure 95% of code optimizations pass readability checks (e.g., via ESLint rules) without introducing new complexity.
- Track trends over time using performance profiling tools (e.g., Node.js Clinic or browser DevTools) to identify recurring bottlenecks and measure long-term improvements.

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

### Issue: Slow Database Queries Impacting API Response Times
**Symptoms:** API endpoints exceed 500ms latency on data-intensive operations
**Root Cause:** Unoptimized Prisma queries or missing database indexes
**Resolution:**
1. Enable Prisma query logging with `log: ['query']` in schema config
2. Identify slow queries and add indexes via Prisma migrations (e.g., `prisma migrate dev`)
3. Refactor queries to use `select()` for specific fields and avoid N+1 problems with `include()`
4. Benchmark with tools like `prisma db push --accept-data-loss` for testing
**Prevention:** Integrate query performance checks into CI/CD pipelines and review database patterns during code reviews

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. For example: "Optimizations applied to src/api routes; benchmarks show 25% speedup. Risk: Monitor for regressions in edge cases. Follow-up: Update performance baselines in docs/performance-baselines.md."

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
