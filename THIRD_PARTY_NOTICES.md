# Third-party notices

Original website code, copy, CSS, SVG artwork and the generated conceptual wallpaper
follow LICENSE. The wallpaper was created with the built-in image generation tool;
its prompt and placements are recorded in `artwork/README.md`.

No downloaded third-party photographs, icon sets, custom fonts or client framework
runtime are shipped. System fonts are supplied by the visitor's device. Website
interactions use first-party browser code.

Build and check dependencies include Astro 7.4.0 (MIT), @astrojs/check 0.9.10 (MIT)
TypeScript 5.9.3 (Apache-2.0), Prettier 3.9.10 (MIT) and prettier-plugin-astro
1.1.1 (MIT). Their transitive dependency versions are locked
in package-lock.json. Installed packages retain their bundled licenses and notices;
this repository does not relicense them. GitHub Actions referenced in the workflow
also retain their upstream terms.

Use `npm ci` to reproduce the dependency set. Neither node_modules nor build tools
are included in the committed source or Pages artifact. If adding third-party
assets or client runtime code, record their exact provenance and applicable notices
before publication.
