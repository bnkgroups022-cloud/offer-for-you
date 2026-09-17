# Offer For You — BNK AI Ad Studio (V1.0)

A SaaS platform where a user uploads a product image and AI generates a
full affiliate ad kit: prompts, video scripts, captions, WhatsApp copy,
hashtags, and downloadable assets.

This repo is being built **phase by phase**. Each phase is fully working
and testable on its own before the next one starts.

## Phase 1 — Auth & Dashboard (this delivery)

**Included:**
- Next.js 15 (App Router) + TypeScript + Tailwind CSS project scaffold
- Dark theme, mobile-first responsive UI, brand colors wired into Tailwind
- Premium marketing landing page at `/` — Hero, Features, How It Works,
  Pricing (Coming Soon), FAQ, Footer, with Login / Start Free CTAs
- Google Sign-In via Firebase Authentication
- Client-side protected `/dashboard` route (redirects to `/login` if signed out)
- Dashboard shell: sidebar (desktop) / drawer + bottom nav (mobile), topbar
  with profile menu and sign-out
- Dashboard widgets, as responsive cards: **Upload Product** (now live —
  see Phase 2 below), **Recent Projects** (now backed by real Supabase
  data — see Phase 4), **AI Credits** (shows the true `0` used; the
  generator and project-saving are both live, see Phases 3-4, but a
  running per-user usage count is still to come), **Download History**
  (empty state until Phase 5), **Profile** (real: avatar, name, email,
  Google badge, join date, sign out)

**Not included yet** (later phases): Supabase persistence (saving
uploads/projects against a user), OpenAI-powered generators, and asset
downloads. Their env vars are already reserved in `.env.local.example`
so nothing has to be restructured later.

## Phase 2 — Image Upload (Cloudinary)

**Included:**
- Drag-and-drop **and** click-to-browse upload in the "Upload Product"
  dashboard widget
- Live **preview** thumbnail for every file, generated locally before
  upload even starts
- Real **progress bar** per file, driven by actual upload progress events
  (not a fake timer)
- **File validation** — type (JPG/PNG/WebP only) and size (8MB max),
  checked before upload, with the specific reason shown inline on
  rejected files
- **Delete** that actually works: removing a file that's still uploading
  cancels the request; removing one that's already on Cloudinary calls a
  server route (`/api/uploads/delete`) that signs a real delete request
  with the Cloudinary Admin SDK
- Files upload directly from the browser to Cloudinary via an **unsigned
  upload preset** — no file ever passes through our own server, so
  uploads aren't bottlenecked by it

**Not included yet:** uploaded photos aren't saved anywhere durable yet
(no Supabase table exists), so they won't appear in "Recent Projects"
and are **not** tied to your account — refreshing the page clears the
list from view (though the files remain on Cloudinary until deleted).
Wiring uploads to a real "projects" record is part of the Supabase work
still to come.

**Security note:** the delete route currently has no ownership check —
anyone who knows a `publicId` could ask the API to delete it, since
there's no database yet linking uploads to users. This is fine for this
single-tenant testing phase; the code has a `TODO` marking exactly where
to add an ownership check once Supabase exists.

## Phase 3 — AI Generator (OpenAI)

A single new page, **AI Generator** (`/dashboard/generate`), that takes a
product photo plus a few details and returns a complete ad kit in one
OpenAI call.

**Note on navigation:** Phase 1 originally sketched five separate
placeholder nav items — Prompt Generator, Script Generator, Caption
Generator, WhatsApp Copy, Hashtag Generator — on the assumption each
would be its own tool. Since the product always generates the whole kit
in a single pass (matching the landing page's "upload once, get
everything" pitch), those five have been consolidated into one **AI
Generator** nav item. The "Upload Product" nav placeholder was also
removed, since upload lives as a Dashboard widget, not a separate route.
The sidebar now has three real items: Dashboard, AI Generator, Download
Assets (still coming soon).

**Inputs:** Product Image (its own drag-and-drop upload, reusing the
Phase 2 Cloudinary pipeline), Product Name, Category (a select, with an
"Other" free-text option), Language (English, Hindi, Hinglish, Tamil,
Telugu, Bengali, Marathi).

**Outputs, generated together in one pass:**
- **Product Analysis** — 2-3 sentences on what the product is and who it appeals to
- **3 Hooks** — short scroll-stopping opening lines, each individually copyable
- **15-Second Script** — a time-coded short-form video script (0-3s / 3-10s / 10-15s beats)
- **Kling Prompt** — a cinematic prompt (always in English) ready to paste into Kling AI
- **WhatsApp Message** — a casual, friend-to-friend recommendation
- **Instagram Caption** — a ready-to-post caption (hashtags kept separate)
- **10 Hashtags** — shown as chips, copyable individually or all at once

Every output field (except the Kling prompt, which is intentionally
always English) is written in the language you selected — not machine-translated
English, but generated natively in that language.

**How it's wired:**
- `/api/generate` is a server route — this is the only place
  `OPENAI_API_KEY` is read, so it never reaches the browser
- Uses OpenAI's **Structured Outputs** (a JSON Schema passed as
  `response_format`) so the model is constrained to return exactly the
  7 fields above — no fragile regex-parsing of free-text output
