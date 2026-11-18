-- Saba Naft Cloudflare D1 pilot. Run against a NEW, isolated D1 database.
-- The database stores no managers' questions, coaching drafts or model responses.
CREATE TABLE IF NOT EXISTS pilot_access (
 code_hash TEXT PRIMARY KEY NOT NULL CHECK (length(code_hash)=64),
 user_id TEXT UNIQUE NOT NULL,
 display_name TEXT NOT NULL DEFAULT 'Pilot Manager',
 active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
 expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS pilot_access_active ON pilot_access(active,expires_at);

-- Single atomic quota row per approved pilot participant.
CREATE TABLE IF NOT EXISTS coach_quota (
 user_id TEXT PRIMARY KEY NOT NULL,
 hour_bucket TEXT NOT NULL,
 hour_hits INTEGER NOT NULL DEFAULT 0 CHECK (hour_hits>=0),
 day_bucket TEXT NOT NULL,
 day_hits INTEGER NOT NULL DEFAULT 0 CHECK (day_hits>=0)
);
