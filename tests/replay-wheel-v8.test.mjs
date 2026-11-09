import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canSpinStoredWheel } from '../web/wheel-spin-guard.js';
import { resolveStoredAssignment } from '../web/episode-result.js';
const app = readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
const html = readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const rules = readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
const episodes = [{id:'a',label:'Episode A'},{id:'b',label:'Episode B'}];
const result = {authUid:'U1',episodeId:'b'};
const resolved=resolveStoredAssignment(result,episodes,'U1');
const target = {roundId:'R1',uid:'U1',index:resolved.index,episodeId:resolved.episodeId};
const ctx = {published:true,target,uid:'U1',roundId:'R1',spinning:false,episodes};
test('spin is enabled only for a published, already stored result',()=>{
  assert.equal(canSpinStoredWheel(ctx),true);
  assert.equal(canSpinStoredWheel({...ctx,published:false}),false);
  assert.equal(canSpinStoredWheel({...ctx,target:null}),false);
  assert.equal(canSpinStoredWheel({...ctx,spinning:true}),false);
});
test('neither another user, another round nor an altered target is accepted',()=>{
  assert.equal(canSpinStoredWheel({...ctx,uid:'U2'}),false);
  assert.equal(canSpinStoredWheel({...ctx,roundId:'R2'}),false);
  assert.equal(canSpinStoredWheel({...ctx,target:{...target,index:0}}),false);
  assert.equal(canSpinStoredWheel({...ctx,target:{...target,episodeId:'fake'}}),false);
  assert.equal(canSpinStoredWheel({...ctx,episodes:[]}),false);
});
test('the user explicitly triggers the spin, not the check-in or result subscription',()=>{
  assert.match(html, /id="spinWheelBtn"[^>]*disabled/);
  assert.match(app, /\$\('spinWheelBtn'\)\.addEventListener\('click',safeRun\('Rad drehen',spinWheelAgain\)\)/);
  const subscribe=app.slice(app.indexOf('function subscribeResult()'),app.indexOf('function resetWheelSession()'));
  assert.doesNotMatch(subscribe,/startWheel\(/);
  assert.match(subscribe,/resolveStoredAssignment\(/);
  const click=app.slice(app.indexOf('function spinWheelAgain()'),app.indexOf('function renderWheel('));
  assert.match(click,/canSpinStoredWheel\(/);
  assert.match(click,/startWheel\(spinTarget.index\)/);
});
test('repeat spinning is animated and does not change the Firestore assignment',()=>{
  const spin=app.slice(app.indexOf('function startWheel('),app.indexOf('setup();',app.indexOf('function startWheel(')));
  assert.match(spin,/const duration=window\.matchMedia\(/);
  assert.doesNotMatch(spin,/\|\|already/);
  assert.doesNotMatch(spin,/runTransaction|updateDoc|setDoc|balancedDraw|randomIndex/);
  assert.match(spin,/button\.textContent='Noch einmal drehen'/);
  assert.match(app,/\$\('episodeName'\)\.textContent=assignment\.label/);
});
test('no premature spin control; clear state after new session',()=>{
  assert.match(app,/function resetWheelSession\(\)\{/);
  assert.match(app,/hide\('spinWheelBtn'\)/);
  assert.match(app,/if\(data.state==='published'\)\{wheelReleased=true/);
  assert.match(app,/else \{wheelReleased=false;spinTarget=null/);
  assert.match(html,/id="studentResult" class="hidden"/);
  assert.match(html,/v=11-20261109/);
  assert.match(app,/BUILD_VERSION = 'v11'/);
});
test('firestore authorization rules are unchanged',()=>{
  assert.match(rules,/match \/sharedRounds\/\{rid\}/);
  assert.match(rules,/get\(gatePath\(rid\)\)\.data\.state == 'published'/);
});
