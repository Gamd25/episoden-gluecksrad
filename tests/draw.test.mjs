import {test} from 'node:test';
import assert from 'node:assert/strict';
import {balancedDraw,randomIndex} from '../web/draw-logic.js';
test('all checked-in persons assigned exactly once, groups differ by at most one',()=>{
 for(let members=1;members<=160;members++){
  for(let episodes=1;episodes<=30;episodes++){
   const people=Array.from({length:members},(_,i)=>({authUid:`uid-${i}`}));
   const groups=Array.from({length:episodes},(_,i)=>({id:`episode-${i}`}));
   const draw=balancedDraw(people,groups);
   assert.equal(draw.length,members);
   assert.equal(new Set(draw.map(x=>x.authUid)).size,members);
   const counts=groups.map(g=>draw.filter(x=>x.episode.id===g.id).length);
   assert.ok(Math.max(...counts)-Math.min(...counts)<=1);
  }
 }
});
test('random index range',()=>{for(let i=1;i<=100;i++){const v=randomIndex(i);assert.ok(Number.isInteger(v)&&v>=0&&v<i);}});
test('random draw changes the order across repetitions',()=>{
 const base=Array.from({length:20},(_,i)=>({authUid:String(i)})),episodes=[{id:'1'}];
 const outcomes=new Set(Array.from({length:8},()=>balancedDraw(base,episodes).map(x=>x.authUid).join(',')));
 assert.ok(outcomes.size>1);
});
test('invalid draw inputs fail closed',()=>{
 assert.throws(()=>balancedDraw([], [{id:'e'}]));
 assert.throws(()=>balancedDraw([{}], []));
});
