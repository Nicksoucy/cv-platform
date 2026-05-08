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
├── cv-selector.html     # Landing page — pick a template
├── cv-builder.html      # Form + live preview + multi-CV session bar
├── cv-preview.html      # Final preview + browser-native PDF export
├── css/
│   └── templates.css    # Shared template styles (Moderne, Classique, Minimal, Sécurité)
├── js/
│   ├── storage.js       # Multi-CV storage layer + legacy migration
│   └── cv-render.js     # Renders the active CV into any of the four templates
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

### Color customization

Each template has its own accent colour picker. Only the picker for the
active template is shown to keep the form focused.

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
    resume: string;
    experiences: Experience[];   // structured
    educations: Education[];     // structured
    experience: string;          // legacy free-form fallback
    education: string;           // legacy free-form fallback
    certifications: string;      // newline-separated
    competences: string;         // comma-separated
    langues: string;             // comma-separated
    colorModerne: string;        // hex
    colorClassique: string;
    colorSecurite: string;
    colorMinimal: string;
  };
};

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
- Data stays on the user's device — there is no server, no analytics, no
  third-party scripts loaded at runtime (Google Fonts is the only external
  link, used for the Inter font).

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

### Phase 3 — Customer experience wins (next)
- Bilingual UI (FR / EN, then ES)
- Photo upload for the agent profile
- AI polish via Claude API ("Améliorer cette description")
- Cover-letter generator that mirrors the CV
- Section toggle / reorder
- Print stylesheet refinement

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
