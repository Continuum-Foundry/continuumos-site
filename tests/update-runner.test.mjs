import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, dispatch } from '../src/lib/playground-model.ts';
import { createUpdateRunner } from '../src/lib/update-runner.ts';

function harness() {
  let state = createState();
  let commits = 0;
  const callbacks = [];
  const notifications = [];
  const runner = createUpdateRunner({
    commit: (scenario) => {
      commits++;
      state = dispatch(state, { type: 'update.simulate', scenario });
    },
    notify: (run) => notifications.push(run),
    schedule: (callback) => {
      callbacks.push(callback);
      return callback;
    },
    unschedule: () => {},
  });
  return {
    runner,
    callbacks,
    notifications,
    get state() {
      return state;
    },
    get commits() {
      return commits;
    },
    edit(action) {
      state = dispatch(state, action);
    },
  };
}
test('a handover activates once and preserves edits and geometry made after it started', () => {
  const h = harness();
  h.runner.start('behavior');
  h.edit({
    type: 'document.edit',
    text: 'Work written during handover',
    selection: { start: 5, end: 12, direction: 'backward' },
  });
  h.edit({ type: 'window.move', app: 'editor', x: 12, y: 90 });
  while (h.runner.current.status === 'running') h.callbacks.shift()();
  h.runner.finish();
  assert.equal(h.commits, 1);
  assert.equal(h.state.generation, 2);
  assert.equal(h.state.text, 'Work written during handover');
  assert.deepEqual(h.state.selection, { start: 5, end: 12, direction: 'backward' });
  assert.equal(h.state.windows.editor.x, 12);
  assert.equal(h.state.windows.editor.y, 90);
});
test('reset/cancel invalidates queued callbacks even if a new run starts', () => {
  const h = harness();
  h.runner.start('behavior');
  const stale = h.callbacks.shift();
  h.runner.cancel();
  h.edit({ type: 'workspace.reset' });
  h.runner.start('appearance');
  stale();
  assert.equal(h.commits, 0);
  assert.equal(h.runner.current.index, 0);
  h.runner.finish();
  assert.equal(h.commits, 1);
  assert.equal(h.state.generation, 1);
});
test('busy runs serialize; replay and finish-now each commit exactly once', () => {
  const h = harness();
  assert.equal(h.runner.start('behavior'), true);
  assert.equal(h.runner.start('appearance'), false);
  h.runner.finish();
  h.callbacks.shift()();
  h.runner.finish();
  assert.equal(h.commits, 1);
  h.runner.start('behavior');
  h.runner.finish();
  assert.equal(h.commits, 2);
  assert.equal(h.state.generation, 3);
});
test('rejection preserves the generation, theme, document and selection', () => {
  const h = harness();
  h.edit({
    type: 'document.edit',
    text: 'Keep this',
    selection: { start: 0, end: 4, direction: 'forward' },
  });
  const before = structuredClone(h.state);
  h.runner.start('rejection');
  h.runner.finish();
  assert.equal(h.runner.current.status, 'rejected');
  assert.equal(h.state.generation, before.generation);
  assert.equal(h.state.theme, before.theme);
  assert.equal(h.state.text, before.text);
  assert.deepEqual(h.state.selection, before.selection);
});
test('reduced motion finishes immediately, including a preference change during playback', () => {
  const h = harness();
  h.runner.start('behavior', true);
  assert.equal(h.commits, 1);
  assert.equal(h.callbacks.length, 0);
  h.runner.start('appearance');
  h.runner.reduceMotion();
  h.runner.reduceMotion();
  h.callbacks.shift()();
  assert.equal(h.commits, 2);
});
test('the all-minimized workspace has no focused app; reopening restores stacking ownership', () => {
  let state = createState();
  state = dispatch(state, { type: 'window.minimize', app: 'editor' });
  state = dispatch(state, { type: 'window.minimize', app: 'settings' });
  assert.equal(state.active, null);
  state = dispatch(state, { type: 'window.open', app: 'files' });
  assert.equal(state.active, 'files');
  assert.equal(state.order.at(-1), 'files');
  assert.equal(state.windows.files.minimized, false);
});
