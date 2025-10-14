```markdown
<!-- agent-update:start:development-workflow -->
# Development Workflow

Outline the day-to-day engineering process for this repository.

## Branching & Releases
This repository follows a trunk-based development model, where the `main` branch serves as the primary trunk for ongoing development. Feature branches are created from `main` for new work (e.g., `feature/user-auth` or `fix/bug-123`), and changes are merged back via pull requests (PRs). Hotfixes branch from the latest release tag if needed.

Releases follow semantic versioning (SemVer) with tags like `v1.2.3`. The release cadence is approximately monthly for minor updates, triggered manually via the CI pipeline after merging to `main`. Automated tagging and npm publishing occur on pushes to tags matching `v*.*.*` in the `package.json` scripts. Review recent tags with `git tag --list 'v*'` and release notes in CHANGELOG.md for details.

## Local Development
Set up your environment as follows:

- Clone the repository: `git clone <repo-url> && cd <repo-name>`
- Install dependencies: `npm install` (includes devDependencies for testing and building)
- Run the CLI locally in development mode: `npm run dev` (starts the app with hot-reloading; use `--watch` for file changes if supported)
- Build for distribution: `npm run build` (outputs optimized bundles to `dist/` or similar; includes TypeScript compilation if applicable)
- Run tests: `npm test` (uses Jest or similar; covers unit and integration tests in `tests/`)
- Lint and format: `npm run lint` and `npm run format` (enforces ESLint and Prettier standards)

For database setup (given Prisma presence), run `npx prisma generate` after install, and `npx prisma db push` for local schema migrations. Environment variables are managed via `.env` files (not committed).

Additional flags: Use `npm run dev -- --port=3000` to customize ports or other options as defined in `package.json`.

## Code Review Expectations
All changes must be submitted via PRs to the `main` branch. Key checklists include:

- **Code Quality**: Run `npm run lint` and `npm test` before submitting; ensure 100% test coverage for new features.
- **Documentation**: Update relevant docs in `docs/` or README.md; add or update tests in `tests/`.
- **Security/Performance**: Scan for vulnerabilities with `npm audit`; review Prisma queries for efficiency.
- **Approvals**: Require at least 1 approving review from a core contributor. Branch protection rules enforce this, plus status checks (lint, test, build).
- **Agent Collaboration**: For AI-assisted development, follow tips in [AGENTS.md](../../AGENTS.md), such as using agent playbooks for code generation and review.

PRs should have descriptive titles, linked issues (e.g., "Fixes #123"), and a summary of changes. Aim for small, focused PRs (<400 lines) to facilitate reviews.

## Onboarding Tasks
New contributors should start with these steps:

- Read CONTRIBUTING.md and complete the setup in Local Development above.
- Tackle beginner-friendly issues labeled "good first issue" or "help wanted" on the issue tracker (e.g., GitHub Issues board).
- Explore the project structure: Core logic in `src/`, database in `prisma/`, frontend assets in `public/` if applicable, scripts in `scripts/`.
- Join the collaboration dashboard at [GitHub Projects](https://github.com/orgs/<org>/projects/1) for triage and runbooks.
- For agent onboarding, review `agents/README.md` and experiment with sample playbooks.

If you're new to the stack (Node.js, Prisma, etc.), check the [Architecture Overview](architecture.md) for high-level diagrams.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Confirm branching/release steps with CI configuration and recent tags.
2. Verify local commands against `package.json`; ensure flags and scripts still exist.
3. Capture review requirements (approvers, checks) from contributing docs or repository settings.
4. Refresh onboarding links (boards, dashboards) to their latest URLs.
5. Highlight any manual steps that should become automation follow-ups.

<!-- agent-readonly:sources -->
## Acceptable Sources
- CONTRIBUTING guidelines and `AGENTS.md`.
- Build pipelines, branch protection rules, or release scripts.
- Issue tracker boards used for onboarding or triage.

<!-- agent-update:end -->
```
