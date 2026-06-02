const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env.development") });

const User = require("../src/users/user.schema");
const Project = require("../src/projects/project.schema");
const Member = require("../src/projectMembers/member.schema");
const Task = require("../src/tasks/task.schema");
const TaskContent = require("../src/taskContent/taskContent.schema");
const TaskChunkEmbedding = require("../src/taskContent/taskChunkEmbedding.schema");

const RAG_TEST_DB = "fullstackTasks_rag_test";

function doc(...paragraphs) {
  return JSON.stringify({
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  });
}

// prettier-ignore
const taskDefs = [
  {
    title: "Q1 Sprint Planning & Roadmap Review",
    description: "Define sprint goals, assign owners, and align on Q1 roadmap priorities across all feature teams.",
    status: "completed", priority: "high", dueDate: new Date("2026-01-10"), lastEditedBy: "alice",
    paragraphs: [
      "The Q1 sprint planning session was held on January 6, 2026, and ran for three hours starting at 10:00 AM PST. All three feature teams attended: Platform Infrastructure, Developer Experience, and Data Pipelines. Alice Wang facilitated the meeting, Bob Chen handled the roadmap deck, and Charlie Li took notes.",
      "The primary goal for Q1 is to ship the internal service registry (code-named Atlas Core) by March 31, 2026. Secondary goals include completing the migration of legacy Jenkins pipelines to GitHub Actions by February 28, 2026, and deploying the new developer dashboard to production by March 15, 2026.",
      "Each team committed to two-week sprint cycles with retrospectives every other Friday. The first retrospective is scheduled for January 23, 2026. Sprint reviews will be held the preceding Thursday at 2:00 PM PST.",
      "Key risks identified: the service registry depends on the PostgreSQL schema migration being completed first, and the dashboard depends on the new analytics API still under design review as of January 6. Both dependencies have weekly check-ins starting January 13.",
      "Action items: Alice to publish the final roadmap doc to Confluence by January 8; Bob to set up the GitHub Projects board by January 9; Charlie to draft the sprint 1 task list and share it in Slack by end of day January 7.",
      "Velocity targets were set based on Q4 2025 actuals: Platform Infrastructure averaged 42 story points per sprint, Developer Experience averaged 38, and Data Pipelines averaged 29. Teams agreed to use T-shirt sizing for estimation until the new tooling is in place.",
      "Three high-priority carryovers from Q4 2025 were reviewed: the auth token expiry bug (critical, assigned to Bob), search index performance degradation (high, assigned to Charlie), and the OpenAPI documentation rewrite (medium, assigned to Alice).",
      "Budget allocation for Q1 was confirmed: $12,000 for infrastructure costs (AWS), $4,500 for third-party tooling licenses, and $2,000 contingency. Alice will submit the formal budget request to finance by January 10.",
    ],
  },
  {
    title: "API Rate Limiting — Design & Implementation",
    description: "Design and implement per-client rate limiting on all public API endpoints to prevent abuse and ensure fair usage.",
    status: "inProgress", priority: "high", dueDate: new Date("2026-02-20"), lastEditedBy: "bob",
    paragraphs: [
      "A design review for the API rate limiting feature was held on February 3, 2026 at 11:00 AM PST. Attendees: Bob Chen (lead), Alice Wang (architecture review), and Marcus Chen (implementation). The meeting lasted 90 minutes.",
      "The agreed approach uses a sliding window algorithm with Redis as the backend store. Each client is identified by API key, and limits are applied per endpoint group rather than per individual route. The chosen library is rate-limiter-flexible v3.0.",
      "Rate limits decided in the February 3 meeting: standard tier — 100 requests per minute; premium tier — 500 requests per minute; internal services — unlimited (IP allowlist). All limits apply per API key, not per IP, to handle clients behind NAT.",
      "When a client exceeds the limit, the API returns HTTP 429 with a Retry-After header set to the number of seconds until the window resets. A X-RateLimit-Limit and X-RateLimit-Remaining header will be included on every response.",
      "Redis key structure: `ratelimit:{apiKey}:{endpointGroup}:{windowStart}`. TTL is set to 2x the window duration to handle clock drift. The Redis instance used is the existing cluster at redis-prod-01.internal, which has 99.97% uptime over the past 6 months.",
      "Bob opened a draft PR (#214) on February 5, 2026. Code review is scheduled for February 10. Marcus will write integration tests covering the sliding window edge cases, quota exhaustion response, and Redis failover behavior (graceful degradation to allow-all when Redis is unreachable).",
      "The feature flag `feature.rate_limiting` will be used to enable the feature in staging first (February 13) and then production (February 20). Rollback plan: disable the flag. No schema migrations required.",
      "Open questions as of February 6: should rate limit config be stored in the database (allowing runtime changes) or in environment variables? Bob will draft a proposal for the February 10 review meeting.",
    ],
  },
  {
    title: "PostgreSQL Schema Migration — v2.3",
    description: "Migrate the users and sessions tables to the new v2.3 schema to support multi-tenancy and improved session management.",
    status: "completed", priority: "high", dueDate: new Date("2026-01-28"), lastEditedBy: "charlie",
    paragraphs: [
      "The v2.3 schema migration was completed and deployed on January 28, 2026 at 2:15 AM PST during the scheduled maintenance window (2:00–4:00 AM PST). Total downtime was 11 minutes. The migration was executed by Charlie Li with Alice Wang on standby.",
      "Changes in v2.3: the `users` table gained a `tenant_id` column (UUID, not null, indexed) and a `display_name` column (varchar 255, nullable). The `sessions` table gained a `device_fingerprint` column (varchar 512, nullable) and the `expires_at` column was changed from TIMESTAMP to TIMESTAMPTZ to fix a timezone bug introduced in v2.1.",
      "The migration script ran in 8 minutes 42 seconds on the production database (3.2M user rows, 11.7M session rows). The Alembic migration file is `migrations/versions/2026_01_28_v2_3_multitenancy.py`. The migration was tested on the staging database on January 22 and January 25 with no issues.",
      "Rollback procedure: a down-migration script was prepared and tested. It removes `tenant_id`, `display_name`, and `device_fingerprint`, and reverts `expires_at` to TIMESTAMP. Estimated rollback time: 6 minutes. The rollback was not needed.",
      "Prior to migration, a full database backup was taken at January 27, 2026 11:58 PM PST. Backup size: 47 GB. Stored in S3 bucket `atlas-db-backups` under prefix `prod/2026-01-27/`. Retention policy: 90 days.",
      "Post-migration validation was completed by 2:45 AM PST: row counts matched pre-migration counts, application health checks passed, and the auth service confirmed sessions were being created and validated correctly with the new schema.",
      "One minor issue found post-deploy on January 28 at 9:14 AM PST: the admin dashboard was displaying 'null' for users who had not yet been assigned a `tenant_id`. Fixed by a hotfix deploy at 10:30 AM PST (PR #198). The root cause was a missing null check in the frontend display component.",
    ],
  },
  {
    title: "Auth Token Expiry Bug — Investigation & Fix",
    description: "Investigate reports of users being unexpectedly logged out after token refresh. Reproduce, root cause, and fix the issue.",
    status: "completed", priority: "high", dueDate: new Date("2026-02-05"), lastEditedBy: "bob",
    paragraphs: [
      "The auth token expiry bug was first reported on January 15, 2026 at 3:22 PM PST by a user on the #support Slack channel. The symptom: users who were active for more than 4 hours were being logged out even though the refresh token was still valid. By January 16, 14 additional reports had been filed.",
      "Bob Chen was assigned as the primary investigator on January 16, 2026. Initial triage narrowed the issue to the token refresh endpoint. The refresh token was being accepted, but the new access token returned was expiring after 5 minutes instead of the configured 4 hours (14400 seconds).",
      "Root cause identified on January 19, 2026: during the v2.1 deployment on December 14, 2025, an environment variable rename broke the token TTL config. `JWT_ACCESS_TTL_SECONDS` was renamed to `JWT_ACCESS_EXPIRATION_TTL` in the codebase but the production environment was not updated. The token generation code was falling back to a hardcoded default of 300 seconds (5 minutes) without any warning log.",
      "Fix: updated the production environment variable on January 20, 2026 at 11:00 AM PST after a change-control approval (ticket OPS-2847). The change was verified by generating a token and inspecting the `exp` claim — correctly showing 4 hours from issue time.",
      "A secondary fix was merged in PR #185 on January 22, 2026: added a startup validation that explicitly throws if `JWT_ACCESS_EXPIRATION_TTL` is not set or is less than 60 seconds, preventing a silent fallback in future.",
      "Post-fix monitoring: Sentry showed zero auth-related errors for 72 hours following the fix. The #support channel received no further logout complaints. Impacted user count estimated at 340 based on Sentry session replay data from January 15–20.",
      "A post-mortem was drafted on January 23, 2026. Key lessons: (1) environment variable renames must trigger a production env audit, (2) critical config values must fail loudly on startup rather than falling back silently. Both items were added to the engineering runbook.",
    ],
  },
  {
    title: "Search Index Performance Optimization",
    description: "Investigate and resolve search latency regression. P95 search response time increased from 120ms to 850ms after the January deploy.",
    status: "completed", priority: "high", dueDate: new Date("2026-02-10"), lastEditedBy: "charlie",
    paragraphs: [
      "A search latency regression was detected on January 17, 2026 via the Grafana dashboard. The P95 response time for the `/api/search` endpoint jumped from a baseline of 120ms to 850ms, coinciding with the January 15 production deploy. Charlie Li was assigned on January 18.",
      "The initial benchmark was run on January 22, 2026 using k6 with 50 concurrent users. Results: P50 = 310ms, P75 = 580ms, P95 = 870ms, P99 = 1,240ms. The previous benchmark (run December 20, 2025) showed: P50 = 58ms, P75 = 95ms, P95 = 120ms, P99 = 185ms.",
      "Investigation steps: (1) EXPLAIN ANALYZE on the search query showed a full table scan on the `documents` table (1.2M rows) despite an index on `content_tsv`. (2) The index was found to be invalid — it had been created concurrently during the January 15 migration and failed partway through due to a lock timeout. (3) `pg_indexes` confirmed the index had status `INVALID`.",
      "Fix: dropped and recreated the GIN index on `content_tsv` using `CREATE INDEX CONCURRENTLY` during off-peak hours on January 24, 2026 at 12:30 AM PST. Index creation took 18 minutes for the 1.2M row table.",
      "Post-fix benchmark run January 24 at 7:00 AM PST: P50 = 52ms, P75 = 88ms, P95 = 115ms, P99 = 178ms — back within baseline range. The Grafana alert was cleared at 7:15 AM PST.",
      "Secondary optimization applied February 3, 2026: added a query result cache (Redis, 60-second TTL) for the top-20 most frequent search terms identified from query logs. This reduced P50 to 12ms for cached queries and brought average database load down by 31%.",
      "Action items from the fix: (1) add automated index validity check to the post-deploy smoke test suite (Charlie, done February 7); (2) add a Grafana alert for P95 > 300ms on search (Alice, done January 25); (3) document the concurrent index creation procedure in the runbook (Charlie, done February 10).",
    ],
  },
  {
    title: "Code Review Standards & Team Guidelines",
    description: "Draft, review, and publish a team-wide code review policy covering expectations, timelines, and tooling conventions.",
    status: "completed", priority: "normal", dueDate: new Date("2026-02-01"), lastEditedBy: "alice",
    paragraphs: [
      "A working group was formed on January 27, 2026 to define code review standards for the Atlas team. Members: Alice Wang (lead), Bob Chen, Charlie Li, and Marcus Chen. The first meeting was held January 27 at 3:00 PM PST and produced a draft outline.",
      "Review SLA agreed upon: all PRs must receive a first review within 1 business day of being marked Ready for Review. PRs blocking a release must be reviewed within 4 hours. The PR author is responsible for following up if the SLA is missed.",
      "Minimum approval requirements: (1) one approval from a team member other than the author for all PRs; (2) two approvals for any changes to authentication, payments, or database migrations; (3) architect sign-off (Alice Wang) for any changes to public API contracts.",
      "PR description template was agreed upon in the January 27 meeting: every PR must include a Summary section (what and why), a Testing section (how it was tested), and a Rollback Plan for any infrastructure or database changes. The template was added to `.github/PULL_REQUEST_TEMPLATE.md` on January 28.",
      "Code review checklist (non-exhaustive): no hardcoded secrets or credentials; no N+1 query patterns; error cases are handled and logged; tests cover the happy path and at least one failure path; database queries use parameterized inputs.",
      "Tooling: the team uses GitHub PR reviews as the primary tool. Inline comments are preferred over general comments for specific feedback. The convention for non-blocking suggestions is to prefix comments with `nit:`. Reviewers must resolve their own comments once satisfied.",
      "The policy was published to the team Confluence space on February 1, 2026 and announced in the #engineering Slack channel. A retrospective to evaluate the policy is scheduled for April 1, 2026 (after 2 months of use). Alice will collect anonymous feedback via a Google Form in the last week of March.",
    ],
  },
  {
    title: "GitHub Actions CI/CD Pipeline Upgrade",
    description: "Migrate all build, test, and deploy pipelines from Jenkins to GitHub Actions. Target completion: February 28, 2026.",
    status: "completed", priority: "high", dueDate: new Date("2026-02-28"), lastEditedBy: "bob",
    paragraphs: [
      "The decision to migrate from Jenkins to GitHub Actions was made in the Q1 planning meeting on January 6, 2026. The primary drivers: Jenkins infrastructure maintenance cost (~$800/month for the EC2 instance), slow pipeline startup time (avg 4 minutes before first test runs), and poor visibility into pipeline status from GitHub PRs.",
      "Bob Chen was assigned as the migration lead. A migration plan was shared with the team on January 12, 2026. The plan covered: (1) inventory all existing Jenkins jobs (27 total), (2) migrate non-critical jobs first (test and lint), (3) migrate staging deploy pipelines, (4) migrate production deploy pipelines last.",
      "Phase 1 (lint and test pipelines) was completed January 20, 2026. The new GitHub Actions workflow file is `.github/workflows/ci.yml`. It uses the `actions/setup-node@v4` action and caches `node_modules` using the `actions/cache@v4` action. Pipeline startup time reduced to 45 seconds.",
      "Phase 2 (staging deploy pipeline) was completed February 5, 2026. Staging deploys now trigger automatically on merge to the `develop` branch. Deployment uses the `aws-actions/configure-aws-credentials@v4` action with OIDC (no long-lived AWS keys). Average staging deploy time: 3 minutes 20 seconds.",
      "Phase 3 (production deploy pipeline) was completed February 24, 2026, four days ahead of schedule. Production deploys require a manual approval step from Alice Wang or Bob Chen before proceeding. This was implemented using the `environment` protection rules in GitHub.",
      "The Jenkins instance was decommissioned on February 28, 2026 at 5:00 PM PST. The EC2 instance (t3.medium, us-west-2) was stopped and a final snapshot was taken before termination. Annual savings: approximately $9,600 in EC2 costs.",
      "Post-migration metrics (first two weeks of March 2026): average CI pipeline duration 4 minutes 10 seconds (down from 11 minutes on Jenkins); pipeline failure rate 3.2% (down from 7.8%); developer satisfaction score 4.4/5 in the March 5 team survey (12 respondents).",
    ],
  },
  {
    title: "Frontend Design System — Initial Setup",
    description: "Bootstrap the shared component library using Storybook and Tailwind. Define tokens, base components, and contribution guidelines.",
    status: "inProgress", priority: "normal", dueDate: new Date("2026-03-15"), lastEditedBy: "alice",
    paragraphs: [
      "The design system initiative was kicked off on January 20, 2026 with a meeting between Alice Wang (engineering lead) and the product design team (Priya Sharma, lead designer). The goal: a shared Storybook component library that both the Atlas dashboard and the developer portal can consume as an npm package.",
      "Tooling decisions made in the January 20 meeting: Storybook 8.x, Tailwind CSS 4.x for styling, shadcn/ui as the component primitive layer, Radix UI for accessible headings and dialogs, and Vite for the build. The package will be published to the internal npm registry at npm.internal.atlas.dev.",
      "Design token structure was agreed upon January 27, 2026: tokens are defined in `tokens/colors.json`, `tokens/spacing.json`, and `tokens/typography.json`. Priya delivered the initial token set on February 3, 2026, covering 12 base colors (6 shades each), 8 spacing steps, and 5 type scales.",
      "Base components prioritized for the first milestone (due March 15, 2026): Button (all variants), Input, Select, Checkbox, Modal, Badge, Tooltip, Avatar, Spinner, and Toast notification. Each component must have: Storybook stories for all states, unit tests with React Testing Library, and WCAG 2.1 AA accessibility compliance.",
      "Alice completed Button, Input, and Select by February 14, 2026. Marcus Chen is working on Checkbox, Modal, and Badge (target: February 28). Priya is delivering updated Figma specs for the remaining components by February 21, 2026.",
      "Contribution guidelines were drafted and published February 10, 2026. Key rules: all new components must start with a Figma spec, no component is merged without a Storybook story and a passing accessibility check using axe-core. The `main` branch is protected — all contributions go through PRs reviewed by Alice.",
      "A design system review meeting is scheduled for March 12, 2026 to evaluate the first-milestone components before the March 15 deadline. Attendees will include Alice, Priya, Marcus, and one representative from each product team consuming the library.",
    ],
  },
  {
    title: "Q1 Security Audit — External Review",
    description: "Coordinate and support the external security audit of Project Atlas. Audit window: March 10–14, 2026.",
    status: "todo", priority: "high", dueDate: new Date("2026-03-20"), lastEditedBy: "alice",
    paragraphs: [
      "An external security audit was contracted with SecureLayer Inc. on February 14, 2026. The statement of work covers a black-box penetration test of the Atlas API and a white-box review of the authentication and authorization subsystems. Contract value: $18,500. The audit window is March 10–14, 2026.",
      "Scope agreed with SecureLayer: all endpoints under `/api/v1/`, the admin dashboard at `admin.atlas.internal`, the GitHub Actions CI pipeline configuration, and the AWS IAM role assignments for the Atlas deployment. Out of scope: the database layer (covered by separate SOC 2 audit in Q2).",
      "Pre-audit preparation tasks (all due March 7, 2026): Alice to provision a SecureLayer test account with editor role; Bob to prepare API documentation and Postman collection for the auditors; Charlie to set up an isolated staging environment (`staging-audit.atlas.internal`) with production-like data (anonymized).",
      "Internal pre-audit review was completed March 3, 2026. Known findings submitted to SecureLayer ahead of time: (1) the admin dashboard does not implement CSRF tokens on state-changing requests (mitigation in progress, PR #231); (2) password reset tokens have a 72-hour expiry which exceeds the OWASP recommendation of 60 minutes (scheduled fix: March 8).",
      "During the audit week (March 10–14), Bob Chen will be on-call for auditor questions with a guaranteed 2-hour response time. Alice will attend a daily 30-minute standup with the SecureLayer team at 9:00 AM PST.",
      "SecureLayer will deliver a preliminary findings report by March 21, 2026 and the final report by March 31, 2026. The team will hold a findings review meeting on March 24 to prioritize remediation. Critical findings must be remediated within 7 days, high findings within 30 days.",
      "A follow-up re-test for any critical or high findings is included in the contract scope and will be scheduled in April 2026. Alice will communicate audit results to the VP of Engineering by April 1, 2026.",
    ],
  },
  {
    title: "OpenAPI Documentation Rewrite",
    description: "Rewrite the Atlas API documentation using OpenAPI 3.1. Replace the outdated Swagger 2.0 spec with accurate, complete endpoint coverage.",
    status: "inProgress", priority: "normal", dueDate: new Date("2026-03-31"), lastEditedBy: "alice",
    paragraphs: [
      "The current API documentation was last updated in August 2025 and covers only 60% of the live endpoints. It uses Swagger 2.0 (OpenAPI 2.0) which lacks support for `oneOf`, `anyOf`, and webhooks. The rewrite will use OpenAPI 3.1 and will be maintained as code alongside the Express routes using `zod-openapi` for schema generation.",
      "Alice Wang is the documentation owner, with Bob Chen contributing endpoint descriptions for the rate-limiting and auth sections. The rewrite was started on January 15, 2026. The target completion date is March 31, 2026.",
      "Endpoint inventory (completed January 20, 2026): 84 total endpoints across 12 resource groups. Current Swagger 2.0 spec covers 51 of 84. Missing coverage: webhooks (8 endpoints), admin routes (12 endpoints), and the search API (13 endpoints).",
      "Tooling: the spec is written in YAML and lives at `docs/openapi/openapi.yaml`. It is auto-generated into a Redoc HTML page deployed at `docs.atlas.internal/api`. A GitHub Actions job regenerates and deploys the Redoc page on every merge to `main`.",
      "Progress as of February 20, 2026: 68 of 84 endpoints documented. Remaining: search API (13 endpoints) and 3 admin endpoints. Alice expects to complete the search API section by March 14 and the admin endpoints by March 28.",
      "A documentation review session was held February 17, 2026 with two external developers who had previously struggled with the old docs. Feedback: the request/response examples were the most valuable part; several parameter descriptions were missing or ambiguous. Alice incorporated the feedback in the February 20 revision.",
      "Once the rewrite is complete, the Swagger 2.0 spec will be archived and removed from the repository. The Redoc page will become the single source of truth. Bob will add a link to the Redoc page in the README and the developer onboarding guide by April 1, 2026.",
    ],
  },
  {
    title: "Stripe Payment Integration — Developer Portal",
    description: "Integrate Stripe to handle subscription billing for the Atlas developer portal. Support monthly and annual plans with plan upgrades.",
    status: "completed", priority: "high", dueDate: new Date("2026-03-15"), lastEditedBy: "bob",
    paragraphs: [
      "The decision to use Stripe for subscription billing was confirmed in the product meeting on January 13, 2026. Stripe was chosen over Paddle and LemonSqueezy because of its robust webhook system, native support for usage-based billing (needed for future roadmap), and existing team familiarity.",
      "Two plans are offered: Standard ($29/month or $290/year, up to 5 team members) and Pro ($99/month or $990/year, unlimited team members). Annual plans receive a 16.7% discount. Stripe product IDs are `prod_atlas_standard` and `prod_atlas_pro` in the production Stripe account.",
      "Integration work started February 3, 2026 with Bob Chen as the lead. The implementation uses `stripe-node` v15 and Stripe Checkout hosted pages to avoid PCI scope for the Atlas backend. After checkout, Stripe redirects to `app.atlas.dev/billing/success?session_id={CHECKOUT_SESSION_ID}`.",
      "Webhook handling: Stripe sends events to `https://api.atlas.dev/webhooks/stripe`. The following events are handled: `checkout.session.completed` (provision subscription), `customer.subscription.updated` (plan change), `customer.subscription.deleted` (downgrade to free), `invoice.payment_failed` (send dunning email and lock account after 7 days).",
      "Testing was completed February 24–28, 2026 using Stripe test mode. Tested scenarios: new subscription, upgrade from Standard to Pro, downgrade from Pro to Standard at end of billing period, payment failure and retry, and cancellation. All scenarios passed.",
      "Production go-live was March 15, 2026 at 10:00 AM PST. First real transaction was processed at 10:47 AM PST (a Standard annual plan, $290). By end of day March 15, 12 subscriptions had been created (8 Standard monthly, 2 Standard annual, 2 Pro monthly).",
      "One post-launch issue: on March 16, duplicate `checkout.session.completed` events caused two subscription records to be created for 3 users. Fixed by adding idempotency checks using the Stripe `idempotency_key` header. Hotfix deployed March 16 at 2:00 PM PST. Affected users were manually corrected by Bob.",
    ],
  },
  {
    title: "Load Testing Report — February 2026",
    description: "Run load tests against the Atlas API to establish production capacity baselines and identify bottlenecks before the March launch.",
    status: "completed", priority: "normal", dueDate: new Date("2026-02-20"), lastEditedBy: "charlie",
    paragraphs: [
      "Load testing was conducted on February 12, 2026 against the staging environment (`staging.atlas.internal`), which mirrors production infrastructure (2x t3.large app servers, 1x db.r6g.large RDS instance, 1x cache.r6g.large ElastiCache). The test was run by Charlie Li using k6 v0.50.",
      "Test scenarios: (1) Steady load — 200 concurrent users for 10 minutes; (2) Ramp-up — 0 to 500 concurrent users over 5 minutes, hold for 10 minutes, ramp down; (3) Spike — sudden jump from 50 to 800 concurrent users, hold for 2 minutes.",
      "Steady load results (200 users): P50 = 45ms, P95 = 180ms, P99 = 320ms. Throughput: 1,240 requests/second. Error rate: 0.02%. CPU on app servers: avg 34%, peak 51%. RDS CPU: avg 18%, peak 27%. All metrics within acceptable range.",
      "Ramp-up results (500 users): P50 = 88ms, P95 = 410ms, P99 = 780ms. Throughput: 2,890 requests/second. Error rate: 0.08%. App server CPU peaked at 78% during the hold phase. RDS CPU peaked at 52%. The `/api/search` endpoint degraded first, with P95 reaching 1,100ms at peak load.",
      "Spike test results (800 users): during the first 30 seconds of the spike, P99 reached 4,200ms and the error rate spiked to 2.3% (HTTP 503 from the load balancer). After 45 seconds the auto-scaling group launched a third app server and metrics stabilized. P99 returned to 820ms at steady state.",
      "Bottlenecks identified: (1) the search endpoint is the first to degrade under load — adding the Redis query cache (done February 3) partially addresses this; (2) auto-scaling group took 45 seconds to respond to the spike — minimum instance count will be raised from 2 to 3 effective March 1; (3) RDS connection pool was exhausted during the spike (max_connections = 100, peak usage 97) — pool size will be increased to 150.",
      "Recommendations implemented before March launch: raise minimum app server count to 3 (done February 25), increase RDS connection pool to 150 (done February 22), and enable ElastiCache for session storage to reduce database reads (scheduled for March 5). Next load test is planned for April 15, 2026.",
    ],
  },
  {
    title: "New Engineer Onboarding — Marcus Chen",
    description: "Onboard Marcus Chen (full-stack engineer) joining the Atlas team on February 1, 2026. Ensure access, setup, and first-week ramp-up tasks are complete.",
    status: "completed", priority: "normal", dueDate: new Date("2026-02-07"), lastEditedBy: "alice",
    paragraphs: [
      "Marcus Chen joined the Atlas team as a full-stack engineer on February 1, 2026, reporting to Alice Wang. Marcus was previously a senior engineer at DataStream Inc. for 4 years, where he specialized in Node.js backend services and React frontends.",
      "Pre-start provisioning (completed January 29, 2026): laptop shipped and received January 27; GitHub organization membership granted; AWS IAM role `AtlasDeveloper` assigned; Slack workspace and all team channels added; Jira and Confluence access provisioned; 1Password team vault access granted.",
      "Day 1 schedule (February 1, 2026): 9:00 AM — welcome call with Alice and Bob; 10:00 AM — HR orientation (30 min); 11:00 AM — dev environment setup session with Bob (estimated 2 hours); 2:00 PM — codebase walkthrough with Charlie; 4:00 PM — end-of-day check-in with Alice.",
      "Dev environment setup was completed by 1:15 PM on February 1. Marcus ran into one issue: the local Docker Compose setup for the test database required Docker Desktop 4.28+ but his laptop shipped with 4.26. Bob updated the `CONTRIBUTING.md` to add the minimum Docker Desktop version requirement.",
      "First-week tasks assigned to Marcus: (1) fix a low-priority bug in the user settings API (issue #203, completed February 3); (2) add unit tests for the session invalidation flow (completed February 5); (3) attend the code review standards meeting on January 27 notes review session (completed February 4); (4) submit first PR by end of week (PR #207 merged February 6, reviewed by Charlie).",
      "30-day plan agreed with Alice: weeks 1–2, focus on codebase familiarity and small bug fixes; weeks 3–4, take ownership of the design system checkbox and modal components (target completion February 28); by March 1, Marcus should be able to independently plan and execute a medium-complexity feature.",
      "Marcus's first code review feedback was noted as thorough and constructive by Bob (on PR #210). Alice noted in the February 7 check-in that Marcus's ramp-up has been faster than expected. Buddy pairing with Charlie will continue through February.",
    ],
  },
  {
    title: "Q2 Stakeholder Demo Preparation",
    description: "Prepare and rehearse the Q2 progress demo for senior leadership. Demo date: April 8, 2026 at 2:00 PM PST.",
    status: "todo", priority: "normal", dueDate: new Date("2026-04-05"), lastEditedBy: "alice",
    paragraphs: [
      "The Q2 stakeholder demo is scheduled for April 8, 2026 at 2:00 PM PST. Attendees will include the VP of Engineering (Sarah Tan), the CTO (David Park), the Director of Product (Maya Reyes), and 4 team leads. The meeting is 60 minutes: 40 minutes demo + 20 minutes Q&A. Alice Wang will present.",
      "Features to demonstrate (confirmed in Alice's March 18, 2026 planning call with Maya Reyes): (1) Atlas Core service registry — show service registration, discovery, and health check dashboard; (2) Developer portal — show signup flow, Stripe billing, and API key management; (3) GitHub Actions CI/CD — show a live pipeline run from PR merge to staging deploy; (4) New design system components in the dashboard.",
      "Preparation timeline: March 25 — draft slide deck (Alice); March 28 — first internal rehearsal with Bob and Charlie (1 hour); April 1 — incorporate feedback and finalize demo script; April 3 — second rehearsal with full team including Marcus; April 5 — final slide deck and demo environment locked.",
      "Demo environment: a dedicated demo instance (`demo.atlas.internal`) will be set up by March 24. Charlie is responsible for provisioning and seeding it with realistic but anonymized data. The demo environment must be on the same version as production and must not share any production data.",
      "Slide deck structure (draft): (1) Q1 recap — 3 key achievements with metrics; (2) Atlas Core demo — 8 minutes; (3) Developer portal demo — 10 minutes; (4) CI/CD demo — 5 minutes; (5) Design system overview — 4 minutes; (6) Q2 roadmap — 8 minutes; (7) Questions — 20 minutes.",
      "Key metrics to highlight in the demo: CI pipeline startup time reduced from 4 minutes to 45 seconds; search P95 latency reduced from 850ms to 115ms; 12 subscriptions on day 1 of Stripe launch; 99.97% API uptime in Q1 (3 minutes downtime: the January 15 outage post-mortem was published).",
      "Risk: the service registry demo depends on Atlas Core being deployed to the demo environment by March 24. If Atlas Core is delayed, Alice will substitute a walkthrough of the staging environment. Alice will confirm Atlas Core status with Charlie by March 20.",
    ],
  },
  {
    title: "Bug Triage Session — March 3, 2026",
    description: "Weekly bug triage: review all open issues, assign priorities, and close stale reports. Session held March 3, 2026.",
    status: "completed", priority: "low", dueDate: new Date("2026-03-03"), lastEditedBy: "charlie",
    paragraphs: [
      "The weekly bug triage session was held on March 3, 2026 at 10:00 AM PST. Attendees: Charlie Li (facilitator), Alice Wang, Bob Chen. Duration: 55 minutes. 28 open issues were reviewed; 6 were newly opened since the previous triage on February 24.",
      "Critical issues reviewed (0 open): the auth token expiry bug (closed January 20) and the search index regression (closed January 24) are both resolved. No new critical issues.",
      "High priority issues reviewed: (1) Issue #219 — admin dashboard crashes when filtering by date range if the end date is before the start date (reported March 1 by internal tester). Assigned to Marcus Chen, target fix March 7. (2) Issue #222 — the Stripe webhook handler fails silently when Stripe sends an unknown event type instead of returning 200 (reported March 2). Assigned to Bob Chen, target fix March 5.",
      "Normal priority issues: 11 issues were reviewed. Notable: issue #215 (modal close button not keyboard-accessible) assigned to Marcus, target March 14. Issue #218 (API returns 500 instead of 400 on malformed JSON body) assigned to Bob, target March 10. Six other normal priority issues were confirmed and kept in backlog.",
      "Low priority / won't fix: 4 issues were closed as won't fix. Issue #201 (request to support XML response format) was closed — the team confirmed the Atlas API will be JSON-only indefinitely. Issue #204 (request to change default avatar color) was closed — design system avatars use deterministic color from user ID hash.",
      "Stale issues closed: 8 issues had no activity for 30+ days and were not reproducible on the current version. They were closed with the label `stale/cannot-reproduce` and a comment asking reporters to reopen if the issue persists on the current release.",
      "Action items from the triage: (1) Charlie to set up a GitHub Action to auto-label issues with `stale` after 21 days of no activity (done March 5); (2) Bob to create issue templates for bug reports to reduce incomplete submissions; (3) next triage session scheduled March 10, 2026 at 10:00 AM PST.",
    ],
  },
  {
    title: "Mobile Responsive Redesign — Dashboard",
    description: "Redesign the Atlas developer dashboard to be fully responsive on mobile and tablet viewports. Target breakpoints: 375px, 768px, 1024px.",
    status: "inProgress", priority: "normal", dueDate: new Date("2026-04-01"), lastEditedBy: "alice",
    paragraphs: [
      "The mobile responsive redesign was initiated following a user survey conducted February 10–14, 2026 (87 respondents). 34% of respondents reported using the dashboard on a mobile device or tablet at least once a week, and 71% of those rated the mobile experience as 'poor' or 'very poor'. Alice Wang approved the redesign as a Q1 stretch goal.",
      "Designer Priya Sharma was briefed on February 16, 2026. Priya delivered high-fidelity Figma mockups for all three breakpoints (375px mobile, 768px tablet, 1024px desktop) on February 17, 2026. The mockups cover 12 key screens: dashboard home, service registry, API keys, billing, settings, and 7 others.",
      "Key design decisions from the February 17 handoff: (1) the sidebar navigation collapses to a bottom tab bar on mobile; (2) all data tables convert to card-based layouts below 768px; (3) the service registry graph visualization is hidden on 375px and replaced with a list view; (4) the billing page retains its table layout on tablet but adds horizontal scroll.",
      "Alice started implementation on February 24, 2026. The approach uses Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) and avoids any JavaScript-driven layout changes. Mobile-first CSS is used: base styles target 375px and are progressively enhanced for larger viewports.",
      "Progress as of March 3, 2026: 5 of 12 screens completed (dashboard home, API keys, billing, account settings, profile). The sidebar-to-tab-bar transition is implemented and working across all three breakpoints. Known issue: the modal overlay on mobile needs z-index adjustment (filed as issue #225).",
      "Cross-browser testing plan: Chrome (Android and iOS), Safari (iOS), Samsung Internet. Testing will be done using BrowserStack. Alice has scheduled a testing session for March 25, 2026. Accessibility: all touch targets must be at least 44x44 CSS pixels per WCAG 2.5.5.",
      "The redesign will be merged to `main` in two phases: phase 1 (all 12 screens, target March 28) behind a feature flag `feature.mobile_redesign`; phase 2 (flag removal and full rollout, target April 1). This allows a gradual rollout and easy rollback.",
    ],
  },
  {
    title: "Analytics Dashboard v2 — Design & Build",
    description: "Build the v2 analytics dashboard for Atlas Pro subscribers. Show API usage, error rates, and latency over time with date range filtering.",
    status: "inProgress", priority: "normal", dueDate: new Date("2026-05-01"), lastEditedBy: "bob",
    paragraphs: [
      "The Analytics Dashboard v2 was added to the Q1 roadmap on January 6, 2026, targeting a May 1, 2026 launch as part of the Pro tier feature set. Bob Chen is the lead engineer. Product requirements were finalized by Maya Reyes on February 20, 2026.",
      "Features in scope for v2: (1) API request volume chart (line chart, hourly/daily/weekly granularity); (2) Error rate chart (HTTP 4xx and 5xx, same granularity options); (3) Latency percentiles chart (P50, P95, P99); (4) Top-10 endpoints by request volume table; (5) Date range filter (last 7 days, last 30 days, custom range up to 90 days); (6) CSV export for all charts.",
      "Data pipeline: API request metrics are logged to CloudWatch. A Lambda function runs every 5 minutes to aggregate metrics from CloudWatch into the Atlas PostgreSQL database (table: `api_metrics_hourly`). The aggregation Lambda was implemented by Charlie Li and deployed March 1, 2026.",
      "Frontend implementation uses Recharts v2.12 for all charts. Bob selected Recharts over Chart.js and Visx because of its native React integration and built-in responsiveness. A date range picker component from the design system will be used once it's available (target March 15, currently in progress).",
      "Bob completed the API backend for the dashboard on February 28, 2026: three new endpoints under `/api/v1/analytics/` (volume, errors, latency). All endpoints require Pro subscription; non-Pro users receive HTTP 403 with an upgrade prompt.",
      "Frontend progress as of March 3, 2026: the API volume and error rate charts are complete and connected to the backend. The latency chart and the top-10 endpoints table are in progress (target March 20). The date range filter and CSV export are blocked on the design system date picker being ready.",
      "The dashboard will be soft-launched to internal users on April 15, 2026 for a 2-week feedback period before the May 1 general release. Bob will set up a feedback form in the dashboard header during the soft-launch period. The v2 dashboard replaces the current static usage stats page which shows only a 30-day request count.",
    ],
  },
  {
    title: "Sentry Error Monitoring — Configuration & Alerting",
    description: "Configure Sentry for all Atlas services, define alert policies, set up team inboxes, and establish an on-call rotation for critical errors.",
    status: "completed", priority: "normal", dueDate: new Date("2026-02-01"), lastEditedBy: "charlie",
    paragraphs: [
      "Sentry was provisioned for the Atlas project on January 29, 2026 by Charlie Li. The team plan was selected ($26/month for 3 seats). The Sentry DSN was added to the Atlas API and developer portal frontend as environment variables. Error tracking went live January 30, 2026 at 9:00 AM PST.",
      "Sentry SDK versions: `@sentry/node` v8.2 for the Express API; `@sentry/react` v8.2 for the React frontend. Source maps are uploaded to Sentry on every production deploy via a GitHub Actions step added to the deploy workflow on February 1, 2026.",
      "Alert policies configured January 30, 2026: (1) Critical alert — any new issue with `level: fatal`; notify `#alerts-critical` Slack channel immediately and page the on-call engineer via PagerDuty. (2) High alert — any issue occurring more than 50 times in 1 hour; notify `#alerts-high` Slack channel within 5 minutes. (3) Daily digest — sent to `#alerts-digest` at 9:00 AM PST with a summary of new issues from the past 24 hours.",
      "Performance monitoring was enabled February 1, 2026. Transaction sampling rate: 10% in production (to stay within the Sentry plan limits). The following transactions are traced: all HTTP requests to the API, all database queries exceeding 100ms, and all outbound HTTP calls to Stripe and AWS.",
      "On-call rotation established: Alice Wang (primary) and Bob Chen (secondary) for the week of January 25. Rotation is weekly, alternating between Alice and Bob, with Charlie Li as backup for escalations. The schedule is managed in PagerDuty. First alert received: January 31 at 2:14 AM PST — a `fatal` error in the Stripe webhook handler (the duplicate event issue, later resolved February 16).",
      "Sentry team inboxes configured: the `Platform` inbox receives all errors from the API; the `Frontend` inbox receives all errors from the React app. Each inbox is reviewed in the Monday morning team standup. By February 1, the Platform inbox had 12 resolved issues and 3 open; the Frontend inbox had 5 resolved and 0 open.",
      "First month metrics (January 30 – February 28, 2026): 1,240 total events captured, 47 unique issues, 38 resolved, 6 in-progress, 3 ignored. Alert fatigue was noted in the February 28 retrospective — the 50-events/hour threshold for high alerts triggered 8 false positives due to a noisy integration test. Threshold raised to 200 events/hour effective March 1.",
    ],
  },
  {
    title: "Production Deployment Runbook — Update",
    description: "Update the production deployment runbook to reflect the new GitHub Actions pipeline, Stripe integration steps, and post-deploy verification checklist.",
    status: "completed", priority: "low", dueDate: new Date("2026-03-20"), lastEditedBy: "bob",
    paragraphs: [
      "The production deployment runbook was last updated on October 15, 2025 and no longer reflected the current deploy process (GitHub Actions replaced Jenkins in February 2026, Stripe webhooks added in March 2026). Bob Chen was assigned to update the runbook on March 5, 2026 with a due date of March 20.",
      "The updated runbook is located at `docs/runbooks/production-deploy.md` in the main repository. Bob published the update on March 18, 2026. Changes were reviewed by Alice Wang on March 19 and approved with two minor corrections (the staging deploy step order and the Sentry release notification command).",
      "Pre-deploy checklist (updated): (1) Confirm all PRs in the release are merged and CI is green on `main`; (2) Run `npm audit` — no critical vulnerabilities; (3) Verify no open critical or high Sentry issues related to the changes; (4) Notify `#deployments` Slack channel: 'Deploying vX.Y.Z at HH:MM PST — @alice @bob'; (5) Ensure at least 2 engineers are available for the deploy window.",
      "Deploy steps (updated for GitHub Actions): trigger the production deploy workflow in GitHub Actions by going to Actions > 'Deploy to Production' > 'Run workflow'. Select the `main` branch. The workflow requires manual approval from Alice Wang or Bob Chen before the deployment step runs. Expected deploy time: 4–6 minutes.",
      "Post-deploy verification checklist: (1) Run the smoke test suite (`npm run test:smoke:prod`) — must pass within 5 minutes; (2) Check Sentry for any new `fatal` errors in the 5 minutes following deploy; (3) Verify Grafana P95 latency is within 20% of pre-deploy baseline; (4) Check Stripe dashboard for any webhook failures; (5) Confirm the release is tagged in GitHub.",
      "Rollback procedure (updated): if any post-deploy check fails, trigger the 'Rollback Production' workflow in GitHub Actions. The rollback deploys the previous Docker image tag (stored in the `PREVIOUS_PROD_IMAGE` secret, automatically updated on every successful deploy). Expected rollback time: 2–3 minutes. The rollback was successfully tested in staging on March 12, 2026.",
      "The runbook also documents the emergency hotfix process: create a branch from the current production tag, make the fix, open a PR to `main`, and use the 'Expedited Review' label to trigger a 4-hour SLA review. Alice must approve all expedited PRs. After merge, a hotfix deploy follows the same steps as a regular deploy.",
    ],
  },
  {
    title: "Post-mortem: January 15, 2026 Production Outage",
    description: "Document root cause, timeline, and action items from the January 15, 2026 outage. Total impact: 2 hours 40 minutes of API unavailability.",
    status: "completed", priority: "high", dueDate: new Date("2026-01-23"), lastEditedBy: "alice",
    paragraphs: [
      "On January 15, 2026, the Atlas API was unavailable for 2 hours and 40 minutes (10:12 AM – 12:52 PM PST). During this window, all API requests returned HTTP 502. The developer portal was partially available (static pages loaded, but all dynamic content failed). Approximately 340 users were impacted based on session data.",
      "Timeline: 10:12 AM — first PagerDuty alert fired (Sentry fatal error spike). 10:15 AM — Alice Wang acknowledged the alert and began investigation. 10:20 AM — Alice confirmed the API pods were crashlooping in Kubernetes; logs showed `Error: Cannot find module '../config/db'`. 10:25 AM — Alice identified that the January 15 deploy (released at 10:05 AM) included a file rename that was not reflected in the import path.",
      "Root cause: during a refactor in PR #178, the file `src/config/database.js` was renamed to `src/config/db.js`. The import in `src/app.js` was updated, but the import in `src/workers/metrics-collector.js` was missed. The CI pipeline passed because the metrics collector is not imported in the test environment. The error only manifested in production when the metrics collector worker started.",
      "Immediate fix: Alice reverted the deploy at 10:30 AM by triggering the rollback workflow. The rollback completed at 10:38 AM but the API did not recover because the Kubernetes readiness probes were still failing for old pods. Bob joined at 10:40 AM and identified the stuck pods. Manual pod restart was performed at 11:15 AM. API recovered at 11:22 AM but with degraded performance (P95 = 1,200ms) due to cache warming.",
      "Full recovery: at 12:52 PM PST, P95 latency returned to baseline (< 200ms) as caches warmed. The metrics collector fix (PR #181) was merged and deployed at 2:30 PM PST with no incident. Total user-visible downtime: 2 hours 40 minutes (10:12 AM – 12:52 PM). Cache degradation lasted an additional 90 minutes.",
      "Contributing factors: (1) the test environment does not start the metrics collector worker — the broken import was not caught by any test; (2) the CI pipeline had no step to check for broken imports across all entry points; (3) the rollback procedure was not documented clearly enough, leading to the 37-minute delay between rollback trigger and recovery.",
      "Action items (all assigned and completed by January 23, 2026): (1) Alice — add `node --check` to CI pipeline for all entry point files (done January 16, PR #182); (2) Bob — add the metrics collector to the integration test startup (done January 18, PR #184); (3) Alice — update the rollback runbook with explicit pod restart steps (done January 20); (4) Charlie — add a Grafana alert for crashlooping pods (done January 17); (5) all — retrospective meeting held January 20 at 2:00 PM PST, notes published to Confluence.",
    ],
  },

  // ─── LONG TASK (1200w) — added specifically to test single vs multi-chunk strategy ───
  // At 150w chunks / 25w overlap this produces ~10 chunks.
  // Single strategy returns the full ~1200w blob; chunked returns only the 5 most relevant 150w sections.
  // Use this task for strategy comparison queries to see where they diverge.
  {
    title: "Atlas Core Service Registry — Technical Design",
    description: "Full technical design document for the Atlas Core service registry: architecture decisions, data model, API contract, capacity limits, and phased rollout plan.",
    status: "inProgress", priority: "high", dueDate: new Date("2026-03-31"), lastEditedBy: "alice",
    paragraphs: [
      "The Atlas Core service registry is the foundational component of the Atlas internal developer platform. A design kickoff meeting was held on February 10, 2026 at 2:00 PM PST. Attendees: Alice Wang (architect), Charlie Li (tech lead), Bob Chen (infrastructure), and Priya Sharma (product). The meeting lasted two hours and produced the high-level design that this document captures. Charlie Li was assigned as the primary implementation owner, with a target delivery of March 31, 2026.",
      "The core problem the service registry solves: as of February 2026, the engineering organisation runs 47 internal microservices. There is no central inventory of which services exist, what versions are deployed, which teams own them, or whether they are healthy. Engineers discover service endpoints through Slack messages and outdated wiki pages. The registry will provide a single source of truth for service discovery, health status, and ownership metadata.",
      "Architecture decision — storage: the registry will use MongoDB as its primary datastore (consistent with the existing Atlas stack). Each service record is stored as a document in the `serviceregistrations` collection. A Redis cache layer (TTL: 60 seconds) sits in front of MongoDB for read-heavy discovery lookups. The Redis instance is the existing `redis-prod-01.internal` cluster. This decision was finalised on February 10, 2026 after evaluating etcd (rejected: operational complexity) and Consul (rejected: licensing cost at scale).",
      "Architecture decision — communication protocol: REST over HTTPS was chosen for all registry API endpoints. gRPC was evaluated and rejected on February 10, 2026 because the majority of Atlas services are Node.js-based and the Node.js gRPC ecosystem requires native bindings that complicate Docker builds. REST also allows direct browser-based interaction with the developer dashboard without a proxy layer.",
      "Data model — service registration document: each registered service stores the following fields: `serviceId` (UUID, immutable), `name` (string, max 80 chars), `version` (semver string, e.g. `1.4.2`), `team` (string, owner team name), `baseUrl` (string, the service's internal base URL), `healthCheckUrl` (string, defaults to `{baseUrl}/health`), `status` (enum: `healthy`, `degraded`, `unreachable`), `registeredAt` (ISO timestamp), `lastHeartbeatAt` (ISO timestamp), `tags` (array of strings, max 10 tags, used for filtering). The document also stores `metadata` as a free-form object (max 2KB) for team-specific fields.",
      "Capacity limits agreed in the February 10 meeting: maximum 500 registered services per Atlas project, maximum 10 tags per service, maximum 2KB for the metadata object, maximum 80 characters for service name, heartbeat interval must be between 10 seconds and 300 seconds (default: 30 seconds). Services that miss 3 consecutive heartbeats (configurable, default: 3) are automatically marked `unreachable`. Services marked `unreachable` for more than 7 days are soft-deleted (status set to `archived`, not physically removed).",
      "API contract — registration and heartbeat: `POST /api/v1/services` registers a new service (requires `name`, `version`, `team`, `baseUrl`; returns the full service document including assigned `serviceId`). `PUT /api/v1/services/:serviceId/heartbeat` updates `lastHeartbeatAt` and resets the miss counter (returns HTTP 204). `PATCH /api/v1/services/:serviceId` updates mutable fields (`version`, `baseUrl`, `tags`, `metadata`). `DELETE /api/v1/services/:serviceId` soft-deletes the service (sets status to `archived`).",
      "API contract — discovery: `GET /api/v1/services` returns all non-archived services with optional query params: `team` (filter by owner), `status` (filter by health status), `tag` (filter by tag, supports multiple), `page` and `limit` (pagination, default limit 50, max 200). `GET /api/v1/services/:serviceId` returns a single service document. `GET /api/v1/services/:serviceId/health` proxies to the service's configured `healthCheckUrl` and returns the raw response, caching the result for 15 seconds.",
      "Authentication and authorisation: all registry write endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) require a valid Atlas API key passed as the `X-Atlas-Api-Key` header. Read endpoints (`GET`) are open within the internal network (IP allowlisted to `10.0.0.0/8`). API key validation uses the existing Atlas API key service; no new auth infrastructure is needed. Rate limits: write endpoints are limited to 60 requests per minute per API key; read endpoints are limited to 600 requests per minute per IP.",
      "Implementation plan — Phase 1 (February 17 – March 7, 2026): Charlie Li implements the MongoDB schema, the registration and heartbeat endpoints, and the Redis caching layer. Bob Chen provisions the MongoDB collection and Redis key namespace on staging. Target: all write endpoints passing integration tests by March 7.",
      "Implementation plan — Phase 2 (March 8 – March 21, 2026): Charlie implements the discovery endpoints and the health-check proxy. Alice builds the developer dashboard UI (service list, health status badges, team filter). Bob sets up the production MongoDB indexes: `{ serviceId: 1 }` unique, `{ team: 1, status: 1 }` compound, `{ lastHeartbeatAt: 1 }` TTL index for archiving. Target: full feature complete on staging by March 21.",
      "Implementation plan — Phase 3 (March 22 – March 31, 2026): end-to-end testing with 5 pilot teams (Platform Infrastructure, Developer Experience, Data Pipelines, Payments, and Identity). Each pilot team registers their services and verifies discovery. Alice will present the registry in the Q2 stakeholder demo on April 8, 2026. Production go-live is scheduled for March 31, 2026 at 10:00 AM PST during the standard maintenance window. A rollback plan (drop the `serviceregistrations` collection and remove the API routes) is documented in the production runbook.",
      "Open questions as of February 14, 2026: (1) Should the heartbeat endpoint accept a partial health payload (CPU, memory, error rate) or remain a simple ping? Charlie will prototype both options by February 21. (2) Should service `version` be enforced as strict semver or allow free-form strings? Alice favours strict semver for queryability; Bob prefers free-form to avoid blocking teams with non-standard versioning. Decision deferred to the February 24 design review. (3) Should the registry expose a WebSocket stream for real-time status updates, or is polling (every 30 seconds from the dashboard) sufficient for the initial release? Agreed to start with polling and evaluate WebSocket based on dashboard adoption metrics after April 1.",
      "Observability and alerting: the service registry will emit structured logs to the existing Winston log pipeline. Three Grafana dashboards will be created by Bob Chen before Phase 3 begins (due March 21, 2026): (1) Registration activity — registrations per hour, deregistrations, heartbeat miss rate; (2) Discovery traffic — GET request volume, cache hit rate (target: above 85%), P95 response time (SLA: under 50ms); (3) Service health overview — count of healthy vs degraded vs unreachable services over time. PagerDuty alerts will fire when more than 10% of registered services are simultaneously unreachable, or when the cache hit rate drops below 70% for more than 5 minutes. Alert routing: critical alerts go to the Platform Infrastructure on-call rotation; warning alerts go to the #atlas-registry Slack channel.",
      "Migration strategy for existing services: the 47 currently running microservices will be onboarded to the registry in three waves. Wave 1 (April 1–14, 2026): the 5 pilot teams from Phase 3 testing — Platform Infrastructure, Developer Experience, Data Pipelines, Payments, Identity — covering 18 services total. Wave 2 (April 15–30, 2026): the next 19 highest-traffic services, prioritised by request volume from load balancer logs. Wave 3 (May 1–15, 2026): remaining 10 services including legacy systems. Each team is responsible for adding the heartbeat client library (`@atlas/registry-client v1.0`, published to the internal npm registry by Charlie Li on March 28, 2026). Onboarding support sessions will be held every Tuesday at 11:00 AM PST throughout April 2026.",
      "Reliability and SLA commitments: the service registry must meet a 99.9% monthly uptime SLA (maximum 43 minutes downtime per month). This is achieved through: (1) two app server replicas behind the Atlas load balancer with automatic failover under 10 seconds; (2) MongoDB replica set with automatic primary election using existing infrastructure; (3) Redis Sentinel with one primary and two replicas, failover under 30 seconds. A circuit breaker on the Redis client will open after 5 consecutive connection failures and remain open for 30 seconds before retrying, during which the registry falls back to direct MongoDB reads with degraded cache performance. The 99.9% SLA is deliberately set lower than the 99.97% Atlas API SLA because the registry is an internal tool — external customer impact is indirect.",
      "Cost analysis (prepared by Bob Chen on February 12, 2026): the service registry requires no new infrastructure. MongoDB storage for 500 service documents at approximately 5KB each totals 2.5MB — negligible. Redis memory for 500 cached documents at 5KB each with a 60-second TTL peaks at approximately 2.5MB, well within the 2GB capacity of the existing ElastiCache instance. The heartbeat processor runs as a lightweight cron every 10 seconds alongside the existing API process, estimated to increase app server CPU by 5%, costing approximately $15 per month at current AWS on-demand pricing. The `@atlas/registry-client` npm library adds one dependency per onboarded service but no runtime infrastructure cost. Total estimated incremental monthly cost: under $20. Approved by Alice Wang on February 13, 2026.",
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.DATABASE_URL, { dbName: RAG_TEST_DB });
  console.log(`✅ Connected to MongoDB: ${RAG_TEST_DB}`);

  await TaskChunkEmbedding.deleteMany({});
  await TaskContent.deleteMany({});
  await Task.deleteMany({});
  await Member.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});
  console.log("🗑️  Cleared existing data");

  const hashedPassword = await bcrypt.hash("Password123#", 10);
  const [alice, bob, charlie] = await User.insertMany([
    { firstName: "Alice", lastName: "Wang", email: "alice@example.com", password: hashedPassword },
    { firstName: "Bob", lastName: "Chen", email: "bob@example.com", password: hashedPassword },
    { firstName: "Charlie", lastName: "Li", email: "charlie@example.com", password: hashedPassword },
  ]);
  console.log("👤 Created users");

  const userMap = { alice, bob, charlie };

  const project = await Project.create({
    name: "Project Atlas",
    description: "Internal developer platform to streamline engineering workflows, CI/CD, monitoring, and team collaboration.",
    createdBy: alice._id,
  });
  console.log("📁 Created project");

  await Member.insertMany([
    { project: project._id, user: alice._id, role: "manager" },
    { project: project._id, user: bob._id, role: "editor" },
    { project: project._id, user: charlie._id, role: "editor" },
  ]);
  console.log("👥 Created members");

  const tasks = await Task.insertMany(
    taskDefs.map((t) => ({
      project: project._id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      createdBy: userMap[t.lastEditedBy]._id,
      dueDate: t.dueDate,
    }))
  );
  console.log(`📝 Created ${tasks.length} tasks`);

  await TaskContent.insertMany(
    tasks.map((task, i) => ({
      task: task._id,
      content: doc(...taskDefs[i].paragraphs),
      plainText: taskDefs[i].paragraphs.join("\n\n"),
      contentType: "tiptap-json",
      lastEditedBy: userMap[taskDefs[i].lastEditedBy]._id,
      lastEditedAt: new Date(),
      embeddingStale: true,
      // embedding intentionally omitted — default: undefined
    }))
  );
  console.log(`📄 Created ${tasks.length} task contents (embedding: undefined, embeddingStale: true)`);

  console.log("\n🎉 RAG test seed complete!");
  console.log("----------------------------");
  console.log(`Database : ${RAG_TEST_DB}`);
  console.log(`Project  : Project Atlas`);
  console.log(`Tasks    : ${tasks.length} (each ~500 words, embeddingStale=true, no embedding)`);
  console.log("Test accounts (all use password: Password123#):");
  console.log("  alice@example.com");
  console.log("  bob@example.com");
  console.log("  charlie@example.com");
  console.log("----------------------------");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ RAG test seed failed:", err);
  process.exit(1);
});
