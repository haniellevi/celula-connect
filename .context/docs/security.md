<!-- agent-update:start:security -->
# Security & Compliance Notes

This document outlines the security policies, practices, and compliance measures for the ai-context scaffolding tool repository. It ensures secure development, deployment, and operation of the application, which includes a Next.js frontend, Prisma-based backend, and associated scripts.

## Authentication & Authorization

The project uses NextAuth.js for authentication, integrated with Prisma for user session management. Key aspects include:

- **Identity Providers**: Supports email/password authentication via Prisma Adapter, with optional OAuth providers like Google and GitHub configured in `src/lib/auth.ts`. Credentials are verified against hashed passwords stored in the Prisma database.
- **Token Formats**: Utilizes JSON Web Tokens (JWTs) for stateless sessions, signed with a secret key from environment variables (e.g., `NEXTAUTH_SECRET`). Tokens include user ID, email, and roles.
- **Session Strategies**: Database sessions are employed for scalability, with sessions stored in the `Session` model in Prisma. Sessions expire after 30 days of inactivity, configurable via `session.maxAge`.
- **Role/Permission Models**: Implements role-based access control (RBAC) with three roles: `user` (basic access), `admin` (project management), and `superadmin` (full repository control). Permissions are enforced via middleware in `src/middleware.ts` and custom hooks in components. For example, API routes in `src/pages/api/` check `getServerSession()` for role validation before proceeding.

All auth configurations are defined in `src/lib/auth.ts` and migrated via Prisma schemas in `prisma/schema.prisma`.

## Secrets & Sensitive Data

Sensitive data is managed securely to prevent exposure in code or logs.

- **Storage Locations**: Secrets are stored in environment variables loaded via `.env.local` for development and AWS Systems Manager Parameter Store for production deployments. No secrets are committed to the repository; a `.env.example` template is provided.
- **Rotation Cadence**: Secrets like `DATABASE_URL` and `NEXTAUTH_SECRET` are rotated every 90 days or upon suspected compromise. API keys for external services (e.g., if integrated with AI providers) follow the same policy.
- **Encryption Practices**: Database connections use TLS encryption enforced in Prisma's `DATABASE_URL`. At-rest encryption is handled by the cloud provider (e.g., AWS RDS with KMS). Sensitive fields in the database (e.g., user passwords) are hashed using bcrypt with a salt round of 12.
- **Data Classifications**: 
  - Public: Static assets in `public/`.
  - Internal: Source code in `src/` and `prisma/`.
  - Confidential: User data in database (e.g., emails, playbooks); Protected: API keys and tokens.
  Scanning for secrets is performed via pre-commit hooks using `husky` and `lint-staged`, integrated with tools like `git-secrets`.

## Compliance & Policies

The project adheres to relevant standards for a development tooling repository.

- **Applicable Standards**: 
  - GDPR: User data (e.g., emails in auth) is minimized, with consent prompts for data processing. Right to erasure is supported via admin APIs.
  - SOC 2 Type I: Controls for security and availability are documented; evidence includes CI/CD pipelines in `.github/workflows/` with security scans (e.g., npm audit).
  - Internal Policies: Follows open-source best practices from the repository maintainers, including OWASP guidelines for web apps. No HIPAA applicability as no health data is handled.
- **Evidence Requirements**: Audit logs are captured via Prisma middleware for database actions. Compliance reports are generated from GitHub Actions outputs. Annual reviews are noted in `docs/compliance-audit.md` (cross-reference). Vulnerability scans run weekly via Dependabot alerts.

Policies are enforced through code reviews requiring security labels on PRs.

## Incident Response

A structured process ensures rapid response to security incidents.

- **On-Call Contacts**: Primary: repository maintainer (contact via GitHub issues or email in `README.md`). Secondary: Security lead (designated in `SECURITY.md`).
- **Escalation Steps**: 
  1. Detection: Alerts from GitHub Dependabot, Snyk (if integrated), or runtime errors logged to Sentry (configured in `src/lib/sentry.ts`).
  2. Triage: Initial assessment within 1 hour; classify severity (low/medium/high/critical) based on CVSS score.
  3. Response: Isolate affected components (e.g., revert deployments via Vercel/Netlify), notify stakeholders via Slack webhook if set up.
  4. Resolution: Patch and deploy fix; document in issue tracker.
- **Tooling for Detection, Triage, and Post-Incident Analysis**: 
  - Detection: ESLint security plugins, Prisma query logging.
  - Triage: GitHub Issues with security template.
  - Analysis: Post-mortems stored in `docs/incidents/` folder, with root cause analysis and lessons learned.

Full runbooks are in `docs/runbooks/incident-response.md`.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Confirm security libraries and infrastructure match current deployments.
2. Update secrets management details when storage or naming changes.
3. Reflect new compliance obligations or audit findings.
4. Ensure incident response procedures include current contacts and tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Security architecture docs, runbooks, policy handbooks.
- IAM/authorization configuration (code or infrastructure).
- Compliance updates from security or legal teams.

<!-- agent-update:end -->
