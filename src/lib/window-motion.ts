/** Interruptible FLIP transitions. Accepted window state never lives in animation callbacks. */
export function createWindowMotion(elements: HTMLElement[], reduced: MediaQueryList) {
  const running = new Map<HTMLElement, Animation>();
  const versions = new Map<HTMLElement, number>();
  function cancel(element: HTMLElement) {
    versions.set(element, (versions.get(element) ?? 0) + 1);
    running.get(element)?.cancel();
    running.delete(element);
    element.inert = false;
  }
  function cancelAll() {
    elements.forEach(cancel);
  }
  function run(element: HTMLElement, from: DOMRect | null, visible: boolean, dock: DOMRect) {
    cancel(element);
    if (reduced.matches || !element.animate || (!from && !visible)) return;
    const version = versions.get(element)!;
    element.hidden = false;
    element.inert = !visible;
    const layout = element.getBoundingClientRect();
    if (!layout.width || !layout.height) return;
    const start = from ?? dock;
    const end = visible ? layout : dock;
    const pose = (rect: DOMRect) =>
      `translate(${rect.left - layout.left}px,${rect.top - layout.top}px) scale(${rect.width / layout.width},${rect.height / layout.height})`;
    const animation = element.animate(
      [
        { transform: pose(start), opacity: from ? 1 : 0.15, transformOrigin: '0 0' },
        { transform: pose(end), opacity: visible ? 1 : 0, transformOrigin: '0 0' },
      ],
      { duration: visible ? 320 : 280, easing: 'cubic-bezier(.2,.75,.2,1)' },
    );
    running.set(element, animation);
    animation.finished
      .then(() => {
        if (versions.get(element) !== version) return;
        element.hidden = !visible;
        element.inert = false;
        running.delete(element);
      })
      .catch(() => {});
  }
  return { run, cancel, cancelAll };
}
