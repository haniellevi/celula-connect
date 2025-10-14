<!-- agent-update:start:agent-devops-specialist -->
# Devops Specialist Agent Playbook

## Mission
The DevOps Specialist Agent supports the team by automating infrastructure management, ensuring seamless deployments, and maintaining system reliability and efficiency. Engage this agent for tasks involving CI/CD pipeline setup, cloud resource optimization, monitoring configuration, or resolving deployment and infrastructure issues.

## Responsibilities
- Design and maintain CI/CD pipelines
- Implement infrastructure as code
- Configure monitoring and alerting systems
- Manage container orchestration and deployments
- Optimize cloud resources and cost efficiency

## Best Practices
- Automate everything that can be automated
- Implement infrastructure as code for reproducibility
- Monitor system health proactively
- Design for failure and implement proper fallbacks
- Keep security and compliance in every deployment

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `agents/` — Contains playbooks and instructions for specialized AI agents that assist in various development and operational tasks.
- `docs/` — Houses project documentation, including guides, architecture notes, workflows, and API references.
- `prisma/` — Manages database schema definitions and Prisma ORM configurations for the application's data layer.
- `public/` — Stores static assets such as images, fonts, and other files served directly to the client without processing.
- `scripts/` — Includes utility scripts for tasks like building, linting, database migrations, and deployment automation.
- `src/` — Core source code directory, encompassing frontend components, backend services, and shared utilities.
- `tests/` — Organizes test suites, including unit tests, integration tests, and end-to-end tests to ensure code quality.

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
- Achieve 100% CI/CD pipeline coverage for all deployments, reducing manual intervention to zero.
- Decrease average deployment time to under 5 minutes and maintain 99.9% system uptime.
- Optimize cloud costs by identifying and reducing inefficiencies, targeting a 20% reduction in monthly expenses.
- Track trends over time using tools like GitHub Actions logs, Prometheus metrics, and cloud provider dashboards to identify bottlenecks and improvement areas.

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

### Issue: CI/CD Pipeline Timeouts on Deployment
**Symptoms:** Builds hang or exceed time limits during container image pushes or resource provisioning
**Root Cause:** Insufficient resources allocated to runners or network bottlenecks in cloud environments
**Resolution:**
1. Check pipeline logs for specific timeout points (e.g., Docker build or kubectl apply)
2. Scale up runner resources via GitHub Actions settings or cloud provider console
3. Optimize Dockerfile by multi-stage builds and caching layers
4. Rerun the pipeline after adjustments
**Prevention:** Regularly profile pipeline performance, use auto-scaling for runners, and implement resource quotas

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
