/**
 * Run locally: node scripts/issue-pilot-code.mjs "pilot-1" "مدیر آزمایشی" > /tmp/saba-pilot-1.sql
 * Generates a personal 256-bit secret; shows it ONCE on stderr.
 * Only the SHA-256 digest and generic user label go into D1.
 * Never commit or share the SQL file or access code publicly.
 */
import { randomBytes, randomUUID, createHash } from "node:crypto";
const nickname = process.argv[2], displayName = process.argv[3] || "Pilot Manager";
if (!nickname || nickname.length > 80 || displayName.length > 120) {
 process.stderr.write("Usage: node issue-pilot-code.mjs <unique-user-nickname> [display-name]\n");
 process.exit(2);
}
const esc = text => "'" + String(text).replaceAll("'", "''") + "'";
const raw = "snp_" + randomBytes(32).toString("hex");
const digest = createHash("sha256").update(raw).digest("hex");
const userId = nickname + "-" + randomUUID();
const expiry = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
process.stdout.write("INSERT INTO pilot_access (code_hash,user_id,display_name,expires_at) VALUES (" +
 [digest,userId,displayName,expiry].map(esc).join(",") + ");\n");
process.stderr.write("PRIVATE ONE-TIME ACCESS CODE (share with invited manager only, securely):\n" + raw +
 "\nExpires: " + expiry + "\nRevocation: UPDATE pilot_access SET active=0 WHERE user_id=" + esc(userId) + ";\n");
