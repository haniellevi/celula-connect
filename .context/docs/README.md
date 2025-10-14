<!-- agent-update:start:docs-index -->
# Documentation Index

Welcome to the repository knowledge base. Start with the project overview, then dive into specific guides as needed.

## Core Guides
- [Project Overview](./project-overview.md)
- [Architecture Notes](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
- [Glossary & Domain Concepts](./glossary.md)
- [Data Flow & Integrations](./data-flow.md)
- [Security & Compliance Notes](./security.md)
- [Tooling & Productivity Guide](./tooling.md)

## Repository Snapshot
- `ACOMPANHAMENTO_MIGRACAO.md` — Migration tracking document.
- `agents/` — AI agent playbooks and prompts.
- `AGENTS.md` — Additional agent-related notes.
- `CHANGELOG.md` — Project change log.
- `CLAUDE.md` — Claude AI integration notes.
- `components.json` — Component configuration (likely for UI tools).
- `docs/` — Living documentation produced by this tool.
- `eslint.config.mjs` — ESLint configuration.
- `next-env.d.ts` — Next.js environment types.
- `next.config.ts` — Next.js configuration.
- `package-lock.json` — Dependency lockfile.
- `package.json` — Project dependencies and scripts.
- `PLANO_MIGRACAO.md` — Migration plan document.
- `playwright.config.ts` — Playwright testing configuration.
- `postcss.config.mjs` — PostCSS configuration.
- `prevc-template.md` — Previous template or migration template.
- `prisma/` — Database schema, migrations, and Prisma configuration.
- `public/` — Static assets served publicly.
- `README.md` — Main project readme.
- `scripts/` — Utility and automation scripts.
- `src/` — TypeScript source files and CLI entrypoints.
- `tailwind.config.ts` — Tailwind CSS configuration.
- `tests/` — Automated tests and fixtures.
- `tsconfig.json` — TypeScript configuration.

## Document Map
| Guide | File | AI Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | `project-overview.md` | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | `architecture.md` | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Development Workflow | `development-workflow.md` | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Testing Strategy | `testing-strategy.md` | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | `glossary.md` | agent-update:glossary | Business terminology, user personas, domain rules |
| Data Flow & Integrations | `data-flow.md` | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | `security.md` | agent-update:security | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | `tooling.md` | agent-update:tooling | CLI scripts, IDE configs, automation workflows |

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Gather context with `git status -sb` plus the latest commits touching `docs/` or `agents/`.
2. Compare the current directory tree against the table above; add or retire rows accordingly.
3. Update cross-links if guides moved or were renamed; keep anchor text concise.
4. Record sources consulted inside the commit or PR description for traceability.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Repository tree and `package.json` scripts for canonical command names.
- Maintainer-approved issues, RFCs, or product briefs referenced in the repo.
- Release notes or changelog entries that announce documentation changes.

<!-- agent-update:end -->
