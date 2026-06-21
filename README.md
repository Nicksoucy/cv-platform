# CV Platform

A 100 % client-side CV / résumé builder, originally tuned for Quebec security
guards (in French) but usable for any role. Pick a template, fill structured
sections with the help of one-click chips and writing tips, see a live
preview, and export an ATS-readable PDF.

No backend, no build step, no dependencies — open the HTML files in a static
server and you're done.

---

## Quick start

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000/cv-selector.html
```

Windows users can double-click `start-local-server.bat`.

The first page is the template picker (`cv-selector.html`). Picking a
template creates a new CV and opens the builder.

---

## File structure

```
.
├── index.html                          # Marketing landing page (homepage)
├── cv-selector.html                    # Template picker (entry into the builder)
├── cv-builder.html                     # Form + live preview + multi-CV session bar
├── cv-preview.html                     # CV preview + PDF + DOCX export
├── cv-cover-letter.html                # AI-assisted cover letter that mirrors the CV
├── cv-ats-check.html                   # Paste a job description, get a keyword score
├── cv-agent-securite-quebec.html       # SEO landing page (long-tail keyword)
├── manifest.json                       # PWA manifest (installable + offline)
├── icon.svg                            # App icon
├── service-worker.js                   # Cache-first SW for offline use
├── css/
│   └── templates.css                   # Shared template styles + print rules
├── js/
│   ├── storage.js                      # Multi-CV storage + import/export + API-key store
│   ├── cv-render.js                    # Template renderer
│   ├── ai.js                           # Anthropic API helper
│   ├── docx-export.js                  # Word-friendly .doc generator (no dependencies)
│   ├── ats.js                          # Job-description keyword scoring
│   └── analytics.js                    # Lightweight BYO-endpoint event logger
└── start-local-server.bat
```

All state lives in `localStorage` under two keys: `cv-list` (the array of
saved CVs) and `active-cv-id`.

---

## Features

### Templates

Four built-in templates, each with one customizable accent colour:

- **Moderne** — colored header band, clean two-column body
- **Classique** — sidebar + main column, traditional serif
- **Minimal** — single column, lots of whitespace
- **Sécurité** — security-themed sidebar with agent icon and certifications block

Switch templates from inside the builder; the live preview updates instantly.

### Structured experience & education

Experience and education are entered as repeatable cards instead of one giant
textarea:

- **Experience card**: type / employer / period / bullet list (with one-click
  quick chips for transferable skills)
- **Education card**: type (DEP, AEP, DES…) / domain / school / year

Each card supports inline edit and delete. Cards are ordered top-to-bottom in
the order they were added.

### Multi-CV workspace

The session bar at the top of the builder lets you keep several CVs in
parallel:

- Switch between saved CVs with the picker
- Rename inline
- **+ Nouveau** to create a fresh one
- **📋 Dupliquer** for a quick variant (e.g. "warehouse CV" vs "security CV")
- **🗑 Supprimer** (refused on the last remaining CV)
- **✨ Charger un exemple** drops in a fully-populated sample agent CV so you
  can see what a finished one looks like before typing

### Autosave

Every field change is persisted to `localStorage` with a 400 ms debounce.
The save indicator shows **Enregistrement…** while a write is in flight and
**Enregistré** once it lands. There's no longer a "submit to save" step —
"Prévisualiser mon CV" just navigates to the preview page.

### One-click chips

The builder is full of one-click quick-fill buttons tuned for the security
guard niche:

- Resume openers (débutant motivé, agent expérimenté, bilingue, superviseur)
- Experience types (Service client, Entrepôt, Sécurité, …) → spawn a new card
- Transferable skills (Communication, Désescalade, Gestion du stress, …) →
  add a bullet to the most recent card
- Common Quebec certifications (BSP, Formation 54h, RCR/DEA, SIMDUT, …)
- Languages frequent in Montreal (Français, Anglais, Créole, Arabe, Punjabi…)

### Live preview

Side-by-side preview at ≥ 1100 px; on smaller screens a Formulaire / Aperçu
tab switcher reveals each pane on demand. An overflow banner appears at the
top of the page when the rendered CV exceeds one Letter page, so you know to
trim before exporting.

### ATS-friendly PDF

Export uses the browser's native print pipeline (`window.print()` plus a
Letter `@page` and a print-only stylesheet that hides toolbars). The
resulting PDF contains **selectable, parseable text**, so résumé-screening
software (ATS) can read it. No image rasterization, no third-party PDF
library, no extra HTTP requests.

### Color & font customization

Each template has its own primary colour, secondary accent colour, and a
font picker (Inter / Georgia / Roboto / Arial). Only the controls for the
active template are shown to keep the form focused.

### Photo upload

Add a profile photo from the personal-info section. Images are
center-cropped and resized to 300×300 in a `<canvas>` and stored as
base64 JPEG inside the active CV. Each template positions the photo
appropriately (header in Moderne, sidebar in Classique / Sécurité,
inline with the name in Minimal).

### Section toggle & reorder

The **📑 Sections** button on the session bar opens a panel where you
can hide any section (Résumé, Expérience, Éducation, Certifications,
Compétences, Langues) or reorder the main-content sections with the
↑ / ↓ buttons. Order and visibility persist on the CV.

### AI writing assistance (BYO key)

Click **🤖 IA** in the session bar to paste an Anthropic API key (stored
in `localStorage`). With a key set, you get:

- **🤖 Améliorer ce résumé** — rewrites the résumé paragraph in clearer
  professional French while preserving the facts.
- **🌐 Traduire en anglais** — produces a natural English version of the
  résumé suitable for a Canadian application.
- **✨ next to each experience bullet** — polishes that single bullet
  into a stronger action-verb statement.

All calls use `claude-haiku-4-5` directly from the browser with the
`anthropic-dangerous-direct-browser-access` header. **For production
use, put a small proxy server between the browser and the API** so the
key is not exposed.

### DOCX (Word) export

The preview page now has both **📄 Télécharger en PDF** and **📝 Télécharger
en Word** buttons. The Word export builds a clean single-column document
from the structured CV data (not from the rendered template) so Word and
LibreOffice both render it predictably. No third-party library — the file
is a Word-readable HTML document saved as `.doc`.

### ATS keyword check

The **🔍 Vérifier ATS** button on the session bar opens
`cv-ats-check.html`. Paste a job description, get a coverage percentage
along with the matched and missing keywords. Click a missing keyword to
add it to the CV's competence list. The scorer normalizes accents, drops
short tokens and stopwords (FR + EN), and applies a small synonym table
for niche terms (BSP ↔ Bureau de la sécurité privée, RCR ↔ secourisme,
etc.).

### JSON export / import

The session-bar **⬇️ Exporter** button downloads the active CV as
`CV_<name>.json` (an envelope with `cvPlatform: 1` plus the full CV
object). **⬆️ Importer** reads a JSON file back in, gives it a fresh
id, marks it `(importé)`, and makes it active. Useful for backups and
for moving a CV between devices without a server.

### Analytics (BYO endpoint)

`js/analytics.js` fires a small set of events: `page_view`, `cta_click`,
`template_picked`, `sample_loaded`, `cv_exported_pdf`,
`cv_exported_docx`, `cv_exported_json`, `cv_imported`, `ats_open`,
`cover_letter_generated`. By default events go to `console.log` so you
can verify they fire. Set
`localStorage["analytics-endpoint"] = "https://your.endpoint/collect"`
to actually report. Events use `navigator.sendBeacon` when available
and have no PII beyond a per-browser visitor id.

### Offline / PWA

The site is installable and works offline. A service worker
(`service-worker.js`) caches the app shell on first load and serves it
from cache thereafter; cross-origin requests (e.g. to the Anthropic API)
are never intercepted. Bump the `CACHE` constant in
`service-worker.js` to invalidate after a deploy.

### Cover letter generator

The **✉️ Lettre de motivation** button opens `cv-cover-letter.html`,
which reads the active CV and offers a small form (company, role,
recipient, highlights). One click on **🤖 Générer le corps de la lettre**
asks Claude to draft a three-paragraph body using the CV's actual
content. The letter preview is themed with the active CV's primary
colour. PDF export uses the same browser-native print pipeline.

---

## Data model

```ts
type CV = {
  id: string;
  name: string;
  template: 'moderne' | 'classique' | 'minimal' | 'securite';
  updatedAt: number;
  data: {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    disponibilite: string;       // comma-separated tags
    photo: string;               // base64 data URL (300×300 JPEG)
    resume: string;
    experiences: Experience[];   // structured
    educations: Education[];     // structured
    experience: string;          // legacy free-form fallback
    education: string;           // legacy free-form fallback
    certifications: string;      // newline-separated
    competences: string;         // comma-separated
    langues: string;             // comma-separated
    colorModerne: string;        // hex — primary per template
    colorClassique: string;
    colorSecurite: string;
    colorMinimal: string;
    accentModerne: string;       // hex — secondary per template
    accentClassique: string;
    accentSecurite: string;
    accentMinimal: string;
    font: 'default' | 'inter' | 'georgia' | 'roboto' | 'arial';
    sections: SectionState[];    // order + visibility
  };
};

