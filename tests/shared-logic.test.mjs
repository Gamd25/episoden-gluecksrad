import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeName,cleanEpisodes} from '../web/shared-logic.js';

test('same human-entered name has one canonical key, regardless of case and repeated spaces',()=>{
  const samples=['  ANNA  Muster  ', 'Anna Muster','anna muster',' ANNA Muster '];
  assert.equal(new Set(samples.map(x=>normalizeName(x).nameKey)).size,1);
});
test('names with special characters and diacritics are preserved visibly',()=>{
  assert.deepEqual(normalizeName('  Durmuş   Gamsız '),{name:'Durmuş Gamsız',nameKey:'durmuş gamsız'});
  assert.equal(normalizeName('Özlem Şahin').nameKey,'özlem şahin');
});
test('reject invalid and unsafe names',()=>{
  for(const s of ['','A','a/b','../x','Name\nInjected','X'.repeat(61),'..','a\\b','<X>\tY']){
    assert.throws(()=>normalizeName(s),s);
  }
});
test('valid variable episode count and strict names',()=>{
  assert.equal(cleanEpisodes(['Folge A','Folge B']).length,2);
  assert.equal(cleanEpisodes(Array.from({length:30},(_,i)=>`Episode ${i}`)).length,30);
  assert.throws(()=>cleanEpisodes([]));
  assert.throws(()=>cleanEpisodes(Array(31).fill('x')));
  assert.throws(()=>cleanEpisodes(['Eins','eins']));
});
