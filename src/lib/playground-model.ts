/** Browser illustration only. These are not guest protocols or OS runtime state. */
export type AppId = 'editor' | 'files' | 'settings' | 'inspector';
export type Theme = 'midnight' | 'dusk' | 'copper';
export type Position = 'left' | 'center' | 'right';
export type Scenario = 'appearance' | 'behavior' | 'rejection';
export interface Selection { start: number; end: number; direction: 'forward' | 'backward' | 'none' }
export interface WindowState { open: boolean; minimized: boolean; maximized: boolean; x: number; y: number }
export interface DemoEvent { action: string; arguments: string; result: string }
export interface DemoState {
  text: string; file: string; theme: Theme; generation: number; wordCountEnabled: boolean;
  selection: Selection; active: AppId; order: AppId[]; windows: Record<AppId, WindowState>;
  events: DemoEvent[]; scenario: Scenario | null; stages: string[];
}
export type Action =
  | { type: 'window.open' | 'window.focus' | 'window.minimize' | 'window.maximize'; app: AppId }
  | { type: 'window.position'; app: AppId; position: Position }
  | { type: 'window.move'; app: AppId; x: number; y: number }
  | { type: 'document.edit'; text: string; selection: Selection }
  | { type: 'document.select'; selection: Selection }
  | { type: 'document.open'; file: string }
  | { type: 'appearance.apply'; theme: Theme }
  | { type: 'update.simulate'; scenario: Scenario }
  | { type: 'workspace.reset' };

export const documents: Record<string,string> = {
  'Field notes.md': 'A little room to think\n\nA system should evolve around your work.\nNot ask you to start again.\n\nKeep the document.\nChange the system.\nContinue.\n\nTry writing something here. Select a few words, then apply an update.',
  'Next steps.md': 'The next meaningful proof\n\nOpen an unsaved document in the guest.\nApply a supported update.\nKeep text, selection, focus and window state.\nProve unchanged boot identity and uptime.\n\nThis browser concept illustrates the intention. Guest proof is still ahead.',
  'About this concept.md': 'This is a browser simulation.\n\nThese windows are HTML and CSS.\nAll updates and application generations are illustrative.\nYour edits live only in memory on this page.\nRefresh or reset to discard them.\n\nNo filesystem access. No code execution. No OS connection.',
};

export function createState(): DemoState {
  return {
    text: documents['Field notes.md'], file:'Field notes.md', theme:'midnight',generation:1,wordCountEnabled:false,
    selection:{start:0,end:0,direction:'none'}, active:'editor',order:['files','inspector','editor','settings'],
    windows:{
      editor:{open:true,minimized:false,maximized:false,x:5,y:64},
      files:{open:false,minimized:false,maximized:false,x:8,y:85},
      settings:{open:true,minimized:false,maximized:false,x:67,y:158},
      inspector:{open:false,minimized:false,maximized:false,x:55,y:195},
    },
    events:[{action:'workspace.ready',arguments:'{}',result:'Browser concept ready. All events are simulated.'}],scenario:null,stages:[],
  };
}

function focus(state: DemoState, app: AppId) {
  state.active=app;state.windows[app].open=true;state.windows[app].minimized=false;
  state.order=state.order.filter(id=>id!==app).concat(app);
}
function log(state:DemoState,action:string,args:object,result:string){
  state.events.push({action,arguments:JSON.stringify(args),result});state.events=state.events.slice(-24);
}
function clampSelection(text:string,selection:Selection):Selection {
  const start=Math.max(0,Math.min(selection.start,text.length));
  return {start,end:Math.max(start,Math.min(selection.end,text.length)),direction:selection.direction};
}
export function wordCount(text:string){return text.trim() ? text.trim().split(/\s+/u).length : 0;}

