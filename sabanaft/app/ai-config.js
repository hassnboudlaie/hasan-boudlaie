/* Public configuration ONLY: set URL after Cloudflare account + D1 + AI binding are deployed and verified.
 * Example: https://saba-leadership-coach-pilot.<your-subdomain>.workers.dev/v1/coach
 * Never store any participant code or Cloudflare API token here.
 * Unconfigured until the real Worker URL is known: local educational guidance stays available.
 */
window.SABA_AI_CONFIG = {
  provider: "cloudflare",
  endpoint: "",
  publishableKey: ""
};
