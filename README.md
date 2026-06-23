# Curaah AI Health & Adherence Companion
### Your Health, Remembered.
**A product of Curaah HealthTech Pvt Ltd**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Relationship to Curaah Hospital OS (Curaah 1.0)](#relationship-to-curaah-hospital-os)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Supabase Setup](#supabase-setup)
7. [Storage Buckets](#storage-buckets)
8. [Edge Functions (AI Layer)](#edge-functions-ai-layer)
9. [All Pages — Detailed](#all-pages--detailed)
10. [The Recovery Score Formula](#the-recovery-score-formula)
11. [DPDP Act 2023 Compliance — What's Built In](#dpdp-act-2023-compliance--whats-built-in)
12. [RLS Policies](#rls-policies)
13. [Known Issues & Pending Fixes](#known-issues--pending-fixes)
14. [What Is NOT Built Yet](#what-is-not-built-yet)
15. [Local Development Setup](#local-development-setup)
16. [Deployment](#deployment)
17. [Testing Checklist](#testing-checklist)

---

## Project Overview

Curaah is an AI-powered personal health companion for chronic disease patients in India. It is **not a reminder app** — it is a companion that builds a complete picture of a patient's health (a "Digital Health Twin") and uses that context every time it helps, so the patient never has to re-explain themselves.

**Core capabilities:**
- Upload a prescription photo → AI extracts medicines, doses, timing → a verified pharmacist confirms it before it becomes the active plan
- Upload a medicine strip/tablet photo → AI identifies it and checks it against the patient's schedule, flagging dangerous interactions
- Daily adherence logging that asks **why** a dose was skipped, not just whether — building a pattern, not a judgement
- Lab report upload → AI explains every value in plain Hindi, Punjabi, or English, and tracks trends over time
- A single **Recovery Score** (0–100) that combines adherence, lab trends, lifestyle, and engagement into one understandable number
- An AI Companion chat that already knows the patient's conditions, medicines, and recent history
- Consent-based Family Dashboard — patients invite family members with granular, revocable permissions
- SOS emergency button with a 3-second cancellable countdown, contact alerts, and optional health-data sharing

**Built by:** Akshat Saini, B.Tech Final Year, IKGPTU · Industrial Training at NIELIT Ropar (AIML)
**Company:** Curaah HealthTech Pvt Ltd (MCA registered)
**Status:** Full frontend + database schema built. AI Edge Functions pending API key integration (by design — see Section 8).

---

## Relationship to Curaah Hospital OS (Curaah 1.0)

Curaah HealthTech Pvt Ltd originally built a B2B Hospital OS (OPD booking, token queues, referrals, proxy booking for hospital staff). After ground validation, hospital sales proved too slow for a student-stage startup, so the company pivoted to **B2C first**: this AI Health Companion product.

**This is a deliberately separate, parallel codebase:**

| | Curaah 1.0 (Hospital OS) | Curaah 2.0 (this repo) |
|---|---|---|
| Repo | `curaah` (original) | `Curaah2` |
| Supabase project | `lospowxozjnoiawxbojg` | `odefkuavdrximrkcfnbd` |
| Audience | Hospitals, staff, proxy agents | Individual patients & families |
| Status | Built, on hold (B2B too slow to sell at this stage) | Active primary product |
| Brand identity | Same logo, same navy/electric-blue palette | Same logo, same navy/electric-blue palette, warmer tone |

Both products share the Curaah brand so the public sees one consistent company. The Hospital OS becomes the B2B expansion once Curaah 2.0 has real B2C traction and revenue.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES Modules) | No framework, no build step |
| Hosting | GitHub Pages | Free |
| Database | Supabase (PostgreSQL) | Separate project from Curaah 1.0 |
| Auth | Supabase Auth | Email/phone + password |
| File Storage | Supabase Storage (private buckets, signed URLs) | Never public |
| Realtime | Not currently used (no live queues like Curaah 1.0) | — |
| AI — Language | Sarvam AI | Hindi/Punjabi/English understanding & generation |
| AI — Reasoning | Anthropic Claude API (via backend proxy) | Never called directly from frontend |
| Domain | curaah.dev / app.curaah.in (TBD) | — |

**Supabase project ID:** `odefkuavdrximrkcfnbd`
**Supabase URL:** `https://odefkuavdrximrkcfnbd.supabase.co`

---

## Project Structure

```
Curaah2/
│
├── index.html                  — Homepage (Rajinder Singh story, features, pricing)
├── register.html               — 3-step registration with granular DPDP consent
├── login.html                  — Login (email or phone), forgot password
│
├── dashboard.html              — Main hub: Recovery Score ring, today's medicines, quick actions
├── prescriptions.html          — Upload + AI extraction + pharmacist verification status
├── medicines.html              — Active medicines list + strip/tablet photo verification
├── adherence.html               — Calendar view + 30-day stats + skip-reason breakdown
├── lab-reports.html            — Upload + AI explanation + trend tracking
├── ai-companion.html           — Chat interface with health context + language switcher
├── recovery-score.html         — Detailed score breakdown + 14-day trend chart + insights
│
├── family.html                 — Invite family (consent + permissions) / caregiver view
├── family-accept.html          — Invite acceptance flow (token-based)
├── sos.html                    — Emergency SOS button + contacts + history
│
├── profile.html                — Edit Digital Health Twin (basic info, health, preferences)
├── consent.html                — View/toggle consents + audit log + data export
├── delete-account.html         — Account deletion request (30-day DPDP SLA)
│
├── privacy.html                — Privacy Policy (DPDP Act 2023 compliant)
├── terms.html                  — Terms of Service (medical disclaimer prominent)
│
├── css/
│   └── style.css               — Full design system (navy/electric-blue, warm companion tone)
│
├── js/
│   ├── supabase.js             — Supabase client + requireAuth() + getCurrentUserProfile()
│   └── main.js                 — Toasts, validators, date helpers, AI disclaimer renderer,
│                                  score color/label helpers
│
├── assets/
│   └── logo.svg                — Curaah shield-drop logo (same as Curaah 1.0)
│
├── curaah2-schema.sql           — Full database schema (16 tables, RLS, functions)
├── curaah2-family-rls-fix.sql   — Additional RLS policies for family invite acceptance
│
└── supabase/
    └── functions/               — Edge Functions (NOT YET BUILT — see Section 8)
        ├── proxy-llm/
        ├── extract-prescription/
        ├── explain-lab-report/
        ├── identify-medicine/
        └── send-sos-alert/
```

---

## Database Schema

Full schema is in `curaah2-schema.sql`. Summary of all 16+ tables:

| Table | Purpose |
|---|---|
| `users` | Extends `auth.users` — profile + all 5 granular DPDP consent fields |
| `health_profiles` | The "Digital Health Twin" — conditions, allergies, lifestyle, emergency contact |
| `prescriptions` | Uploaded prescriptions + AI extraction + pharmacist verification |
| `medicines` | Individual medicines with schedule, salt composition, AI identification |
| `adherence_logs` | One row per scheduled dose per day — status + skip reason |
| `food_logs` | Daily nutrition logs with optional AI analysis |
| `exercise_logs` | Daily exercise/yoga logs |
| `lab_reports` | Uploaded reports + AI explanation + trend comparison vs previous report |
| `recovery_scores` | One row per user per day — overall + 4 weighted sub-scores + streak |
| `family_members` | Invite system — token-based, granular permissions, full consent audit trail |
| `ai_conversations` | Full AI Companion chat history, tagged with context snapshot for audit |
| `sos_contacts` | Emergency contacts, each with their own health-data-access consent |
| `sos_events` | Log of every SOS trigger — location, contacts alerted, resolution |
| `consent_audit_log` | DPDP-required permanent log of every consent grant/revoke |
| `deletion_requests` | Account deletion requests with 30-day due date |
| `notifications` | In-app/WhatsApp/SMS notification queue |
| `app_config` | Versioned config: consent version, AI disclaimers in 3 languages |

**Important relationships:**
- `adherence_logs.medicine_id → medicines.id` (cascade delete)
- `lab_reports.previous_report_id → lab_reports.id` (self-reference, for trend tracking)
- `family_members.patient_user_id` and `family_members.family_user_id` both reference `users.id` — a single row represents one consent grant from one patient to one family member

**Key SQL functions:**
- `calculate_recovery_score(user_id, date)` — computes and upserts the daily Recovery Score (see Section 10 for the formula)
- `get_family_dashboard(patient_id, family_id)` — returns a permission-filtered summary for the caregiver view in `family.html`

---

## Supabase Setup

### Authentication
- Email/password auth. Phone-only signups use a synthetic email (`{phone}@curaah.user`) since Supabase Auth requires an email field — `login.html` resolves phone-or-email input to the correct format automatically.
- No separate account types here (unlike Curaah 1.0's patients/staff/proxy-agents split) — every Curaah 2.0 user is a `users` row, and family relationships are modeled via the `family_members` table, not separate auth roles.

### Connection (`js/supabase.js`)
```javascript
const SUPABASE_URL = 'https://odefkuavdrximrkcfnbd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_v8_0rizrl232lQEAPXyBfw_pyFD-2CE';
```
This anon key is public-safe; RLS policies on every table are what actually protect data.

### Setup order (run once, in this order)
```
1. Run curaah2-schema.sql in SQL Editor
2. Run curaah2-family-rls-fix.sql in SQL Editor
3. Create storage buckets (see Section 7)
4. Add AI provider keys as Supabase secrets (see Section 8) — only when ready
5. Deploy Edge Functions (see Section 8) — only when ready
```

---

## Storage Buckets

Create these in **Supabase Dashboard → Storage**. All must be **private** (no public access) — every page accesses files only via short-lived signed URLs (`createSignedUrl`), never public URLs.

| Bucket | Used by | Max size suggestion |
|---|---|---|
| `prescriptions` | `prescriptions.html` | 10MB, image/pdf |
| `lab-reports` | `lab-reports.html` | 10MB, image/pdf |
| `medicine-strips` | `medicines.html` | 5MB, image only |
| `avatars` | `profile.html`, `ai-companion.html` (chat photo attachments) | 2MB, image only |

File paths follow the pattern `{user_id}/{timestamp}.{ext}` so each user's files are namespaced — combined with Storage RLS (not yet explicitly written; currently relying on signed-URL-only access patterns in the frontend). **Recommend adding explicit Storage RLS policies before production** restricting each bucket so a user can only upload/read under their own `{user_id}/` prefix.

---

## Edge Functions (AI Layer)

**Deliberately not yet built.** Per project decision, AI provider keys (Sarvam, Claude, Gemini) are added to Supabase secrets only *after* the full frontend/schema is complete and tested — never hold keys in frontend code.

Every page that needs AI already calls the relevant function via `supabase.functions.invoke(...)` and **gracefully degrades** if the function isn't deployed yet (shows a "saved, AI analysis coming shortly" message instead of breaking). This means the app is fully testable end-to-end right now, before any AI key exists.

| Function | Called from | Expected input | Expected output |
|---|---|---|---|
| `extract-prescription` | `prescriptions.html` | `{ prescription_id, file_path }` | `{ medicines: [{ name, dosage, timing }], diagnosis, doctor_name }` |
| `explain-lab-report` | `lab-reports.html` | `{ report_id, file_path, language }` | `{ summary, values_explained: [{ name, value, unit, status, explanation }] }` |
| `identify-medicine` | `medicines.html` | `{ strip_url?, tablet_url?, user_id }` | `{ medicine_name, matches_schedule, explanation, interaction_warning? }` |
| `proxy-llm` | `ai-companion.html` | `{ message, photo_url?, health_context, language, session_id }` | `{ reply }` |
| `send-sos-alert` | `sos.html` | `{ user_id, event_id, lat, lng }` | (dispatches SMS/WhatsApp — no return value needed by frontend) |

**Security requirement for every function:** API keys for Sarvam/Claude/Gemini must be set via `supabase secrets set` and read with `Deno.env.get(...)` inside the function — never passed from or exposed to the frontend.

**`proxy-llm` system prompt must enforce:**
- Never diagnose, never prescribe
- Always include the disclaimer (frontend already renders one via `renderAiDisclaimer()`, but the model's own response should also stay within general-guidance framing)
- Detect emergency-language input and direct to calling 112 / nearest hospital
- Respond in the `language` passed (hindi/punjabi/english)
- Use `health_context` (conditions, medicines, recent adherence, recovery score) to personalise, but never invent facts not present in that context

---

## All Pages — Detailed

### `index.html` — Homepage
Hero with a live chat-bubble mockup, the "Rajinder Singh" problem-story timeline, 6-feature grid, 3-channel section (App/WhatsApp/AI Voice Call), 4-tier pricing teaser (Free / Care ₹99 / Family ₹199 / NRI $9), final CTA.

### `register.html` — Registration
3-step flow: (1) basic details + language selection, (2) health snapshot + emergency contact, (3) **5 separate granular consent checkboxes** (health data, AI analysis, family sharing, research, marketing) — 2 required, 3 optional — plus Terms/Privacy agreement. On submit: creates `auth.users` + `users` row + `health_profiles` row + optional `sos_contacts` row + **5 individual rows in `consent_audit_log`** (one per consent type, per DPDP requirement that consent be auditable per-purpose).

### `login.html`
Accepts email or phone (resolves phone → synthetic email). Forgot-password flow via `supabase.auth.resetPasswordForEmail`. Captures and respects a `?return=` URL param for deep-link flows (used by `family-accept.html`).

### `dashboard.html` — Main Hub
- Recovery Score ring (calls `calculate_recovery_score` RPC live, then reads back the row)
- Today's Medicines list, built from `medicines.timing[]` × per-medicine schedule, joined against today's `adherence_logs`
- Tap ✓/✗ to log adherence — skip prompts for a reason (`forgot`, `side_effects`, etc.) via a simple `prompt()` (a proper modal is a good upgrade later)
- Recent prescriptions / recent lab reports panels

### `prescriptions.html`
Drag-and-drop or click upload → Supabase Storage (`prescriptions` bucket) → signed URL → insert `prescriptions` row (`extraction_status: 'pending'`) → calls `extract-prescription` edge function → renders extracted medicines + "pending pharmacist verification" badge. Full history list below.

### `medicines.html`
Verify panel: upload strip photo and/or tablet photo (both optional, at least one required) → uploads to `medicine-strips` bucket → calls `identify-medicine` → renders match/mismatch result + any interaction warning + AI disclaimer. Active medicines grid below, with schedule chips (🌅🌇🌙) and verified/unverified badge.

### `adherence.html`
30-day stats (taken/skipped/rate/current streak — streak computed client-side by walking back from today). Full navigable month calendar with color-coded dots (green=100% taken that day, amber=partial, red=mostly skipped, grey=no data). Click any past day for a detail breakdown. Skip-reasons horizontal bar chart for the last 30 days.

### `lab-reports.html`
Upload with report type + date metadata → `lab-reports` bucket → links to `previous_report_id` of the same `report_type` for trend tracking → calls `explain-lab-report` → renders color-coded value rows (normal/high/low) + plain-language summary + AI disclaimer. History list shows trend badges (↑ Improving / ↓ Needs Attention) once `improvement_detected` is set (currently only settable by the not-yet-built edge function or manually).

### `ai-companion.html` — The Centerpiece
Builds a `healthContext` snapshot (conditions, medicines, last-7-days adherence, current Recovery Score) on load, then sends it with every message to `proxy-llm`. Supports photo attachments (uploaded to `avatars` bucket as a generic media path). Hindi/Punjabi/English switcher. Every message — both directions — is persisted to `ai_conversations` with `context_snapshot` for audit purposes. Suggested-question chips per language. Graceful fallback text when the edge function isn't deployed.

### `family.html` — Two Modes in One Page
- **"People I've Invited" (patient mode):** form with relationship, contact info, 3 access-level presets (Summary/Full/Emergency-only), 3 individual permission toggles (medicines, lab reports, SOS alerts). On submit, creates a `family_members` row with a generated `invite_token`, copies the invite link, shows it via `alert()` (a proper share-sheet UI is a good upgrade later). List below shows status (Active/Pending/Revoked) with a Revoke button.
- **"Family I'm Watching Over" (caregiver mode):** queries `family_members` where `family_user_id = me`, calls `get_family_dashboard` RPC per patient, renders today's adherence + Recovery Score + SOS-alert status per person.

### `family-accept.html`
Reads `?token=` from URL. States handled: invalid/missing token, already-accepted, revoked, valid-but-needs-login (redirects through `login.html`/`register.html` preserving `?return=` back to this page), valid-and-ready-to-accept. Accept sets `family_user_id`, `is_active: true`, `accepted_at`, `consent_given_at`. **Requires `curaah2-family-rls-fix.sql` to be applied** — the base schema's RLS would otherwise block this update (see Known Issues).

### `sos.html`
Pulsing animated SOS button → 3-second cancellable countdown → on trigger: best-effort geolocation (non-blocking if denied) → fetches active `sos_contacts` → logs `sos_events` row → calls `send-sos-alert` (gracefully degrades if not deployed) → shows "Alert Sent" state listing contacts notified. Add-contact form includes a per-contact "can access health data" consent checkbox. History panel below.

### `recovery-score.html`
Large animated score ring (same formula as dashboard, bigger). 4 breakdown cards with weight labels and progress bars matching the SQL function's exact weighting (40/25/20/15). 14-day bar chart (client-built from `recovery_scores` rows, gaps shown as grey). Dynamic insights list generated from the `breakdown` JSONB column (e.g. "only 4 of 7 doses taken this week").

### `profile.html` — Editing the Digital Health Twin
3 tabs: Basic Info, Health Profile (tag-inputs for conditions/allergies/family history, blood group, smoking/alcohol, activity level, diet, primary doctor/hospital, emergency contact), Preferences (language selector, syncs to `localStorage` via `setPreferredLanguage()` immediately so `ai-companion.html` picks it up). Live Profile Completeness ring (10-point checklist) updates after each save.

### `consent.html`
Required consents (health data, AI analysis) shown as **locked toggles** — can't be turned off without deleting the account, since the product can't function without them. Optional consents (family sharing, research, marketing) toggle live, each write going to both `users` and `consent_audit_log`. "Download My Data" button does a real client-side export — pulls from all 12 user-data tables and downloads a JSON file (genuine DPDP data-portability, not a stub). Full audit log list below, human-readable ("You granted consent for...").

### `delete-account.html`
Lists concrete consequences, the 3-step 30-day timeline, optional exit-reason capture, **password re-verification** (re-runs `signInWithPassword` before proceeding — defends against a hijacked session triggering deletion), and a typed-confirmation-phrase (`DELETE MY ACCOUNT`) gate. On submit: inserts `deletion_requests` row, sets `users.is_active = false`, logs to `consent_audit_log`, signs out. **Actual data deletion is not automated** — see Known Issues.

### `privacy.html` / `terms.html`
Both written specific to Curaah 2.0's actual data flows (not generic templates) — cover the AI processing pipeline, pharmacist-verification-as-trust-layer, family-sharing consent model, SOS data-sharing scope, 72-hour breach notification commitment, and full medical disclaimer. Cross-linked to each other and to `consent.html`.

---

## The Recovery Score Formula

Implemented in `calculate_recovery_score()` in `curaah2-schema.sql`. **This exact formula must stay in sync between the SQL function and any explanatory text in `recovery-score.html` / `dashboard.html`.**

```
Overall Score =
    Adherence Score   × 0.40   (last 7 days, % of scheduled doses taken,
                                 +5 bonus per 7-day perfect streak, capped at +20)
  + Lab Score          × 0.25   (80 if most recent report shows improvement,
                                 40 if not, 50 if no reports yet — neutral default)
  + Lifestyle Score    × 0.20   (50% from food logs/7 this week, 50% from
                                 exercise logs/5 this week, capped at 100)
  + Engagement Score   × 0.15   (40 base + up to 40 from AI questions this week
                                 (capped at 3) + 20 flat for profile completion —
                                 this last term is simplified and could be made
                                 more dynamic later)
```

The function upserts one row per `(user_id, score_date)` in `recovery_scores`, storing both the headline numbers and a full `breakdown` JSONB for the insights engine in `recovery-score.html` to read from.

---

## DPDP Act 2023 Compliance — What's Built In

This was a first-class design requirement, not an afterthought. Concretely:

- **Granular, separate consent** at registration — never one blanket checkbox (`register.html` Step 3)
- **Consent audit trail** — every grant/revoke, including at signup, is a separate timestamped row in `consent_audit_log` (`register.html`, `consent.html`, `delete-account.html`)
- **Right to access** — full data visible across the dashboard; real JSON export in `consent.html`
- **Right to erasure** — `delete-account.html` creates a `deletion_requests` row with a `due_by` 30 days out, deactivates the account immediately
- **Right to withdraw consent** — optional consents toggle live and independently in `consent.html`, without affecting account access
- **Family/SOS consent is opt-in and granular** — nothing is shared by default; every permission is an explicit boolean the patient sets (`family.html`, `sos.html`)
- **AI disclaimer surfaced everywhere AI output appears** — `renderAiDisclaimer()` in `main.js`, used in `ai-companion.html`, `medicines.html`, `lab-reports.html`
- **No API keys in frontend** — AI calls are designed to go only through Supabase Edge Functions (Section 8)
- **Private file storage** — no public bucket URLs, only signed URLs with expiry

---

## RLS Policies

Full policies are in `curaah2-schema.sql`; the family-invite-specific addition is in `curaah2-family-rls-fix.sql`. Key patterns:

- Almost every personal table: `using (auth.uid() = user_id)` for full self-access
- `family_members`: patient manages their own outgoing invites; family member can view invites where they're the `family_user_id`; **plus** the narrow "claim by token" policies added in the fix file
- Read-extension policies on `medicines`, `adherence_logs`, `lab_reports`, `recovery_scores`: family members can `SELECT` a patient's rows **only** where a matching active `family_members` row grants that specific permission (`can_view_medicines`, `can_view_lab_reports`, etc.) — this is the actual enforcement layer behind the consent model, not just a UI suggestion

---

## Known Issues & Pending Fixes

### 1. Family invite acceptance required an RLS fix (resolved)
**Problem:** the base schema's `family_members` policies only let `patient_user_id = auth.uid()` write rows. But accepting an invite means a *different* user (the invitee) needs to update a row where they're not yet attached.
**Fix:** `curaah2-family-rls-fix.sql` adds three narrow policies scoped only to **unclaimed** invites (`family_user_id is null`). **Must be run** for `family-accept.html` to work — it is not included in the base schema file.

### 2. Storage bucket RLS not yet explicit
**Problem:** buckets are created as private, but no explicit per-user path policy has been written yet (e.g. restricting `prescriptions/{user_id}/...` writes to only that `user_id`). Currently relies on signed-URL-only access patterns in the frontend.
**Recommendation:** add Storage RLS policies before any real user data goes in, of the form:
```sql
create policy "Users can upload own prescriptions"
on storage.objects for insert
with check (bucket_id = 'prescriptions' and (storage.foldername(name))[1] = auth.uid()::text);
```
(repeat per bucket, per operation)

### 3. Account deletion is not automated end-to-end
**Problem:** `delete-account.html` creates the `deletion_requests` row and deactivates the account, but nothing currently runs the actual cascading data deletion after 30 days.
**Needed:** a scheduled Edge Function (or Supabase Cron job) that finds `deletion_requests` past their `due_by` with `status = 'pending'`, deletes all related rows across every table, and marks the request `completed`.

### 4. Skip-reason capture uses a native `prompt()`
In `dashboard.html`, marking a dose "skipped" uses `prompt()` for the reason — functional, but a proper modal with the 8 predefined `skip_reason` options (matching the schema's check constraint) would be a better experience and avoid free-text mismatches with the enum.

### 5. Family invite link sharing uses `alert()`
In `family.html`, after creating an invite, the link is shown via `alert()` and copied to clipboard. A proper share-sheet (or WhatsApp-share deep link, given the target audience) would be a meaningful upgrade.

### 6. `medicines.html` has no manual "add medicine" flow
Medicines are currently only created via prescription AI extraction. If extraction isn't deployed yet (see Section 8), there is no UI path to manually add a medicine. Worth adding a simple manual-entry form as a stopgap.

---

## What Is NOT Built Yet

```
Edge Functions (all 5)             — Deliberately deferred until AI keys are added
Storage bucket RLS policies        — See Known Issue #2
Automated 30-day deletion sweep    — See Known Issue #3
Manual "add medicine" form         — See Known Issue #6
WhatsApp Business API integration  — For the "use Curaah entirely via WhatsApp" channel
AI Voice Call (Sarvam STT/TTS)     — Phone-based onboarding/check-ins
Payment gateway integration        — For Curaah Care/Family/NRI paid tiers
Push notifications                 — Medicine reminders currently have no delivery
                                      mechanism beyond opening the app
Mobile app / PWA manifest          — Currently desktop/mobile-web only
Recovery Kits (Phase 2 commerce)   — Mentioned in product vision, not built
Population health analytics        — Anonymised aggregate insights (Year 2+ idea)
Blockchain health ledger           — Long-term vision, not started
```

---

## Local Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/Curaah2.git
cd Curaah2

# Any static server works — no build step
python3 -m http.server 8000
# or use the VS Code Live Server extension

# Open
http://localhost:8000
```

Supabase URL and anon key in `js/supabase.js` work identically on localhost and production — no environment switching needed. Auth, storage, and RPC calls all function locally as long as the Curaah2 Supabase project has had the schema + RLS fix applied.

### Testing without AI keys
Every AI-dependent page (`prescriptions.html`, `medicines.html`, `lab-reports.html`, `ai-companion.html`) is built to **work fully end-to-end without any Edge Function deployed** — uploads succeed, data saves, and a clear "AI analysis coming shortly" message shows instead of an error. This means the whole non-AI product (auth, profile, adherence logging, family sharing, SOS, consent management) can be fully tested today.

---

## Deployment

### GitHub Pages
```
1. Push all files to the `main` branch of the Curaah2 repository
2. Repository Settings → Pages → Source: main branch, root folder
3. Add a CNAME file if using a custom domain
4. Test the live URL before sharing — especially register → login → dashboard flow
```

### Pre-launch checklist
```
□ curaah2-schema.sql run in Supabase SQL Editor
□ curaah2-family-rls-fix.sql run in Supabase SQL Editor
□ 4 storage buckets created (prescriptions, lab-reports, medicine-strips, avatars), all private
□ Storage RLS policies added (see Known Issue #2)
□ All HTML files + css/ + js/ + assets/ pushed to repo root
□ Supabase project not paused (free tier pauses after 7 days inactivity —
  set up a cron-job.org ping if needed, same as Curaah 1.0)
□ Full registration → login → dashboard flow tested on the live URL
□ Family invite → accept flow tested with two real accounts
```

---

## Testing Checklist

### Registration & consent
```
□ Register with phone only (no email) — verify synthetic email login works after
□ Try submitting Step 3 without required consents — should block with a toast
□ Verify 5 separate consent_audit_log rows are created on successful registration
□ Login with phone number on login.html
□ Login with email on login.html
□ Test forgot password flow
```

### Core health features
```
□ Upload a prescription — verify it appears in history with "Processing" badge
□ Upload a lab report with a type and date — verify it appears in history
□ Mark a dose "taken" on dashboard — verify adherence_logs row + Recovery Score updates
□ Mark a dose "skipped" with a reason — verify it appears in adherence.html's
  skip-reasons breakdown
□ Check adherence.html calendar — click a past day, verify detail view
□ Check recovery-score.html — verify breakdown cards match dashboard ring
```

### AI Companion (pre-AI-key testing)
```
□ Send a text message — verify fallback message appears, conversation saves
□ Attach a photo — verify preview shows, message sends, photo uploads to storage
□ Switch language — verify suggested questions change
□ Reload page — verify conversation history loads from ai_conversations
```

### Family & SOS
```
□ Create a family invite from family.html — verify invite link generated
□ Open the invite link in an incognito window, register a new account
□ Accept the invite — verify it appears as "Active" in the inviter's list
   (REQUIRES curaah2-family-rls-fix.sql to have been run)
□ Switch to "Family I'm Watching Over" tab — verify the patient's summary loads
□ Revoke access from the patient side — verify caregiver loses access
□ Add an SOS contact with health-data-access consent checked
□ Trigger SOS — verify countdown, cancel works, and full trigger logs an sos_events row
```

### Account management
```
□ Edit profile across all 3 tabs — verify Profile Completeness ring updates
□ Toggle an optional consent in consent.html — verify audit log entry appears
□ Download data export — verify JSON file contains real data across all tables
□ Submit account deletion with wrong password — verify it's rejected
□ Submit account deletion with correct password + exact phrase — verify
  deletion_requests row created and account becomes unable to log in
```

---

## Design System Notes

Same brand identity as Curaah 1.0, with warmer touches appropriate to a companion product:

```css
--navy:       #060d1f
--navy-mid:   #0f1f3d
--electric:   #3d9eff   /* primary accent, same as Hospital OS */
--teal:       #00d4aa   /* new — used for the companion/wellness feel */
--success:    #00c48c
--warning:    #ff9f00
--danger:     #ff4757
--warm-white: #fdfbf8   /* new — homepage background, warmer than the
                            Hospital OS's --off-white */
```

Logo: identical shield-with-water-drop SVG inline, used across every page — this is the visual thread connecting Curaah 1.0 and 2.0 as one company.

Typography: Georgia (serif) for headings — same as Hospital OS — Inter for body text.

---

*README last updated: May 2026*
*Curaah HealthTech Pvt Ltd · Nangal, Punjab 🇮🇳*
*"Your health, remembered."*
