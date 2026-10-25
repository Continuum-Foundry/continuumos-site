export const site = {
  name: 'ContinuumOS',
  description:
    'An original Rust desktop operating system exploring continuity, deliberate design, and live development.',
  repository: 'https://github.com/Continuum-Foundry/continuumos-site',
  reviewed: 'October 25, 2026',
  resultsThrough: 'October 24, 2026',
  company: 'https://company-site-ten-gamma.vercel.app',
};

export const href = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export type Milestone = {
  id: string;
  title: string;
  status: 'Evidence retained' | 'Locally accepted' | 'Planned';
  environment: 'Windows host' | 'QEMU guest' | 'Future guest';
  reviewed: string;
  scope: string;
  description: string;
};
export const milestones: Milestone[] = [
  {
    id: 'M0',
    title: 'Establish the foundation',
    status: 'Evidence retained',
    environment: 'Windows host',
    reviewed: site.reviewed,
    scope: 'Compile and tooling feasibility',
    description:
      'Windows-native tooling, independent freestanding Rust link probes, dependency experiments and retained compile evidence. These are feasibility results, not guest runtime support.',
  },
  {
    id: 'M1',
    title: 'An original kernel, an actual ISO',
    status: 'Locally accepted',
    environment: 'QEMU guest',
    reviewed: site.reviewed,
    scope: 'Experimental VM baseline',
    description:
      'Standalone UEFI ISO boots with checked boot metadata, fatal diagnostics, memory ownership and interrupts/uptime. The declared single-core experimental baseline passes local acceptance; this is not a usable desktop.',
  },
  {
    id: 'M2',
    title: 'A UI that can keep its place',
    status: 'Locally accepted',
    environment: 'Windows host',
    reviewed: site.reviewed,
    scope: 'Hosted subset',
    description:
      'The Slint/custom comparison, selected custom Rust core and same-window resource reload pass local acceptance. Unsaved text, selection, history, focus and geometry survive supported resource changes. Guest confirmation remains pending.',
  },
  {
    id: 'M3',
    title: 'Give components boundaries',
    status: 'Planned',
    environment: 'Future guest',
    reviewed: site.reviewed,
    scope: 'Next gate · not started',
    description:
      'Isolated processes, capability-controlled handles and versioned interfaces. Establish the execution and authority boundaries that replacement needs.',
  },
  {
    id: 'M4',
    title: 'Bring continuity into the guest',
    status: 'Planned',
    environment: 'Future guest',
    reviewed: site.reviewed,
    scope: 'Guest resource continuity',
    description:
      'Desktop surfaces, input and an authenticated development channel. Demonstrate guest resource updates with unchanged kernel boot identity and uptime.',
  },
  {
    id: 'M5',
    title: 'Replace behavior, preserve work',
    status: 'Planned',
    environment: 'Future guest',
    reviewed: site.reviewed,
    scope: 'Application behavior replacement',
    description:
      'Transfer accepted document state to a new application generation. Test incompatible updates, candidate failures and repeated reloads.',
  },
  {
    id: 'M6',
    title: 'Make recovery durable',
    status: 'Planned',
    environment: 'Future guest',
    reviewed: site.reviewed,
    scope: 'Durability and recovery',
    description:
      'Persistent files, activation records, selected service replacement and separately tested boot recovery.',
  },
  {
    id: 'M7',
    title: 'Installation and accounts',
    status: 'Planned',
    environment: 'Future guest',
    reviewed: site.reviewed,
    scope: 'Required for M8',
    description:
      'Graphical offline VM installation, local accounts and first-owner setup, repair and preserving reinstall. Validate ownership and account/session authority before the experimental release.',
  },
  {
    id: 'M8',
    title: 'A coherent experimental release',
    status: 'Planned',
    environment: 'Future guest',
    reviewed: site.reviewed,
    scope: 'Experimental VM release',
    description:
      'A reproducible standalone ISO with declared VM support, provenance and accessibility review. The exact ISO must install offline; the installed VM must boot with the ISO detached and pass account, file-preservation and recovery tests.',
  },
];

