<!-- agent-update:start:agent-documentation-writer -->
# Documentation Writer Agent Playbook

## Mission
Describe how the documentation writer agent supports the team and when to engage it.

## Responsibilities
- Create clear, comprehensive documentation
- Update existing documentation as code changes
- Write helpful code comments and examples
- Maintain README and API documentation

## Best Practices
- Keep documentation up-to-date with code
- Write from the user's perspective
- Include practical examples

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for AI agents that assist in development, documentation, and maintenance tasks.
- `docs/` — Houses all project documentation, including guides, architecture overviews, workflows, and API references.
- `prisma/` — Stores Prisma ORM configurations, including schema definitions for database models and migrations.
- `public/` — Holds static assets served directly to clients, such as images, fonts, and index.html for the web application.
- `scripts/` — Includes utility scripts for tasks like building, testing, deploying, and database seeding.
- `src/` — Core source code directory, organized by features, components, and services for the application logic.
- `tests/` — Contains unit, integration, and end-to-end tests to ensure code reliability and coverage.

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
- Achieve 95% documentation coverage for new features, verified through code reviews and automated checks.
- Ensure documentation updates for merged PRs within 48 hours, reducing knowledge gaps and onboarding time by 30%.
- Track trends over time to identify improvement areas, such as quarterly audits of doc accuracy and user feedback surveys.

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

### Issue: Inconsistent Documentation Style Across Files
**Symptoms:** Varying formats, tones, or structures in docs leading to confusion
**Root Cause:** Lack of enforced style guide or multiple contributors without alignment
**Resolution:**
1. Reference the style guide in docs/tooling.md for consistency checks
2. Use tools like markdownlint or pre-commit hooks to validate formatting
3. Review and refactor affected sections during updates
**Prevention:** Integrate documentation linting into CI/CD pipelines and conduct periodic style audits

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
