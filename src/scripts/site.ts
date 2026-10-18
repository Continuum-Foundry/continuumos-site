const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector<HTMLElement>('.site-header');
const sentinel = document.createElement('div');
sentinel.className = 'header-sentinel';
header?.before(sentinel);
const headerObserver =
  'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) =>
        header?.classList.toggle('is-scrolled', !entry.isIntersecting),
      )
    : null;
headerObserver?.observe(sentinel);

const revealObserver =
  'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const element = entry.target as HTMLElement;
            pendingReveals.delete(element);
            if (!reduced.matches && typeof element.animate === 'function')
              element.animate(
                [
                  { opacity: 0.35, transform: 'translateY(12px)' },
                  { opacity: 1, transform: 'none' },
                ],
                { duration: 500, easing: 'cubic-bezier(.2,.7,.2,1)' },
              );
            revealObserver?.unobserve(element);
          }
        },
        { threshold: 0.12 },
      )
    : null;
const pendingReveals = new Set<Element>();
document
  .querySelectorAll(
    '.intro-section,.principles,.continuity-feature,.progress-callout,.closing,.page-content>.article-block,.milestone',
  )
  .forEach((element) => {
    pendingReveals.add(element);
    revealObserver?.observe(element);
  });

document.querySelectorAll<HTMLPreElement>('.code-block').forEach((block) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-code';
  button.textContent = 'Copy';
  button.setAttribute('aria-label', 'Copy code example');
  const status = document.createElement('span');
  status.className = 'copy-status';
  status.setAttribute('role', 'status');
  const wrap = document.createElement('div');
  wrap.className = 'code-wrap';
  block.before(wrap);
  wrap.append(block, button, status);
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(
        block.querySelector('code')?.textContent ?? block.textContent ?? '',
      );
      button.textContent = 'Copied';
      status.textContent = 'Code copied.';
    } catch {
      button.textContent = 'Copy';
      status.textContent = 'Could not copy. Select the code and copy it manually.';
    } finally {
      button.disabled = false;
    }
  });
});

function finishMotion() {
  document.getAnimations().forEach((animation) => {
    try {
      animation.finish();
    } catch {
      animation.cancel();
    }
  });
}
reduced.addEventListener('change', () => {
  if (reduced.matches) finishMotion();
});
addEventListener('pagehide', () => {
  headerObserver?.disconnect();
  revealObserver?.disconnect();
  finishMotion();
});
addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  headerObserver?.observe(sentinel);
  pendingReveals.forEach((element) => revealObserver?.observe(element));
});