- The parsed JSON is validated again with a `zod` schema server-side
  before it's ever sent to the browser, as defense-in-depth on top of
  Structured Outputs
- The product photo is sent to OpenAI as an image URL (the Cloudinary
  `secure_url` from the upload), not re-uploaded as base64

**Note (Phase 4 update):** generated ad kits are now saved automatically
— see Phase 4 below. This section is kept as-is for the historical
record of what Phase 3 shipped on its own.

**Security note:** like the Phase 2 delete route, `/api/generate` has no
per-user rate limiting or ownership check yet — anyone who can reach
your deployed app's `/api/generate` endpoint can trigger an OpenAI call
on your API key. Fine for local testing; before a public launch, add
rate limiting and tie requests to a signed-in user.

## Phase 4 — My Projects (Supabase)

A new **My Projects** page (`/dashboard/projects`), plus real
persistence: every ad kit the AI Generator produces is now saved
automatically, and the Dashboard's Recent Projects widget shows real
data instead of an empty state.

**What's new:**
- **Auto-save on generate** — the moment `/dashboard/generate` gets a
  successful result, it's saved to Supabase in the background (no extra
  click). A small inline banner shows "Saving…", then "Saved to My
  Projects," or a clear error if the save failed (the ad kit itself
  stays fully usable either way — a failed save never loses your
  generated text, you can still copy it manually).
- **My Projects page** — thumbnail, product name, category, language,
  and created date for every saved project, newest first. Also linked
  from the sidebar (new **My Projects** nav item) and from Recent
  Projects' "View all."
- **Real Download** — click Download on any project to get a genuine
  `.txt` file (built client-side, no server round-trip) containing the
  product analysis, all 3 hooks, the script, the Kling prompt, the
  WhatsApp message, the Instagram caption, and all 10 hashtags.
- **Real Delete** — click Delete (with a confirmation prompt) and the
  project disappears for good: the server route removes the Cloudinary
  image *and* the Supabase row, so nothing orphaned is left behind on
  either service.
