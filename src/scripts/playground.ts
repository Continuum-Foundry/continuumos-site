import { createState, dispatch, commands, wordCount, type AppId, type Action, type Theme, type Position, type Scenario, type Selection } from '../lib/playground-model';

const root=document.querySelector<HTMLElement>('#playground');
if(root){
  let state=createState();
  const get=<T extends HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
  const editor=get<HTMLTextAreaElement>('#demo-editor');
  const workspace=get<HTMLElement>('#desktop-workspace');
  const palette=get<HTMLDialogElement>('#command-palette');
  const search=get<HTMLInputElement>('#command-search');
  const launcher=get<HTMLElement>('#launcher');
  const mobile=window.matchMedia('(max-width: 800px)');
  const names:Record<AppId,string>={editor:'Editor',files:'Files',settings:'Appearance',inspector:'Inspector'};
  const windows=[...root.querySelectorAll<HTMLElement>('[data-window]')];
  let logLength=-1;
  let lastEvent=state.events.at(-1);
  let lastStages: string[] | null=null;

  function selection():Selection{return {start:editor.selectionStart,end:editor.selectionEnd,direction:editor.selectionDirection};}
  function rememberSelection(){state=dispatch(state,{type:'document.select',selection:selection()});renderEditorStatus();}
  function renderEditorStatus(){
    const selected=state.selection.end-state.selection.start;
    get('#selection-label').textContent=selected?`${selected} characters selected`:'No selection';
    const count=get('#word-count');count.hidden=!state.wordCountEnabled;count.textContent=`${wordCount(state.text)} words`;
  }
  function render(){
    root!.dataset.theme=state.theme;
    root!.dataset.mobile=String(mobile.matches);
    if(editor.value!==state.text)editor.value=state.text;
    get('#editor-file-name').textContent=state.file;
    get('#editor-generation').textContent=String(state.generation);
    get('#theme-label').textContent=state.theme[0].toUpperCase()+state.theme.slice(1);
    get('#active-app-label').textContent=names[state.active];
    windows.forEach(element=>{
      const id=element.dataset.window as AppId;const windowState=state.windows[id];
      element.hidden=!windowState.open||windowState.minimized||(mobile.matches&&state.active!==id);
      element.classList.toggle('is-active',state.active===id);
      element.classList.toggle('is-maximized',windowState.maximized);
      element.style.zIndex=String(10+state.order.indexOf(id));
      element.style.left=`${windowState.x}%`;element.style.top=`${windowState.y}px`;
      const maximize=element.querySelector<HTMLButtonElement>('[data-maximize]')!;
      maximize.setAttribute('aria-label',`${windowState.maximized?'Restore':'Maximize'} ${names[id]}`);
      maximize.setAttribute('aria-pressed',String(windowState.maximized));
    });
    root!.querySelectorAll<HTMLButtonElement>('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===state.theme)));
    root!.querySelectorAll<HTMLElement>('[data-dock-indicator]').forEach(dot=>{
      const windowState=state.windows[dot.dataset.dockIndicator as AppId];dot.hidden=!windowState.open||windowState.minimized;
    });
    renderEditorStatus();
    if(logLength!==state.events.length||lastEvent!==state.events.at(-1)){
      const list=get<HTMLOListElement>('#action-log');list.replaceChildren();
      [...state.events].reverse().forEach(event=>{
        const li=document.createElement('li');const code=document.createElement('code');code.textContent=event.action;
        const args=document.createElement('small');args.textContent=event.arguments;
        const result=document.createElement('p');result.textContent=event.result;li.append(code,args,result);list.append(li);
      });logLength=state.events.length;lastEvent=state.events.at(-1);
    }
    if(state.scenario&&lastStages!==state.stages){
      const stages=get<HTMLOListElement>('#simulation-stages');stages.replaceChildren();
      state.stages.forEach((stage,i)=>{const li=document.createElement('li');const number=document.createElement('span');number.textContent=`0${i+1}`;li.append(number,document.createTextNode(stage));stages.append(li);});
      get('#simulation-title').textContent=state.scenario==='rejection'?'Rejected before activation.':state.scenario==='behavior'?'A new simulated editor generation.':'A new appearance. The same state.';
    }else if(!state.scenario&&lastStages!==state.stages){
      get('#simulation-title').textContent='A handover, step by step.';
      const li=document.createElement('li');li.textContent='Choose a scenario to inspect its illustrative events.';get('#simulation-stages').replaceChildren(li);
    }
    lastStages=state.stages;
  }
  function send(action:Action){
    const restoreSelection=action.type==='appearance.apply'||action.type==='update.simulate';
    state=dispatch(state,action);
    render();
    if(action.type==='window.minimize'){
      const next=windows.find(element=>!element.hidden&&element.dataset.window===state.active);
      const target=next?.querySelector<HTMLElement>('textarea,button,select')??root!.querySelector<HTMLButtonElement>('[data-open="editor"]');
      target?.focus({preventScroll:true});
    }
    if(action.type==='document.open')editor.focus({preventScroll:true});
    if(restoreSelection){
      editor.setSelectionRange(state.selection.start,state.selection.end,state.selection.direction);
      if(state.windows.editor.open&&!state.windows.editor.minimized&&(!mobile.matches||state.active==='editor'))editor.focus({preventScroll:true});
    }
    if(action.type==='workspace.reset'){
      editor.setSelectionRange(0,0);get<HTMLSelectElement>('#editor-position').value='';
      get('#demo-status').textContent='Workspace reset. In-memory edits discarded. All events are simulated.';
    }else if(action.type!=='window.focus'&&action.type!=='window.move'&&action.type!=='document.select'&&action.type!=='document.edit'){
      get('#demo-status').textContent=state.events.at(-1)?.result??'Ready.';
    }
  }
  function closeLauncher(){launcher.hidden=true;root!.querySelector('[data-launcher]')?.setAttribute('aria-expanded','false');}
  function runCommand(index:number){const command=commands[index];if(!command)return;palette.close();send(command.action);}
  function renderCommands(){
    const results=get('#command-results');results.replaceChildren();const query=search.value.trim().toLowerCase();
    commands.forEach((command,index)=>{
      if(!`${command.label} ${command.description}`.toLowerCase().includes(query))return;
      const button=document.createElement('button');button.type='button';button.dataset.command=String(index);
      const name=document.createElement('span');name.textContent=command.label;const detail=document.createElement('small');detail.textContent=command.description;
      button.append(name,detail);button.addEventListener('click',()=>runCommand(index));results.append(button);
    });
    if(!results.childElementCount){const empty=document.createElement('p');empty.textContent='No matching demo action.';empty.className='palette-empty';results.append(empty);}
  }
  function openPalette(){closeLauncher();search.value='';renderCommands();palette.showModal();search.focus();}
  root.addEventListener('click',event=>{
    const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button)return;
    if(button.dataset.open){send({type:'window.open',app:button.dataset.open as AppId});closeLauncher();}
    else if(button.dataset.minimize)send({type:'window.minimize',app:button.dataset.minimize as AppId});
    else if(button.dataset.maximize)send({type:'window.maximize',app:button.dataset.maximize as AppId});
    else if(button.dataset.file)send({type:'document.open',file:button.dataset.file});
    else if(button.dataset.themeChoice)send({type:'appearance.apply',theme:button.dataset.themeChoice as Theme});
    else if(button.hasAttribute('data-palette-open'))openPalette();
    else if(button.hasAttribute('data-launcher')){launcher.hidden=!launcher.hidden;button.setAttribute('aria-expanded',String(!launcher.hidden));if(!launcher.hidden)launcher.querySelector('button')?.focus();}
  });
  document.querySelectorAll<HTMLButtonElement>('[data-reset]').forEach(button=>button.addEventListener('click',()=>{send({type:'workspace.reset'});closeLauncher();}));
  document.querySelectorAll<HTMLButtonElement>('[data-scenario]').forEach(button=>button.addEventListener('click',()=>send({type:'update.simulate',scenario:button.dataset.scenario as Scenario})));
  get<HTMLSelectElement>('#editor-position').addEventListener('change',event=>{const select=event.target as HTMLSelectElement;if(select.value)send({type:'window.position',app:'editor',position:select.value as Position});});
  editor.addEventListener('input',()=>{state=dispatch(state,{type:'document.edit',text:editor.value,selection:selection()});renderEditorStatus();});
  editor.addEventListener('select',rememberSelection);editor.addEventListener('keyup',rememberSelection);editor.addEventListener('pointerup',rememberSelection);editor.addEventListener('blur',rememberSelection);
  windows.forEach(element=>element.addEventListener('pointerdown',()=>{state=dispatch(state,{type:'window.focus',app:element.dataset.window as AppId});render();}));
  windows.forEach(element=>element.addEventListener('focusin',()=>{const app=element.dataset.window as AppId;if(state.active!==app){state=dispatch(state,{type:'window.focus',app});render();}}));
  root.querySelectorAll<HTMLElement>('[data-drag]').forEach(bar=>{
    let dragging:{id:number;startX:number;startY:number;x:number;y:number}|null=null;
    const app=bar.dataset.drag as AppId;
    bar.addEventListener('pointerdown',event=>{
      if(mobile.matches||state.windows[app].maximized||(event.target as HTMLElement).closest('button'))return;
      dragging={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:state.windows[app].x,y:state.windows[app].y};
      bar.setPointerCapture(event.pointerId);event.preventDefault();
    });
    bar.addEventListener('pointermove',event=>{
      if(!dragging)return;const element=bar.parentElement!;
      const maxX=Math.max(0,(workspace.clientWidth-element.offsetWidth)/workspace.clientWidth*100);
      const maxY=Math.max(48,workspace.clientHeight-element.offsetHeight-75);
      const x=Math.max(0,Math.min(maxX,dragging.x+(event.clientX-dragging.startX)/workspace.clientWidth*100));
      const y=Math.max(48,Math.min(maxY,dragging.y+event.clientY-dragging.startY));
      send({type:'window.move',app,x,y});
    });
    function release(){dragging=null;}
    bar.addEventListener('pointerup',release);bar.addEventListener('pointercancel',release);bar.addEventListener('lostpointercapture',release);
  });
  search.addEventListener('input',renderCommands);
  palette.addEventListener('keydown',event=>{
    const buttons=[...palette.querySelectorAll<HTMLButtonElement>('[data-command]')];
    const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(!buttons.length)return;const next=event.key==='ArrowDown'?(index+1)%buttons.length:(index<=0?buttons.length-1:index-1);buttons[next]?.focus();
    }else if(event.key==='Enter'&&document.activeElement===search){event.preventDefault();const first=buttons[0];if(first)runCommand(Number(first.dataset.command));}
  });
  get('#palette-close').addEventListener('click',()=>palette.close());
  palette.addEventListener('click',event=>{if(event.target===palette){const rect=palette.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)palette.close();}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!launcher.hidden){closeLauncher();root!.querySelector<HTMLButtonElement>('[data-launcher]')?.focus({preventScroll:true});}});
  document.addEventListener('click',event=>{const target=event.target as HTMLElement;if(!launcher.hidden&&!launcher.contains(target)&&!target.closest('[data-launcher]'))closeLauncher();});
  mobile.addEventListener('change',render);
  render();
}
