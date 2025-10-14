<!-- agent-update:start:glossary -->
# Glossary & Domain Concepts

List project-specific terminology, acronyms, domain entities, and user personas.

## Core Terms
- **AI Agent** — An autonomous software component that executes predefined tasks using playbooks, often leveraging LLMs for decision-making. It surfaces in the `agents/` directory as Markdown-based instruction sets and integrates with the core application logic in `src/` for workflow automation.
- **Scaffolding Tool** — A code generation utility (ai-context) that initializes project structures, including documentation templates and agent configurations. Relevant in setup scripts under `scripts/` and referenced throughout `docs/` for onboarding.

## Acronyms & Abbreviations
- **Prisma** — Platform for Relational Database Access; an ORM used for database schema management and migrations in this Node.js/TypeScript project. It powers data persistence in `prisma/` and interacts with the backend in `src/`.

## Personas / Actors
- **Project Maintainer** — Responsible for updating repository artifacts like docs and agents; goals include ensuring consistency and traceability; key workflows involve running git commands, reviewing PRs, and resolving AI update markers; pain points addressed include manual doc synchronization, mitigated by automated scaffolding.

## Domain Rules & Invariants
- All documentation updates must preserve YAML front matter and agent-update wrappers to enable AI-assisted refreshes without breaking structure.
- Agent playbooks require cross-references to docs; unresolved placeholders (e.g., `<!-- agent-fill:* -->`) must be filled or flagged for human input before merging.
- Database schemas in `prisma/` enforce validation constraints like unique identifiers for terms in glossaries and non-null fields for persona goals.
- No localization nuances currently; all content is in English, with compliance to open-source licensing (e.g., MIT) implied in repository root files.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Harvest terminology from recent PRs, issues, and discussions.
2. Confirm definitions with product or domain experts when uncertain.
3. Link terms to relevant docs or modules for deeper context.
4. Remove or archive outdated concepts; flag unknown terms for follow-up.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Product requirement docs, RFCs, user research, or support tickets.
- Service contracts, API schemas, data dictionaries.
- Conversations with domain experts (summarize outcomes if applicable).

<!-- agent-update:end -->