type SectionState = { id: 'resume' | 'experience' | 'education' | 'certifications' | 'competences' | 'langues'; visible: boolean };

type Experience = {
  id: string;
  type: string;
  employer: string;
  period: string;
  bullets: string[];
};

type Education = {
  id: string;
  type: string;
  domain: string;
  school: string;
  year: string;
};
```

The renderer prefers the structured arrays; if they are empty it falls back
to the legacy string fields, so previously saved CVs continue to display.

---

## Security

- All user-supplied content is HTML-escaped before being injected into
  the templates (see `esc()` / `escMultiline()` in `js/cv-render.js`).
- CV data stays on the user's device — there is no server, no analytics,
  no third-party scripts loaded at runtime (Google Fonts is the only
  external link, used for the Inter font).
- **Anthropic API key warning**: the AI features ship in "bring your own
  key" mode. The key is stored in `localStorage` and sent directly from
  the browser to `api.anthropic.com` with the
  `anthropic-dangerous-direct-browser-access` header. This is fine for a
  personal workspace but **not safe for a production multi-user
  deployment** — extension scripts, third-party libs, or future XSS bugs
  could exfiltrate the key. For production use, replace the direct
  fetch in `js/ai.js` with a call to a small server-side proxy you
  control.

---

## Roadmap

The audit and roadmap that drove the recent work:

### Phase 1 — Stop the bleeding ✅
- Replaced image-based PDF (html2canvas + jsPDF) with browser-native print to
  produce ATS-readable PDFs
- Fixed broken nested CSS, doubled `<body>` tag, duplicate rules
- Replaced blocking `alert()` with inline guidance
- Added overflow warning when content exceeds one page
- Dropped two CDN dependencies

### Phase 2 — Core UX overhaul ✅
- Shared `CVStore` module with multi-CV support and legacy migration
- Structured experience and education cards (no more giant textareas)
- In-builder template switcher with live preview update
- Autosave with status indicator
- Mobile preview tab
- "Charger un exemple" sample-data shortcut
- HTML-escaped renderer (closes the `innerHTML` injection hole)

### Phase 3 — Customer experience wins ✅
- Photo upload (cropped, base64) wired into every template
- AI polish via Claude API: résumé rewrite, French→English translation,
  per-bullet polish
- Cover letter generator that mirrors the CV's primary colour
- Section toggle & reorder
- Per-template secondary colours and font picker
- Print stylesheet refinements: `page-break-inside: avoid` on items,
  tighter line height in print, headings not stranded at page bottoms

### Phase 4 — Platform (partially shipped) ✅
- **PWA / offline support** ✅
- **DOCX (Word) export** ✅
- **ATS keyword check** ✅
- **Supabase auth + cloud-saved CVs / shareable links** — deferred. Needs
  a provisioned Supabase project (URL + anon key + schema + RLS) and is
  better done in a focused session.
- **Framework migration (SvelteKit / Astro / Next)** — deferred and
  recommended *against* unless a clear product need appears. The no-build
  static-HTML setup is currently a feature: zero install, instant deploy,
  trivial to debug.

### Phase 5 — Growth ✅
- Real homepage (`index.html`) with marketing copy + CTA
- Open Graph + canonical + meta description on every entry page
- One niche SEO landing page (`cv-agent-securite-quebec.html`)
- JSON export / import for CV backup and device-to-device transfer
- Lightweight analytics module instrumenting funnel events
  (template_picked, cv_exported_pdf/docx/json, cover_letter_generated,
  ats_open, …)

### Phase 4 — Platform
- Migrate to a small framework (SvelteKit / Astro / Next)
- Supabase auth + cloud-saved CVs and shareable links
- PWA / offline support
- DOCX export
- ATS keyword score

### Phase 5 — Growth
- SEO landing pages for niche queries
- Shareable preview links
- Funnel analytics

---

## Development notes

- **No build, no install.** Edit the HTML/CSS/JS, refresh the browser.
- **Testing.** The render layer is plain functions and can be exercised in
  Node by `eval`-ing `js/storage.js` and `js/cv-render.js` against a
  minimal `document` / `localStorage` stub. See the smoke test used in
  recent commits for an example.
- **Branch.** Active development happens on
  `claude/audit-and-improve-app-FuJgd`.
