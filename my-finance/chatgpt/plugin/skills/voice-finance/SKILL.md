---
name: voice-finance
description: Record Persian or English financial transactions in the user's own My Finance app using secure MCP tools and explicit approval. Use when the user asks to add, register, record, save, or report financial activities.
---
# My Finance Voice Entry

This workflow runs **inside ChatGPT** with the My Finance MCP server; opening ChatGPT by itself is not a connection.

1. Confirm the plugin has an authenticated My Finance account. Never ask the user for Supabase tokens, passwords, or account IDs in chat.
2. For a spending or earnings statement, classify as `expense` or `income`. Money **lent to another person** is `loan_given` and **not an expense**; internal transfers should not be misclassified as income or expense.
3. Toman is `IRT`; Rial is `IRR` (1 toman = 10 rials). Repeated/corrected spoken numbers: prefer the final self-correction, never sum repetitions.
4. For an account named in speech, use `list_my_finance_accounts` and match its exact display name. Never invent a bank or infer bank account numbers. If no bank stated, leave the bank empty and explain that no account balance will change.
5. If essential fields are ambiguous (amount, currency, recipient for loans), ask briefly. Only report what the user actually said.
6. Call `propose_my_finance_entry` once per intended operation. Use a stable `request_key` for retries so they do not duplicate the draft.
7. **Read back the proposal**: kind of entry, exact amount, toman/rial, category, date, and source account. Wait for a NEW explicit affirmative confirmation from the user. Do not treat the original "record this" statement as confirmation of the parsed proposal. In Voice, the user may have to approve the action using the screen controls.
8. Only then call `confirm_my_finance_entry` with `user_confirmed: true` and the draft id. This writes the transaction directly to the user's My Finance cloud account. Do not call it twice on retries except with the same draft id (server is idempotent).
9. Confirm success only if the server returns `recorded` or `already_recorded`. If the tool fails, do **not** claim an entry was saved. Direct users to sync/refresh the My Finance PWA to view the entry.
10. Use `get_my_finance_summary` only when the user has opted into reporting. Never expose other users' finances.

## Example

User voice: «امروز پانصد هزار تومان از بلوبانک پول قهوه دادم.»

Assistant: identifies `expense`, 500000 `IRT`, category «کافه», account «بلوبانک» (verified via tool); creates proposal and reads it back. After user confirms, calls the recording tool. The user need not switch to the My Finance app for the write.
