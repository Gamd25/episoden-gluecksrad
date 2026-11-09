import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
test('no supplemental explanation near the student wheel spin button',()=>{
  const result=html.split('<div id="studentResult" class="hidden">')[1].split('</div>\n          <div id="studentError"')[0];
  assert.doesNotMatch(result,/Du kannst nach der Freigabe wiederholt drehen/);
  assert.doesNotMatch(result,/Die zugeteilte Episode ändert sich dadurch nicht/);
  assert.doesNotMatch(result,/wheel-spin-hint/);
  assert.match(result,/<button id="spinWheelBtn"[^>]*>Rad drehen<\/button>/);
  assert.match(result,/id="myEpisode"/);
});
test('v11 runs new script and retains visible build identification',()=>{
  assert.match(app,/BUILD_VERSION = 'v12'/);
  assert.match(html,/Lädt v12/);
  assert.match(html,/app\.js\?v=12-20261109/);
});
