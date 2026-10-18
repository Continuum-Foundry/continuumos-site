import {
  createState,
  dispatch,
  commands,
  documents,
  wordCount,
  type AppId,
  type Action,
  type Theme,
  type Position,
  type Scenario,
  type Selection,
} from '../lib/playground-model';
import { createUpdateRunner, type UpdateRun } from '../lib/update-runner';
import { createWindowMotion } from '../lib/window-motion';

const root = document.querySelector<HTMLElement>('#playground');
if (root) {
  const get = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
  const editor = get<HTMLTextAreaElement>('#demo-editor');
  const workspace = get('#desktop-workspace');
  const palette = get<HTMLDialogElement>('#command-palette');
  const search = get<HTMLInputElement>('#command-search');
  const launcher = get('#launcher');
  const discard = get<HTMLDialogElement>('#discard-dialog');
  const mobile = matchMedia('(max-width: 800px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const windows = [...root.querySelectorAll<HTMLElement>('[data-window]')];
  const motion = createWindowMotion(windows, reduced);
  const names: Record<AppId, string> = {
    editor: 'Editor',
    files: 'Files',
    settings: 'Appearance',
    inspector: 'Inspector',
  };
  let state = createState();
  let lastEvent: object | undefined;
  let pending: Action | null = null;
  let paletteOpener: HTMLElement | null = null;
  let discardOpener: HTMLElement | null = null;
  let discardAccepted = false;
  let paletteExecuted = false;

  function selection(): Selection {
    return {
      start: editor.selectionStart,
      end: editor.selectionEnd,
      direction: editor.selectionDirection,
    };
  }
  function rememberSelection() {
    state = dispatch(state, { type: 'document.select', selection: selection() });
    renderEditor();
  }
  const dirty = () => state.text !== documents[state.file];
  function renderEditor() {
    const selected = state.selection.end - state.selection.start;
    get('#selection-label').textContent = selected
      ? `${selected} characters selected`
      : 'No selection';
    get('#word-count').hidden = !state.wordCountEnabled;
    get('#word-count').textContent = `${wordCount(state.text)} words`;
    get('#document-dirty').textContent = dirty()
      ? 'Unsaved edits · memory only'
      : 'Bundled sample · memory only';
  }
  function isVisible(id: AppId) {
    const w = state.windows[id];
    return w.open && !w.minimized && (!mobile.matches || state.active === id);
  }
  function applyPosition(element: HTMLElement) {
    const w = state.windows[element.dataset.window as AppId];
    element.style.left = `${w.x}%`;
    element.style.top = `${w.y}px`;
  }
  function render() {
    root!.dataset.theme = state.theme;
    root!.dataset.mobile = String(mobile.matches);
    if (editor.value !== state.text) editor.value = state.text;
    get('#editor-file-name').textContent = state.file;
    get('#editor-generation').textContent = String(state.generation);
    get('#theme-label').textContent = state.theme[0].toUpperCase() + state.theme.slice(1);
    get('#active-app-label').textContent = state.active ? names[state.active] : 'Workspace';
    windows.forEach((element) => {
      const id = element.dataset.window as AppId;
      element.hidden = !isVisible(id);
      element.inert = false;
      element.classList.toggle('is-active', state.active === id);
      element.classList.toggle('is-maximized', state.windows[id].maximized);
      element.style.zIndex = String(10 + state.order.indexOf(id));
      applyPosition(element);
      const button = element.querySelector<HTMLButtonElement>('[data-maximize]')!;
      button.setAttribute(
        'aria-label',
        `${state.windows[id].maximized ? 'Restore' : 'Maximize'} ${names[id]}`,
      );
      button.setAttribute('aria-pressed', String(state.windows[id].maximized));
    });
    root!.querySelectorAll<HTMLButtonElement>('[data-open]').forEach((button) => {
      const active = state.active === button.dataset.open;
      button.dataset.active = String(active);
      button.setAttribute('aria-pressed', String(active));
    });
    root!
      .querySelectorAll<HTMLElement>('[data-dock-indicator]')
      .forEach((dot) => (dot.hidden = !isVisible(dot.dataset.dockIndicator as AppId)));
    root!
      .querySelectorAll('[data-theme-choice]')
      .forEach((button) =>
        button.setAttribute(
          'aria-pressed',
          String(button.getAttribute('data-theme-choice') === state.theme),
        ),
      );
    const empty = get('.desktop-empty');
    empty.hidden = state.active !== null;
    empty.dataset.visible = String(state.active === null);
    renderEditor();
    const event = state.events.at(-1);
    if (lastEvent !== event) {
      lastEvent = event;
      const list = get('#action-log');
      list.replaceChildren();
      [...state.events].reverse().forEach((item) => {
        const li = document.createElement('li');
        const code = document.createElement('code');
        code.textContent = item.action;
        const args = document.createElement('small');
        args.textContent = item.arguments;
        const result = document.createElement('p');
        result.textContent = item.result;
        li.append(code, args, result);
        list.append(li);
      });
    }
  }
  function fitWindows() {
    if (mobile.matches) return;
    windows
      .filter(
        (element) => !element.hidden && !state.windows[element.dataset.window as AppId].maximized,
      )
      .forEach((element) => {
        const w = state.windows[element.dataset.window as AppId];
        w.x = Math.max(
          0,
          Math.min(
            w.x,
            Math.max(
              0,
              ((workspace.clientWidth - element.offsetWidth) / workspace.clientWidth) * 100,
            ),
          ),
        );
        w.y = Math.max(
          56,
          Math.min(w.y, Math.max(56, workspace.clientHeight - element.offsetHeight - 90)),
        );
        applyPosition(element);
      });
  }
  function focusActive() {
    const active = windows.find(
      (element) => element.dataset.window === state.active && !element.hidden,
    );
    const target =
      state.active === 'editor' ? editor : active?.querySelector<HTMLElement>('button,select');
    (target ?? root!.querySelector<HTMLElement>('[data-open="editor"]'))?.focus({
      preventScroll: true,
    });
  }
  function commit(action: Action, animated = true) {
    const hadWordCount = state.wordCountEnabled;
    const id = 'app' in action ? action.app : null;
    const element = id ? windows.find((item) => item.dataset.window === id)! : null;
    const from = element && !element.hidden ? element.getBoundingClientRect() : null;
    if (element) motion.cancel(element);
    const keepEditorFocus = document.activeElement === editor;
    if (
      ![
        'update.simulate',
        'window.focus',
        'window.move',
        'document.edit',
        'document.select',
      ].includes(action.type)
    ) {
      get('#simulation-status').dataset.result =
        runner.current.status === 'running' ? 'running' : 'idle';
      root!
        .querySelectorAll<HTMLElement>('[data-run-icon]')
        .forEach((icon) => (icon.hidden = true));
    }
    if (action.type === 'workspace.reset') {
      dragCleanup?.();
      runner.cancel();
      motion.cancelAll();
    }
    state = dispatch(state, action);
    render();
    if (!hadWordCount && state.wordCountEnabled && !reduced.matches)
      get('#word-count').animate(
        [
          { opacity: 0, translate: '0 4px' },
          { opacity: 1, translate: '0 0' },
        ],
        { duration: 280 },
      );
    fitWindows();
    if (element && animated && action.type !== 'window.focus' && action.type !== 'window.move') {
      const dock = root!.querySelector<HTMLElement>(`.desktop-dock [data-open="${id}"]`)!;
      motion.run(element, from, isVisible(id!), dock.getBoundingClientRect());
    }
    if (
      action.type === 'document.open' ||
      action.type === 'window.minimize' ||
      action.type === 'window.open'
    )
      focusActive();
    if (action.type === 'document.open') editor.setSelectionRange(0, 0);
    if (action.type === 'update.simulate' || action.type === 'appearance.apply') {
      editor.setSelectionRange(
        state.selection.start,
        state.selection.end,
        state.selection.direction,
      );
      if (keepEditorFocus && isVisible('editor')) editor.focus({ preventScroll: true });
    }
    if (action.type === 'workspace.reset') {
      root!.querySelectorAll<HTMLSelectElement>('select').forEach((select) => (select.value = ''));
      editor.setSelectionRange(0, 0);
      get('#demo-status').textContent = 'Workspace reset. In-memory edits discarded.';
    } else if (
      !['window.focus', 'window.move', 'document.select', 'document.edit'].includes(action.type)
    )
      get('#demo-status').textContent = state.events.at(-1)?.result ?? 'Ready.';
  }
  function renderRun(run: UpdateRun) {
    root!
      .querySelectorAll<HTMLElement>('[data-run-icon]')
      .forEach((icon) => (icon.hidden = icon.dataset.runIcon !== run.status));
    const finishFocused = document.activeElement === get('#finish-update');
    const busy = run.status === 'running';
    root!
      .querySelectorAll<HTMLButtonElement>('[data-theme-choice]')
      .forEach((button) => (button.disabled = busy));
    document.querySelectorAll<HTMLButtonElement>('[data-scenario]').forEach((button) => {
      button.disabled = busy;
      button.toggleAttribute('data-running', busy && button.dataset.scenario === run.scenario);
      button.setAttribute('aria-busy', String(busy && button.dataset.scenario === run.scenario));
    });
    const progress = get('#run-progress');
    progress.hidden = run.status === 'idle';
    get('#finish-update').hidden = !busy;
    get('#simulation-status').dataset.result = run.status;
    get('#run-phase').textContent = run.steps[run.index] ?? '';
    const percent = busy ? Math.round(((run.index + 1) / run.steps.length) * 100) : 100;
    const meter = get('.run-meter');
    meter.setAttribute('aria-valuenow', String(percent));
    meter.style.setProperty('--progress', `${percent}%`);
    const list = get('#simulation-stages');
    list.replaceChildren();
    if (run.status === 'idle') {
      const li = document.createElement('li');
      li.textContent = 'Choose a scenario to inspect its illustrative events.';
      list.append(li);
      get('#simulation-title').textContent = 'A handover, step by step.';
      return;
    }
    get('#simulation-title').textContent =
      run.status === 'rejected'
        ? 'Rejected before activation.'
        : busy
          ? 'A continuous handover.'
          : run.scenario === 'behavior'
            ? 'A new generation. The same document.'
            : 'New appearance. Same place.';
    run.steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.dataset.phase = i === run.index && busy ? 'current' : i <= run.index ? 'done' : 'pending';
      const number = document.createElement('span');
      number.textContent = `0${i + 1}`;
      li.append(number, document.createTextNode(step));
      list.append(li);
    });
    if (!busy && finishFocused) focusActive();
  }
  const runner = createUpdateRunner({
    commit: (scenario) => commit({ type: 'update.simulate', scenario }, false),
    notify: renderRun,
  });
  function execute(action: Action) {
    if (action.type === 'update.simulate') {
      if (runner.start(action.scenario, reduced.matches) && isVisible('editor')) {
        editor.focus({ preventScroll: true });
        editor.setSelectionRange(
          state.selection.start,
          state.selection.end,
          state.selection.direction,
        );
      }
      return;
    }
    if (action.type === 'appearance.apply' && runner.current.status === 'running') return;
    if ((action.type === 'workspace.reset' || action.type === 'document.open') && dirty()) {
      pending = action;
      discardAccepted = false;
      discardOpener = document.activeElement as HTMLElement;
      discard.showModal();
      get('#discard-keep').focus();
      return;
    }
    commit(action);
  }
  function closeLauncher(returnFocus = false) {
    launcher.hidden = true;
    root!.querySelector('[data-launcher]')?.setAttribute('aria-expanded', 'false');
    if (returnFocus)
      root!.querySelector<HTMLButtonElement>('[data-launcher]')?.focus({ preventScroll: true });
  }
  function appear(element: HTMLElement) {
    if (!reduced.matches)
      element.animate(
        [
          { opacity: 0, translate: '0 8px' },
          { opacity: 1, translate: '0 0' },
        ],
        { duration: 280, easing: 'cubic-bezier(.2,.75,.2,1)' },
      );
  }
  function highlight(index: number) {
    const buttons = [...get('#command-results').querySelectorAll<HTMLButtonElement>('button')];
    buttons.forEach((button, i) => (button.dataset.highlighted = String(i === index)));
  }
  function runCommand(index: number) {
    const command = commands[index];
    if (!command) return;
    paletteExecuted = true;
    palette.close();
    execute(command.action);
  }
  function renderCommands() {
    const list = get('#command-results');
    list.replaceChildren();
    const query = search.value.trim().toLowerCase();
    commands.forEach((command, index) => {
      if (!`${command.label} ${command.description}`.toLowerCase().includes(query)) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.command = String(index);
      button.disabled =
        runner.current.status === 'running' &&
        ['appearance.apply', 'update.simulate'].includes(command.action.type);
      const label = document.createElement('span');
      label.textContent = command.label;
      const detail = document.createElement('small');
      detail.textContent = command.description;
      button.append(label, detail);
      button.addEventListener('click', () => runCommand(index));
      button.addEventListener('focus', () =>
        highlight([...list.querySelectorAll('button')].indexOf(button)),
      );
      list.append(button);
    });
    const count = list.childElementCount;
    get('#command-count').textContent = `${count} ${count === 1 ? 'action' : 'actions'} available`;
    if (!count) {
      const p = document.createElement('p');
      p.className = 'palette-empty';
      p.textContent = 'No matching action. Try “editor”, “theme” or “update”.';
      list.append(p);
    }
    highlight(-1);
  }
  function openPalette() {
    if (palette.open || discard.open) return;
    paletteOpener = document.activeElement as HTMLElement;
    paletteExecuted = false;
    closeLauncher();
    search.value = '';
    renderCommands();
    palette.showModal();
    appear(palette);
    search.focus();
  }
  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button || button.disabled) return;
    if (button.dataset.open) {
      execute({ type: 'window.open', app: button.dataset.open as AppId });
      closeLauncher();
    } else if (button.dataset.minimize)
      execute({ type: 'window.minimize', app: button.dataset.minimize as AppId });
    else if (button.dataset.maximize)
      execute({ type: 'window.maximize', app: button.dataset.maximize as AppId });
    else if (button.dataset.file) execute({ type: 'document.open', file: button.dataset.file });
    else if (button.dataset.themeChoice)
      execute({ type: 'appearance.apply', theme: button.dataset.themeChoice as Theme });
    else if (button.hasAttribute('data-palette-open')) openPalette();
    else if (button.hasAttribute('data-launcher')) {
      launcher.hidden = !launcher.hidden;
      button.setAttribute('aria-expanded', String(!launcher.hidden));
      if (!launcher.hidden) {
        appear(launcher);
        launcher.querySelector('button')?.focus();
      }
    }
  });
  document.querySelectorAll('[data-reset]').forEach((button) =>
    button.addEventListener('click', () => {
      execute({ type: 'workspace.reset' });
      closeLauncher();
    }),
  );
  document
    .querySelectorAll<HTMLElement>('[data-scenario]')
    .forEach((button) =>
      button.addEventListener('click', () =>
        execute({ type: 'update.simulate', scenario: button.dataset.scenario as Scenario }),
      ),
    );
  get('#finish-update').addEventListener('click', () => runner.finish());
  get('#discard-keep').addEventListener('click', () => {
    pending = null;
    discard.close();
  });
  discard.querySelector('[data-discard-confirm]')!.addEventListener('click', () => {
    discardAccepted = true;
    const action = pending;
    pending = null;
    discard.close();
    if (action) commit(action);
  });
  discard.addEventListener('cancel', () => (pending = null));
  discard.addEventListener('close', () => {
    if (pending) pending = null;
    if (discardAccepted) focusActive();
    else if (discardOpener?.isConnected) discardOpener.focus({ preventScroll: true });
  });
  const positions = [
    get<HTMLSelectElement>('#editor-position'),
    ...root.querySelectorAll<HTMLSelectElement>('[data-position-app]'),
  ];
  positions.forEach((select) =>
    select.addEventListener('change', () => {
      if (select.value)
        execute({
          type: 'window.position',
          app: (select.dataset.positionApp ?? 'editor') as AppId,
          position: select.value as Position,
        });
    }),
  );
  editor.addEventListener('input', () => {
    state = dispatch(state, { type: 'document.edit', text: editor.value, selection: selection() });
    renderEditor();
  });
  ['select', 'keyup', 'pointerup', 'blur'].forEach((type) =>
    editor.addEventListener(type, rememberSelection),
  );
  function focusWindow(app: AppId) {
    if (state.active === app) return;
    state = dispatch(state, { type: 'window.focus', app });
    render();
  }
  windows.forEach((element) => {
    element.addEventListener('pointerdown', () => focusWindow(element.dataset.window as AppId));
    element.addEventListener('focusin', () => focusWindow(element.dataset.window as AppId));
  });

  let dragCleanup: (() => void) | null = null;
  root.querySelectorAll<HTMLElement>('[data-drag]').forEach((bar) => {
    const app = bar.dataset.drag as AppId;
    const element = bar.parentElement!;
    let dragging: {
      id: number;
      x: number;
      y: number;
      startX: number;
      startY: number;
      maxX: number;
      maxY: number;
      stage: DOMRect;
      width: number;
    } | null = null;
    let frame = 0;
    let next: { x: number; y: number } | null = null;
    let edge: Position | null = null;
    const preview = get('#snap-preview');
    function flush() {
      frame = 0;
      if (!next) return;
      state = dispatch(state, { type: 'window.move', app, ...next });
      applyPosition(element);
      next = null;
    }
    function release(commitEdge = false) {
      if (!dragging) return;
      const id = dragging.id;
      dragging = null;
      cancelAnimationFrame(frame);
      flush();
      preview.hidden = true;
      if (bar.hasPointerCapture(id)) bar.releasePointerCapture(id);
      if (commitEdge && edge) execute({ type: 'window.position', app, position: edge });
      edge = null;
      dragCleanup = null;
    }
    bar.addEventListener('pointerdown', (event) => {
      if (
        event.button !== 0 ||
        mobile.matches ||
        state.windows[app].maximized ||
        (event.target as Element).closest('button,select')
      )
        return;
      dragCleanup?.();
      motion.cancel(element);
      const w = state.windows[app];
      const stage = workspace.getBoundingClientRect();
      dragging = {
        id: event.pointerId,
        x: w.x,
        y: w.y,
        startX: event.clientX,
        startY: event.clientY,
        maxX: Math.max(
          0,
          ((workspace.clientWidth - element.offsetWidth) / workspace.clientWidth) * 100,
        ),
        maxY: Math.max(56, workspace.clientHeight - element.offsetHeight - 90),
        stage,
        width: element.offsetWidth,
      };
      dragCleanup = () => release(false);
      bar.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    bar.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      next = {
        x: Math.max(
          0,
          Math.min(
            dragging.maxX,
            dragging.x + ((event.clientX - dragging.startX) / dragging.stage.width) * 100,
          ),
        ),
        y: Math.max(56, Math.min(dragging.maxY, dragging.y + event.clientY - dragging.startY)),
      };
      edge =
        event.clientX < dragging.stage.left + 24
          ? 'left'
          : event.clientX > dragging.stage.right - 24
            ? 'right'
            : null;
      preview.hidden = !edge;
      if (edge) {
        preview.style.left =
          edge === 'left'
            ? '3%'
            : `${Math.max(0, 97 - (dragging.width / dragging.stage.width) * 100)}%`;
        preview.style.width = `${dragging.width}px`;
        preview.style.height = `${element.offsetHeight}px`;
      }
      if (!frame) frame = requestAnimationFrame(flush);
    });
    bar.addEventListener('pointerup', () => release(true));
    bar.addEventListener('pointercancel', () => release(false));
    bar.addEventListener('lostpointercapture', () => release(false));
  });
  search.addEventListener('input', renderCommands);
  palette.addEventListener('keydown', (event) => {
    const buttons = [
      ...palette.querySelectorAll<HTMLButtonElement>('[data-command]:not(:disabled)'),
    ];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!buttons.length) return;
      const next =
        event.key === 'ArrowDown'
          ? (index + 1) % buttons.length
          : index <= 0
            ? buttons.length - 1
            : index - 1;
      buttons[next].focus();
    } else if (event.key === 'Enter' && document.activeElement === search) {
      event.preventDefault();
      if (buttons[0]) runCommand(Number(buttons[0].dataset.command));
    }
  });
  get('#palette-close').addEventListener('click', () => palette.close());
  palette.addEventListener('close', () => {
    if (discard.open) return;
    if (paletteExecuted) focusActive();
    else if (paletteOpener?.isConnected) paletteOpener.focus({ preventScroll: true });
  });
  palette.addEventListener('click', (event) => {
    if (event.target === palette) {
      const r = palette.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        palette.close();
    }
  });
  root.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openPalette();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      dragCleanup?.();
      if (!launcher.hidden) closeLauncher(true);
      root!.classList.add('tooltips-dismissed');
    }
  });
  root.addEventListener('pointermove', () => root!.classList.remove('tooltips-dismissed'));
  root.addEventListener('focusin', () => root!.classList.remove('tooltips-dismissed'));
  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (!launcher.hidden && !launcher.contains(target) && !target.closest('[data-launcher]'))
      closeLauncher();
  });
  const resize = new ResizeObserver(() => {
    dragCleanup?.();
    motion.cancelAll();
    render();
    fitWindows();
  });
  resize.observe(workspace);
  mobile.addEventListener('change', () => {
    dragCleanup?.();
    motion.cancelAll();
    render();
    fitWindows();
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      runner.reduceMotion();
      motion.cancelAll();
      render();
    }
  });
  addEventListener('pagehide', () => {
    runner.cancel();
    dragCleanup?.();
    motion.cancelAll();
    resize.disconnect();
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) {
      resize.observe(workspace);
      render();
      fitWindows();
    }
  });
  render();
  fitWindows();
  renderRun(runner.current);
}
