# Security Specification — Genesis of Machine Cognition

## 1. Data Invariants

1. **Default-Deny Baseline**: Any path not explicitly matched under `/experiments/{experimentId}`, `/notes/{noteId}`, or `/sessions/{sessionId}` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity Enforcement**: All read and write operations require an authenticated user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`).
3. **Path Variable Hardening**: Every single-document target operation (`get`, `create`, `update`, `delete`) validates the document ID via `isValidId(id)` (`1..128` chars matching `^[a-zA-Z0-9_\-]+$`).
4. **Strict Ownership Isolation**: Every document in `/experiments`, `/notes`, and `/sessions` must set `ownerId == request.auth.uid` on creation, preserve `ownerId` immutability on updates, and restrict `get`, `list`, `update`, and `delete` strictly to the document owner (`resource.data.ownerId == request.auth.uid`).
5. **Schema & Volumetric Bounds (`firebase-blueprint.json` Parity)**:
   - `ExperimentSnapshot`: Exact keys `['ownerId', 'title', 'moduleType', 'summary', 'parameters', 'status', 'createdAt', 'updatedAt']`; `title` `1..120` chars; `moduleType` in `['mcp_spiking', 'thermodynamics', 'lithography', 'agi_stack']`; `summary` `1..600` chars; `parameters` is a bounded map (`size() <= 20`); `status` in `['active', 'archived']`.
   - `ResearchNote`: Exact keys `['ownerId', 'topic', 'modelUsed', 'content', 'createdAt', 'updatedAt']`; `topic` `1..150` chars; `modelUsed` `1..64` chars; `content` `1..8000` chars.
   - `ChatSession`: Exact keys `['ownerId', 'title', 'persona', 'model', 'lastMessagePreview', 'messageCount', 'createdAt', 'updatedAt']`; `title` `1..120` chars; `persona` `1..64` chars; `model` `1..64` chars; `lastMessagePreview` `1..500` chars; `messageCount` integer `1..100`.
6. **Temporal Integrity & Immortal Fields**: `createdAt` and `updatedAt` must equal `request.time` on `create`. On `update`, `createdAt` and `ownerId` are immutable (`incoming().createdAt == existing().createdAt`) and `updatedAt == request.time`.
7. **Terminal State Locking**: Once an `ExperimentSnapshot` transitions to `status == 'archived'`, no further updates are permitted (`existing().status != 'archived'`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Attack Vector | Target Collection | Malicious Payload / Context | Expected Outcome |
|---|---|---|---|---|
| 1 | **Identity Spoofing on Create** | `/experiments/exp_1` | `auth.uid = "user_A"`, payload `ownerId = "user_B"` | `PERMISSION_DENIED` |
| 2 | **Unverified Email Spoof** | `/notes/note_1` | `auth.uid = "user_A"`, `email_verified = false` | `PERMISSION_DENIED` |
| 3 | **Shadow / Ghost Field Injection** | `/experiments/exp_1` | Valid fields + `"isAdmin": true` | `PERMISSION_DENIED` |
| 4 | **ID Poisoning Attack** | `/notes/invalid$id!@#` | Path ID contains prohibited characters `$!@#` | `PERMISSION_DENIED` |
| 5 | **Denial-of-Wallet String Overflow** | `/notes/note_1` | `topic` string length = `500` chars (`> 150` max) | `PERMISSION_DENIED` |
| 6 | **Enum Bypass on Module Type** | `/experiments/exp_1` | `moduleType = "arbitrary_module"` | `PERMISSION_DENIED` |
| 7 | **Client Timestamp Forgery** | `/sessions/sess_1` | `createdAt` set to past timestamp (`!= request.time`) | `PERMISSION_DENIED` |
| 8 | **Immutable Owner Hijack on Update** | `/notes/note_1` | Update changing `ownerId` from `"user_A"` to `"user_B"` | `PERMISSION_DENIED` |
| 9 | **Terminal State Mutation** | `/experiments/exp_archived` | Update against document where `existing().status == 'archived'` | `PERMISSION_DENIED` |
| 10 | **Value Poisoning on Update** | `/sessions/sess_1` | Update whitelisted `messageCount` with string `"999"` instead of `int` | `PERMISSION_DENIED` |
| 11 | **Cross-Tenant Read (PII / Data Leak)** | `/notes/note_user_B` | `get` request by `user_A` on `user_B`'s research note | `PERMISSION_DENIED` |
| 12 | **Unscoped List Scraping** | `/experiments` | `list` query without `where('ownerId', '==', request.auth.uid)` | `PERMISSION_DENIED` |

---

## 3. Hardened Red Team Audit Summary

- **Shadow Update Test**: Passed — `hasAll` + `hasOnly` in `isValidExperiment`, `isValidNote`, and `isValidSession` combined with `affectedKeys().hasOnly(...)` in `allow update` reject all ghost fields.
- **Email Spoofing Test**: Passed — `isSignedIn()` mandates `request.auth.token.email_verified == true`.
- **PII / Cross-User Isolation Test**: Passed — `get`, `list`, `update`, and `delete` require `existing().ownerId == request.auth.uid`.
- **Query Trust Test**: Passed — `allow list` explicitly checks `existing().ownerId == request.auth.uid` with zero `get()`/`exists()` calls inside `list`.
- **Value Poisoning Test**: Passed — `allow update` begins with `isValid[Entity](incoming())`, blocking any invalid type or out-of-bounds value even on whitelisted keys.
