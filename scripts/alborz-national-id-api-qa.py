"""Non-destructive Alborz national-ID API contract check.

Never submits a valid national ID, creates a registration, or prints personal
identifiers. Run only against the intended Alborz workshop project.
"""
import json
import urllib.error
import urllib.request

ENDPOINT = "https://cymatyfnwuxikrghydrn.supabase.co/functions/v1/alborz-workshop-sync"

def status(code, action="login"):
    payload = json.dumps({"action": action, "code": code}).encode("utf-8")
    request = urllib.request.Request(
        ENDPOINT, data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            response.read()
            return response.status
    except urllib.error.HTTPError as response:
        response.read()
        return response.code

assert status("12345678") == 401, "Retired eight-digit PIN must not authenticate"
assert status("0000000000") == 400, "Invalid ten-digit checksum must be rejected"
assert status("۰۰۰۰۰۰۰۰۰۰") == 400, "Persian-digit normalization and validation failed"
assert status("012345") == 401, "Short identifiers must not authenticate"
assert status("0000000000", "read") == 401, "National ID must not access data without a session"
print("PASS: retired PIN rejected; invalid national ID rejected; Persian digits normalized; non-session read rejected")
