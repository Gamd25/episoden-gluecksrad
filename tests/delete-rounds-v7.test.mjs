import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../web/style.css',import.meta.url),'utf8');
const backend=readFileSync(new URL('../web/shared-backend.js',import.meta.url),'utf8');
test('Rundenübersicht: eigener Löschknopf ohne verschachtelte Schaltflächen',()=>{
 assert.match(app,/const row=makeElement\('div','round-row'\)/);
 assert.match(app,/const remove=makeElement\('button','round-delete'/);
 assert.match(app,/row\.append\(b,remove\)/);
 assert.match(css,/\.round-delete/);
});
test('Löschknopf verwechselt nicht das aktive Rundenziel',()=>{
 assert.match(app,/deleteRoundById\(round\.id,round\.title\)/);
 assert.match(app,/const round=teacherRounds\.find\(r=>r\.id===roundId\)/);
 assert.match(app,/if\(currentRoundId===roundId\)/);
 assert.match(app,/if\(typed!=='LÖSCHEN'\)return/);
 assert.match(app,/deletingRoundIds\.has\(roundId\)/);
});
test('Löschen liest nur erlaubte Listen und feste Einzel-Dokumente vom Server',()=>{
 assert.match(backend,/getDocsFromServer\(collection\(db,'sharedRounds',rid,name\)\)/);
 assert.match(backend,/\['results','presence','authorized','names'\]/);
 assert.match(backend,/\[\['view','state'\],\['gate','status'\]\]/);
 assert.match(backend,/await getDocFromServer\(ref\)/);
 assert.match(backend,/if\(snap\.exists\(\)\)await deleteDoc\(ref\)/);
 assert.doesNotMatch(backend,/\['results','presence','authorized','names','view','gate'\]/);
 assert.match(backend,/await batch\.commit\(\)/);
 assert.match(backend,/await deleteDoc\(root\(db,rid\)\)/);
});
test('Nach dem Löschen keine pauschalen Änderungen an anderen Runden',()=>{
 assert.match(app,/if\(currentRoundId===roundId\)\{/);
 assert.match(app,/toast\(`Runde „\$\{title\}“ wurde gelöscht\.`/);
});
test('Gute Versionsdiagnose im HTML und tatsächlich geladenem JS',()=>{
 assert.match(html,/id="buildBadge"/);
 assert.match(app,/BUILD_VERSION = 'v8'/);
 assert.match(app,/buildBadge\.textContent=BUILD_VERSION/);
 assert.match(html,/app\.js\?v=8-20261109/);
});
test('Alte fehlerhafte Check-in-Meldung kann v7-Code nicht erzeugen',()=>{
 assert.doesNotMatch(app,/Dein Check-in wurde von der Lehrperson entfernt/);
 assert.match(app,/Dein Check-in wurde übernommen/);
});

test('Löschen bleibt ohne Firestore-Regeländerung und neu geladenem Backend möglich',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
 assert.match(rules,/match \/view\/\{id\}/);
 assert.match(rules,/match \/gate\/\{id\}/);
 assert.match(rules,/allow list: if false/);
 assert.match(app,/shared-backend\.js\?v=8-20261109/);
 assert.match(html,/v7 · JS geladen|Lädt v8/);
});
