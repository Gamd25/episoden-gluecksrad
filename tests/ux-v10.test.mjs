import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
const before=readFileSync(new URL('../web/wheel-motion.js',import.meta.url),'utf8');
const deleteCode=app.slice(app.indexOf('async function deleteRoundById('),app.indexOf('async function finalizeRound()'));
const subscribe=app.slice(app.indexOf('function subscribeResult()'),app.indexOf('function resetWheelSession()'));
const spin=app.slice(app.indexOf('function startWheel(index)'),app.lastIndexOf('setup();'));
test('exact unwanted status messages are absent and no wording replaces them',()=>{
  assert.doesNotMatch(app,/Deine Episode steht fest\. Drücke „Rad drehen“ für die Animation\./);
  assert.doesNotMatch(app,/Das Rad zeigt wieder deine gespeicherte Episode\./);
  assert.match(subscribe,/hide\('spinningLabel'\)/);
  assert.match(spin,/hide\('spinningLabel'\)/);
  assert.match(html,/id="spinningLabel" class="spinning-label hidden"/);
});
test('delete uses one yes/no confirmation without typed word, login still required',()=>{
  assert.match(deleteCode,/const approved=confirm\(`/);
  assert.match(deleteCode,/if\(!approved\)return/);
  assert.doesNotMatch(deleteCode,/prompt\(|typed|Gib exakt LÖSCHEN ein/);
  assert.match(deleteCode,/!isGoogleUser\(\)/);
  assert.match(deleteCode,/const round=teacherRounds.find\(r=>r.id===roundId\)/);
  assert.match(deleteCode,/await call\('deleteRound',\{roundId\}\)/);
});
test('no change to Firestore protection or re-randomization while spinning',()=>{
  assert.match(rules,/match \/sharedRounds\/\{rid\}/);
  assert.match(spin,/planStoredLanding\(/);
  assert.doesNotMatch(spin,/sparkFinalize|balancedDraw|runTransaction|setDoc\(/);
  assert.match(before,/4300/);
});
test('fresh deploy has unmistakable version marker',()=>{
  assert.match(app,/BUILD_VERSION = 'v12'/);
  assert.match(html,/Lädt v12/);
  assert.match(html,/app\.js\?v=12-20261109/);
});
