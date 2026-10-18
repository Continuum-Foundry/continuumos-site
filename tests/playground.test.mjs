import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, dispatch, documents, commands, wordCount } from '../src/lib/playground-model.ts';

function editedState(){
  let state=createState();
  state=dispatch(state,{type:'document.edit',text:'Unsaved work <script>plain text</script> 🙂',selection:{start:2,end:12,direction:'backward'}});
  state=dispatch(state,{type:'window.position',app:'editor',position:'right'});
  return state;
}
for(const scenario of ['appearance','behavior','rejection']){
  test(`${scenario} retains unsaved text, selection and window geometry`,()=>{
    let state=editedState();const before=structuredClone(state);state=dispatch(state,{type:'update.simulate',scenario});
    assert.equal(state.text,before.text);assert.deepEqual(state.selection,before.selection);assert.deepEqual(state.windows,before.windows);
    if(scenario==='appearance'){assert.notEqual(state.theme,before.theme);assert.equal(state.generation,before.generation);}
    if(scenario==='behavior'){assert.equal(state.generation,before.generation+1);assert.equal(state.wordCountEnabled,true);assert.equal(wordCount(state.text),5);}
    if(scenario==='rejection'){assert.equal(state.generation,before.generation);assert.equal(state.theme,before.theme);assert.equal(state.wordCountEnabled,before.wordCountEnabled);assert.match(state.events.at(-1).result,/Rejected: schema/);}
  });
}
test('minimize, open and maximize retain document state and restore geometry',()=>{
  let state=editedState();const before=structuredClone(state.windows.editor);const text=state.text;
  state=dispatch(state,{type:'window.minimize',app:'editor'});assert.equal(state.windows.editor.minimized,true);
  state=dispatch(state,{type:'window.open',app:'editor'});assert.equal(state.windows.editor.minimized,false);assert.equal(state.active,'editor');
  state=dispatch(state,{type:'window.maximize',app:'editor'});assert.equal(state.windows.editor.maximized,true);
  state=dispatch(state,{type:'window.maximize',app:'editor'});assert.deepEqual(state.windows.editor,before);assert.equal(state.text,text);
});
test('only bundled files open; reset discards edits and restores baseline',()=>{
  let state=editedState();state=dispatch(state,{type:'document.open',file:'Next steps.md'});assert.equal(state.text,documents['Next steps.md']);
  state=dispatch(state,{type:'document.open',file:'../../secret'});assert.equal(state.file,'Next steps.md');
  state=dispatch(state,{type:'workspace.reset'});assert.deepEqual(state,createState());
});
test('palette and controls use the same reducer; event history stays bounded',()=>{
  let state=editedState();const copper=commands.find(command=>command.label==='Apply copper appearance');
  state=dispatch(state,copper.action);assert.equal(state.theme,'copper');assert.equal(state.events.at(-1).action,'appearance.apply');
  for(let i=0;i<100;i++)state=dispatch(state,{type:'update.simulate',scenario:'behavior'});
  assert.equal(state.events.length,24);assert.equal(state.generation,101);assert.equal(new Set(state.order).size,4);
});
test('selections clamp to text boundaries and empty documents count zero words',()=>{
  let state=createState();state=dispatch(state,{type:'document.edit',text:'abc',selection:{start:-2,end:100,direction:'forward'}});
  assert.deepEqual(state.selection,{start:0,end:3,direction:'forward'});assert.equal(wordCount(' \n '),0);
});
