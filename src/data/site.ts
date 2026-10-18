export const site = {
  name: 'ContinuumOS',
  description: 'An original Rust desktop operating system exploring continuity, deliberate design, and live development.',
  repository: 'https://github.com/Continuum-Foundry/continuumos-site',
  reviewed: 'October 18, 2026',
};

export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export type Milestone = { id: string; title: string; status: 'Evidence retained' | 'Partially demonstrated' | 'Planned'; description: string };
export const milestones: Milestone[] = [
  { id: 'M0', title: 'Establish the foundation', status: 'Evidence retained', description: 'Windows-native tooling, independent freestanding Rust link probes, dependency experiments and retained compile evidence. These are feasibility results, not guest runtime support.' },
  { id: 'M1', title: 'An original kernel, an actual ISO', status: 'Partially demonstrated', description: 'P1-02 demonstrated minimal original Rust kernel entry from a standalone UEFI ISO in QEMU. Checked boot metadata, owned memory, exceptions and interrupt/timekeeping gates remain.' },
  { id: 'M2', title: 'Find the desktop language', status: 'Planned', description: 'Compare Slint with a minimal custom UI using the same scenes, input and accessibility expectations. Prove hosted resource continuity before selecting a toolkit.' },
  { id: 'M3', title: 'Give components boundaries', status: 'Planned', description: 'Isolated processes, capability-controlled handles and versioned interfaces. Establish the execution and authority boundaries that replacement needs.' },
  { id: 'M4', title: 'Bring continuity into the guest', status: 'Planned', description: 'Desktop surfaces, input and an authenticated development channel. Demonstrate guest resource updates with unchanged kernel boot identity and uptime.' },
  { id: 'M5', title: 'Replace behavior, preserve work', status: 'Planned', description: 'Transfer accepted document state to a new application generation. Test incompatible updates, candidate failures and repeated reloads.' },
  { id: 'M6', title: 'Make recovery durable', status: 'Planned', description: 'Persistent files, activation records, selected service replacement and separately tested boot recovery.' },
  { id: 'M7', title: 'Extend through evidence', status: 'Planned', description: 'Evaluate additional devices, networking, runtimes and optional isolated inference behind independent integration gates.' },
  { id: 'M8', title: 'A coherent experimental release', status: 'Planned', description: 'A reproducible standalone ISO, declared VM support, recovery tests, accessibility review and complete provenance.' },
];

export const layers = [
  { id: 'apps', name: 'Applications', tag: 'Your work', text: 'An editor, file browser and inspector are the intended starting point. Applications own their document state; a compatible replacement must explicitly transfer it.', boundary: 'Versioned application state and surface contracts' },
  { id: 'actions', name: 'Typed actions', tag: 'One vocabulary', text: 'Buttons, shortcuts and authorized automation call the same typed operations. Naming an action grants no authority. An optional model can propose actions later through the same checks.', boundary: 'Typed arguments, scoped authority, expected revisions' },
  { id: 'compositor', name: 'Compositor & desktop', tag: 'A coherent surface', text: 'The OS owns window policy, focus and input routing. Software rendering comes first. Slint and a minimal custom UI remain candidates, pending the comparison.', boundary: 'Surface submission, input and accessibility semantics' },
  { id: 'services', name: 'Isolated services', tag: 'Explicit boundaries', text: 'The proposed system separates responsibilities into protected processes. Selected services become replaceable only after isolation, request ownership and state-transfer tests pass.', boundary: 'Capability-controlled IPC and explicit protocol schemas' },
  { id: 'updates', name: 'Update coordinator', tag: 'A controlled handover', text: 'The proposed coordinator validates compatibility, transfers accepted state, changes routes and retires old execution safely. A failed candidate cannot silently become a successful update.', boundary: 'Validation → quiescence → state transfer → activation' },
  { id: 'kernel', name: 'Original Rust kernel', tag: 'The foundation', text: 'A first-party freestanding Rust kernel with narrowly documented architecture-specific assembly. Minimal ISO entry is demonstrated; full kernel readiness and user-mode isolation remain ahead.', boundary: 'Kernel objects, memory, scheduling and syscall boundary' },
];
