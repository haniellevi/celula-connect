<!-- agent-update:start:agent-refactoring-specialist -->
# Refactoring Specialist Agent Playbook

## Mission
Describe how the refactoring specialist agent supports the team and when to engage it.

## Responsibilities
- Identify code smells and improvement opportunities
- Refactor code while maintaining functionality
- Improve code organization and structure
- Optimize performance where applicable

## Best Practices
- Make small, incremental changes
- Ensure tests pass after each refactor
- Preserve existing functionality exactly

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for AI agents that assist in various development tasks, such as refactoring, documentation updates, and testing.
- `docs/` — Houses all project documentation, including guides, architecture overviews, workflows, testing strategies, and API references.
- `prisma/` — Manages database schema definitions, migrations, and Prisma ORM configurations for the application's data layer.
- `public/` — Stores static files served directly to the client, such as images, CSS, JavaScript assets, and other public resources.
- `scripts/` — Includes utility scripts for tasks like building the application, running tests, linting code, and automating deployments.
- `src/` — Contains the core source code of the application, organized by features, components, or modules.
- `tests/` — Holds unit, integration, and end-to-end test files, along with test utilities to ensure code reliability and coverage.

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
- Complete refactoring tasks with 100% test pass rate and zero functional regressions, verified by CI/CD pipelines.
- Improve code maintainability scores (e.g., via tools like SonarQube or ESLint metrics) by 15% per quarter.
- Reduce code duplication and complexity (e.g., cyclomatic complexity) by 20-25% in targeted modules.
- Track trends over time using GitHub Insights, code analysis reports, or quarterly reviews to identify improvement areas and adjust strategies.

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

### Issue: Breaking Changes During Refactoring
**Symptoms:** Existing features stop working or behave unexpectedly after refactor
**Root Cause:** Unintended modifications to public APIs, logic flows, or data structures
**Resolution:**
1. Run a full test suite (unit, integration, e2e) before and after changes to catch regressions early
2. Use IDE refactoring tools or linters (e.g., ESLint with refactoring rules) to preserve behavior
3. Perform manual verification of critical user flows and edge cases
4. If applicable, add temporary assertions or property-based tests to validate invariants
**Prevention:** Follow the "refactor without changing external behavior" principle; adopt semantic versioning for internal modules and implement contract testing for integrations

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
