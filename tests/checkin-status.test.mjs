import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createMembershipWitness} from '../web/checkin-status.js';

const app=readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');

test('newly committed check-in: first server-side empty event is not mistaken for a removal',()=>{
 const witness=createMembershipWitness();
 assert.equal(witness.observe({exists:false,fromCache:true}),'ignore-cache');
 assert.equal(witness.observe({exists:false,fromCache:false}),'await-confirmation');
 assert.equal(witness.hasServerWitness(),false);
});

test('cache hit alone cannot confirm an earlier live membership',()=>{
 const witness=createMembershipWitness();
 assert.equal(witness.observe({exists:true,fromCache:true}),'present');
 assert.equal(witness.observe({exists:false,fromCache:false}),'await-confirmation');
});

test('after server-confirmed member, missing cache is ignored and missing server requires independent verification',()=>{
 const witness=createMembershipWitness();
 assert.equal(witness.observe({exists:true,fromCache:false}),'present');
 assert.equal(witness.hasServerWitness(),true);
 assert.equal(witness.observe({exists:false,fromCache:true}),'ignore-cache');
 assert.equal(witness.observe({exists:false,fromCache:false}),'verify-absence');
});

test('already server-verified member on page reload can trigger verification when server says missing',()=>{
 const witness=createMembershipWitness({alreadyVerified:true});
 assert.equal(witness.observe({exists:false,fromCache:false}),'verify-absence');
});

test('web app uses status witness and two independent checks, with neutral message after confirmed absence',()=>{
 assert.match(app,/createMembershipWitness\(\{alreadyVerified\}\)/);
 assert.match(app,/observation!=='verify-absence'/);
 assert.match(app,/getDocFromServer\(authRef\)/);
 assert.match(app,/const secondCheck=await getDocFromServer\(authRef\)/);
 assert.doesNotMatch(app,/Dein Check-in wurde von der Lehrperson entfernt/);
 assert.match(app,/Dein Check-in wurde übernommen\. Warte auf den Abschluss/);
});

test('deployment has visible v9 marker and version-busted app requests',()=>{
 assert.match(html,/id="buildBadge" class="build-version"[^>]*>Lädt v12/);
 assert.match(html,/src="\.\/app\.js\?v=12-20261109"/);
 assert.match(html,/href="\.\/style\.css\?v=8-20261109"/);
});
