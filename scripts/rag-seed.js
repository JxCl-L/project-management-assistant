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
    status: "completed", priority: "high", dueDate: new Date("2026-06-10"), lastEditedBy: "alice",
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
    status: "inProgress", priority: "high", dueDate: new Date("2026-06-20"), lastEditedBy: "bob",
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
    status: "completed", priority: "high", dueDate: new Date("2026-06-15"), lastEditedBy: "charlie",
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
    status: "completed", priority: "high", dueDate: new Date("2026-06-18"), lastEditedBy: "bob",
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
    status: "completed", priority: "high", dueDate: new Date("2026-06-25"), lastEditedBy: "charlie",
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
    status: "completed", priority: "normal", dueDate: new Date("2026-06-12"), lastEditedBy: "alice",
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
    status: "completed", priority: "high", dueDate: new Date("2026-06-28"), lastEditedBy: "bob",
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
    status: "inProgress", priority: "normal", dueDate: new Date("2026-07-15"), lastEditedBy: "alice",
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
    status: "todo", priority: "high", dueDate: new Date("2026-07-20"), lastEditedBy: "alice",
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
    status: "inProgress", priority: "normal", dueDate: new Date("2026-07-31"), lastEditedBy: "alice",
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
    status: "completed", priority: "high", dueDate: new Date("2026-07-10"), lastEditedBy: "bob",
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
    status: "completed", priority: "normal", dueDate: new Date("2026-06-22"), lastEditedBy: "charlie",
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
    status: "completed", priority: "normal", dueDate: new Date("2026-06-14"), lastEditedBy: "alice",
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
    status: "todo", priority: "normal", dueDate: new Date("2026-08-05"), lastEditedBy: "alice",
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
    status: "completed", priority: "low", dueDate: new Date("2026-07-03"), lastEditedBy: "charlie",
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
    status: "inProgress", priority: "normal", dueDate: new Date("2026-08-01"), lastEditedBy: "alice",
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
    status: "inProgress", priority: "normal", dueDate: new Date("2026-09-01"), lastEditedBy: "bob",
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
    status: "completed", priority: "normal", dueDate: new Date("2026-06-11"), lastEditedBy: "charlie",
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
    status: "completed", priority: "low", dueDate: new Date("2026-07-22"), lastEditedBy: "bob",
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
    status: "completed", priority: "high", dueDate: new Date("2026-06-23"), lastEditedBy: "alice",
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
    status: "inProgress", priority: "high", dueDate: new Date("2026-08-31"), lastEditedBy: "alice",
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

