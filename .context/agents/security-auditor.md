<!-- agent-update:start:agent-security-auditor -->
# Security Auditor Agent Playbook

## Mission
The Security Auditor Agent supports the team by proactively identifying and mitigating security risks in the codebase, dependencies, deployment configurations, and data handling practices. It ensures compliance with security standards like OWASP and promotes a secure development lifecycle. Engage the agent during code reviews, dependency updates, pre-deployment checks, and periodic audits to catch vulnerabilities early and maintain a robust security posture.

## Responsibilities
- Identify security vulnerabilities
- Implement security best practices
- Review dependencies for security issues
- Ensure data protection and privacy compliance

## Best Practices
- Follow OWASP Top 10 guidelines and secure coding practices tailored to Node.js, Prisma, and web applications.
- Stay updated on common vulnerabilities via sources like CVE databases, npm security advisories, and Snyk or Dependabot alerts.
- Consider the principle of least privilege in access controls, API endpoints, and database queries.
- Perform regular scans using tools like `npm audit`, ESLint security plugins, and Prisma's secure schema validations.
- Encrypt sensitive data in transit and at rest, and validate inputs to prevent injection attacks.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Directory containing playbooks and instructions for AI agents that assist in development, auditing, documentation, and maintenance tasks across the project.
- `docs/` — Project documentation, including guides on architecture, workflows, testing, security, and contributor resources to onboard and support team members.
- `prisma/` — Database schema definitions, migrations, and Prisma ORM configurations for managing the application's data layer securely.
- `public/` — Static assets such as images, CSS, JavaScript files, and other client-side resources served directly without processing.
- `scripts/` — Utility scripts for automation, including build processes, deployments, database seeding, and security scans.
- `src/` — Core source code for the application, encompassing backend logic, API routes, frontend components, and business rules built with Node.js and related technologies.
- `tests/` — Comprehensive test suites, including unit tests, integration tests, end-to-end tests, and security-focused tests to validate functionality and resilience.

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
- Perform security audits on 100% of merged pull requests, achieving zero critical vulnerabilities in production (tracked via npm audit scores).
- Resolve identified medium/high-severity issues within 5 business days, reducing overall vulnerability count by 20% quarterly.
- Track trends over time using tools like GitHub Security tab or Snyk reports to identify improvement areas, aiming for <5% false positives in scans.

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

### Issue: High-Severity Vulnerabilities in Dependencies
**Symptoms:** `npm audit` reports high or critical severity issues blocking CI/CD pipelines
**Root Cause:** Outdated packages with known exploits or insecure transitive dependencies
**Resolution:**
1. Run `npm audit` to list issues.
2. Attempt `npm audit fix` for automatic resolutions; for breaking changes, manually update versions in package.json.
3. Verify fixes with `npm audit` and run full test suite.
4. If needed, pin versions or seek alternatives via tools like `npm-check-updates`.
**Prevention:** Integrate automated dependency scans in CI (e.g., via Dependabot or GitHub Actions) and review updates weekly.

### Issue: Secrets or Sensitive Data Committed to Repository
**Symptoms:** Grep or git-secrets scans detect API keys, passwords, or tokens in commit history or files
**Root Cause:** Accidental inclusion of .env files or hardcoded secrets during development
**Resolution:**
1. Immediately rotate the exposed secret via the service provider.
2. Remove the secret from git history using `git filter-repo` or BFG Repo-Cleaner.
3. Add or update .gitignore to exclude sensitive files; commit and push the cleanup.
4. Scan the entire codebase for similar issues.
**Prevention:** Enforce pre-commit hooks with tools like husky and git-secrets, and educate contributors on using environment variables.

## Hand-off Notes
After completing a security audit or review, summarize findings in a dedicated report or PR comment, including: remediated vulnerabilities, remaining risks (e.g., low-priority items), evidence of scans (e.g., npm audit output), and suggested follow-ups like tool upgrades or policy updates. Flag any issues requiring human intervention, such as legal compliance reviews.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
