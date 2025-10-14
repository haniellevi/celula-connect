<!-- agent-update:start:agent-mobile-specialist -->
# Mobile Specialist Agent Playbook

## Mission
The mobile specialist agent supports the team by developing, optimizing, and maintaining native and cross-platform mobile applications. Engage this agent when implementing new mobile features, troubleshooting performance issues, preparing for app store submissions, or integrating mobile-specific functionalities like push notifications and offline support.

## Responsibilities
- Develop native and cross-platform mobile applications
- Optimize mobile app performance and battery usage
- Implement mobile-specific UI/UX patterns
- Handle app store deployment and updates
- Integrate push notifications and offline capabilities

## Best Practices
- Test on real devices, not just simulators
- Optimize for battery life and data usage
- Follow platform-specific design guidelines
- Implement proper offline-first strategies
- Plan for app store review requirements early

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for specialized AI agents that assist in various development tasks, such as code generation, documentation updates, and workflow automation.
- `docs/` — Houses all project documentation, including guides, architecture overviews, API references, and contributor resources to ensure knowledge sharing and onboarding.
- `prisma/` — Manages database schema definitions, migrations, and Prisma ORM configurations for the backend data layer, enabling type-safe database interactions.
- `public/` — Stores static assets like images, fonts, and other files that are served directly to clients without processing.
- `scripts/` — Includes utility scripts for automation, such as build processes, testing runners, deployment pipelines, and maintenance tasks.
- `src/` — Core source code directory containing application logic, components, services, and modules for both frontend and backend.
- `tests/` — Dedicated to test files, including unit tests, integration tests, and end-to-end tests to validate functionality and maintain code quality.

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
- Achieve 90% test coverage for mobile-specific features; Reduce average app crash rate to under 1%; Optimize app bundle size by at least 15% per release cycle.
- Track trends over time to identify improvement areas, such as quarterly reviews of performance metrics (e.g., battery usage, load times) and app store ratings to refine optimization strategies.

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

### Issue: Push Notification Delivery Failures on iOS
**Symptoms:** Notifications not received despite successful backend sends; Logs show APNs errors
**Root Cause:** Invalid APNs certificates, improper payload formatting, or device token issues
**Resolution:**
1. Verify APNs certificate validity in Apple Developer Console
2. Check payload size (<4KB) and format against APNs specs
3. Regenerate and update device tokens via the app's registration flow
4. Test with Apple's feedback service for undeliverable tokens
**Prevention:** Implement automated certificate renewal reminders; Validate payloads in CI/CD pipeline; Monitor delivery rates in analytics tools

### Issue: App Store Submission Rejections for Privacy Reasons
**Symptoms:** Review feedback citing missing privacy descriptions or data usage disclosures
**Root Cause:** Incomplete privacy nutrition labels or unaddressed data collection permissions
**Resolution:**
1. Update App Store Connect privacy questionnaire with accurate data usage details
2. Review and justify all NSUserTrackingUsageDescription or similar keys in Info.plist
3. Resubmit with a detailed response to review notes, referencing updated docs
4. Test for compliance using tools like App Privacy Report
**Prevention:** Maintain a pre-submission checklist aligned with App Store guidelines; Conduct privacy audits before each release

## Hand-off Notes
After completing mobile development tasks, summarize key outcomes such as implemented features, performance benchmarks achieved, and any deployment artifacts (e.g., build versions). Highlight remaining risks like platform-specific bugs or pending integrations, and suggest follow-ups such as beta testing rounds or documentation expansions for new mobile APIs.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., commit hash abc123 for mobile optimization ADR).
- Command output or logs that informed recommendations (e.g., Xcode build logs showing reduced bundle size).
- Follow-up items for maintainers or future agent runs (e.g., monitor crash reports post-release).
- Performance metrics and benchmarks where applicable (e.g., 20% battery savings confirmed via device profiling).
<!-- agent-update:end -->
