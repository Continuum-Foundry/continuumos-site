import type { Scenario } from './playground-model';

export type RunStatus = 'idle' | 'running' | 'completed' | 'rejected';
export interface UpdateRun {
  id: number;
  status: RunStatus;
  scenario: Scenario | null;
  index: number;
  steps: string[];
}
export const updateSteps: Record<Scenario, string[]> = {
  appearance: [
    'Validate the appearance candidate',
    'Prepare the next theme',
    'Activate at the scene boundary',
    'Document, selection and windows retained',
  ],
  behavior: [
    'Validate editor state schema v1',
    'Carry the current document forward',
    'Activate the new editor generation',
    'Word count enabled. Your work is still here.',
  ],
  rejection: [
    'Validate the candidate schema',
    'Reject incompatible schema v99',
    'Existing generation and work left intact',
  ],
};
interface Options {
  commit: (scenario: Scenario) => void;
  notify: (run: UpdateRun) => void;
  schedule?: (callback: () => void, delay: number) => unknown;
  unschedule?: (handle: unknown) => void;
}

/** Presentation timing is separate from accepted document/window data. */
export function createUpdateRunner(options: Options) {
  const schedule = options.schedule ?? ((callback, delay) => setTimeout(callback, delay));
  const unschedule =
    options.unschedule ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
  let run: UpdateRun = { id: 0, status: 'idle', scenario: null, index: 0, steps: [] };
  let timer: unknown;
  const clear = () => {
    if (timer !== undefined) unschedule(timer);
    timer = undefined;
  };
  const notify = () => options.notify({ ...run, steps: [...run.steps] });
  function finish() {
    if (run.status !== 'running' || !run.scenario) return;
    clear();
    const scenario = run.scenario;
    // Mark finished before the callback: reentrant finish cannot commit twice.
    run = {
      ...run,
      status: scenario === 'rejection' ? 'rejected' : 'completed',
      index: run.steps.length - 1,
    };
    options.commit(scenario);
    notify();
  }
  function tick(id: number) {
    if (run.id !== id || run.status !== 'running') return;
    if (run.index >= run.steps.length - 2) {
      finish();
      return;
    }
    run = { ...run, index: run.index + 1 };
    notify();
    timer = schedule(() => tick(id), 400);
  }
  return {
    start(scenario: Scenario, reduced = false) {
      if (run.status === 'running') return false;
      clear();
      run = { id: run.id + 1, status: 'running', scenario, index: 0, steps: updateSteps[scenario] };
      notify();
      if (reduced) finish();
      else {
        const id = run.id;
        timer = schedule(() => tick(id), 400);
      }
      return true;
    },
    finish,
    cancel() {
      clear();
      run = { id: run.id + 1, status: 'idle', scenario: null, index: 0, steps: [] };
      notify();
    },
    reduceMotion() {
      finish();
    },
    get current() {
      return run;
    },
  };
}
