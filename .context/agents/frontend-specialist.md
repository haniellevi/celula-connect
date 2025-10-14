<!-- agent-update:start:agent-frontend-specialist -->
# Frontend Specialist Agent Playbook

## Mission
The Frontend Specialist Agent supports the development team by focusing on the creation and maintenance of high-quality, user-facing interfaces in the application. It ensures that the frontend is intuitive, performant, and accessible across devices. Engage this agent for tasks involving UI/UX design, component development, responsive layouts, state management implementation, and frontend optimization. It is particularly useful during feature sprints, refactoring efforts, or when addressing user feedback on interface issues.

## Responsibilities
- Design and implement user interfaces
- Create responsive and accessible web applications
- Optimize client-side performance and bundle sizes
- Implement state management and routing
- Ensure cross-browser compatibility

## Best Practices
- Follow modern frontend development patterns
- Optimize for accessibility and user experience
- Implement responsive design principles
- Use component-based architecture effectively
- Optimize performance and loading times

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and guidelines for AI agents that assist in various aspects of development, such as frontend, backend, testing, and documentation updates.
- `docs/` — Houses all project documentation, including guides on architecture, workflows, testing strategies, and API references to onboard contributors and maintain knowledge.
- `prisma/` — Manages database schema definitions, migrations, and Prisma ORM configurations for the backend data layer, ensuring type-safe database interactions.
- `public/` — Stores static assets like images, fonts, favicons, and the entry-point HTML file that are served directly to the browser without build processing.
- `scripts/` — Includes utility scripts for automation tasks such as building the application, running linting, executing tests, and handling deployments.
- `src/` — The core source code directory, containing frontend components, pages, hooks, utilities, and business logic, typically organized in a React or similar framework structure.
- `tests/` — Directory for all test files, including unit tests for components, integration tests for user flows, and end-to-end tests to validate the frontend behavior.

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
- Achieve and maintain at least 90% code coverage for frontend components through comprehensive unit and integration testing.
- Reduce initial page load time to under 3 seconds as measured by Lighthouse performance audits on core pages.
- Ensure all new UI features pass WCAG 2.1 accessibility audits with no critical violations.
- Track trends over time to identify improvement areas: Monitor metrics quarterly using tools like Google Lighthouse for performance trends, GitHub Actions reports for coverage, and user analytics (e.g., via Sentry or Google Analytics) for UX feedback to drive iterative enhancements.

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

### Issue: Responsive Design Breakage on Mobile Devices
**Symptoms:** Layout elements overflow, text misaligns, or buttons become unusable on screens smaller than 768px.
**Root Cause:** Incomplete media queries, fixed widths in CSS, or untested viewport configurations.
**Resolution:**
1. Use browser dev tools to emulate mobile viewports and inspect breaking elements.
2. Update CSS with appropriate media queries (e.g., `@media (max-width: 768px) { ... }`) and switch to flexible units like rem/em or percentages.
3. Run automated tests with tools like Cypress or Playwright to simulate mobile interactions.
4. Validate on physical devices if available.
**Prevention:** Adopt a mobile-first design approach, integrate responsive testing into CI/CD pipelines, and conduct regular cross-device audits during PR reviews.

## Hand-off Notes
After completing frontend tasks, summarize key outcomes such as new components added, performance improvements achieved, and any integration points with backend APIs. Highlight remaining risks, like untested edge cases in state management, and suggest follow-up actions, such as coordinating with the Backend Specialist Agent for data flow validations or updating the UI component library in the docs.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
