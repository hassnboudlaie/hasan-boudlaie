# Kish OKR access gateway — prepared, not deployed

The laptop screenshot on 2026-10-10 shows a Cloudflare block before the app loads. The existing production service is public and its health endpoint returns 200 from the audit environment. The exact blocking rule is unknown without the visitor Ray ID/security-event access. Application RBAC changes cannot remove that edge rule.

This candidate alternative entrypoint keeps the existing application, authentication and D1 database. It forwards only the application endpoints and its three public assets, validates incoming mutation Origins, preserves the session cookie and CSRF token, and points navigation/invitation links to its own hostname. It neither creates a new database nor stores passwords or organization data locally. It is not an open proxy.

Run `node test.mjs`. Native Render creation can use the existing public GitHub repo with build command `node --check okr-system/deployment/render-bridge/gateway.mjs` and start command `node okr-system/deployment/render-bridge/gateway.mjs`, runtime Node 24, manual deployment, and the Free compute plan. Render supplies `RENDER_EXTERNAL_URL`; HTTPS is required in production.

Deployment is pending the account owner's confirmation of the intended Render workspace. No service has been created and no public URL has been verified. Before creation, inspect existing services for duplicates. The supplied Blueprint is a reviewable configuration; direct MCP creation is preferred for this single service.

Free compute spins down after 15 minutes idle and may need about one minute to wake. Bandwidth/build overages may be billed on accounts with a payment method; inspect billing/spend limits before enabling unrestricted usage. Source: https://render.com/docs/free

This remains dependent on the original upstream and is an access test, not proof of Iran-network reachability. Verify deployment, independent account login, persistent state, permission enforcement and access from the affected laptop before adopting the new link. The original upstream login rate limiter sees a shared gateway IP, so large simultaneous onboarding may require a separately reviewed throttling change. Keep the old URL and data intact. Do not switch the GitHub entrypoint until this route is independently verified.
