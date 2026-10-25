# Progress-led website refresh verification

Date: October 25, 2026. Local implementation/self-review of the website only; no publication or independent approval.

## Source and artifacts

Source base: `1593114a59d6a29c93b4c3a8946fd568bb9cc0d2` plus the local refresh diff. Node `24.21.0`; unchanged npm lockfile SHA-256 `eea8d0459458240686dd4c29420ef02c4965b3ddf3f00fdeb669ad1f0db4a314`.

Final homepage HTML SHA-256: `440f7106e9b57362b0526a1877b1eaba7683f06efae90b721ea5551dd39e855c`.
Final Progress HTML SHA-256: `43f1d2af017f1c0311e34b62afccefe103c2a1d452205f4083d4e2b88519dc96`.

The ignored local directory `verification/refresh-2026-10-25/` holds desktop/mobile PNG captures, the 200% zoom capture, a complete refresh patch and a source/artifact hash manifest. Generated output and full diagnostics remain local.

## Checks actually performed

| Check                     | Result                                                                                                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run check`           | Astro/TypeScript: 27 files, zero errors/warnings/hints; all 13 existing simulation/state tests pass                                                                                                                                                    |
| `npm run build`           | Seven HTML pages, 98 local references, route/assets/base-path and simulation-label checks pass                                                                                                                                                         |
| JavaScript gzip budgets   | Shared 883 B / 6 KiB; homepage 768 B / 6 KiB; Concepts total 7,853 B / 30 KiB                                                                                                                                                                          |
| Production browser review | Six content routes at 320, 390, 768 and 1440px: 24 page/viewport checks, no horizontal document overflow or browser runtime errors                                                                                                                     |
| Automated accessibility   | No axe violations in the final 24-page matrix using WCAG 2 A/AA, 2.1 AA and 2.2 AA tags                                                                                                                                                                |
| No JavaScript             | All six content routes return readable static main content with one h1                                                                                                                                                                                 |
| 200% browser zoom         | All six routes reflow without horizontal document overflow; a 1440px browser window reports a 711px layout viewport and devicePixelRatio 2, allowing for its scrollbar                                                                                 |
| Interaction review        | Appearance, behavior, rejection and behavior replay preserve unsaved text, selection and editor geometry; generation changes only for behavior. Dirty reset supports Keep editing and explicit discard. Architecture works with Enter; skip link works |
| Roadmap                   | M0–M8 and grouped future anchors are present; M1/M2 scope, M3 next gate and M7/M8 installation requirements are explicit                                                                                                                               |

Chromium page zoom was set through a disposable local test extension using the browser tabs zoom API, rather than CSS zoom or a device-scale approximation. Keyboard and visual review supplement automated checks; this is not complete accessibility certification or physical-touch testing.

## Content review and findings

The public summary is reviewed October 25 against results through October 24. M1 is the locally accepted experimental QEMU baseline; M2 is the locally accepted Windows-hosted subset. Custom Rust remains provisional pending guest confirmation. Hosted resources change within the same process/window; guest resources and replacement application processes have separate future gates.

The three hosted observations retain their conditions: 1080p file-reload p95 128.116 ms over 100 reloads, excluding compilation/display latency; rich typing/search 18.642 ms and effects/motion 17.424 ms elapsed frame p95 at scale 1, tracing off, 1,000 samples per workload/effect cell. Both frame observations exceed 16.667 ms. Guest memory, CPU and input targets remain unaccepted; 256 MiB is an unmet guest target.

Initial browser review found insufficient contrast in illustration line numbers and the simulation timeline, and code blocks that needed keyboard focus when horizontally scrollable. These were corrected and the complete matrix rerun. Mobile hero spacing was corrected. All final page/viewport checks pass. The playground controller, reducer and update runner are unchanged.

No added dependencies, client runtime, remote fonts, analytics or third-party browser requests were introduced. The curated company summary matches these scope boundaries. No private source, raw OS evidence or binaries were copied into the site. No OS acceptance suite was rerun for this website-only change, and no guest result is derived from website testing.

## Delivery

At the close of this local verification, no commit, push, deployment or OS release had been performed. The owner subsequently authorized pushing and redeploying both independent websites; exact-revision deployment checks are separate from this local record. The earlier verification record remains historical.