- **Recent Projects, wired up** — the Dashboard widget now shows your 4
  most recent saved projects (or the same honest empty state as before,
  if you haven't generated anything yet).

**How it's wired:**
- All Supabase access goes through server-side API routes
  (`/api/projects`, `/api/projects/[id]`) using the **service role key**
  — the browser never talks to Supabase directly, and no
  `NEXT_PUBLIC_SUPABASE_*` client is used anywhere in this app.
- The `projects` table has Row Level Security **enabled with zero
  policies**. That's intentional: it means the anon/authenticated roles
  (which this app never uses anyway) are locked out completely, and only
  the service-role client — used only in these server routes — can read
  or write. See "Supabase Setup" below for the exact SQL.
- Every field of the ad kit (`analysis`, `hooks`, `script`, `klingPrompt`,
  `whatsappMessage`, `instagramCaption`, `hashtags`) is stored as one
  `jsonb` column, so no schema migration is needed if a future phase adds
  more output fields.
- Deleting a project deletes its Cloudinary image first (best-effort —
  logged but non-blocking) and then its Supabase row, so a Cloudinary
  hiccup never leaves a project stuck and undeletable.

**Security note (same trust model as every route so far):** there's
still no Firebase Admin SDK to verify ID tokens server-side, so every
`/api/projects*` route trusts a client-supplied Firebase `uid` rather
than a verified session. The delete route additionally checks that
`project.user_id === uid` before deleting anything, but — exactly like
the ownership checks mentioned in Phases 2 and 3 — this is
accident-prevention, not real security: a malicious client could send
any `uid` it likes. Before this is production-hardened for multiple
real users, add Firebase Admin ID-token verification server-side and
derive `uid` from the verified token instead of trusting the request.

## Phase 5 — Export System (Download Assets)

**Download Assets** (`/dashboard/downloads`) is now a real page instead
of the "Soon" placeholder in the sidebar. Pick any saved project and
export the pieces you actually need, one at a time:

- **Instagram Caption**
- **WhatsApp Copy**
- **Hashtags** (joined into one paste-ready line, `#` added to any tag
  that's missing it)
- **AI Prompt** (the Kling video prompt from Phase 3)

Each has its own **Copy** button (instant, no download) and **Download**
button (a real `.txt` file, built client-side — no server round-trip,
same pattern as Phase 4's full-kit export). A **"Download full kit"**
button is still there too, for when you want everything — analysis,
hooks, script, and all seven fields — in one file.

**Generate Video — future placeholder.** A clearly disabled card sits
below the four exports, labeled "Coming soon." It's there so the
eventual "send the AI Prompt to Kling and get a video back" flow has an
obvious home once the Kling API is wired up — nothing is faked or
simulated here; the button does nothing but explain what it will do
later.

**How it's wired:**
- The project picker (a `<select>`) defaults to your most recently
  generated project and lists every saved project by name and date.
- All four exports and the full-kit download pull straight from the
  `Project` already loaded by `useProjects()` — no new API route was
  needed, since the data was already being fetched for My Projects.
- Filenames are slugified from the product name (e.g.
  `wireless-neckband-earphones-whatsapp-copy.txt`), using the same
  `slugify()` helper the Phase 4 full-kit export uses (now shared, in
  `src/lib/slugify.ts`, instead of duplicated).
- The Dashboard's **Download History** widget still shows an honest
  empty state — no download event is logged anywhere yet (there's no
  `downloads` table), so a fabricated history would be dishonest. It now
  links to the real Download Assets page and says plainly that history
  logging is a gap, not a hidden feature.

**Not included yet:** no download event is recorded anywhere (so
Download History stays empty even after you export things), and
Generate Video does nothing beyond explaining itself — both are called
out above and in the Roadmap.

## Tech stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Firebase Authentication (Google provider)
- Cloudinary (image upload, Phase 2 — live)
- OpenAI API (AI Generator, Phase 3 — live), validated with `zod`
- Supabase (persistence, Phase 4 — live), accessed only server-side with
  the service role key
- Kling API (future — the Kling prompt output is already Kling-ready)

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- A Firebase project with the **Google** sign-in provider enabled
- A Cloudinary account with an **unsigned upload preset** (free tier is fine)
- An OpenAI API key with access to a vision-capable model (e.g. `gpt-4o`)
- A Supabase project (free tier is fine) with a `projects` table — see
  **Supabase Setup** below

> Note: this project was authored in a sandboxed environment without
> package-registry access, so `npm install` / `npm run build` have not
> been run here. Please run them locally as the first test — see
> "Phase 1 Test" below.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up Firebase — see the **Firebase Console Setup** walkthrough below
   if this is your first time; short version:
   - Build → Authentication → Sign-in method → enable **Google**
   - Project settings → General → "Your apps" → add a **Web app** →
     copy the `firebaseConfig` values
3. Set up Cloudinary — see the **Cloudinary Console Setup** walkthrough
   below; short version: grab your cloud name from the dashboard, create
   an unsigned upload preset, and grab your API key/secret.
4. Set up OpenAI — see the **OpenAI Setup** walkthrough below; short
   version: create an API key at platform.openai.com and add billing
   (the API isn't covered by a ChatGPT subscription).
5. Set up Supabase — see the **Supabase Setup** walkthrough below; short
   version: create a project, run the provided SQL to create the
   `projects` table with RLS enabled, and grab the service role key.
6. Copy the env template and fill it in:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in the six `NEXT_PUBLIC_FIREBASE_*` values, the four
   `CLOUDINARY_*` / `NEXT_PUBLIC_CLOUDINARY_*` values, `OPENAI_API_KEY`,
   and `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`. Leave
   Kling blank — reserved for later.
7. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000
8. Click **Get started free** → **Continue with Google** → you should
   land on `/dashboard` signed in, and refreshing should keep you signed
   in (and redirect straight to `/dashboard` from `/`).

## Firebase Console Setup (step by step)

Everything here happens at https://console.firebase.google.com — no
billing account or credit card needed for Authentication.

**1. Create the project**
1. Click **Add project** (or **Create a project**).
2. Enter a project name, e.g. `offer-for-you`. Firebase suggests a unique
   project ID underneath — you can leave it as-is.
3. You'll be asked about Google Analytics — you can toggle it **off** for
   this project; it isn't needed for Authentication.
4. Click **Create project** and wait for it to finish provisioning.

**2. Enable the Google sign-in provider**
1. In the left sidebar, open **Build → Authentication**.
2. Click **Get started** (first time only).
3. Go to the **Sign-in method** tab.
4. Click **Google** in the provider list.
5. Toggle **Enable**.
6. Set a **Project public-facing name** (shown on the Google consent
   screen, e.g. "Offer For You") and a **Project support email** (pick
   your own email from the dropdown).
7. Click **Save**.

**3. Register a Web app and get your config**
1. Click the **gear icon → Project settings** in the left sidebar.
2. Scroll to **Your apps** and click the **`</>`** (Web) icon to add a
   web app.
3. Give it a nickname, e.g. `offer-for-you-web`. You do **not** need to
   check "Also set up Firebase Hosting."
4. Click **Register app**. Firebase shows a `firebaseConfig` object —
   copy the six values (`apiKey`, `authDomain`, `projectId`,
   `storageBucket`, `messagingSenderId`, `appId`) into your `.env.local`
   as the matching `NEXT_PUBLIC_FIREBASE_*` variables.
5. Click **Continue to console** — you can skip the SDK install
   instructions Firebase shows, since the `firebase` npm package is
   already in this project's `package.json`.

**4. Authorize the domains that will run this app**
1. Still in **Authentication**, go to the **Settings** tab → **Authorized
   domains**.
2. `localhost` is included by default, so local development works
   immediately.
3. When you deploy, add your deployed domain here too (e.g.
   `your-app.vercel.app`, and later your custom domain) — otherwise
   Google sign-in fails on that domain with `auth/unauthorized-domain`.

**5. Confirm it's wired up correctly**
1. In this project, copy `.env.local.example` to `.env.local` and paste
   in the six values from step 3.
2. Run `npm run dev`, open the app, and click **Start Free** or
   **Login → Continue with Google**.
3. A Google account-picker popup should appear. After choosing an
   account, you should land on `/dashboard` with your name, email and
   photo showing in the top-right menu.

**Common issues**
- **`auth/unauthorized-domain`** — the domain you're testing from isn't
  in Authorized domains (step 4).
- **Popup closes immediately / `auth/popup-blocked`** — your browser
  blocked the sign-in popup; allow popups for `localhost` and retry.
- **Sign-in button is disabled** — `.env.local` is missing or one of the
  six `NEXT_PUBLIC_FIREBASE_*` values is empty; check the browser
  console for the exact missing-key warning this project logs.

## Cloudinary Console Setup (step by step)

Everything here happens at https://console.cloudinary.com — the free
tier is enough for development.

**1. Create an account and find your cloud name**
1. Sign up (or log in) at https://cloudinary.com.
2. On the **Dashboard**, copy the **Cloud name** shown near the top —
   this goes in `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

**2. Create an unsigned upload preset**
Uploads happen directly from the browser, so they use an *unsigned*
preset rather than your secret API key.
1. Go to the **gear icon → Settings → Upload**.
2. Scroll to **Upload presets** → click **Add upload preset**.
3. Set **Signing Mode** to **Unsigned**.
4. (Recommended) Set **Folder** to `offer-for-you/products` so every
   upload from this app is organized under one folder automatically.
5. (Recommended, defense-in-depth) Under the preset's restrictions, set
   **Allowed formats** to `jpg, png, webp` and a max file size — this
   backs up the client-side validation this project already does.
6. Click **Save**, then copy the preset's **name** into
   `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

**3. Get your API key and secret (for deleting files)**
1. Back on the **Dashboard**, find **API Key** and **API Secret** (click
   "reveal" for the secret).
2. Copy them into `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` — no
   `NEXT_PUBLIC_` prefix on these two; they must stay server-only.

**4. Confirm it's wired up correctly**
1. Fill in all four Cloudinary values in `.env.local`.
2. Run `npm run dev`, sign in, and on the dashboard's Upload Product
   card, drag in a JPG or PNG.
3. You should see a thumbnail preview immediately, a progress bar while
   it uploads, then a green "Uploaded" badge and a "View on Cloudinary"
   link — click it to confirm the file really is on Cloudinary.
4. Click the trash icon to delete it — the item should disappear from
   the list. To fully confirm, check Cloudinary's **Media Library** in
   the console; the file (and folder, if you set one) should be gone.

**Common issues**
- **Upload silently fails / network error** — double check
  `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and
  `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` are both set and the preset is
  actually **Unsigned** (a signed preset will reject browser uploads
  that don't include a signature).
- **"Upload preset not found"** — the preset name in `.env.local`
  doesn't match one in Console > Settings > Upload exactly (case-sensitive).
- **Delete button shows an error** — `CLOUDINARY_API_KEY` /
  `CLOUDINARY_API_SECRET` are missing from `.env.local`, or the dev
  server needs a restart after adding them (Next.js only reads
  `.env.local` at startup).

## OpenAI Setup (step by step)

Everything here happens at https://platform.openai.com — note that this
is separate from a ChatGPT Plus subscription; API usage is billed
separately (pay-as-you-go), typically a few cents per generation.

**1. Create an API key**
1. Log in (or sign up) at https://platform.openai.com.
2. Go to **Dashboard → API keys** (or platform.openai.com/api-keys).
3. Click **Create new secret key**, give it a name like
   `offer-for-you-dev`, and copy the key immediately — it's only shown once.
4. Paste it into `OPENAI_API_KEY` in `.env.local`. Leave `OPENAI_MODEL`
   blank unless you want to override the default (`gpt-4o`).

**2. Add billing**
1. Go to **Settings → Billing** and add a payment method plus a small
   initial credit balance. Without this, API calls fail even with a
   valid key.
2. (Recommended) Set a monthly budget/usage limit under Billing so a bug
   or unexpected traffic can't run up a large bill.

**3. Confirm it's wired up correctly**
1. Fill in `OPENAI_API_KEY` (and Cloudinary's four values, if not
   already done) in `.env.local`, then restart `npm run dev`.
2. Sign in, go to the sidebar's **AI Generator**, upload a product photo,
   fill in a name and category, and click **Generate Ad Kit**.
3. After 10-30 seconds you should see all 7 output sections filled in —
   Product Analysis, 3 Hooks, 15-Second Script, Kling Prompt, WhatsApp
   Message, Instagram Caption, 10 Hashtags — each with a working Copy button.

**Common issues**
- **"OpenAI isn't configured" / 500 error immediately** —
  `OPENAI_API_KEY` is missing from `.env.local`, or the dev server
  wasn't restarted after adding it.
- **401 Unauthorized** — the key is invalid, revoked, or pasted with
  extra whitespace.
- **429 / quota errors** — no billing/credit added yet (see step 2), or
  you've hit your usage limit.
- **Generation times out** — vision + structured-output responses can
  take 15-30s; locally this is fine, but on Vercel's free tier, function
  duration is capped lower than the `maxDuration = 60` this route
  requests. If you see timeouts in production, check your Vercel plan's
  function duration limit.
- **Response doesn't match the expected format** — very rare with
  Structured Outputs, but if your `OPENAI_MODEL` override points at a
  model that doesn't support `response_format: json_schema`, generation
  will fail with a clear error; switch back to a model that does (e.g. `gpt-4o`).

## Supabase Setup (step by step)

Everything here happens at https://supabase.com — the free tier is
enough for development.

**1. Create a project**
1. Sign up (or log in) at https://supabase.com/dashboard.
2. Click **New project**, pick an organization, give it a name (e.g.
   `offer-for-you`), set a database password (save it somewhere safe —
   you won't need it for this app, but Supabase requires one), and pick
   a region close to you.
3. Click **Create new project** and wait a minute or two for it to provision.

**2. Create the `projects` table**
1. In the left sidebar, open the **SQL Editor**.
2. Click **New query**, paste the SQL below, and click **Run**:

```sql
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  product_name text not null,
  category text not null,
  language text not null,
  image_url text not null,
  image_public_id text not null,
  ad_kit jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on projects (user_id);

alter table projects enable row level security;
-- No policies are added on purpose: enabling RLS with zero policies
-- locks the anon/authenticated roles out of this table completely.
-- Only the service-role key (used exclusively in this app's server-side
-- API routes — never in the browser) can bypass RLS and access it.
```

3. You should see "Success. No rows returned" — the table now exists.

**3. Get your API URL and service role key**
1. In the left sidebar, open **Project Settings → API**.
2. Copy the **Project URL** into `NEXT_PUBLIC_SUPABASE_URL`.
3. Under **Project API keys**, copy the **`anon` `public`** key into
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not currently used by any code, but
   filled in for completeness/future use).
4. Reveal and copy the **`service_role`** **secret** key into
   `SUPABASE_SERVICE_ROLE_KEY`. Treat this exactly like a password — it
   bypasses every RLS rule. Never commit it, never prefix it with
   `NEXT_PUBLIC_`, never log it.

**4. Confirm it's wired up correctly**
1. Fill in the three Supabase values in `.env.local`, then restart
   `npm run dev`.
2. Sign in, go to **AI Generator**, generate an ad kit (see the Phase 3
   Test above if you need the steps). You should see a "Saving…" then
   "Saved to My Projects" banner appear above the results.
3. Go to the sidebar's **My Projects** — the ad kit you just generated
   should appear with its thumbnail, name, category, language, and date.
4. Back in Supabase, open **Table Editor → projects** — you should see
   the same row there, with `ad_kit` holding the full generated JSON.
5. Click **Download** on the project card — a `.txt` file should
   download with all 7 ad-kit fields inside.
6. Click **Delete**, confirm the prompt — the card disappears, the
   Supabase row is gone from Table Editor, and the image is gone from
   Cloudinary's Media Library.

**Common issues**
- **"Supabase isn't configured on the server"** —
  `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing
  from `.env.local`, or the dev server needs a restart after adding them.
- **"Could not save the project" / "Could not load your projects"** —
  double-check the SQL in step 2 actually ran (check Table Editor for a
  `projects` table); also confirm you copied the `service_role` key, not
  the `anon` key, into `SUPABASE_SERVICE_ROLE_KEY`.
- **Project saved but thumbnail shows "No preview"** — the Cloudinary
  image behind `image_url` was deleted independently (e.g. manually in
  Cloudinary's console) after the project was saved.

## Folder structure

```
src/
  app/
    layout.tsx          Root layout (fonts, dark theme, AuthProvider)
    page.tsx             Public landing page
    login/page.tsx        Google sign-in screen
    dashboard/
      layout.tsx          AuthGuard + DashboardShell wrapper
      page.tsx            Dashboard home (widget grid)
      generate/page.tsx    AI Generator: form + results, auto-saves to Supabase
      projects/page.tsx    My Projects: list, download, delete
      downloads/page.tsx   Download Assets: per-asset export system
    api/
      uploads/delete/route.ts  Server route: signed Cloudinary destroy
      generate/route.ts        Server route: OpenAI call (has the API key)
      projects/route.ts        Server route: GET (list) / POST (save) a project
      projects/[id]/route.ts   Server route: DELETE a project (Cloudinary + Supabase)
  components/
    ui/                  Button, Card, Icon — generic building blocks
    landing/             Navbar, Hero, Features, HowItWorks, Pricing, FAQ,
                          Footer, LandingPage (composes all of the above),
                          content.ts (all landing page copy)
    layout/              Sidebar, Topbar, MobileNav, DashboardShell
    auth/                GoogleSignInButton, AuthGuard, UserAvatar
    dashboard/           UploadProductWidget, RecentProjectsWidget (real data),
                          AICreditsWidget, DownloadHistoryWidget,
                          ProfileWidget, EmptyState (shared empty-state UI)
    upload/              Dropzone (supports single or multi-file),
                          UploadItemCard, ProgressBar
    generator/           GeneratorForm, GeneratorResults, ProductImagePicker,
                          OutputSection, CopyButton
    projects/            ProjectCard (thumbnail, download, delete)
    downloads/           AssetExportCard (per-asset Copy + Download),
                          GenerateVideoCard (disabled Kling placeholder)
  context/AuthContext.tsx Firebase auth state, exposed via useAuth()
  hooks/useAuth.ts
  hooks/useImageUpload.ts       Upload list state (dashboard widget)
  hooks/useSingleImageUpload.ts One-image variant (AI Generator form)
  hooks/useAdGenerator.ts       Calls /api/generate, tracks status/result/lastInput
  hooks/useProjects.ts          Fetches + deletes projects for the signed-in user
  lib/firebase/          client.ts (init) + auth.ts (sign-in/out helpers)
  lib/cloudinary/        validate.ts, upload.ts, delete.ts (client-safe),
                          server.ts (Admin SDK — server-only, has the secret)
  lib/openai/            server.ts (client — server-only, has the API key),
                          prompt.ts (system/user prompt builders),
                          schema.ts (zod validation + the JSON Schema
                          passed to OpenAI's Structured Outputs)
  lib/supabase/          server.ts (service-role client — server-only),
                          schema.ts (zod validation for project payloads),
                          mappers.ts (DB row ↔ app Project type)
  lib/projects/          client.ts (fetch wrappers for /api/projects),
                          download.ts (client-side full-kit .txt export)
  lib/export/            assetExport.ts (client-side per-asset .txt export)
  lib/slugify.ts          Shared filename-safe slug helper
  config/brand.ts        Brand colors + the nav map
  config/generator.ts    Category and language options for the form
  types/user.ts, types/upload.ts, types/generator.ts, types/project.ts
```

## Deploy to Vercel

1. Push this project to a GitHub repo (Vercel deploys from git).
2. Go to https://vercel.com/new and import that repo.
3. Framework preset: Vercel auto-detects **Next.js** — leave build command
   as `next build` and output as default.
4. Before the first deploy, add environment variables under
   **Project Settings → Environment Variables** (copy every key from
   `.env.local.example` that you've filled in — at minimum the six
   `NEXT_PUBLIC_FIREBASE_*` values, the four Cloudinary values,
   `OPENAI_API_KEY`, and `NEXT_PUBLIC_SUPABASE_URL` /
   `SUPABASE_SERVICE_ROLE_KEY`). Add them to all three environments
   (Production, Preview, Development). All `/api/*` routes run as Vercel
   serverless functions automatically — no extra config needed, though
   `/api/generate` requests up to 60s of execution time (`maxDuration` in
   the route file); check your plan's function-duration limit if
   generation times out in production.
5. Click **Deploy**. Vercel builds and gives you a `*.vercel.app` URL.
6. Back in the Firebase console → Authentication → Settings →
   **Authorized domains** → add your `*.vercel.app` domain (and your
   custom domain later) or Google sign-in will fail on the deployed site
   with an `auth/unauthorized-domain` error.
7. For later phases: once new keys exist (e.g. Kling), add them the same
   way before redeploying — no code changes needed, the env vars are
   already wired to be read from `process.env`.

Redeploying after future phases is automatic: every push to your main
branch triggers a new Vercel deployment.

## Phase 1 Test

Run through this after `npm install`:

1. `npm install` completes with no errors
2. `npm run build` completes with no type/lint errors
3. `npm run dev` → open `http://localhost:3000` and check the landing
   page: Navbar (Login / Start Free), Hero, Features, How It Works,
   Pricing (Coming Soon), FAQ accordion, Footer all render
4. Click each Navbar anchor link (Features / How it works / Pricing /
   FAQ) — page smooth-scrolls to that section
5. On Pricing, submit an email in "Notify me" — it shows a confirmation
   message (UI only for now; not yet wired to a real waitlist backend)
6. Click **Start Free** or **Login** → **Continue with Google** → lands
   on `/dashboard` signed in
7. Refresh `/dashboard` — session persists (no bounce to `/login`)
8. On `/dashboard`, check all 5 widgets render as cards: Upload Product
   (drop-zone + disabled button), Recent Projects (empty state), AI
   Credits (shows "0 credits used"), Download History (empty state),
   Profile (your avatar, name, email, "Google account" badge, join date)
9. Resize to phone width — Navbar collapses to a hamburger menu, the
   dashboard sidebar becomes a drawer + bottom nav bar, and the widget
   grid stacks to a single column
10. Sign out from the profile menu (top right) or the Profile widget's
    Sign out button → redirected to `/login`
11. Visit `/dashboard` directly while signed out → redirected to `/login`
    (route protection works)

Report back what breaks, if anything, and I'll fix it before moving on.

## Phase 2 Test

Run through this after filling in the four Cloudinary env vars:

1. On the dashboard's **Upload Product** card, drag a JPG/PNG/WebP onto
   the drop zone — a thumbnail preview and a progress bar appear
   immediately, then a green "Uploaded" badge
2. Click "View on Cloudinary" on an uploaded file — it opens the real
   image at a `res.cloudinary.com` URL
3. Click to browse instead of dragging — same result
4. Try uploading a `.pdf` or `.gif` — it's rejected inline with "Unsupported
   file type," no network request is made
5. Try uploading a file larger than 8MB — rejected inline with a
   "File is too large" message
6. Drag in 2–3 valid files at once — each gets its own row with its own
   progress bar, uploading independently
7. Click delete (trash icon) on a file **while it's still uploading** —
   the upload stops and the row disappears
8. Click delete on a file that finished uploading — it briefly shows
   "Deleting," then disappears; check Cloudinary's Media Library to
   confirm it's actually gone, not just hidden in the UI
9. Refresh the page — the upload list is empty again (expected: nothing
   is persisted yet, see "Not included yet" under Phase 2 above)
10. Resize to phone width — the widget and its file rows stay readable
    and don't overflow horizontally

Report back what breaks, and I'll fix it before moving on.

## Phase 3 Test

Run through this after filling in `OPENAI_API_KEY`:

1. Sidebar → **AI Generator** loads a two-column form + results layout
2. Try clicking **Generate Ad Kit** with the form incomplete — it's
   disabled until an image is uploaded, a name is entered, and a category
   is chosen
3. Upload a product photo in the form's own image picker — same
   preview/progress behavior as the dashboard's Upload Product widget
4. Fill in a name (e.g. "Wireless Neckband Earphones"), pick a category,
   pick a language, click **Generate Ad Kit**
5. A loading state appears ("Generating your ad kit…"); after ~10-30s,
   all 7 sections render: Product Analysis, 3 Hooks, 15-Second Script,
   Kling Prompt, WhatsApp Message, Instagram Caption, 10 Hashtags
6. Everything reads in the language you picked (except the Kling prompt,
   which should always be English)
7. Click a few **Copy** buttons — paste somewhere to confirm the right
   text copied, and the button briefly shows "Copied ✓"
8. Click **Copy all** on Hooks and on Hashtags — confirm all 3 / all 10
   come through in one paste
9. Click **Start over** — the form and results both reset
10. Try selecting **Category → Other** — a free-text field appears and
    is required before Generate becomes enabled
11. Turn off your network (or use an invalid `OPENAI_API_KEY` temporarily)
    and try generating — a clear error message appears with a "Try again"
    button, not a silent failure or a stuck spinner
12. Resize to phone width — the form and results stack into a single
    column and stay readable

Report back what breaks, and I'll fix it before we tackle Supabase
persistence (saving generated kits as real projects).

## Phase 4 Test

Run through this after filling in the three Supabase env vars and
running the SQL from **Supabase Setup** above:

1. Sidebar shows a new **My Projects** item between AI Generator and
   Download Assets
2. Go to **My Projects** with no projects yet — see the honest empty
   state ("No projects yet") with an "Open AI Generator" button, not a
   blank page or an error
3. Go to **AI Generator**, generate an ad kit — after it finishes, a
   "Saving…" banner appears above the results, then turns into "Saved to
   My Projects"
4. Go to the Dashboard — **Recent Projects** now shows the project you
   just generated (not the old empty state)
5. Go to **My Projects** — the same project appears with its thumbnail,
   product name, category, language, and created date
6. Generate 2-3 more ad kits with different product names — confirm they
   all appear in both Recent Projects (most recent 4) and My Projects
   (all of them, newest first)
7. Click **Download** on a project — a `.txt` file downloads containing
   all 7 ad-kit fields (open it and confirm the content matches what was
   shown on the Generator results page)
8. Click **Delete** on a project — a confirmation prompt appears; cancel
   it once to confirm nothing happens, then confirm it for real — the
   card disappears immediately
9. Check Supabase's **Table Editor → projects** and Cloudinary's **Media
   Library** — the deleted project's row and image should both be gone
10. Refresh the My Projects page and the Dashboard — everything you
    didn't delete is still there (this is real persistence, not
    client-side-only state)
11. Sign out and sign back in with the **same** Google account — your
    projects are still there (they're tied to your Firebase `uid`, not
    to the browser session)
12. Resize to phone width — My Projects cards stack into a readable
    single column with full-width Download/Delete buttons

Report back what breaks, and I'll fix it before we tackle Download
Assets / Kling in Phase 5.

## Phase 5 Test

Run through this with at least one saved project (generate one first if
you don't have any yet):

1. Sidebar's **Download Assets** no longer shows a "Soon" badge and is
   clickable (desktop sidebar, mobile drawer, and mobile bottom bar all
   agree)
2. Open **Download Assets** with zero projects (a brand-new account) —
   see the honest empty state ("Nothing to export yet") with an "Open AI
   Generator" button, not a blank page or an error
3. With at least one project, the page loads with the **Project**
   dropdown already selecting your most recently generated one
4. Switch the dropdown to a different project (if you have more than
   one) — all four asset cards below update to that project's content
5. On each of the 4 cards (Instagram Caption, WhatsApp Copy, Hashtags,
   AI Prompt): click **Copy** — paste somewhere to confirm the right
   text copied and the button briefly shows "Copied ✓"
6. On each of the 4 cards, click **Download** — a `.txt` file downloads
   named like `<product>-<asset>.txt` (e.g.
   `wireless-earphones-hashtags.txt`); open it and confirm it contains
   exactly that one field, nothing else
7. Confirm the **Hashtags** card's content is one line of space-separated
   `#tags`, not a raw array or missing `#` characters
8. The **Generate Video** card is visibly disabled (grayed out button,
   "Coming soon" badge) and clicking it does nothing — no console error,
   no fake loading state
9. Click **Download full kit** — the same complete `.txt` export from
   Phase 4 downloads (all 7 fields plus metadata)
10. Back on the Dashboard, the **Download History** widget still shows
    its empty state (expected — no download event is logged anywhere
    yet) but now links to Download Assets instead of dead-ending
11. Resize to phone width — the project dropdown, the 4 asset cards
    (stacking to one column), and the Generate Video card all stay
    readable and don't overflow horizontally

Report back what breaks, and I'll fix it before we tackle real Kling
video generation and the Firebase Admin token verification that's been
flagged as outstanding since Phase 2.

## Roadmap (next phases)

- **Phase 2 (upload):** done
- **Phase 3 (AI Generator):** done — Product Analysis, 3 Hooks,
  15-Second Script, Kling Prompt, WhatsApp Message, Instagram Caption,
  10 Hashtags, all from one OpenAI call
- **Phase 4 (Supabase / My Projects):** done — generated ad kits persist
  as real projects tied to a user, Recent Projects and My Projects both
  show real data, Download and Delete both fully work
- **Phase 5 (Export System / Download Assets):** done — per-asset
  download of Caption, WhatsApp Copy, Hashtags and AI Prompt, plus the
  full-kit download; Generate Video shown as an honest, disabled
  placeholder rather than faked
- **Phase 6:** wire the actual Kling API behind the Generate Video
  button, add real per-user AI Credits tracking, log real download
  events so Download History stops being an empty state, and — before
  any public launch — Firebase Admin ID-token verification to replace
  the client-supplied-`uid` trust model used across all API routes so far

## Brand colors

| Token | Hex |
|---|---|
| Primary | `#344CB7` |
| Secondary | `#577BC1` |
| Accent | `#0EA5E9` |
| Dark | `#000957` |
