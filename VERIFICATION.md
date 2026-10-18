# Website verification

Date: October 18, 2026. This record covers the website only, not guest behavior.

## Automated checks

- Astro/TypeScript: 19 files, zero errors, warnings or hints.
- Seven Node tests passed: all three update scenarios preserve text, selection
  and window geometry; minimize/open/maximize/restore; bundled-file validation
  and reset; palette/reducer parity with bounded event history; selection bounds.
- Production static build: seven pages, 92 local references checked beneath
  `/continuumos-site/`; homepage contains no script tag. Missing/unprefixed
  assets and routes fail the build check.
- Optimized generated wallpaper: 58,450-byte WebP. No remote font, analytics or
  persistent browser state is introduced by website code.

## Browser verification

Checked the production preview in the in-app Chromium browser at desktop
1440 × 1050 and mobile 390 × 844; narrow 720px reflow is also reviewed.

- Typed literal `<script>` text remains editable text.
- Appearance scenario changes the theme while keeping the exact document,
  selection [0, 5], editor position and editor focus.
- Behavior scenario advances the illustrative generation and enables word count
  while retaining text and selection.
- Rejected schema v99 leaves the preceding generation, theme and document intact.
- Palette filtering and Enter execute the shared typed appearance action.
- Bounded pointer dragging keeps the editor inside the workspace; decorative
  clipping does not create a hidden scroll container around focused windows.
- Minimize/open, right-position preset, maximize and restore retain document and
  window position. Mobile file opening shows only the active app.
- Reset restores the bundled initial document, midnight theme and generation 1;
  word count is hidden again.
- Architecture selection changes its explanation and boundary; text alternatives
  are available in a native disclosure, including without JavaScript.
- Mobile Concepts and Architecture show no horizontal document overflow.

CSS supplies visible keyboard focus, system-font fallbacks and a reduced-motion
profile. Browser tests do not establish native assistive-technology conformance.
Full OS/hardware accessibility and guest metrics are outside this website.

## Publication

The public repository `Continuum-Foundry/continuumos-site` was created and verified
through GitHub with administrator access. Windows keyring access requires running
the authenticated GitHub CLI outside the sandbox. Pages deployment remains pending
until a workflow run and the live routes are verified.
