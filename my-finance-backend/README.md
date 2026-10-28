# My Finance - Private Sync Backend

Purpose: read owner-authorized Google Sheets transactions and receivables for the existing installed finance PWA.

Deploy from the existing GitHub repository into a **free** Render Node web service.

Build: cd my-finance-backend && npm install --omit=dev
Start: node my-finance-backend/server.mjs
Health endpoint: /health

Server-side environment variables (never commit values):
OWNER_EMAIL, FINANCE_SHEET_ID, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_KEY (32 random bytes in hex), PUBLIC_BASE_URL.

Create a Google OAuth Web application, activate the Sheets API, and register PUBLIC_BASE_URL/auth/callback as an Authorized Redirect URI. The owner signs in once at /auth/start. The resulting refresh token is carried in an encrypted, expiring bearer session (60 days), not stored in the public repository.

Backend endpoints: GET /health, GET /auth/start, GET /auth/callback, GET /api/snapshot.

Security: OAuth state verification, owner-only email check, readonly Sheets scope, AES-256-GCM session encryption, strict CORS, no-cache financial responses. Treat the encrypted bearer session on the handset as sensitive; encrypt and restrict mobile access. Do not expose credentials in ChatGPT or public GitHub.

Financial data remains in the private Google Sheet. This backend contains no financial data or database.

Deployment is not active until Render permits free service creation and private OAuth credentials are configured. No paid Render services should be selected without explicit authorization.