export const currentViews = [
  {
    id: 'kernel',
    number: '01',
    title: 'QEMU kernel baseline',
    milestone: milestones[1],
    label: 'Locally accepted',
    text: 'An original Rust kernel boots from its own UEFI ISO. Checked metadata, memory ownership, diagnostics and timer/uptime are in place.',
    link: 'progress/#m1',
  },
  {
    id: 'hosted',
    number: '02',
    title: 'Windows-hosted UI',
    milestone: milestones[2],
    label: 'Locally accepted',
    text: 'Supported theme and layout reloads retain unsaved work in the same process and window. Custom Rust is the provisional UI direction.',
    link: 'progress/#m2',
  },
  {
    id: 'concept',
    number: '03',
    title: 'Browser concept',
    milestone: null,
    label: 'Design exploration',
    text: 'An interactive sketch of the intended desktop. Its windows and handovers are simulated in your browser.',
    link: 'concepts/',
  },
];

export const laterMilestones = [
  {
    id: 'm9-m14',
    range: 'M9–M14',
    title: 'An everyday VM desktop',
    text: 'Files and desktop workflows, application delivery, backup and administration, networking, audio and assistive integration lead to a coherent usable VM release.',
  },
  {
    id: 'm15',
    range: 'M15',
    title: 'One named physical PC',
    text: 'Qualify one explicit hardware profile after the usable VM desktop passes. Broad hardware support needs its own evidence.',
  },
  {
    id: 'm16-m21',
    range: 'M16–M21',
    title: 'Separate research tracks',
    text: 'Windows compatibility and browser feasibility studies; optional GPU acceleration, SMP, bounded Wasm and local AI experiments. These have individual prerequisites, are not a serial chain, and do not gate M8 or M14.',
  },
];

export const layers = [
  {
    id: 'apps',
    name: 'Applications',
    tag: 'Your work',
    text: 'An editor, file browser and inspector are the intended starting point. Applications own their document state; a compatible replacement must explicitly transfer it.',
    boundary: 'Versioned application state and surface contracts',
  },
  {
    id: 'actions',
    name: 'Typed actions',
    tag: 'One vocabulary',
    text: 'Buttons, shortcuts and authorized automation call the same typed operations. Naming an action grants no authority. An optional model can propose actions later through the same checks.',
    boundary: 'Typed arguments, scoped authority, expected revisions',
  },
  {
    id: 'compositor',
    name: 'Compositor & desktop',
    tag: 'A coherent surface',
    text: `${milestones[2].status} on the ${milestones[2].environment.toLowerCase()}: the custom Rust UI is provisionally selected after comparison with Slint. Software rendering and supported resource continuity work in the hosted subset. Guest window policy, input routing and integration await M4 confirmation.`,
    boundary: 'Surface submission, input and accessibility semantics',
  },
  {
    id: 'services',
    name: 'Isolated services',
    tag: 'Explicit boundaries',
    text: 'The proposed system separates responsibilities into protected processes. Selected services become replaceable only after isolation, request ownership and state-transfer tests pass.',
    boundary: 'Capability-controlled IPC and explicit protocol schemas',
  },
  {
    id: 'updates',
    name: 'Update coordinator',
    tag: 'A controlled handover',
    text: 'The proposed coordinator validates compatibility, transfers accepted state, changes routes and retires old execution safely. A failed candidate cannot silently become a successful update.',
    boundary: 'Validation → quiescence → state transfer → activation',
  },
  {
    id: 'kernel',
    name: 'Original Rust kernel',
    tag: 'The foundation',
    text: `${milestones[1].status} in the ${milestones[1].environment}: a first-party freestanding Rust kernel with narrowly documented architecture-specific assembly. ISO boot, checked metadata, owned memory, fatal diagnostics and interrupts/uptime pass the experimental baseline. Scheduling and user-mode isolation remain ahead.`,
    boundary: 'Kernel objects, memory, scheduling and syscall boundary',
  },
];