// ─── 10 extra projects for UI / RAG smoke testing ───────────────────────────
// prettier-ignore
const extraProjectDefs = [
  // 1. Website Redesign
  {
    name: "Company Website Redesign",
    description: "Full redesign of the marketing website — new brand identity, mobile-first layout, and CMS migration.",
    createdBy: "alice",
    tasks: [
      {
        title: "Brand Identity & Style Guide Finalisation",
        description: "Lock in typography, colour palette, and logo usage rules before any dev work begins.",
        status: "completed", priority: "high", dueDate: new Date("2026-06-10"), lastEditedBy: "alice",
        paragraphs: [
          "The brand refresh project was approved by the CMO on September 1, 2026. Alice Wang is leading the design workstream with external agency PixelCraft. The style guide covers primary and secondary palettes, typeface stack (Inter for headings, Lato for body), icon library (Phosphor Icons), and motion principles.",
          "Colour palette finalised September 18, 2026: primary indigo #4F46E5, accent amber #F59E0B, neutral slate scale (50–900). All colours were tested for WCAG 2.1 AA contrast compliance using Figma's built-in accessibility plugin. Three combinations failed and were adjusted before sign-off.",
          "Logo variants delivered by PixelCraft on September 20, 2026: full wordmark (light and dark), icon-only mark, and horizontal lockup. SVG and PNG exports at 1×, 2×, and 3× are stored in the shared Figma library and the `assets/brand/` folder in the main repo.",
          "Typography scale: H1 48px / 1.1 line-height, H2 36px, H3 28px, H4 22px, body 16px / 1.6, small 14px / 1.5. All sizes use the 4px base grid. Priya Sharma reviewed the scale on October 2, 2026 and approved without changes.",
          "Action items for October 6: publish the style guide PDF to Notion; update Storybook tokens with the new palette; share the Figma library link with the development team. Alice confirmed all three items were completed by end of day October 5, 2026.",
        ],
      },
      {
        title: "Homepage Wireframes & Content Audit",
        description: "Produce low-fidelity wireframes for the new homepage and audit all existing copy for reuse vs. rewrite.",
        status: "completed", priority: "high", dueDate: new Date("2026-06-13"), lastEditedBy: "bob",
        paragraphs: [
          "A content audit of the existing website was conducted September 15–19, 2026 by Bob Chen. The site has 42 pages: 8 product pages, 6 case studies, 14 blog posts, and 14 utility pages (about, careers, legal). Of these, 22 pages will be migrated, 12 will be rewritten, and 8 will be retired.",
          "Homepage wireframes were produced in Figma by Priya Sharma and shared with the team on September 22, 2026. The new homepage structure: hero with headline + CTA, social proof bar (logos), three-column feature grid, product demo video embed, customer testimonials carousel, pricing summary section, and footer.",
          "Stakeholder review meeting held September 25, 2026. Attendees: Alice (lead), Bob (engineering), Maya Reyes (product), and the CMO. Key feedback: the hero section needs a secondary CTA for 'Book a demo'; the pricing section should show annual/monthly toggle. Wireframes revised and re-approved October 1, 2026.",
          "Copywriting brief sent to freelance copywriter Daniela Rossi on September 26, 2026. First draft of homepage copy due October 3, 2026. Daniela delivered on time; Bob reviewed and suggested two headline alternatives. Final copy locked October 5, 2026.",
          "SEO keyword mapping for the homepage was completed by Bob on September 28, 2026. Primary keyword: 'developer platform'. Secondary keywords: 'service registry tool', 'API management platform', 'internal developer portal'. Meta title and description templates were added to the Notion content brief.",
        ],
      },
      {
        title: "CMS Migration — Contentful Setup",
        description: "Migrate all blog posts and landing pages from the legacy WordPress CMS to Contentful.",
        status: "inProgress", priority: "normal", dueDate: new Date("2026-06-18"), lastEditedBy: "charlie",
        paragraphs: [
          "The decision to migrate from WordPress to Contentful was made on September 5, 2026. Drivers: WordPress maintenance overhead (monthly plugin updates, security patches), lack of a structured content model for the new page builder, and the need for a headless CMS that the Next.js frontend can query via API.",
          "Contentful space provisioned September 10, 2026. Content models defined: Page (slug, title, SEO fields, body rich text), BlogPost (title, author, publishedAt, tags, featuredImage, body), CaseStudy (title, customer, industry, outcomes, body), and Component (name, type, fields JSONB for reusable sections).",
          "Charlie Li built the WordPress export script on September 17, 2026. It pulls all posts via the WordPress REST API and transforms them into Contentful's management API format. 14 blog posts were migrated on September 19, 2026. Three posts had broken image references that were manually fixed.",
          "Landing page migration is in progress as of October 1, 2026. 6 of 8 product pages have been migrated. The remaining 2 (Integrations and Pricing) are blocked on final copy approval. Charlie expects to complete them by October 7, 2026.",
          "The Next.js frontend is configured to query Contentful using the Contentful SDK v10 at build time (static generation) and on-demand (ISR with 300-second revalidation). Preview mode is set up for draft content using a Contentful preview API key stored in Vercel environment variables.",
        ],
      },
      {
        title: "Performance Optimisation — Core Web Vitals",
        description: "Achieve LCP < 2.5s, CLS < 0.1, INP < 200ms on all key pages before launch.",
        status: "inProgress", priority: "high", dueDate: new Date("2026-06-24"), lastEditedBy: "alice",
        paragraphs: [
          "A baseline Lighthouse audit was run October 1, 2026 against the staging build of the new website. Results: LCP 3.8s (poor), CLS 0.24 (poor), INP 180ms (needs improvement), TBT 420ms. All four metrics need improvement before the October 15 launch date.",
          "LCP root cause: the hero section background image (1.2MB WebP) is not preloaded and the font files are not preloaded. Fix: add `<link rel='preload'>` for the hero image and the Inter wax font files; compress the hero image to under 200KB using Squoosh. Alice applied the fix October 3 — LCP improved to 2.1s in testing.",
          "CLS root cause: the testimonials carousel shifts layout on mount because image dimensions are not reserved. Fix: add explicit `width` and `height` attributes to all `<img>` tags and use `aspect-ratio` CSS on the carousel wrapper. Charlie applied the fix October 4 — CLS improved to 0.04.",
          "INP: the pricing toggle component triggers a full re-render of the pricing table on change. Bob refactored the component to use `useMemo` and `useTransition` on October 5, 2026. INP reduced to 85ms in Chrome DevTools profile.",
          "TBT: the main JS bundle is 780KB (uncompressed). Bob split the bundle using Next.js `dynamic()` imports for the video embed and the testimonials carousel. Bundle reduced to 310KB for the initial load. TBT reduced to 140ms. Final Lighthouse re-run scheduled October 8, 2026.",
        ],
      },
      {
        title: "Launch Checklist & Go-Live Plan",
        description: "Define and verify every pre-launch item — redirects, DNS cut-over, analytics, cookie consent.",
        status: "todo", priority: "high", dueDate: new Date("2026-06-30"), lastEditedBy: "alice",
        paragraphs: [
          "Launch is scheduled for October 15, 2026 at 10:00 AM PST. The go-live plan was drafted by Alice Wang on October 2, 2026. It covers DNS cut-over, redirect mapping, analytics setup, cookie consent, and post-launch monitoring. All items have a named owner and a hard deadline of October 9 for pre-launch verification.",
          "Redirect mapping: 18 old URLs need 301 redirects to new equivalents. Bob built the redirect list in a CSV and implemented them as Next.js `redirects` config on September 30, 2026. Tested all 18 redirects manually on staging October 3 — all pass. One additional redirect for `/pricing-old` was added October 4.",
          "Analytics: Google Analytics 4 and Plausible Analytics will both run during the first month for comparison. GA4 measurement ID added to the Next.js layout on October 2. Plausible script added October 3. Both are firing correctly on staging as verified by the GA4 DebugView and Plausible live dashboard.",
          "Cookie consent: implemented using the `cookieconsent` library v3. Consent banner appears on first visit for EU users (GeoIP-based). Functional cookies (Plausible) load without consent; analytics cookies (GA4) require explicit acceptance. Legal reviewed the banner text on October 4, 2026 and approved.",
          "Post-launch monitoring plan: Sentry error tracking is already in place. A Grafana dashboard will monitor server-side rendering error rates, Vercel build success rates, and Contentful API response times. Alice will be on-call for the first 48 hours post-launch (October 15–16). A retro is scheduled October 17, 2026.",
        ],
      },
    ],
  },

  // 2. User Analysis
  {
    name: "Q3 User Behaviour Analysis",
    description: "Deep-dive analysis of user sessions, funnel drop-offs, and feature engagement metrics to inform Q4 product decisions.",
    createdBy: "bob",
    tasks: [
      {
        title: "Session Recording Review — Onboarding Funnel",
        description: "Watch 50 Hotjar session recordings of new users going through onboarding. Log friction points.",
        status: "completed", priority: "high", dueDate: new Date("2026-07-02"), lastEditedBy: "bob",
        paragraphs: [
          "Bob Chen reviewed 50 Hotjar session recordings between September 22 and September 26, 2026. Recordings were filtered to users who signed up in September 2026 and had at least one session longer than 2 minutes. The onboarding funnel has four steps: account creation, workspace setup, first project creation, and first task creation.",
          "Step drop-off rates observed in the recordings: account creation → workspace setup: 94% completion (3 drops). Workspace setup → first project: 81% completion (9 drops). First project → first task: 67% completion (16 drops). The biggest drop occurs between project creation and task creation.",
          "Most common friction point at the project-to-task drop: users do not realise they need to click the '+' button inside the project view to create a task. 11 of the 16 drop-off recordings show the user hovering over the empty project state for several seconds before leaving. The empty state illustration does not include a visible CTA.",
          "Other friction points noted: 6 users tried to drag-and-drop a file into the workspace setup step expecting file import; the step doesn't support this. 4 users misread the 'workspace slug' field as 'username'. 3 users abandoned because the email verification step was not obvious — the verification email landed in spam.",
          "Recommendations logged in Notion on September 27, 2026: (1) add a prominent 'Create your first task' CTA in the empty project state; (2) rename 'workspace slug' to 'workspace URL'; (3) add a resend-verification-email button visible immediately after signup. Shared with the product team for Q4 prioritisation.",
        ],
      },
      {
        title: "SQL Funnel Analysis — Activation Rate",
        description: "Write SQL queries against the events warehouse to compute weekly activation rates for the past 12 weeks.",
        status: "completed", priority: "high", dueDate: new Date("2026-07-06"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie Li wrote and ran the activation rate analysis using BigQuery on September 28–30, 2026. Activation is defined as: a user who signed up and created at least one task within 7 days. The analysis covers weeks W36–W47 2026 (September 1 – November 23) with data through September 28.",
          "Activation rates by week: W36 42%, W37 45%, W38 43%, W39 41%, W40 38%, W41 36%, W42 39%, W43 44%, W44 46%, W45 48%, W46 51%, W47 49% (partial week). The dip in W40–W41 coincides with a known email deliverability issue (September 28 – October 5) where verification emails had a 30% delivery failure rate due to a misconfigured SPF record.",
          "Cohort breakdown: users who came from paid search activated at 54% (n=312); users from organic search at 41% (n=687); users from direct/referral at 62% (n=198). Paid search users have the highest activation rate, suggesting stronger intent. Organic users are the largest cohort and have the most room for improvement.",
          "Time-to-first-task distribution (among activated users): median 18 minutes, P75 2.1 hours, P90 11 hours, P99 6 days. 72% of users who activate do so within the first hour of signup. This suggests the onboarding window is short — interventions should trigger within 15–30 minutes of signup.",
          "The analysis SQL files are saved in `analytics/queries/activation_rate_q3_2026.sql`. Charlie documented methodology notes in Notion. Results were presented to the product team in the weekly data review on October 1, 2026. Alice Wang requested a breakdown by plan tier for the October 8 follow-up meeting.",
        ],
      },
      {
        title: "Feature Engagement Heatmap Report",
        description: "Analyse Mixpanel event data to identify the top 10 most and least used features across all active workspaces.",
        status: "completed", priority: "normal", dueDate: new Date("2026-07-10"), lastEditedBy: "bob",
        paragraphs: [
          "Bob Chen pulled feature engagement data from Mixpanel on September 30, 2026. The analysis covers all workspaces with at least one active user in the past 30 days (n=1,240 workspaces). Events tracked include: task_created, task_completed, task_comment_added, project_created, member_invited, file_attached, due_date_set, label_added, search_used, and analytics_viewed.",
          "Top 5 most used features (median events per workspace per week): task_created 34, task_completed 28, due_date_set 21, member_invited 9, task_comment_added 7. The core task lifecycle is clearly well-used.",
          "Bottom 5 least used features: analytics_viewed 0.3 events/week, file_attached 0.8, search_used 1.2, label_added 1.9, project_created 2.1. Analytics and file attachment are significantly under-used relative to their development cost.",
          "Segment analysis: Pro tier workspaces use search_used at 4.1 events/week vs. 0.8 for Standard. This suggests Pro users are managing larger volumes of tasks where search is necessary. The analytics dashboard (analytics_viewed) is barely used even in Pro tier (0.5 events/week), raising questions about discoverability.",
          "Recommendations: (1) surface the analytics dashboard in the main navigation instead of burying it in settings; (2) add a search shortcut hint (Cmd+K) in the task list empty state; (3) consider deprioritising file attachment in Q4 given low usage. Report shared with product on October 2, 2026.",
        ],
      },
      {
        title: "NPS Survey Design & Distribution",
        description: "Design the Q3 NPS survey, set up distribution in Customer.io, and collect at least 200 responses.",
        status: "inProgress", priority: "normal", dueDate: new Date("2026-07-14"), lastEditedBy: "alice",
        paragraphs: [
          "The Q3 NPS survey was designed by Alice Wang on September 29, 2026. The survey consists of the standard NPS question ('How likely are you to recommend Atlas to a colleague?', 0–10 scale) plus three follow-up questions: (1) What's the single most valuable thing Atlas does for you? (open text); (2) What's the one thing that would most improve your experience? (open text); (3) Which feature do you use most? (multiple choice, 8 options).",
          "Survey built in Typeform and linked to Customer.io via webhook on October 1, 2026. The distribution campaign targets active users (at least one login in the past 30 days) with more than 30 days of account age. Estimated audience: 3,400 users. Send time: October 3, 2026 at 10:00 AM in the user's local time zone.",
          "Email subject line A/B test: variant A 'Quick question about your Atlas experience' (control), variant B 'Help us make Atlas better — 2 minutes' (treatment). Split 50/50. Open rate after 24 hours: variant A 31%, variant B 38%. Variant B declared winner on October 4 and used for any follow-up reminders.",
          "Response count as of October 7, 2026: 187 responses (5.5% response rate). Target is 200 by October 8. A reminder email was sent October 6 to non-openers. 42 additional responses came in within 6 hours of the reminder. Target should be exceeded by end of day October 7.",
          "Preliminary NPS score (n=187): 61 promoters (33%), 92 passives (49%), 34 detractors (18%). NPS = 33 − 18 = 15. This is below the Q2 score of 22 and the industry benchmark of 32. Alice will present the full analysis including verbatim themes in the October 10 product review.",
        ],
      },
      {
        title: "Churn Analysis — September 2026 Cohort",
        description: "Identify users who churned in September and run exit interviews with at least 5.",
        status: "todo", priority: "high", dueDate: new Date("2026-07-18"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie Li will pull the September 2026 churn data from the billing system on October 6, 2026. Churn is defined as: subscription cancelled or downgraded to free tier in September 2026. Preliminary count from Stripe data: 34 churned accounts (28 Standard, 6 Pro). Monthly churn rate: 2.8% for Standard, 1.1% for Pro.",
          "Charlie will cross-reference churned accounts with the last Mixpanel session date, last feature used, account age, and number of team members. This profile data will help segment churn reasons and prioritise interview candidates.",
          "Exit interview outreach plan: email all 34 churned accounts with a Calendly link offering a $25 Amazon gift card for a 20-minute interview. Target: 5 completed interviews by October 9. Alice will conduct the interviews using a standardised guide covering: primary reason for churning, alternatives considered, likelihood of returning, and key product gaps.",
          "Interview guide drafted by Alice on October 2, 2026. Key questions: 'What was the main reason you decided to cancel?', 'Did you consider any alternatives before cancelling?', 'Was there a specific moment or experience that made you decide to leave?', 'What would need to change for you to reconsider Atlas?'.",
          "Deliverable: a churn analysis report combining the quantitative profile data and the qualitative interview themes. Due October 15, 2026. The report will feed directly into the Q4 retention strategy session scheduled October 17 with the CEO, CMO, and product team.",
        ],
      },
    ],
  },

  // 3. Learning Notes — React / TypeScript
  {
    name: "React & TypeScript Learning Notes",
    description: "Personal study notes and code experiments while learning advanced React patterns and TypeScript for the frontend re-architecture project.",
    createdBy: "charlie",
    tasks: [
      {
        title: "Notes: React Server Components Deep Dive",
        description: "Study RSC model, streaming, and Suspense boundaries from the official docs and Next.js App Router source.",
        status: "completed", priority: "normal", dueDate: new Date("2026-07-21"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie Li started studying React Server Components (RSC) on September 20, 2026. Primary resources: the React 19 official docs, the Next.js App Router documentation, and the RSC RFC published by the React team. Study sessions: 1 hour per day, Monday to Friday.",
          "Key concepts understood by September 25: RSCs run only on the server and have zero bundle impact on the client. They can be async and can directly await database calls or file reads. Client Components are opted in with the 'use client' directive. The boundary between server and client must be explicit — you cannot import a Client Component into a Server Component without marking the boundary.",
          "Streaming and Suspense: Next.js App Router supports streaming HTML via React's Suspense. Wrapping a slow component in `<Suspense fallback={<Skeleton />}>` allows the initial HTML to be sent immediately and the deferred content to stream in as a separate chunk. Charlie implemented a demo with a slow database fetch (simulated 2-second delay) on September 26, confirming streaming works in the dev server.",
          "Gotchas noted during study: (1) `useState`, `useEffect`, and event handlers cannot be used in Server Components — must split into a Client Component. (2) Server Components cannot accept non-serialisable props (functions, class instances). (3) `'use client'` marks the entire subtree as client-rendered — keep boundaries as deep in the tree as possible to maximise server rendering.",
          "Experiment: rebuilt the Atlas task list page as an RSC on September 28, 2026. The task list now renders on the server with direct MongoDB access, no API round-trip. Time to first byte (TTFB) improved from 420ms to 95ms on the local dev server. Code is in the `experiments/rsc-task-list` branch.",
        ],
      },
      {
        title: "Notes: TypeScript Generics & Conditional Types",
        description: "Work through TypeScript handbook chapters on generics, mapped types, template literals, and conditional types with exercises.",
        status: "completed", priority: "normal", dueDate: new Date("2026-07-25"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie studied TypeScript generics and advanced type system features September 21–27, 2026. Resources: TypeScript 5.6 handbook, Matt Pocock's Total TypeScript course (chapters 6–9), and the TypeScript playground for experiments.",
          "Generics summary: generics allow writing type-safe functions and classes that work across multiple types. Key syntax: `function identity<T>(arg: T): T`. Constraints: `<T extends object>` restricts T to object types. Default types: `<T = string>` sets a default if T is not inferred.",
          "Conditional types: `T extends U ? X : Y`. Useful for type inference utilities. Example: `type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T` — this recursively unwraps nested Promises and is now built into TypeScript 4.5+. Charlie wrote 8 conditional type exercises, all passing type checks.",
          "Mapped types: `{ [K in keyof T]: T[K] }` iterates over all keys of T. Template literal types: `type EventName<T extends string> = \`on${Capitalize<T>}\`` produces `'onClick'` from `'click'`. Charlie implemented a type-safe event emitter using both patterns on September 25, 2026.",
          "Practical application: refactored the Atlas API client types using mapped types to auto-generate the request/response type pairs from the OpenAPI schema types. Eliminated 120 lines of manually maintained type definitions. PR #301 opened September 27, reviewed and merged by Alice October 1.",
        ],
      },
      {
        title: "Notes: Zustand vs Redux Toolkit — State Management Comparison",
        description: "Evaluate Zustand and Redux Toolkit for global state management in the new dashboard frontend. Document tradeoffs.",
        status: "completed", priority: "normal", dueDate: new Date("2026-07-28"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie conducted a state management evaluation September 22–28, 2026. The Atlas dashboard currently uses React Context + useReducer for global state, which causes unnecessary re-renders in the project list and task board views. The evaluation compared Zustand 4.x and Redux Toolkit 2.x.",
          "Zustand evaluation: setup is minimal — a store is created with `create()` and selectors are defined inline. No boilerplate outside the store file. Bundle size: 3.4KB gzipped. Charlie built a prototype task board store in 45 minutes. The reactive slicing via selector functions prevents unnecessary re-renders automatically.",
          "Redux Toolkit evaluation: requires more setup (store, slices, selectors) but provides more structure for large teams. RTK Query is a strong differentiator — it handles data fetching, caching, and cache invalidation out of the box. Bundle size: 11KB gzipped for RTK alone, plus 2KB for RTK Query. Charlie spent 3 hours building an equivalent prototype.",
          "Decision: Charlie recommends Zustand for the Atlas dashboard. The reasoning: the team is small (4 engineers), the existing data-fetching layer is already React Query (which provides caching), and Zustand's low boilerplate reduces cognitive overhead. RTK Query would be worth reconsidering if the team grows beyond 8 engineers.",
          "Recommendation document shared with Alice and Bob on September 29, 2026. Alice agreed with the recommendation. Zustand will be adopted in the Q4 frontend re-architecture sprint. Charlie will write the initial store setup and migration guide by October 10, 2026.",
        ],
      },
      {
        title: "Notes: Testing — Vitest & React Testing Library",
        description: "Set up Vitest as the test runner and learn RTL query priorities and async testing patterns.",
        status: "inProgress", priority: "normal", dueDate: new Date("2026-07-31"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie set up Vitest 2.x as the test runner on October 1, 2026. The existing Jest setup was removed (Jest required Babel transpilation which slowed the test suite by ~40%). Vitest uses the same Vite config as the dev server — no additional transpilation needed. Test run time for 120 tests: 4.2s (down from 7.1s with Jest).",
          "React Testing Library: Charlie studied the RTL documentation and Kent C. Dodds's testing articles September 23–27. Key principle: test behaviour, not implementation. Query priority: `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByTestId`. Using `getByTestId` is a last resort — if you need it, the component likely lacks accessible semantics.",
          "Async testing patterns: `await screen.findByText('...')` waits for elements to appear (uses polling with a default timeout of 1000ms). `waitFor(() => ...)` waits for an assertion to pass. `act()` wraps state updates that happen outside React's rendering cycle. Charlie wrote 15 async tests for the task creation flow using these patterns.",
          "Mocking: Vitest uses `vi.fn()` for function mocks and `vi.mock('module')` for module mocks. Charlie mocked the Axios API client using `vi.mock` and confirmed that the task list component renders error state when the API returns a 500. Pattern documented in `docs/testing-guide.md`.",
          "Still to complete by October 8: (1) set up code coverage reporting with Istanbul (Vitest has built-in support via `--coverage`); (2) configure a coverage threshold (target: 80% lines); (3) write tests for the project settings page which currently has 0% coverage.",
        ],
      },
      {
        title: "Notes: Performance — useMemo, useCallback & React Profiler",
        description: "Profile the task board render performance and apply memoisation where it yields measurable improvement.",
        status: "todo", priority: "low", dueDate: new Date("2026-08-03"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie plans to profile the Atlas task board on October 6, 2026 using the React DevTools Profiler. The task board currently re-renders all task cards when any single task is updated, which causes visible jank when a board has more than 50 tasks. The goal is to achieve a consistent 60fps interaction response.",
          "Profiling plan: (1) open the Profiler tab in React DevTools; (2) click 'Record'; (3) drag a task card to a new column; (4) stop recording; (5) inspect the flame graph for components with render times over 16ms. Expected culprits: the task card list container (re-renders all N cards) and the column header component (unnecessary re-render on drag).",
          "Memoisation strategy: wrap stable child components in `React.memo()` to skip re-renders when props haven't changed. Use `useMemo` to memoize expensive derived values (e.g., filtered/sorted task lists). Use `useCallback` to stabilize function references passed as props so `React.memo` children don't re-render unnecessarily.",
          "Pitfall awareness (from study notes): `useMemo` and `useCallback` are not free — they add memory overhead and the dependency comparison cost. Do not wrap everything — profile first and only memoize where renders are actually expensive and frequent. The React team warns against premature memoization.",
          "Expected deliverable: a before/after comparison of React Profiler renders when moving a task on a board with 100 tasks. Target: reduce the number of components re-rendering from ~100 to < 10 on a single drag action. Results will be documented in this task note and shared with the team.",
        ],
      },
    ],
  },

  // 4. Cooking Notes
  {
    name: "Weekly Meal Prep & Recipe Notes",
    description: "Personal cooking journal — weekly meal prep plans, recipe experiments, nutritional notes, and grocery lists.",
    createdBy: "alice",
    tasks: [
      {
        title: "Weekly Meal Plan — Week of Oct 6",
        description: "Plan 5 lunches and 5 dinners for the week, optimised for protein, prep time under 2 hours Sunday.",
        status: "completed", priority: "normal", dueDate: new Date("2026-08-05"), lastEditedBy: "alice",
        paragraphs: [
          "Alice Wang planned the meal prep for the week of October 6, 2026 on Sunday October 4. Theme for the week: Mediterranean-inspired meals with a focus on legumes and lean protein. Total estimated prep time: 1 hour 45 minutes. Grocery budget: $80.",
          "Lunches (Mon–Fri): Monday – Greek chicken bowls (grilled chicken thighs, cucumber, cherry tomatoes, olives, tzatziki, pita). Tuesday – Lentil soup (red lentils, cumin, coriander, lemon, spinach). Wednesday – Leftover lentil soup. Thursday – Falafel wraps with hummus and pickled red onion. Friday – Tuna niçoise salad.",
          "Dinners (Mon–Fri): Monday – Baked salmon with roasted vegetables (zucchini, bell pepper, red onion) and couscous. Tuesday – Shakshuka with crusty bread. Wednesday – Chickpea and sweet potato curry over brown rice. Thursday – Leftover curry. Friday – Homemade pizza (wholemeal dough, tomato sauce, mozzarella, rocket, prosciutto).",
          "Meal prep completed Sunday October 4, 1:30 PM – 3:15 PM. Prepped: marinated chicken thighs (raw, refrigerated), cooked a full pot of red lentil soup, roasted the vegetables for Monday dinner, made a batch of tzatziki, and cooked 2 cups of brown rice. Total actual prep time: 1 hour 45 minutes, on target.",
          "Nutritional targets met: estimated 140g protein per day (target ≥ 130g), 45g fibre per day, calorie range 2,100–2,300. Macros tracked in MyFitnessPal. One substitution made: planned falafel from scratch but used store-bought to save 30 minutes — note for next week to make falafel ahead.",
        ],
      },
      {
        title: "Recipe Experiment: Sourdough Focaccia",
        description: "Test a new overnight sourdough focaccia recipe. Document hydration, fermentation time, and bake results.",
        status: "completed", priority: "low", dueDate: new Date("2026-08-08"), lastEditedBy: "alice",
        paragraphs: [
          "Alice attempted a sourdough focaccia on October 3–4, 2026 using a recipe adapted from Joshua Weissman's high-hydration focaccia. The starter (100% hydration, maintained for 8 months) was fed 12 hours before mixing. Starter activity test: doubled within 4 hours, passed the float test.",
          "Recipe: 500g bread flour (King Arthur), 450g water (90% hydration), 100g active starter (20% inoculation), 10g salt, 50g olive oil. Mixed Friday October 3 at 8:00 PM. Autolyse 30 minutes, then added starter and salt. Four sets of stretch-and-folds at 30-minute intervals (8:30–10:00 PM). Bulk fermented at room temperature (68°F) until 1.5× volume — reached at 7:00 AM Saturday.",
          "Cold retard: placed in the refrigerator at 7:00 AM Saturday October 4 for 2 hours to make shaping easier. Transferred to an oiled 13×9 pan at 9:00 AM, drizzled with 30ml olive oil, dimpled, and topped with flaked sea salt, rosemary, and Kalamata olives. Proofed at room temperature 1 hour.",
          "Bake: preheated oven to 450°F (232°C) with a baking steel on the middle rack for 45 minutes. Baked 22 minutes — golden brown, internal temperature 210°F. Result: excellent open crumb, crispy base, flavourful crust. The overnight cold retard improved flavour complexity compared to same-day bake.",
          "Notes for next bake: (1) increase salt to 11g — slightly underseasoned; (2) try a longer cold retard (18–24 hours) for more sour flavour; (3) consider adding sun-dried tomatoes and caramelised onion as toppings; (4) the 90% hydration was manageable — could push to 95% next attempt for even more open crumb.",
        ],
      },
      {
        title: "Recipe Experiment: Thai Green Curry from Scratch",
        description: "Make green curry paste from scratch rather than using store-bought. Compare flavour, time cost, and effort.",
        status: "completed", priority: "low", dueDate: new Date("2026-08-11"), lastEditedBy: "alice",
        paragraphs: [
          "Alice cooked Thai green curry from scratch on October 5, 2026. The goal was to compare a homemade green curry paste with the Mae Ploy brand paste she normally uses. Ingredients for paste: 10 green bird's eye chillies, 4 green shallots, 6 garlic cloves, 1 stalk lemongrass, 2cm galangal, 4 kaffir lime leaves, 1 tsp shrimp paste, 1 tsp white pepper, 1 tsp coriander seeds, 1/2 tsp cumin seeds, 1 tbsp fish sauce, 30g fresh coriander root and stems.",
          "Paste preparation: dry-toasted coriander and cumin seeds, then ground in a spice grinder. Pounded remaining ingredients in a mortar and pestle (about 15 minutes) until a fine paste formed. The lemongrass and galangal were the hardest to break down — would use a food processor next time for the coarser fibrous ingredients before finishing in the mortar.",
          "Curry: heated 2 tbsp coconut oil, fried the paste 3 minutes until fragrant. Added 400ml coconut cream, brought to a simmer. Added 400g sliced chicken thigh, 1 cup chicken stock, 2 tbsp fish sauce, 1 tbsp palm sugar, 4 kaffir lime leaves. Simmered 15 minutes. Added 1 cup Thai eggplant, 1 cup snap peas, and a large handful of Thai basil at the end. Served with jasmine rice.",
          "Taste comparison: the homemade paste produced noticeably brighter, more complex flavour — the fresh galangal and lemongrass aromatics were much stronger than Mae Ploy. The heat level was similar but the chilli flavour was fresher. The homemade version also had a more vivid green colour.",
          "Time cost comparison: homemade paste took 25 minutes of prep vs. 2 minutes to open the Mae Ploy tub. Verdict: worth making from scratch for a dinner party or weekend cooking, but Mae Ploy is fine for weeknight speed. Alice will make a triple batch of paste and freeze it in ice cube trays for future use.",
        ],
      },
      {
        title: "Grocery Budget Review — September 2026",
        description: "Review grocery spending for September 2026 vs budget. Identify overspend categories and adjust October plan.",
        status: "completed", priority: "low", dueDate: new Date("2026-08-14"), lastEditedBy: "alice",
        paragraphs: [
          "Alice reviewed her September 2026 grocery spending on October 5, 2026 using receipts logged in a Numbers spreadsheet. Total September spend: $347. Budget was $300. Overspend: $47 (15.7%). The overspend was concentrated in two categories: specialty ingredients and eating-out-adjacent (ready-made items from Whole Foods hot bar).",
          "Category breakdown: fresh produce $89 (budget $80, over $9); meat and fish $102 (budget $90, over $12); dairy and eggs $38 (budget $35, over $3); pantry staples $41 (budget $40, over $1); specialty ingredients (imported spices, artisan cheese, tahini) $52 (budget $30, over $22); ready-made items $25 (budget $25, on budget).",
          "Specialty ingredient overspend analysis: the $22 overspend came from purchasing imported tahini ($8.50, could use a US brand at $5), Spanish smoked paprika ($6.50, could use standard paprika for most recipes), and a wheel of imported Pecorino Romano ($12 vs. $7 for the domestic equivalent). Total avoidable overspend: ~$14.",
          "Adjustments for October: (1) set a $10 cap per specialty item trip; (2) plan meals around what's on sale at the weekly supermarket circular before writing the shopping list; (3) batch-cook the week's protein on Sunday to reduce temptation for Whole Foods hot bar purchases; (4) use the US-brand tahini for hummus — Alice tested it and found it acceptable.",
          "October budget: $310 (a modest $10 increase to account for seasonal produce price changes in autumn). Alice will log receipts weekly rather than monthly to catch overspend earlier. A mid-month check-in is scheduled October 15.",
        ],
      },
      {
        title: "Nutrition Goals: Q4 2026 Check-in",
        description: "Review nutrition goals set in July and adjust targets for Q4 based on blood panel results and training load.",
        status: "todo", priority: "normal", dueDate: new Date("2026-08-17"), lastEditedBy: "alice",
        paragraphs: [
          "Alice has a GP appointment on October 9, 2026 to review a blood panel taken September 25. The panel covers: full blood count, comprehensive metabolic panel, lipid panel, vitamin D, vitamin B12, ferritin, and HbA1c. Results are expected to be available at the appointment. Alice will use the results to adjust Q4 nutrition targets.",
          "Q3 nutrition goals (set July 1, 2026): protein ≥ 130g/day (tracked via MyFitnessPal), fibre ≥ 40g/day, saturated fat ≤ 20g/day, omega-3 supplementation 2g EPA+DHA daily (Nordic Naturals Ultimate Omega). Alcohol: ≤ 2 units per week.",
          "Q3 adherence summary (self-reported, 13 weeks): protein target met 10 of 13 weeks. The three misses were during travel weeks (August and September conferences). Fibre target met every week — Alice attributes this to the consistent legume-heavy meal plan. Omega-3 supplementation: consistent. Alcohol: exceeded target 2 weeks (both during work events).",
          "Known areas of concern going into the blood panel: Alice has historically had low-normal vitamin D (October bloods last year: 28 ng/mL, borderline insufficient). She has been supplementing with vitamin D3 5000 IU daily since January 2026. Expects the level to have improved but wants confirmation. Ferritin was low in the July panel (18 ng/mL, reference range 12–150); has been taking ferrous sulfate 65mg elemental iron every other day since.",
          "Post-appointment plan: update the Q4 meal plan targets based on blood panel results. If vitamin D is still low, increase supplementation to 7000 IU with a 3-month recheck. If ferritin has improved above 40, can reduce iron supplementation frequency. Will update this note after the October 9 appointment.",
        ],
      },
    ],
  },

  // 5. Workout Notes
  {
    name: "Strength & Conditioning Training Log",
    description: "Personal training log tracking workouts, progressive overload, mobility work, and race/event preparation.",
    createdBy: "bob",
    tasks: [
      {
        title: "Workout Log: Deadlift Progression — Week 40",
        description: "Log Week 40 deadlift sessions and assess readiness to attempt a 1RM test in Week 43.",
        status: "completed", priority: "normal", dueDate: new Date("2026-08-19"), lastEditedBy: "bob",
        paragraphs: [
          "Bob Chen is following a 16-week powerlifting peaking programme (started June 2026). Week 40 is the final week of the volume block before a 3-week intensity block leading to a mock meet in Week 43. Current deadlift training max: 180kg. Programme uses the percentage-based GZCL methodology.",
          "Monday October 5 session — Deadlift: 4×4 at 82% (147.6kg, rounded to 147.5kg). Bar speed was excellent on all reps. RPE estimated at 7.5 for the last set. Grip with mixed grip (left supinated, right pronated). 4-minute rest between sets. No belt used for volume work this week.",
          "Thursday October 3 session — Romanian Deadlift (accessory): 3×8 at 100kg, slow 3-second eccentric. No belt. Focused on maintaining a neutral spine and hinging from the hip. Hamstring DOMS significant the following day — noted as a sign of appropriate accessory volume.",
          "Readiness assessment for Week 43 1RM test: bar speed and RPE trends over the past 4 weeks suggest the training max is set conservatively. Based on Epley formula projections from the 4×4 sets, estimated 1RM is 190–195kg. Bob plans to attempt 185kg as an opener, 190kg as a second attempt, and 195kg as a third attempt if the second is clean.",
          "Recovery notes: sleep average 7.2 hours/night this week (target 7.5+). Calorie intake on training days: 3,100kcal (maintenance estimated at 2,900 + 200 surplus). Protein: 185g/day. Body weight: 87.4kg (target weight class: 93kg). No injuries or pain to report. HRV reading Monday morning: 68ms (baseline 65ms) — recovered well from the previous week.",
        ],
      },
      {
        title: "Mobility Routine: Hip Flexor & Thoracic Spine",
        description: "Document the daily 15-minute mobility routine added to address hip flexor tightness limiting squat depth.",
        status: "completed", priority: "low", dueDate: new Date("2026-08-22"), lastEditedBy: "bob",
        paragraphs: [
          "Bob added a daily 15-minute mobility routine on September 15, 2026 after a physiotherapy assessment identified tight hip flexors (left > right) and limited thoracic spine rotation as the two factors limiting squat depth below parallel. The routine was prescribed by physiotherapist Dr. Sarah Kim.",
          "Hip flexor routine (8 minutes): (1) Half-kneeling hip flexor stretch — 90 seconds each side, posterior pelvic tilt, avoid lumbar extension. (2) Couch stretch — 60 seconds each side, against a wall. (3) 90/90 hip rotation — 10 controlled rotations each direction. (4) Hip CARS (controlled articular rotations) — 5 slow full-range circles each direction.",
          "Thoracic spine routine (7 minutes): (1) Foam roller thoracic extension — 10 reps over each vertebra level from T4 to T10, 2-3 second hold at end range. (2) Thread-the-needle rotation — 8 reps each side, slow. (3) Seated rotation with dowel rod — 10 reps each side. (4) Wall slide — 10 reps, maintaining contact between arms and wall throughout.",
          "Progress after 3 weeks: Bob measured squat depth with a video assessment on October 5. Previous depth: femur at parallel with heels elevated 1cm. Current depth: 2cm below parallel with flat feet. Left hip flexor tightness has improved — couch stretch discomfort reduced from 7/10 to 3/10 on a pain scale. Thoracic rotation: improved from an estimated 30° to 42° based on a phone app measurement.",
          "Dr. Kim review scheduled October 9, 2026. Bob will bring the video comparisons and mobility test results to the appointment. Target by the end of Week 43: full squat depth below parallel with flat feet under load. The routine will be maintained throughout the peaking block and reassessed in November.",
        ],
      },
      {
        title: "Half Marathon Plan: Race Week Preparation",
        description: "Finalise the taper plan and race-day logistics for the October 18 half marathon.",
        status: "inProgress", priority: "high", dueDate: new Date("2026-08-25"), lastEditedBy: "bob",
        paragraphs: [
          "Bob is racing the Golden Gate Half Marathon on October 18, 2026. This is his second half marathon; his PB from April 2026 is 1:52:14. Goal for October 18: sub-1:50:00 (average pace 5:12/km). The 16-week training programme peaked in Week 38 (September 21) with a 21km long run at 5:30/km.",
          "Taper plan: Week 39 reduced volume by 20% (total 45km). Week 40 (current, October 6 race week) reduced volume by 40% (total 30km planned). Runs this week: Monday easy 8km at 5:45/km ✓, Wednesday race-pace session 6km at 5:12/km (scheduled October 7), Friday shakeout 4km easy (scheduled October 9), Saturday rest, Sunday race.",
          "Race-day logistics: race starts 8:00 AM at the Ferry Building, San Francisco. Packet pickup is Saturday October 17, 1:00–6:00 PM at the Embarcadero. Parking: Bob will take BART to Embarcadero station. Bag check available at the start line. Weather forecast as of October 6: 14°C / 57°F, partly cloudy, wind 12km/h — ideal conditions.",
          "Race-day nutrition plan: breakfast at 5:30 AM (oats, banana, peanut butter, coffee). No solid food after 6:15 AM. Race nutrition: one SiS GO Isotonic gel at km 7, one at km 14. Carried in a Nathan running vest waistband. Hydration: sip from every aid station (stations at km 2, 5, 8, 11, 14, 17, 20). Electrolytes: one Precision Hydration 1000mg sachet in 500ml water pre-race.",
          "Gear: Nike Vaporfly 3 (race shoes, 65km on them — still in the sweet spot). Brooks Sherpa 7\" shorts. On Running Lightweight T-shirt. Garmin Forerunner 965 for pacing. Race bib: #4872. Bob's wife will meet him at km 10 (Sausalito crossing) and at the finish line.",
        ],
      },
      {
        title: "Gym Log: Upper Body Push — Week 40",
        description: "Log the bench press and overhead press sessions for the week and assess shoulder stability.",
        status: "completed", priority: "normal", dueDate: new Date("2026-08-28"), lastEditedBy: "bob",
        paragraphs: [
          "Bob's upper body push sessions for Week 40: Tuesday October 6 (bench press day) and Thursday October 8 (overhead press day). Training notes below.",
          "Tuesday October 6 — Bench Press: 4×4 at 80% training max (100kg). RPE 8 on the last set — harder than expected, possibly due to cumulative fatigue. All reps completed with a 2-second pause at the chest. Secondary: Incline dumbbell press 3×10 at 30kg, close-grip bench 3×8 at 70kg, cable flyes 3×15 at 15kg.",
          "Thursday October 8 — Overhead Press: 4×5 at 75% training max (60kg). RPE 7.5, felt solid. Bar path slightly drifted forward on the 4th set — cue for next session: actively push the bar back over the ears. Secondary: Arnold press 3×12 at 20kg, lateral raises 4×15 at 10kg, face pulls 3×20 at 25kg cable.",
          "Shoulder stability assessment: Bob has a history of left shoulder impingement (resolved October 2025 with physio). No pain during this week's sessions. Mobility test: internal/external rotation within normal range bilaterally. The band pull-apart warm-up (100 reps, 3×) continues to be key for activating the posterior shoulder before pressing.",
          "Progressive overload plan for Week 41: increase bench training max by 2.5kg (from 125kg to 127.5kg) if bar speed was high — it was. OHP training max stays at 80kg for another week. Bob will video the OHP from the side next session to check bar path consistency.",
        ],
      },
      {
        title: "Nutrition Audit: Training Week Macros vs Target",
        description: "Review MyFitnessPal logs for Week 40 and ensure macros align with the strength/endurance hybrid goals.",
        status: "todo", priority: "low", dueDate: new Date("2026-08-31"), lastEditedBy: "bob",
        paragraphs: [
          "Bob plans to review his MyFitnessPal logs for Week 40 (October 3–9, 2026) on October 9 to verify that macros aligned with his hybrid strength/endurance fueling targets. The week includes both a taper for the half marathon and strength training — these have conflicting macro requirements.",
          "Target macros for strength days (Monday, Tuesday, Thursday): calories 3,100kcal, protein 185g (≥ 2.1g/kg BW), carbohydrate 380g (prioritise around training), fat 90g. Target for endurance/easy days (Wednesday, Friday) and rest days: calories 2,700kcal, protein 185g, carbohydrate 300g, fat 80g. Race day (Sunday October 18) macros will be planned separately.",
          "Expected findings based on self-recall: Tuesday was a heavier training day and Bob suspects calorie intake was ~2,900 (below target). Wednesday was a race-pace session and nutrition was intentionally higher carb — Bob ate pasta for dinner (~120g carbs). Friday shakeout day should have been easy to hit targets.",
          "Key micronutrients to check: iron (Bob has been borderline low from a September blood panel — 65mg ferrous sulfate every other day); magnesium (supplement 300mg glycinate at night for sleep quality); zinc (supplement 25mg with dinner). MyFitnessPal does not track magnesium well, so this will be estimated manually.",
          "After the review, Bob will calculate the week's average protein per kg body weight, total carbohydrate across training days, and estimated energy availability. If any macro significantly missed target, he'll note the cause (social event, travel, time constraints) and adjust the Week 41 plan proactively.",
        ],
      },
    ],
  },

  // 6. Shopping / Finance Notes
  {
    name: "Personal Finance & Shopping Tracker",
    description: "Monthly budget tracking, savings goals, investment notes, and shopping list management for household and personal expenses.",
    createdBy: "charlie",
    tasks: [
      {
        title: "Monthly Budget Review — September 2026",
        description: "Reconcile all September income and expenses in the budget spreadsheet. Calculate savings rate.",
        status: "completed", priority: "high", dueDate: new Date("2026-07-08"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie Li completed the September 2026 budget reconciliation on October 5, 2026 using a Numbers spreadsheet linked to bank account exports (Chase checking, Chase Sapphire Preferred credit card, Marcus high-yield savings). All transactions were categorised and reviewed.",
          "Income September 2026: take-home salary $5,820 (after tax, 401k contribution of 6%, and health insurance premium). Side income from freelance code review sessions: $350. Total income: $6,170.",
          "Expenses September 2026: rent $1,750 (fixed), groceries $347 (budget $300, over $47 — see grocery review note), dining out $210 (budget $150, over $60 — two team dinners and a birthday dinner), transport $89 (BART passes + one Lyft), subscriptions $78 (Netflix, Spotify, iCloud, GitHub Copilot, Notion), utilities $95, gym membership $55, health/personal care $68, clothing $0, entertainment $120 (concert tickets bought August, events in September), miscellaneous $45. Total expenses: $2,857.",
          "Savings: $6,170 − $2,857 = $3,313 saved. Savings rate: 53.7% (target ≥ 50%). Above target — the freelance income pushed the rate over. Of the $3,313: $2,000 went to the emergency fund (target: 6 months expenses = $17,142; current balance: $13,890, 81% funded); $1,000 to the taxable brokerage account (VOO purchase); $313 to the vacation fund (Kyoto trip planned March 2027).",
          "Key variances vs budget: groceries +$47 (see grocery note), dining out +$60 (social — acceptable), entertainment +$70 (concert tickets pre-purchased). All other categories were within 5% of budget. Overall verdict: solid month. October target: reduce dining out to $120 (avoid team dinners where possible) and keep groceries under $310.",
        ],
      },
      {
        title: "Investment Review — Q3 2026 Portfolio",
        description: "Review the Q3 performance of the index fund portfolio and rebalance if allocations have drifted more than 5%.",
        status: "completed", priority: "high", dueDate: new Date("2026-07-12"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie reviewed the Q3 2026 investment portfolio performance on October 4, 2026. Portfolio total: $68,420 across three accounts: 401k (Fidelity, $41,200), Roth IRA (Fidelity, $18,740), and taxable brokerage (Fidelity, $8,480). This excludes the emergency fund ($13,890 in Marcus HYSA at 4.85% APY).",
          "Target allocation: 80% US equities (VTI/FXAIX), 15% international equities (VXUS), 5% bonds (BND). Current allocation after Q3: US equities 83.4% (over by 3.4%), international 13.1% (under by 1.9%), bonds 3.5% (under by 1.5%). Drift is within the 5% rebalance threshold on all positions, so no rebalance action is required.",
          "Q3 2026 performance: total portfolio return +4.2% (vs. S&P 500 total return +3.9% for Q3). The overweight to US equities contributed to slight outperformance vs. the target allocation. YTD return: +14.8%. Since inception (January 2020): +112% total return, 12.8% CAGR.",
          "Contribution activity: 401k — $769/month employee + $384 employer match = $1,153/month. Annual 401k contributions on track to hit the IRS limit of $23,500. Roth IRA — $583/month via automated transfer (on track for the $7,000 annual limit). Taxable brokerage — irregular, $1,000 contributed in September (VOO purchase at $513.20/share, 1.948 shares).",
          "Action items: no rebalance needed. Charlie will review again after Q4 (January 2027) and consider increasing the bond allocation to 10% as the portfolio grows larger and the time horizon to first major goal (home purchase, target 2029) gets shorter. Tax-loss harvesting opportunity: VXUS position is down $340 from cost basis — note to revisit in December.",
        ],
      },
      {
        title: "Shopping List: October Household Restock",
        description: "Compile a prioritised shopping list for October — differentiate between weekly grocery runs and monthly bulk buys.",
        status: "completed", priority: "low", dueDate: new Date("2026-07-16"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie compiled the October household restock list on October 3, 2026. Items are divided into three tiers: weekly fresh produce (Safeway, ~$60/week), monthly pantry bulk buy (Costco, ~$120 per visit), and quarterly specialty items (Amazon or specialty stores).",
          "Weekly fresh produce (Safeway, October 6 run): bananas, blueberries, spinach, broccoli, sweet potatoes, cherry tomatoes, garlic, red onion, Greek yoghurt (Fage 5%, 32oz), eggs (18-pack), sourdough bread (Acme), whole milk (half gallon).",
          "Monthly Costco run (October 11): olive oil (3L), canned San Marzano tomatoes (6-pack), dried chickpeas (5lb bag), brown rice (10lb bag), quinoa (4lb bag), rolled oats (10lb bag), almond butter (2×1.8kg), wild salmon fillets (frozen, 2kg), chicken thighs (frozen, 3kg), mixed nuts (1.36kg), dish soap, laundry pods, paper towels.",
          "Quarterly specialty items needed this month: Maldon flaky sea salt (Amazon, $8.50), Korean gochugaru chilli flakes (H Mart, $6), Japanese soy sauce (Kikkoman tamari 1L, $7 at Nijiya Market), miso paste (white and red, $5 each at Nijiya). Total estimated specialty spend: $32.",
          "Budget tracking: weekly groceries $60 × 4 = $240, Costco bulk $120, specialty $32 = $392 total October grocery spend. This is above the revised $310 grocery budget. Charlie plans to reduce the Costco order by skipping the almond butter (still have half a jar) and the quinoa (still have a 2lb bag). Revised Costco estimate: $98. Revised total: $370 — still above $310. Will reevaluate after the October 6 Safeway run.",
        ],
      },
      {
        title: "Research: High-Yield Savings vs Treasury Bills",
        description: "Compare current HYSA rates vs 3-month T-bills for the emergency fund. Make a recommendation.",
        status: "inProgress", priority: "normal", dueDate: new Date("2026-07-20"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie is researching the optimal holding vehicle for the $13,890 emergency fund as of October 2026. The fund is currently in a Marcus HYSA at 4.85% APY. The research question: would 3-month or 6-month Treasury bills offer a better after-tax return given California's state income tax exemption on Treasury interest?",
          "Current rates as of October 3, 2026 (from TreasuryDirect and Bankrate): Marcus HYSA 4.85% APY (taxable, federal + state). 3-month T-bill auction yield: 5.02% annualised. 6-month T-bill yield: 4.97%. 1-year T-bill yield: 4.78%. T-bill interest is exempt from California state income tax (9.3% marginal rate for Charlie's income bracket).",
          "After-tax return comparison for $13,890 at Charlie's marginal rates (federal 22%, California 9.3%): HYSA $13,890 × 4.85% × (1 − 0.313) = $462.90/year net. 3-month T-bill $13,890 × 5.02% × (1 − 0.22) = $543.80/year net (state tax saved). Net advantage of 3-month T-bills: $80.90/year. Percentage advantage: +17.5% better after-tax return.",
          "Liquidity consideration: T-bills can be purchased weekly at TreasuryDirect auction and held to maturity (3 months) or sold on the secondary market before maturity with a small bid-ask spread (typically 1–3 basis points on short maturities). For a true emergency fund, selling before maturity could be needed. HYSA allows same-day transfer to checking.",
          "Preliminary recommendation: for the portion of the emergency fund likely to not be needed in the next 6 months ($10,000 of the $13,890), move to a T-bill ladder (3-month, rolling). Keep $3,890 in the HYSA for immediate-liquidity emergencies. Charlie will finalise the recommendation after checking the October 6 T-bill auction results and share it in this note by October 8.",
        ],
      },
      {
        title: "Year-End Tax Planning Checklist",
        description: "Identify tax optimisation actions to take before December 31, 2026 — IRA contributions, loss harvesting, FSA spend.",
        status: "todo", priority: "high", dueDate: new Date("2026-07-24"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie is starting Q4 tax planning early (October 2026) to have time to execute any actions before December 31. The checklist covers retirement contributions, tax-loss harvesting, FSA spending, charitable giving, and business expense deductions for the freelance income.",
          "Retirement contributions: 401k on track for $23,500 limit (automated). Roth IRA: $583/month × 12 = $6,996 — $4 short of the $7,000 limit. Charlie will make a $4 catch-up contribution in December. Backdoor Roth is not needed — income is below the phase-out range.",
          "Tax-loss harvesting: VXUS position is down $340 from cost basis (noted in the Q3 portfolio review). In December, if VXUS is still at a loss, Charlie will sell and immediately buy a similar-but-not-identical fund (e.g., VEA for developed markets) to avoid the wash-sale rule. The $340 loss can offset up to $3,000 of ordinary income.",
          "FSA (Healthcare Flexible Spending Account): balance as of October 1: $480 remaining. Must be spent by December 31 (no rollover). Eligible expenses to plan: dental cleaning and X-rays scheduled November 15 (co-pay ~$30), new prescription glasses (estimated $200 at Warby Parker), over-the-counter medications stockpile (ibuprofen, antihistamine, sunscreen). Total planned FSA spend: ~$280. Remaining $200 to be spent on contact lenses.",
          "Freelance income (estimated $1,400 for 2026 based on $350/month freelance average × 4 months remaining): Charlie needs to set aside 25% for self-employment taxes. Deductible business expenses: portion of home internet ($15/month × 12 = $180), GitHub Copilot subscription ($10/month × 12 = $120), portion of home office (10% of rent = $175/month × 12 = $2,100 — consult CPA before claiming). Schedule a tax planning session with CPA David Nguyen by November 1, 2026.",
        ],
      },
    ],
  },

  // 7. Travel Planning
  {
    name: "Kyoto & Osaka Trip Planning",
    description: "Planning notes for the 10-day Japan trip in March 2027 — itinerary, accommodation, budget, and logistics.",
    createdBy: "alice",
    tasks: [
      {
        title: "Flight Research & Booking",
        description: "Find and book the best value flights SFO–KIX (Kansai) for March 2027.",
        status: "completed", priority: "high", dueDate: new Date("2026-08-02"), lastEditedBy: "alice",
        paragraphs: [
          "Alice researched SFO–KIX flights on September 28–October 3, 2026. Travel dates: March 12–22, 2027 (10 nights). Preferred: non-stop or 1-stop with under 14 hours total travel time. Budget: $900 per person. Alice is travelling with her partner.",
          "Options found: (1) ANA non-stop SFO–KIX: $1,080/person, 11h 15m, departs 1:30 PM arrives next day 6:45 PM. (2) JAL via NRT: $870/person, 13h 40m total, departs 11:45 AM. (3) United via NRT: $720/person, 15h 20m total, departs 9:45 AM. (4) Cathay Pacific via HKG: $680/person, 16h 50m total.",
          "Decision: booked ANA non-stop SFO–KIX at $1,080/person on October 3, 2026. Rationale: the premium over JAL buys 2.5 hours less travel time on both legs. Non-stop avoids connection risk (March is cherry blossom season — popular travel dates, tight connections could be catastrophic). Total flight cost: $2,160 for two.",
          "Return leg: KIX–SFO non-stop, ANA NH170, departs 4:00 PM March 22, arrives 9:30 AM March 22 (crossing date line). Booked simultaneously. Booking reference: ANA-7X2KQP. Seats selected: 25A and 25B (economy plus, extra legroom).",
          "Travel insurance: purchased Allianz Travel Insurance on October 4, 2026. Coverage: trip cancellation ($4,000 per person), medical evacuation ($250,000), medical expenses ($10,000), baggage loss ($1,500). Total premium: $210 for two people. Certificate emailed to alice@example.com.",
        ],
      },
      {
        title: "Accommodation Research — Kyoto (6 nights)",
        description: "Find accommodation in Kyoto for March 13–19: balance location, price, and authentic experience.",
        status: "completed", priority: "high", dueDate: new Date("2026-08-06"), lastEditedBy: "alice",
        paragraphs: [
          "Alice researched Kyoto accommodation on October 1–5, 2026. Dates: March 13–19, 2027 (6 nights). Priorities: within walking distance of a subway station, traditional-style preferred, budget ≤ $180/night. March is peak cherry blossom season — availability is limited and prices are elevated.",
          "Options reviewed: (1) Kyomachiya Nishiki (traditional machiya townhouse rental): $220/night for the entire house, sleeps 4. Located in Nishiki market area, 5 mins walk to Karasuma-Oike station. Very authentic. (2) The Millennials Kyoto (capsule hotel with pods): $65/person/night, co-working vibe, not traditional. (3) Kyoto Granbell Hotel (boutique hotel): $160/night, Gion district, 10 mins walk to Shijo station. (4) Nishiyama Onsen Keiunkan (ryokan): $280/night/person including dinner and breakfast — over budget but Alice wanted to note it for a potential 1-night splurge.",
          "Booked: Kyomachiya Nishiki for 5 of 6 nights (March 13–18), $220/night × 5 = $1,100. The 6th night (March 18–19) will be at Nishiyama Onsen Keiunkan ryokan, $560 for two (1 night with meals) — a planned splurge experience. Total Kyoto accommodation: $1,660.",
          "Kyomachiya booking reference: AirBnB #HM5929. Nishiyama Onsen booking: direct, reservation code NSW-2027-03-18. Both properties have a strict 48-hour cancellation policy — Alice noted the deadlines: AirBnB cancel by March 11, Nishiyama cancel by March 16.",
          "Osaka accommodation (March 19–22, 3 nights) still to be booked — assigned to this week's task. Alice is considering Dotonbori area for walkability to food and nightlife. Budget $120/night.",
        ],
      },
      {
        title: "Itinerary Draft: Kyoto Day-by-Day",
        description: "Draft a day-by-day Kyoto itinerary balancing temples, food, and seasonal cherry blossom viewing.",
        status: "inProgress", priority: "normal", dueDate: new Date("2026-08-10"), lastEditedBy: "alice",
        paragraphs: [
          "Alice is drafting the Kyoto itinerary for March 13–19, 2027. Cherry blossom peak bloom in Kyoto is typically March 25 – April 5, but the period March 13–19 should catch early blooms at higher-elevation spots. The itinerary is in Notion and is being shared with Alice's partner for input.",
          "Day 1 (March 13, arrival): arrive KIX 6:45 PM, take the Haruka Express to Kyoto Station (75 minutes), check in to machiya. Light dinner near Nishiki market. Early night — adjust to 17-hour time difference. March 13 in Kyoto is likely cool (8–13°C) and possibly drizzling.",
          "Day 2 (March 14, Arashiyama): Bamboo Grove, Tenryu-ji garden (cherry blossom early bloom expected), lunch at a soba restaurant on the main street, Okochi-Sanso Villa garden, monkey park (optional). Evening: back to Gion for kaiseki dinner reservation (Alice will book in November — restaurants fill up fast for March).",
          "Day 3 (March 15, Fushimi Inari + Nishiki Market): early morning (6:00 AM) Fushimi Inari Taisha to avoid crowds — 2-hour hike to the top and back. Afternoon: explore Nishiki Market (local produce, pickles, street food). Evening: cooking class — Alice found a machiya cooking class offering a 3-hour lesson for $65/person.",
          "Days 4–6 (March 16–18): Philosopher's Path, Nanzen-ji, Heian Shrine (likely earliest cherry blossom in Kyoto), Kinkaku-ji, Ryoan-ji, Nijo Castle, Pontocho alley for dinner. Day 6 checkout to ryokan. Still need to fill in specific times and restaurant bookings — Alice will finalise by October 15.",
        ],
      },
      {
        title: "Japan Rail Pass Research",
        description: "Determine if a JR Pass is cost-effective for the 10-day itinerary given new 2026 pricing.",
        status: "completed", priority: "normal", dueDate: new Date("2026-08-14"), lastEditedBy: "alice",
        paragraphs: [
          "Alice researched the JR Pass on October 2, 2026 following reports that 2024–2025 price increases made it less cost-effective for short trips. The current prices (purchased overseas before travel): 7-day JR Pass ¥50,000 (~$330), 14-day JR Pass ¥80,000 (~$529 at current exchange rate).",
          "Planned JR-eligible train journeys: (1) KIX–Kyoto via Haruka Express: ¥1,900 each way (¥3,800 round trip). (2) Kyoto–Osaka Shinkansen (Hikari): ¥2,850 each way. (3) Osaka–KIX via Haruka (if not using ICOCA): ¥1,750. (4) Day trip from Kyoto to Nara: ¥720 each way on JR Nara line. Total estimated JR-eligible spend per person: ¥9,120 (~$60).",
          "Verdict: the JR Pass is not cost-effective for this trip. The itinerary is concentrated in the Kyoto–Osaka corridor, most of which is served by non-JR subway lines and private railways (Hankyu, Kintetsu) that are not covered by the pass. The 7-day JR Pass at $330 would require ¥50,000 of JR journeys per person to break even — the itinerary generates only ¥9,120.",
          "Alternative: ICOCA card (rechargeable IC card accepted on all subway lines, buses, and most JR local trains in the Kansai region, plus convenience stores and vending machines). Loaded with ¥20,000 ($133) each. Alice will purchase ICOCA cards at KIX airport on arrival.",
          "Day trip to Hiroshima evaluation: Alice considered adding a Hiroshima day trip (from Kyoto by Shinkansen: ¥11,000 round trip per person). At that price, a 2-day JR Pass extension would not be available, and the full cost per person would be $73. Decision: skip Hiroshima this trip due to cost and time. It will be included in a future longer Japan trip.",
        ],
      },
      {
        title: "Packing List & Pre-Departure Checklist",
        description: "Build a comprehensive packing list and pre-departure task checklist for the March 2027 trip.",
        status: "todo", priority: "low", dueDate: new Date("2026-08-18"), lastEditedBy: "alice",
        paragraphs: [
          "Alice plans to build the master packing list on October 9, 2026, 5 months before departure. Starting early allows time to acquire missing items during sales. The packing list will be maintained in a shared Notion page with her partner.",
          "Clothing considerations: Kyoto in mid-March is 8–15°C with occasional rain. Layering is key. Key clothing items: mid-layer fleece or down jacket, waterproof outer layer, comfortable walking shoes (expect 15,000–20,000 steps/day), one nice outfit for kaiseki dinner, slip-on shoes for temples (must remove shoes frequently).",
          "Electronics: unlocked iPhone with Japanese eSIM (will purchase from Ubigi or Airalo before departure, ~$20 for 10GB), portable charger (20,000mAh Anker), travel adapter (Japan uses Type A, same as US — no adapter needed), Kindle loaded with Japan travel books.",
          "Documents: passports (checked September 2026, both valid through 2030), printed flight and hotel confirmations, travel insurance certificate, copies of passports stored in Google Drive, emergency contacts card (US Embassy in Tokyo: +81-3-3224-5000), cash (¥80,000 in cash withdrawn from Schwab no-fee ATM before or at KIX — Schwab reimburses all ATM fees globally).",
          "Pre-departure tasks: 6 weeks before — book kaiseki dinner reservation and cooking class. 4 weeks before — finalise Osaka accommodation. 2 weeks before — purchase eSIM data plan, notify bank of travel dates. 1 week before — download offline Google Maps for Kyoto and Osaka, charge all devices, confirm all bookings. Day before — reconfirm ANA flight, print boarding passes, prepare yen cash.",
        ],
      },
    ],
  },

  // 8. Home Renovation Notes
  {
    name: "Apartment Renovation Notes",
    description: "Planning and progress notes for the kitchen and bathroom renovation of the apartment — contractor quotes, timeline, material choices.",
    createdBy: "bob",
    tasks: [
      {
        title: "Contractor Quotes — Kitchen Renovation",
        description: "Collect at least 3 quotes for the kitchen renovation and compare scope, timeline, and warranty.",
        status: "completed", priority: "high", dueDate: new Date("2026-08-21"), lastEditedBy: "bob",
        paragraphs: [
          "Bob collected three contractor quotes for the kitchen renovation between September 15 and October 3, 2026. The scope: replace cabinets (existing are original 1989 melamine), install quartz countertops, new subway tile backsplash, replace range hood, and repaint walls and ceiling.",
          "Quote 1 — Bay Renovations (Yelp 4.8★, 120 reviews): $18,400 total. Cabinets: semi-custom from CliqStudios. Countertops: Cambria quartz. Timeline: 3 weeks. 2-year labour warranty, manufacturer warranty on materials. Includes permit filing.",
          "Quote 2 — Peninsula Home Improvement (Yelp 4.5★, 67 reviews): $14,200 total. Cabinets: IKEA SEKTION with custom door fronts (Semihandmade). Countertops: MSI Calacatta quartz. Timeline: 4 weeks. 1-year labour warranty. Does not include permit filing (Bob would need to file separately, estimated $350).",
          "Quote 3 — Pacific Coast Kitchens (Yelp 4.9★, 210 reviews): $22,800 total. Cabinets: fully custom from a local cabinet maker. Countertops: Taj Mahal quartzite (natural stone, not quartz). Timeline: 6 weeks. 5-year labour warranty, includes permit. Premium materials justify the price premium.",
          "Decision: Bob chose Peninsula Home Improvement at $14,200. Rationale: the IKEA/Semihandmade cabinet approach is proven (Bob researched extensively in the r/malelivingspace and r/kitchens communities) and the MSI Calacatta quartz matches the desired aesthetic. The $4,200 savings vs Bay Renovations is meaningful. Bob will file the permit himself ($350). Work starts November 3, 2026.",
        ],
      },
      {
        title: "Material Selection: Countertops & Backsplash",
        description: "Visit stone yards to select the quartz slab and choose the backsplash tile pattern.",
        status: "completed", priority: "normal", dueDate: new Date("2026-08-25"), lastEditedBy: "bob",
        paragraphs: [
          "Bob visited two stone yards on October 4–5, 2026: MS International in Burlingame and Bedrosians Tile in San Jose. The goal: select the countertop quartz slab and the backsplash tile.",
          "Countertop selection: after reviewing 12 quartz options, Bob selected MSI Calacatta Laza (3cm thick, polished finish). Slab dimensions: 130\" × 65\". Kitchen countertop linear footage: 28 linear feet. Slab price: $85/sq ft fabricated and installed (already included in Peninsula's quote). Bob picked the specific slab number (Slab #4 of 7 in stock) and had it tagged for hold until November 1.",
          "Backsplash tile: Bob chose a 3×9\" handmade white ceramic tile with a slightly irregular surface (Heath Ceramics Cloud White, $22.50/sq ft). Backsplash area: 18 sq ft. Tile cost estimate: $405 + 20% overage = $486. The handmade texture adds warmth that standard glossy subway tile doesn't, and complements the Calacatta quartz movement.",
          "Grout selection: unsanded grout in a warm grey (Mapei Silverado #64). Bob cross-referenced the grout colour against the quartz veining and the planned cabinet colour (Benjamin Moore Hale Navy) using a physical sample board assembled on October 5.",
          "All materials ordered October 6, 2026 with delivery to Bob's address on October 28, 2026 — allowing 6 days before the November 3 start date for contractor verification. Bob confirmed delivery address and building freight elevator booking with the building super.",
        ],
      },
      {
        title: "Cabinet Layout Planning with IKEA Home Planner",
        description: "Create the final cabinet layout in IKEA's 3D planner tool and verify dimensions before ordering.",
        status: "completed", priority: "normal", dueDate: new Date("2026-08-29"), lastEditedBy: "bob",
        paragraphs: [
          "Bob completed the final IKEA SEKTION cabinet layout on October 4, 2026 using the IKEA Home Planner web tool. The kitchen is a galley layout (11' × 8'). Bob measured the kitchen on September 28 and confirmed dimensions with a laser measure.",
          "Cabinet plan: base cabinets along both walls. Left wall (sink side): 36\" sink base, 12\" base + drawer, 24\" base. Right wall (range side): 30\" base, 9\" base filler, 30\" pull-out trash/recycling. Upper cabinets: left wall 36\" upper, 24\" upper; right wall 30\" upper, 9\" filler. Pantry: 24×80\" tall unit at the end of the right wall.",
          "SEKTION frame sizes ordered from IKEA: 14 cabinet frames, 22 door fronts (Axstad Matte White — clean, minimalist look that pairs with the navy island if Bob adds one in the future), 8 drawers, and assorted interior organisers (cutlery trays, spice racks, pull-out shelves). Total IKEA order: $3,840.",
          "Semihandmade add-ons: Bob is not using Semihandmade for this renovation (they are compatible with SEKTION but add cost). The Axstad Matte White doors are visually clean enough. If Bob wants to upgrade in 5 years, Semihandmade doors can be swapped without replacing the frames.",
          "IKEA order placed October 5, 2026 at the Emeryville store. Scheduled for click-and-collect October 27, 2026 — Bob will rent a Uhaul cargo van for pickup. Order confirmation #: IKEA-SEA-20261005-4482.",
        ],
      },
      {
        title: "Bathroom Renovation: Mood Board & Budget",
        description: "Create a mood board for the bathroom renovation (planned for Q1 2027) and set a realistic budget.",
        status: "inProgress", priority: "low", dueDate: new Date("2026-09-02"), lastEditedBy: "bob",
        paragraphs: [
          "Bob is planning a bathroom renovation for Q1 2027 (January–February) immediately following the kitchen renovation. The bathroom is a 5×8' single-bathroom with a tub/shower combo, single vanity, and toilet. It was last renovated in 2005 and the grout is failing.",
          "Mood board assembled on October 3, 2026 in Figma using images from Houzz, Architectural Digest, and Dwell. Aesthetic direction: Japanese-minimal with warm materials. Key elements: large-format floor tile (12×24\" porcelain in warm grey), zellige-style subway tiles on the shower walls (handmade, slightly irregular surface), floating walnut vanity with an undermount ceramic sink, matte black fixtures throughout, and a frameless shower door.",
          "Scope of bathroom renovation (draft): replace floor tile, replace shower tile, replace vanity and mirror, replace toilet (current one runs intermittently — a Toto Drake II is on the shortlist), install a new exhaust fan with humidity sensor, repaint walls, replace light fixture above mirror.",
          "Budget research: Bob collected rough estimates from two contractors who were at the property for the kitchen quote. Peninsula Home Improvement estimated $8,500–$11,000 for a full gut-and-replace excluding toilet (which Bob prefers to buy separately). Bay Renovations estimated $10,000–$13,000. Budget target: $12,000 total including toilet and all materials.",
          "Next steps (October and November): (1) finalise tile selection — visit Bedrosians again to look at the zellige-style options; (2) order Toto Drake II toilet ahead of time to ensure availability; (3) get a formal quote from Peninsula for the bathroom scope; (4) book Peninsula for January 12 start (immediately after kitchen punch list is signed off). Still in planning — no bookings made yet.",
        ],
      },
      {
        title: "Renovation Budget Tracker — Q4 2026",
        description: "Track all renovation-related expenses against the $20,000 renovation budget for Q4 2026.",
        status: "todo", priority: "high", dueDate: new Date("2026-09-05"), lastEditedBy: "bob",
        paragraphs: [
          "Bob has allocated $20,000 for home renovation in Q4 2026 (October–December), funded from a dedicated high-yield savings account ($23,400 balance as of October 1). The budget is split across the kitchen renovation and bathroom planning for the following quarter.",
          "Kitchen renovation committed expenses as of October 6, 2026: contractor (Peninsula Home Improvement) $14,200, IKEA cabinets (order placed) $3,840, countertop quartz slab (included in Peninsula quote, $0 additional), backsplash tile (Heath Ceramics, ordered) $486, grout and installation materials (Peninsula supplies, $0 additional), permit filing $350. Total committed: $18,876.",
          "Remaining Q4 renovation budget: $20,000 − $18,876 = $1,124. Contingency needed: renovation projects routinely exceed estimates by 10–15%. Bob has budgeted a separate $3,000 contingency from the HYSA balance above the $20,000 allocation.",
          "Additional costs expected but not yet committed: range hood (ZLINE 30\" wall-mounted, $650 from AJ Madison), under-cabinet LED lighting (Kichler strip lights, $180), kitchen faucet (Kohler Simplice pull-down, $280), and paint + supplies (Benjamin Moore Hale Navy, estimated $120). Total additional: $1,230. This brings expected total to $20,106 — $106 over budget before contingency.",
          "Bob will update this tracker weekly as invoices are received and payments made. The tracker lives in a Numbers spreadsheet shared with the building super for the permit record. Final reconciliation to be done December 31, 2026 once the kitchen punch list is complete. A separate budget tracker will be started for the Q1 2027 bathroom renovation in November.",
        ],
      },
    ],
  },

  // 9. Learning Notes — System Design
  {
    name: "System Design Interview Prep Notes",
    description: "Study notes, practice problems, and mock interview logs for senior software engineer system design interviews.",
    createdBy: "charlie",
    tasks: [
      {
        title: "Notes: Design a URL Shortener (Tiny URL)",
        description: "Work through the URL shortener design problem end-to-end: requirements, back-of-envelope math, components, and trade-offs.",
        status: "completed", priority: "high", dueDate: new Date("2026-09-07"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie studied the URL shortener system design problem on September 22–23, 2026 using Alex Xu's System Design Interview book (Chapter 8) and a Neetcode.io walkthrough. This is one of the most common warm-up questions in system design interviews — mastering it builds intuition for scale, hashing, and database choice.",
          "Requirements gathered: functional — given a long URL, return a short alias (~7 characters); given a short alias, redirect to the original URL; aliases expire after 1 year by default; custom aliases supported. Non-functional — read-heavy (read:write ratio 100:1), must handle 100M redirects/day, URLs must be unique, high availability.",
          "Back-of-envelope calculations: 100M redirects/day = 1,157 reads/second. Writes: 10M new URLs/day = 116 writes/second. Storage: 10M URLs/day × 365 days × 5 years × 500 bytes = 9.1 TB over 5 years — manageable. A 7-character base62 ID supports 62^7 = 3.5 trillion unique URLs — well within needs.",
          "System components: API servers (stateless, horizontally scalable), a URL shortening service that generates IDs (via counter or random approach), a relational DB (MySQL) for URL storage and mapping, a CDN for the redirect responses, a cache layer (Redis) for the most popular URLs. Schema: `urls` table with `id`, `short_key`, `original_url`, `created_at`, `expires_at`, `user_id`.",
          "Key trade-offs discussed: (1) Counter-based ID generation (simple but requires a distributed counter service, e.g., Zookeeper) vs. random base62 ID (simpler but higher collision probability at scale). (2) DB choice: MySQL for strong consistency and transactions, or Cassandra for write scalability? URL shortener is read-heavy — MySQL with read replicas is sufficient. (3) Cache eviction: LRU cache for hot URLs; the top 20% of URLs likely account for 80% of traffic.",
        ],
      },
      {
        title: "Notes: Design a Distributed Message Queue",
        description: "Study the Kafka architecture — topics, partitions, consumer groups, and durability guarantees.",
        status: "completed", priority: "high", dueDate: new Date("2026-09-10"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie studied distributed message queue design on September 24–25, 2026. Resources: the Kafka documentation, Martin Kleppmann's Designing Data-Intensive Applications Chapter 11, and a YouTube walkthrough by Jordan has no life. The target: be able to design a Kafka-like system from first principles in an interview.",
          "Core concepts: a message queue decouples producers from consumers. A topic is a named log of events. Topics are split into partitions for parallelism — each partition is an ordered, immutable sequence of records. Consumers in the same consumer group each read from a disjoint subset of partitions, enabling horizontal scaling. A record offset is the position of a message within a partition.",
          "Durability: Kafka achieves durability through replication. Each partition has one leader and N-1 follower replicas (configurable, typically N=3). All writes go to the leader. Followers pull from the leader. A write is considered committed when all in-sync replicas (ISR) have acknowledged it. A `min.insync.replicas` setting of 2 ensures at least 2 replicas have the data before acknowledging a write.",
          "Consumer guarantees: at-most-once (commit offset before processing — risk of data loss on crash), at-least-once (commit after processing — risk of duplicate processing on crash), exactly-once (requires idempotent consumers + Kafka transactions). In practice, most systems use at-least-once + idempotent consumer logic.",
          "System design application: use Kafka for the Atlas event pipeline (API request events → Kafka topic → Lambda consumer → analytics DB). This decouples the API from the analytics aggregation, allows replay of events if the consumer has a bug, and handles traffic spikes without losing data. Charlie added this to the Atlas technical design notes as a recommendation for the analytics v3 roadmap.",
        ],
      },
      {
        title: "Mock Interview: Design a Rate Limiter",
        description: "Conduct a timed mock interview (45 mins) for the rate limiter design problem and record feedback.",
        status: "completed", priority: "high", dueDate: new Date("2026-09-13"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie conducted a mock system design interview on October 2, 2026 with a friend (senior engineer at Stripe, 7 years experience). Format: 45 minutes, interviewer asks clarifying questions, interviewee designs on a shared Excalidraw canvas. Problem: Design a rate limiter for a REST API supporting 10,000 clients.",
          "Charlie's approach in the mock: started by clarifying requirements (is this per user, per IP, or per API key? sliding window or fixed window? what happens when limit is exceeded?). Settled on: per API key, sliding window, return 429 with Retry-After header when exceeded, limit is configurable per client tier.",
          "Design presented: token bucket algorithm stored in Redis. Key: `ratelimit:{apiKey}:{windowStart}`. Script: Lua script in Redis for atomic check-and-increment (avoids race condition). Rate limit config stored in a PostgreSQL table and cached in-memory on each API server with a 60-second TTL. Redis cluster with 3 shards for horizontal scale.",
          "Interviewer feedback: strengths — good requirement gathering, identified the race condition early, correctly proposed Lua script for atomicity, mentioned Redis Sentinel for HA. Areas to improve: (1) did not discuss what happens when Redis is down — should mention graceful degradation (allow all traffic or deny all traffic, and why you'd choose each); (2) did not calculate the Redis memory requirement (this is expected in senior interviews); (3) the config caching strategy was mentioned but not detailed enough.",
          "Action items from feedback: (1) add a Redis failure mode discussion to all rate-limiting questions; (2) practice calculating Redis memory for rate limit state (formula: num_clients × window_count × (key_size + counter_size)); (3) re-do this problem in 2 weeks incorporating the feedback. Score from interviewer: 6/10 — 'strong junior, would like to see more depth on failure modes and back-of-envelope for senior level'.",
        ],
      },
      {
        title: "Notes: CAP Theorem & Consistency Patterns",
        description: "Study CAP theorem, PACELC extension, and consistency patterns (eventual, strong, causal) with database examples.",
        status: "inProgress", priority: "normal", dueDate: new Date("2026-09-17"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie is studying the CAP theorem and related consistency concepts on October 3–8, 2026. Resources: DDIA Chapter 9, the CAP theorem original paper (Brewer 2000), the PACELC paper (Abadi 2012), and Jepsen.io analyses of specific databases.",
          "CAP theorem states: a distributed system can guarantee at most two of three properties — Consistency (every read receives the most recent write or an error), Availability (every request receives a non-error response), Partition tolerance (the system continues to operate despite network partitions). In practice, network partitions are unavoidable, so the real choice is CP vs AP.",
          "CP systems (sacrifice availability under partition): HBase, Zookeeper, MongoDB in default configuration. When a partition occurs, CP systems may refuse writes to maintain consistency. AP systems (sacrifice consistency under partition): Cassandra, DynamoDB, CouchDB. When partitioned, AP systems continue to serve reads/writes but may return stale data.",
          "PACELC extension: even without a partition (the P case), there is a tradeoff between Latency (L) and Consistency (C). E.g., DynamoDB is PA/EL — available under partition, low latency over consistency otherwise. MySQL is PC/EC — consistent under partition (refuses writes), consistent otherwise (pays latency for synchronous replication).",
          "Practical patterns: (1) Read-your-writes consistency: a user always sees their own writes immediately (implemented via sticky sessions to the primary DB or via version vectors). (2) Monotonic reads: a user never reads older data than they previously read. (3) Eventual consistency with conflict resolution: last-write-wins (Cassandra default), vector clocks (Riak), CRDTs. Charlie will complete this topic with two more study sessions by October 10.",
        ],
      },
      {
        title: "Mock Interview: Design YouTube",
        description: "Timed 60-minute mock interview for the video streaming platform design problem.",
        status: "todo", priority: "high", dueDate: new Date("2026-09-21"), lastEditedBy: "charlie",
        paragraphs: [
          "Charlie has scheduled a 60-minute mock system design interview for October 10, 2026 (moved one day past the due date) with a staff engineer at Netflix. The problem: Design a video streaming platform (YouTube-scale). This is one of the hardest system design problems — it involves video transcoding pipelines, CDN, distributed storage, and real-time recommendation.",
          "Preparation plan for the mock: (1) review Alex Xu Chapter 14 (Design YouTube) before the session; (2) study S3-compatible object storage architecture (used for raw and transcoded video storage); (3) review adaptive bitrate streaming (HLS / DASH protocol); (4) refresh knowledge on DAG-based transcoding pipeline (similar to what YouTube uses internally).",
          "Key topics to cover in the design: video upload flow (user → API → object storage → transcoding queue); transcoding pipeline (worker pool, FFMPEG, multiple resolution outputs: 360p, 720p, 1080p, 4K); CDN distribution (transcoded segments pushed to CDN PoPs); video player (adaptive bitrate selection based on network conditions); metadata service (title, description, channel, view count stored in a document DB); recommendation engine (collaborative filtering using watch history — can be high-level).",
          "Back-of-envelope estimates to prepare: YouTube's scale — 500 hours of video uploaded per minute. If each minute of video = 100MB raw = 500GB per minute upload. After transcoding to 5 quality levels: ~250GB stored per minute. At this scale, distributed object storage (S3-like) with multiple geographic regions is required.",
          "Success criteria for this mock: (1) complete all major components within 45 minutes; (2) proactively mention at least one failure mode per component (e.g., what if the transcoding worker crashes mid-job?); (3) propose a back-of-envelope storage estimate without being prompted; (4) score ≥ 7/10 from the interviewer.",
        ],
      },
    ],
  },

  // 10. Book Club / Reading Notes
  {
    name: "2026 Reading List & Book Notes",
    description: "Personal reading log — notes, highlights, and reflections on books read in 2026 across fiction, non-fiction, and technical topics.",
    createdBy: "alice",
    tasks: [
      {
        title: "Book Notes: The Pragmatic Programmer (20th Anniversary Ed.)",
        description: "Read and annotate the core chapters. Extract 10 actionable principles to apply to the Atlas project.",
        status: "completed", priority: "normal", dueDate: new Date("2026-09-24"), lastEditedBy: "alice",
        paragraphs: [
          "Alice read The Pragmatic Programmer (20th Anniversary Edition) by David Thomas and Andrew Hunt in September 2026. She had read the original edition in 2019 — this re-read focused on the updated examples and new material in the 20th anniversary version. Reading sessions: 20–30 minutes per day commute, 3 weeks to complete.",
          "Most impactful concepts from this reading: (1) The Broken Windows theory — don't leave bad code unaddressed; it signals that the codebase is not cared for and accelerates decay. Applied to Atlas: Alice immediately raised two instances of commented-out dead code she had been ignoring (removed in PR #305). (2) Tracer Bullets — build a thin end-to-end slice first rather than building each layer completely before the next. Applied this to the analytics dashboard design.",
          "(3) DRY (Don't Repeat Yourself) — but the book is careful to clarify that DRY applies to knowledge, not just code. Two pieces of code that do the same thing for different reasons are not DRY violations if the logic represents different concepts. Alice found this nuance valuable for a debate she had with Bob about shared validation logic. (4) Design by Contract — functions should state their pre-conditions, post-conditions, and invariants explicitly (via assertions or documentation). Atlas now uses Zod schemas at API boundaries as a partial implementation of this principle.",
          "Quotes highlighted: 'It is not enough to write programs that function correctly. You must also write programs that are not fragile.' / 'You can't write perfect software. Software is too complex for that. But you can write good-enough software.' / 'Test your software, or your users will.'",
          "10 actionable principles extracted and posted to the team Confluence under 'Engineering Principles': (1) Fix broken windows immediately; (2) Use tracer bullets for new features; (3) Make it easy to reproduce bugs; (4) Do not use coincidental programming; (5) Estimate before you commit; (6) Keep knowledge in a single authoritative place; (7) Use assertions to document invariants; (8) Decouple using events/messages where possible; (9) Refactor early and often; (10) Test your assumptions.",
        ],
      },
      {
        title: "Book Notes: Atomic Habits — James Clear",
        description: "Extract the core framework and design a personal habit stack for Q4 2026.",
        status: "completed", priority: "normal", dueDate: new Date("2026-09-27"), lastEditedBy: "alice",
        paragraphs: [
          "Alice read Atomic Habits by James Clear over two weeks in September 2026. She had heard recommendations from three colleagues and two podcasts — final motivation to read it was a conversation with Bob about building a consistent exercise habit. Key insight from the preface: habits are the compound interest of self-improvement.",
          "Four laws of behaviour change (Clear's framework): (1) Make it obvious (cue). (2) Make it attractive (craving). (3) Make it easy (response). (4) Make it satisfying (reward). Each law has an inversion for breaking bad habits: make it invisible, unattractive, difficult, unsatisfying.",
          "Habit stacking formula: 'After [CURRENT HABIT], I will [NEW HABIT].' Alice applied this to build her Q4 habit stack: After pouring morning coffee, I will open Duolingo for 5 minutes (Japanese study for Kyoto trip). After closing my laptop for the day, I will do the 15-minute yoga routine. After brushing teeth at night, I will write 3 things I'm grateful for in the Day One journal app.",
          "Implementation intentions: 'I will [BEHAVIOUR] at [TIME] in [LOCATION].' Alice set three: (1) I will go to the gym at 7:30 AM on Monday, Wednesday, Friday in the Mission Rock Athletic Club. (2) I will meditate at 6:30 AM in my living room using Headspace. (3) I will write in my journal at 10:00 PM at my desk.",
          "Reflection: Alice applied the book retrospectively to habits that already work for her. Her consistent meal prep habit succeeds because she has made it obvious (grocery order delivered Saturday), attractive (she enjoys cooking podcasts during prep), easy (the meal plan is pre-decided Sunday morning), and satisfying (she takes a photo of the fridge at the end of prep). Identifying these mechanics makes it easier to troubleshoot when habits break.",
        ],
      },
      {
        title: "Fiction: Piranesi — Susanna Clarke",
        description: "Read and note initial reactions, themes, and questions to bring to the book club meeting.",
        status: "completed", priority: "low", dueDate: new Date("2026-09-30"), lastEditedBy: "alice",
        paragraphs: [
          "Alice read Piranesi by Susanna Clarke in one weekend, October 3–4, 2026. The novel was recommended by her book club (3 members: Alice, her friend Sarah, and her colleague Marcus Chen). Book club meeting is scheduled October 8, 2026. The book is 272 pages — short for Clarke's writing but dense in atmosphere.",
          "Synopsis (spoiler-light): set in a House with infinite halls, filled with marble statues and tidal waters. The narrator, Piranesi, lives alone except for an enigmatic figure he calls the Other. The novel is written as journal entries. The mystery deepens as Piranesi discovers evidence that unsettles his understanding of the House and of himself.",
          "Themes noted by Alice: (1) memory and identity — Piranesi's sense of self is entirely constructed from what the House reveals to him; the novel asks whether identity can exist without memory of one's origins. (2) Knowledge and reality — Piranesi's taxonomical mapping of the House (he catalogues every statue) as a way of creating order in a world he cannot fully understand. (3) Isolation and contentment — Piranesi is profoundly at peace in his solitude, which challenges the reader's assumption that isolation is inherently suffering.",
          "Writing style: Clarke's prose is spare and precise, the opposite of Jonathan Strange & Mr Norrell's baroque density. The journal format creates dramatic irony — the reader understands more than Piranesi does, which is both frustrating and deeply moving. The worldbuilding is revealed through implication, not exposition.",
          "Questions for book club: (1) Is Piranesi's happiness in the House authentic, or is it a symptom of what he has lost? (2) The House is described as beautiful — do you find the setting comforting or unsettling, and does that change as you learn more? (3) How does the novel treat the relationship between naming things and understanding them? (4) The ending — did it satisfy you, or did the resolution diminish the mystery?",
        ],
      },
      {
        title: "Book Notes: DDIA — Chapters 7–9 (Transactions & Consensus)",
        description: "Read and annotate DDIA Chapters 7, 8, and 9 for the distributed systems study track.",
        status: "inProgress", priority: "high", dueDate: new Date("2026-09-04"), lastEditedBy: "alice",
        paragraphs: [
          "Alice is reading Designing Data-Intensive Applications (DDIA) by Martin Kleppmann as part of her distributed systems study track (linked to the system design interview prep). She completed Chapter 7 (Transactions) on September 28 and Chapter 8 (Trouble with Distributed Systems) on October 3. Chapter 9 (Consistency and Consensus) is in progress.",
          "Chapter 7 highlights: ACID properties — Atomicity (all or nothing), Consistency (database invariants preserved), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes). Key insight: 'Consistency' in ACID is the application's responsibility, not the database's — the database only guarantees atomicity and isolation. Isolation levels: read committed (prevents dirty reads, allows non-repeatable reads), snapshot isolation (MVCC, prevents non-repeatable reads), serializable (strongest, prevents all anomalies).",
          "Chapter 8 highlights: everything that can go wrong in a distributed system. Network failures (messages can be delayed, lost, or duplicated — no upper bound on delay). Clock drift (clocks on different machines diverge; NTP corrects drift but cannot eliminate it; wall-clock time is unreliable for ordering events — use logical clocks). Partial failures (some nodes fail while others continue — makes the system behave non-deterministically). The fundamental challenge: a distributed system cannot distinguish between a slow node and a dead node.",
          "Chapter 9 in progress: linearizability (the strongest single-object consistency model — behaves as if there is a single copy of the data), causal consistency (weaker than linearizability, preserves cause-effect ordering), total order broadcast (equivalent to consensus), and the Raft and Paxos consensus algorithms. Alice is at the Raft section (page 364 of 620).",
          "Application to Atlas: the Atlas service registry uses a leader-based MongoDB replica set (similar to Raft). Understanding Chapter 9 will help Alice make better decisions about the registry's consistency guarantees — specifically, whether to use linearizable reads (expensive, requires round-trip to primary) or snapshot reads (faster, may return stale data). Will document the decision in the Atlas Core technical design.",
        ],
      },
      {
        title: "Q4 2026 Reading Plan",
        description: "Select 5 books for Q4 and schedule reading to finish one per month.",
        status: "todo", priority: "low", dueDate: new Date("2026-09-10"), lastEditedBy: "alice",
        paragraphs: [
          "Alice plans to finalise her Q4 2026 reading list on October 9, 2026. Q3 was a strong reading quarter (6 books finished). Q4 goals: maintain the momentum, include at least 2 technical books, 1 fiction, and 2 non-fiction/biography.",
          "Candidates for Q4 technical reading: (1) Staff Engineer: Leadership Beyond the Management Track — Will Larson (directly relevant — Alice is targeting a staff engineer promotion in 2027); (2) The Staff Engineer's Path — Tanya Reilly (complementary to Larson); (3) Software Architecture: The Hard Parts — Neal Ford et al. (distributed systems architecture patterns, relevant to Atlas work). Likely selection: both Larson and Ford — Reilly to be read in Q1 2027.",
          "Candidates for non-fiction: (1) Chip War — Chris Miller (semiconductor supply chain — topical given AI chip shortages); (2) The Innovator's Dilemma — Clayton Christensen (classic product strategy, Alice has wanted to read it for 2 years); (3) Into Thin Air — Jon Krakauer (narrative non-fiction, lighter reading). Likely selection: Chip War and Into Thin Air.",
          "Fiction: Babel by R.F. Kuang has been on Alice's list since its 2022 publication. The book club voted to read it in December. That would cover the fiction slot.",
          "Tentative Q4 reading schedule: October — Staff Engineer (Larson, 288 pages, ~15 pages/day). November — Software Architecture: The Hard Parts (Ford et al., 389 pages — dense, may need extra time). December — Chip War + Babel (reading in parallel: Chip War mornings commute, Babel evenings). Into Thin Air pushed to January 2027 — lighter book for the holiday season when reading time is inconsistent.",
        ],
      },
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

  // ─── Extra projects ───────────────────────────────────────────────────────
  let extraTaskCount = 0;
  for (const pd of extraProjectDefs) {
    const proj = await Project.create({
      name: pd.name,
      description: pd.description,
      createdBy: userMap[pd.createdBy]._id,
    });

    await Member.insertMany([
      { project: proj._id, user: alice._id, role: "manager" },
      { project: proj._id, user: bob._id, role: "editor" },
      { project: proj._id, user: charlie._id, role: "editor" },
    ]);

    const extraTasks = await Task.insertMany(
      pd.tasks.map((t) => ({
        project: proj._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        createdBy: userMap[t.lastEditedBy]._id,
        dueDate: t.dueDate,
      }))
    );

    await TaskContent.insertMany(
      extraTasks.map((task, i) => ({
        task: task._id,
        content: doc(...pd.tasks[i].paragraphs),
        plainText: pd.tasks[i].paragraphs.join("\n\n"),
        contentType: "tiptap-json",
        lastEditedBy: userMap[pd.tasks[i].lastEditedBy]._id,
        lastEditedAt: new Date(),
        embeddingStale: true,
      }))
    );

    extraTaskCount += extraTasks.length;
    console.log(`📁 Created project "${pd.name}" with ${extraTasks.length} tasks`);
  }

  console.log("\n🎉 RAG test seed complete!");
  console.log("----------------------------");
  console.log(`Database : ${RAG_TEST_DB}`);
  console.log(`Projects : 1 (Project Atlas) + ${extraProjectDefs.length} extra = ${1 + extraProjectDefs.length} total`);
  console.log(`Tasks    : ${tasks.length} (Atlas) + ${extraTaskCount} (extra) = ${tasks.length + extraTaskCount} total`);
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
