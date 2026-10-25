# Enterprise storage integration — implementation boundary

The public app currently runs `PRACTICE_MODE=true`. Its shared storage adapter only enables on `/apps/hasan-boudlaie/okr-system/` and calls same-origin `/api/kish/workspace`; GitHub Pages runs at `/hasan-boudlaie/okr-system/`. Changing a label or a client role cannot enable server security.

The connected Sites catalog identifies the existing protected portal and the original Kish application. Neither a deployed backend change nor authenticated multiuser verification was performed in phase 2. Existing server records were not read, overwritten or migrated.

## Required next implementation

Keep GitHub Pages as the public frontend. Reuse the existing protected backend after inspecting its source and deployed authentication. A separate API origin must explicitly allow only the GitHub origin and use a server-issued session or a short-lived authorization-code flow with PKCE; never ship keys in the repository or infer permissions from localStorage. Cookie-based cross-site sessions also require real browser testing against third-party-cookie restrictions.

Server workspace API contract:

- GET workspace: authenticated tenant membership, revision and data, no private HR notes in a general workspace payload.
- PUT/PATCH workspace: validate server role and tenant on every request, require expected revision, reject conflicts with 409 without any write, and transact data plus an immutable audit event.
- Server validation: stable IDs, finite numbers, parent existence, cycle checks, valid timeframe references, safe archive semantics, no cascading deletion of goals when a timeframe is archived.
- Reviews/private meeting notes: separate owner/participant-authorized endpoints and tables, not one public JSON blob.
- Backup: encrypted versioned snapshots with tested recovery, retention policy and an operator export; return recoverable failure states.

Do not automatically upload a local browser workspace to a remote server. Present the exact destination and a comparison of incoming/current record counts; preserve both copies and reconcile conflicts by ID. Enable remote mode only after authentication, two-user synchronization, viewer write rejection, cross-tenant rejection, revoked-session rejection, conflict handling and backup restoration pass on the actual deployed API.

## Release acceptance

An enterprise claim requires two independently authenticated users reading the same revision, successful permitted writes, rejected forbidden writes at HTTP level, a tested concurrent update conflict, and a recovered backup. Phase 2 does not satisfy these criteria.
