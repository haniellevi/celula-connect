<!-- agent-update:start:tooling -->
# Tooling & Productivity Guide

Collect the scripts, automation, and editor settings that keep contributors efficient.

## Required Tooling
- **Node.js** — Download and install the latest LTS version (v18.0.0 or higher) from [nodejs.org](https://nodejs.org/). Powers the server-side runtime, build processes, and local development server for the full-stack application.
- **Yarn** — Install globally via `npm install -g yarn` (version 1.22.x or compatible). Serves as the primary package manager for dependency installation and script execution, as specified in `package.json`.
- **Prisma CLI** — Install globally with `npm install -g prisma` (version 5.x or latest). Enables database schema management, migrations, and client generation using the Prisma ORM in the `prisma/` directory.
- **Git** — Install from [git-scm.com](https://git-scm.com/) (version 2.30+ recommended). Essential for version control, cloning the repo, and managing branches/pull requests.

## Recommended Automation
- **Pre-commit Hooks**: Use Husky (configured in `package.json` under `devDependencies`) for linting and type-checking before commits. Run `yarn prepare` after install to set up; it enforces ESLint and Prettier on staged files.
- **Linting/Formatting**: Execute `yarn lint` (ESLint for TypeScript/JavaScript) and `yarn format` (Prettier for code styling). Integrated into CI via GitHub Actions for pull request validation.
- **Code Generators/Scaffolding**: Run `yarn prisma generate` to auto-generate Prisma client after schema changes. Use `yarn prisma db push` for quick schema syncing in development.
- **Shortcuts/Watch Modes**: Start the dev server with `yarn dev` (uses Next.js or similar for hot-reloading). For testing, `yarn test:watch` runs Jest in watch mode. Build with `yarn build` and preview with `yarn start`.

## IDE / Editor Setup
- **VS Code Extensions**:
  - ESLint (by Microsoft): Highlights linting issues in real-time.
  - Prettier - Code formatter: Auto-formats on save; configure in `.prettierrc`.
  - Prisma (by Prisma): Syntax highlighting and auto-completion for `schema.prisma`.
  - GitLens (by GitKraken): Enhanced Git blame and history views.
  - Thunder Client or REST Client: For API testing against local endpoints.
- **Workspace Settings**: Share `.vscode/settings.json` for TypeScript validation (`typescript.validate.enable: true`) and format-on-save. Use snippets for common patterns like React components or Prisma queries.

## Productivity Tips
- **Terminal Aliases**: Add to `~/.bashrc` or `~/.zshrc`: `alias dev='yarn dev'`, `alias lint-fix='yarn lint --fix'`, `alias migrate='yarn prisma migrate dev'`. These streamline local loops.
- **Container Workflows**: If using Docker (via `scripts/docker-compose.yml` if present), run `docker-compose up` to mirror production environments, including database setup with PostgreSQL.
- **Local Emulators**: Use Prisma Studio (`yarn prisma studio`) for a GUI to browse and edit database records. Mirror production with a local SQLite or Postgres instance via Docker.
- **Shared Scripts**: Check the `scripts/` directory for utilities like `setup.sh` for initial env setup or `deploy.sh` for release automation. Team dotfiles (e.g., `.eslintrc.js`, `tsconfig.json`) ensure consistency.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Verify commands align with the latest scripts and build tooling.
2. Remove instructions for deprecated tools and add replacements.
3. Highlight automation that saves time during reviews or releases.
4. Cross-link to runbooks or README sections that provide deeper context.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Onboarding docs, internal wikis, and team retrospectives.
- Script directories, package manifests, CI configuration.
- Maintainer recommendations gathered during pairing or code reviews.

<!-- agent-update:end -->
