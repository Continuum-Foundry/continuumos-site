# Website verification

Latest local refresh: [October 25 verification](VERIFICATION-2026-10-25.md). The October 18 record below is preserved as historical evidence.

Date: October 18, 2026. This record covers the website, not guest behavior.

## Automated checks

- Astro/TypeScript: 26 files; zero errors, warnings or hints.
- 13 state tests pass. Coverage includes all three scenarios; text, selection and
  geometry retained; edits during playback; exactly-once activation; rejected
  candidates; stale callbacks after cancellation/reset; replay; immediate reduced
  motion; all-minimized state; window restore; sample validation and bounded logs.
- Production build: seven HTML pages and 92 local references beneath
  `/continuumos-site/`. Static hero copy, controls and simulation labels are checked.
- Measured JavaScript gzip: shared 883 B (6 KiB budget), home-specific 768 B
  (6 KiB budget), Concepts total 7,853 B (30 KiB budget). These are compressed
  generated modules, including inline scripts and imported dependencies.
- Original wallpaper remains a 58,450-byte WebP. No remote fonts, analytics,
  persistence, guest service or continuous rendering loop is introduced.

## Browser checks

Development and final production output were reviewed with the in-app Chromium
browser. All five main routes were loaded directly at 360, 390, 768, 1280 and
1440px. Settled document measurements showed no horizontal overflow. Additional
720 x 525 reflow checks approximate the available space at 200% desktop zoom.

Observed interactions:

- Home theme selection and explicit continuity playback return to the chosen
  appearance, with the illustrated document anchored and the concept label retained.
- A behavior handover retained text changed after playback started, selection
  [0, 1], and enabled generation 2 / word count on completion.
- Rejection and Finish now retained generation 2 and explained incompatible v99.
- Dirty reset/sample-open dialogs default to Keep editing. Cancel retains edits;
  discard loads the sample and deliberately returns focus to the editor.
- Scoped Ctrl+K, empty palette results, filtered counts, arrows and Enter work;
  executing an appearance action returns focus to the editor.
- Rapid minimize/open/maximize/restore retains the document and leaves the latest
  requested window state visible. Minimizing all windows exposes the empty workspace.
- Pointer dragging to the left edge applies the existing left position preset;
  the preview is removed on release. Bounds recalculate across tested viewports.
- Mobile app switching displays one app, toolbar controls measure 44px high, and
  editor/search inputs are 16px. The navigation remains visible.
- Architecture selection via Enter changes the explanation and selected rail.
- Milestone links update the hash and target styling (verified with M2).
- Native clipboard copying reported Code copied. No browser console warnings or
  errors were observed in the final production interaction review.

## Evidence and limits

Local, ignored evidence in `verification/` includes:

- `polish-before-home.jpg`: retained baseline screenshot.
- `polish-after-home.jpg`, `polish-after-playground.jpg`,
  `polish-after-mobile.jpg`: browser captures.
- `hero.webp`, `handover.webp`, `windows.webp`: short animated WebP recordings
  encoded from timestamped, actual browser screenshot sequences. They are sampled
  recordings, not frame-rate or rendering-performance measurements. The window
  recording includes browser scrolling triggered by control focus.

Native 200% browser zoom, OS reduced-motion changes, touch-device emulation and
JavaScript-disable controls are unavailable in this browser. The reduced-motion
runner is covered by state tests; CSS/JS preference listeners were reviewed.
No-JavaScript verification inspects generated HTML and static alternatives rather
than a browser session with scripts disabled. Touch target geometry and responsive
switching were checked, not physical touch hardware. Clipboard failure feedback,
mid-drag Escape/pointer cancellation and idle animation activity were reviewed in
source but not independently forced/measured through this browser. Keyboard focus
and semantic controls were reviewed; this is not an assistive-technology or formal
WCAG certification. No guest metrics or OS accessibility result is implied.

## Publication

The independent public repository is `Continuum-Foundry/continuumos-site`.
The SHA-pinned Pages workflow checks `main` and deploys only `dist/` through the
`github-pages` environment. Private OS material is outside the publication scope.

Live site: https://continuum-foundry.github.io/continuumos-site/.
The initial deployment was workflow 39102196594. The cinematic polish is delivered
through the same workflow; its result and live route checks are recorded in the
associated delivery report after deployment.
