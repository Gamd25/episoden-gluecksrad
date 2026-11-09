import { test } from 'node:test';
import assert from 'node:assert/strict';
import {resolveStoredAssignment,visitedWheelKey} from '../web/episode-result.js';
const episodes=[{id:'a',label:'Frieden'},{id:'b',label:'Gemeinschaft'}];
const result={authUid:'sid-1',episodeId:'b',episodeLabel:'Veralteter Wert'};
test('a previously published result is resolved from persistent server result and published episode list',()=>{
  assert.deepEqual(resolveStoredAssignment(result,episodes,'sid-1'),{index:1,episodeId:'b',label:'Gemeinschaft'});
});
test('a result belonging to another anonymous account is rejected',()=>{
  assert.throws(()=>resolveStoredAssignment(result,episodes,'sid-2'),/Anmeldung/);
});
test('a tampered or missing episode ID cannot be silently assigned',()=>{
  assert.throws(()=>resolveStoredAssignment({...result,episodeId:'missing'},episodes,'sid-1'),/Radliste/);
});
test('missing unpublished episode list cannot reveal a result',()=>{
  assert.throws(()=>resolveStoredAssignment(result,[],'sid-1'),/veröffentlichten/);
});
test('storage key isolates rounds and anonymous users; it is not an assignment',()=>{
  assert.notEqual(visitedWheelKey('r1','u1'),visitedWheelKey('r2','u1'));
  assert.notEqual(visitedWheelKey('r1','u1'),visitedWheelKey('r1','u2'));
});
