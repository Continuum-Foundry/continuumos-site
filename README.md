# ContinuumOS website

The public presentation and browser desktop concept for ContinuumOS. This is a
static Astro website, not an operating system, emulator or guest runtime.
Original material is all rights reserved; external patches are currently paused.

## Local development

Use Node 24.14 or newer and npm. From this checkout:

```powershell
npm ci
npm run dev
```

Open the printed local URL with `/continuumos-site/`. Production verification:

```powershell
npm run check
npm run build
npm run preview
```

The wrapper disables Astro telemetry without modifying global configuration.
Static content is readable before JavaScript. Small shared enhancements add reveals,
sticky-header feedback and code copying; the homepage adds optional scene playback.
Concepts alone loads the desktop controller. Build checks enforce gzip budgets of
6 KiB shared, 6 KiB homepage-specific and 30 KiB total for Concepts.
No analytics, remote fonts, backend or browser persistence is included.

## Content and maintenance

- Shared metadata, milestone records and architecture layers: `src/data/site.ts`.
- Editorial routes: `src/pages/`. Pages use the shared layout and design tokens.
- Browser state and typed demo actions: `src/lib/playground-model.ts`.
- DOM interaction: `src/scripts/playground.ts`.
- Cancellable handovers and window motion: `src/lib/update-runner.ts` and `src/lib/window-motion.ts`.
- Shared interaction tokens and surface refinements: `src/styles/polish.css`.
- Shared/homepage enhancements: `src/scripts/site.ts` and `src/scripts/hero.ts`.
- Original generated wallpaper, final prompt and placement: `artwork/README.md`.

Before changing progress claims, verify them against retained OS evidence. Keep
demonstrated, proposed and unmeasured material distinguishable. M1 completion,
guest desktop usability, isolation and live reload are not demonstrated here.
Keep the 256 MiB figure labeled as a target and the Slint/custom UI choice open.

The playground keeps edits in page memory. Refresh, navigation or reset discards
them. Reset and opening another sample ask before discarding a dirty document.
Compatible timed handovers retain the latest text, selection and window geometry;
Finish now completes a run once, and reset cancels obsolete callbacks.
All results and generations are
simulated. No guest connection, file access or code execution is implemented.

## GitHub Pages

Public remote: `https://github.com/Continuum-Foundry/continuumos-site.git`.
Live site: https://continuum-foundry.github.io/continuumos-site/.
The initial Pages workflow and all live page routes were verified on October 18, 2026.

Set Pages source to **GitHub Actions**. The SHA-pinned workflow checks PRs and
deploys successful pushes to `main` or manual runs on Ubuntu 24.04. Only `dist/` is deployed;
source artwork, tests and authoring notes are not hosted as site assets.

The `site` and `base` values live in `astro.config.mjs`. Use the `href()` helper
for local links. Static output checks catch missing routes/assets and unprefixed
paths. No custom domain or CNAME is configured. A custom domain requires updating
both the Astro settings and canonical/base-path checks.

This checkout is nested under `ContinuumOS/website/`, ignored by the parent,
and has its own Git history. Do not add it as a submodule or commit private OS
documents, logs, binaries, credentials or machine-specific evidence here.

## Publication boundary

The owner's explicit website request authorizes this separate public presentation,
curated explainers and labeled browser concepts. It does not change the private OS
repository's visibility, release policy, handling restrictions or source licensing.
Do not mirror its full library, evidence or source into this repository.

See LICENSE, NOTICE, THIRD_PARTY_NOTICES.md and VERIFICATION.md.
