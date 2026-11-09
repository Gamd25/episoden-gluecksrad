import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
function section(start,end){return app.slice(app.indexOf(start),app.indexOf(end,app.indexOf(start)+start.length));}
const subscribe=section('function subscribeResult()','function resetWheelSession()');
const reset=section('function resetWheelSession()','function spinWheelAgain()');
const spin=app.slice(app.indexOf('function startWheel(index)'),app.lastIndexOf('setup();'));
const finish=spin.slice(spin.indexOf('function finish()'),spin.indexOf('if(!duration){finish()'));
test('the complete episode card is initially invisible in HTML',()=>{
  assert.match(html, /id="myEpisode" class="result-box hidden"/);
});
test('loading or refreshing an already published Firebase result does not reveal the episode',()=>{
  assert.doesNotMatch(subscribe,/show\('myEpisode'\)/);
  assert.match(subscribe,/if\(shownAssignment===assignmentKey\)return;/);
  assert.match(subscribe,/hide\('myEpisode'\);/);
  assert.match(subscribe,/resolveStoredAssignment\(snap\.data\(\),wheelEpisodes,subscribedUid\)/);
});
test('clicking spin hides card and starts the pre-assigned animation',()=>{
  assert.match(spin,/hide\('myEpisode'\);/);
  assert.match(spin,/planStoredLanding\(/);
  assert.match(spin,/chooseVisualTurns\(/);
  assert.doesNotMatch(spin,/runTransaction|balancedDraw|setDoc\(/);
});
test('after animation finish only, with current assigned identity, the card is shown',()=>{
  assert.match(finish,/wheelReleased && studentIdentity && user\?\.uid===spinTarget\?\.uid/);
  assert.match(finish,/studentRoundId===spinTarget.roundId && shownAssignment===visibleAssignment/);
  assert.match(finish,/show\('myEpisode'\)/);
  assert.match(spin,/if\(!duration\)\{finish\(\);return;\}/);
  assert.match(spin,/if\(p<1\)requestAnimationFrame\(frame\);else finish\(\)/);
});
test('new participation or returning browser session starts without a visible result',()=>{
  assert.match(reset,/hide\('myEpisode'\)/);
  assert.match(reset,/\$\('episodeName'\)\.textContent='';/);
  assert.match(app,/else \{wheelReleased=false;spinTarget=null;hide\('myEpisode'\)/);
});
test('v12 marker and no misleading automatic reveal on reopening',()=>{
  assert.match(app,/BUILD_VERSION = 'v12'/);
  assert.match(html,/app\.js\?v=12-20261109/);
  assert.doesNotMatch(html,/erscheint beim erneuten Öffnen/);
});
