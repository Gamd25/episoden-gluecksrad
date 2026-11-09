import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../web/app.js', import.meta.url),'utf8');
const html=readFileSync(new URL('../web/index.html', import.meta.url),'utf8');
test('published episode is restored from Firestore result for the current uid',()=>{
  assert.match(app,/onSnapshot\(doc\(db,'sharedRounds',subscribedRound,'results',subscribedUid\)/u);
  assert.match(app,/resolveStoredAssignment\(snap\.data\(\),wheelEpisodes,subscribedUid\)/u);
  assert.match(app,/\$\('episodeName'\)\.textContent=assignment\.label/u);
});
test('result appears independently of wheel animation',()=>{
  const subscribe=app.slice(app.indexOf('function subscribeResult()'),app.indexOf('function renderWheel('));
  assert.match(subscribe,/show\('myEpisode'\)/u);
  const start=app.slice(app.indexOf('function startWheel('));
  assert.doesNotMatch(start,/hide\('myEpisode'\)/u);
  assert.match(start,/localStorage\.setItem\(key,'1'\)/u);
});
test('episode list defaults to actual separate lines, not literal backslash n',()=>{
  assert.ok(html.includes(['>Episode 1','Episode 2','Episode 3','Episode 4','Episode 5</textarea>'].join('\n')));
});
test('persistent episode is located below wheel in the student result area',()=>{
  const wheel=html.indexOf('<canvas id="wheel"'),result=html.indexOf('id="myEpisode"'),close=html.indexOf('id="studentError"');
  assert.ok(wheel>0 && result>wheel && close>result);
});
