import type { Theme } from '../lib/playground-model';
const root = document.querySelector<HTMLElement>('[data-hero-scene]');
if (root) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const play = root.querySelector<HTMLButtonElement>('[data-hero-play]')!;
  const controls = [...root.querySelectorAll<HTMLButtonElement>('[data-hero-theme]')];
  const status = root.querySelector<HTMLElement>('[data-hero-status]')!;
  let theme: Theme = 'midnight';
  let timer: ReturnType<typeof setTimeout> | undefined;
  function apply(next: Theme) {
    theme = next;
    root!.dataset.theme = theme;
    controls.forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.heroTheme === theme)),
    );
    const label = root!.querySelector('[data-hero-surface]');
    if (label) label.textContent = theme[0].toUpperCase() + theme.slice(1);
  }
  function finish() {
    clearTimeout(timer);
    timer = undefined;
    if (!root!.classList.contains('is-playing')) return;
    apply(theme);
    root!.classList.remove('is-playing');
    play.disabled = false;
    controls.forEach((button) => (button.disabled = false));
    status.textContent = 'New appearance. Document retained. Concept illustration.';
  }
  controls.forEach((button) =>
    button.addEventListener('click', () => {
      apply(button.dataset.heroTheme as Theme);
      status.textContent = `${button.textContent?.trim()} appearance. Same document.`;
    }),
  );
  play.addEventListener('click', () => {
    root.classList.add('is-playing');
    play.disabled = true;
    controls.forEach((button) => (button.disabled = true));
    root.dataset.theme = theme === 'midnight' ? 'dusk' : 'midnight';
    status.textContent = `Preparing ${theme} appearance…`;
    if (reduced.matches) finish();
    else timer = setTimeout(finish, 900);
  });
  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            if (!reduced.matches && typeof root.animate === 'function')
              root
                .querySelectorAll('.preview-editor,.preview-settings,.preview-dock')
                .forEach((element, i) =>
                  element.animate(
                    [
                      { opacity: 0, translate: '0 14px' },
                      { opacity: 1, translate: '0 0' },
                    ],
                    { duration: 600, delay: i * 80, easing: 'cubic-bezier(.2,.7,.2,1)' },
                  ),
                );
            observer?.disconnect();
          },
          { threshold: 0.2 },
        )
      : null;
  observer?.observe(root);
  play.disabled = false;
  controls.forEach((button) => (button.disabled = false));
  reduced.addEventListener('change', () => {
    if (reduced.matches) finish();
  });
  addEventListener('pagehide', () => {
    finish();
    observer?.disconnect();
  });
}