/** All controls, palette items and guided scenarios dispatch through this reducer. */
export function dispatch(state:DemoState,action:Action):DemoState{
  if(action.type==='workspace.reset')return createState();
  if(action.type==='document.edit'){
    state.text=action.text;state.selection=clampSelection(state.text,action.selection);return state;
  }
  if(action.type==='document.select'){state.selection=clampSelection(state.text,action.selection);return state;}
  if(action.type==='window.open'||action.type==='window.focus'){
    focus(state,action.app);if(action.type==='window.open')log(state,action.type,{app:action.app},'Window opened.');
  }else if(action.type==='window.minimize'){
    state.windows[action.app].minimized=true;
    state.active=[...state.order].reverse().find(id=>state.windows[id].open&&!state.windows[id].minimized)??'editor';
    log(state,action.type,{app:action.app},'Window minimized. State retained.');
  }else if(action.type==='window.maximize'){
    const window=state.windows[action.app];window.maximized=!window.maximized;focus(state,action.app);
    log(state,action.type,{app:action.app},window.maximized?'Window maximized.':'Window restored.');
  }else if(action.type==='window.position'){
    const window=state.windows[action.app];window.x=action.position==='left'?3:action.position==='center'?19:36;window.y=65;window.maximized=false;focus(state,action.app);
    log(state,action.type,{app:action.app,position:action.position},'Window position changed.');
  }else if(action.type==='window.move'){
    state.windows[action.app].x=Math.max(0,Math.min(95,action.x));state.windows[action.app].y=Math.max(48,Math.min(500,action.y));
  }else if(action.type==='document.open'){
    if(!Object.hasOwn(documents,action.file))return state;
    state.file=action.file;state.text=documents[action.file];state.selection={start:0,end:0,direction:'none'};focus(state,'editor');
    log(state,action.type,{file:action.file},'Bundled sample opened. Previous in-memory edits replaced.');
  }else if(action.type==='appearance.apply'){
    state.theme=action.theme;log(state,action.type,{theme:action.theme},'Appearance changed. Document and window state retained.');
  }else if(action.type==='update.simulate'){
    state.scenario=action.scenario;
    if(action.scenario==='appearance'){
      state.theme=state.theme==='midnight'?'dusk':'midnight';
      state.stages=['Candidate appearance validated','New theme activated at a simulated scene boundary','Document, selection and window state retained'];
      log(state,action.type,{scenario:action.scenario},'Simulated appearance update applied. Document retained.');
    }else if(action.scenario==='behavior'){
      state.generation++;state.wordCountEnabled=true;
      state.stages=['Illustrative editor state schema v1 accepted','Document and selection carried to the candidate','New editor generation activated; word count enabled','Previous simulated generation retired'];
      log(state,action.type,{scenario:action.scenario},`Simulated editor generation ${state.generation} active. State retained.`);
    }else{
      state.stages=['Candidate declares incompatible document schema v99','Compatibility validation rejected the candidate','Previous visible generation left intact'];
      log(state,action.type,{scenario:action.scenario},'Rejected: schema v99 is incompatible with demo state v1. Nothing activated.');
    }
  }
  return state;
}

export const commands: {label:string;description:string;action:Action}[]=[
  {label:'Open editor',description:'window.open · editor',action:{type:'window.open',app:'editor'}},
  {label:'Open files',description:'window.open · files',action:{type:'window.open',app:'files'}},
  {label:'Open appearance',description:'window.open · settings',action:{type:'window.open',app:'settings'}},
  {label:'Open action inspector',description:'window.open · inspector',action:{type:'window.open',app:'inspector'}},
  {label:'Apply midnight appearance',description:'appearance.apply · midnight',action:{type:'appearance.apply',theme:'midnight'}},
  {label:'Apply dusk appearance',description:'appearance.apply · dusk',action:{type:'appearance.apply',theme:'dusk'}},
  {label:'Apply copper appearance',description:'appearance.apply · copper',action:{type:'appearance.apply',theme:'copper'}},
  {label:'Simulate appearance update',description:'update.simulate · appearance',action:{type:'update.simulate',scenario:'appearance'}},
  {label:'Simulate app behavior update',description:'update.simulate · behavior',action:{type:'update.simulate',scenario:'behavior'}},
  {label:'Simulate incompatible update',description:'update.simulate · rejection',action:{type:'update.simulate',scenario:'rejection'}},
  {label:'Position editor left',description:'window.position · editor, left',action:{type:'window.position',app:'editor',position:'left'}},
  {label:'Position editor center',description:'window.position · editor, center',action:{type:'window.position',app:'editor',position:'center'}},
  {label:'Position editor right',description:'window.position · editor, right',action:{type:'window.position',app:'editor',position:'right'}},
  {label:'Reset workspace',description:'workspace.reset · discards edits',action:{type:'workspace.reset'}},
];
