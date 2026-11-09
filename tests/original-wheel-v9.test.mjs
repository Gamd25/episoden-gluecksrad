import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ORIGINAL_WHEEL_SETTINGS as s,easeOutCubic,chooseVisualTurns,planStoredLanding} from '../web/wheel-motion.js';
const app=readFileSync(new URL('../web/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
const snd=readFileSync(new URL('../web/wheel-audio.js',import.meta.url),'utf8');
const TAU=Math.PI*2;
const mod=(x)=>((x%TAU)+TAU)%TAU;
test('duration, cubic deceleration, original audio volume and 6-10 turns',()=>{
  assert.equal(s.durationMs,4300);assert.equal(s.minimumTurns,6);assert.equal(s.maximumTurns,10);assert.equal(s.audioVolume,0.85);
  assert.equal(easeOutCubic(0),0);assert.equal(easeOutCubic(1),1);assert.equal(easeOutCubic(0.5),0.875);
  assert.equal(chooseVisualTurns(()=>0),6);assert.equal(chooseVisualTurns(()=>0.1999),6);
  assert.equal(chooseVisualTurns(()=>0.2),7);assert.equal(chooseVisualTurns(()=>0.999999),10);
});
test('every permitted visual spin lands at the stored episode for all 1-30 episodes',()=>{
 for(let count=1;count<=30;count++)for(let index=0;index<count;index++)for(let turns=6;turns<=10;turns++)for(let initial of [0,Math.PI*3.7,2000.3,-6.8]){
   const plan=planStoredLanding({index,episodeCount:count,currentRotation:initial,turns});
   assert.ok(plan.target>plan.start);
   const distance=mod(plan.target+(index+0.5)*TAU/count);
   assert.ok(Math.min(distance,TAU-distance)<1e-9,`count=${count} index=${index} turns=${turns} distance=${distance}`);
 }
});
test('incomplete or arbitrary targets are rejected',()=>{
  const p={index:0,episodeCount:2,currentRotation:0,turns:6};
  for(const v of [{...p,index:2},{...p,index:-1},{...p,episodeCount:0},{...p,episodeCount:31},{...p,turns:5},{...p,turns:11},{...p,currentRotation:NaN}]) assert.throws(()=>planStoredLanding(v));
});
test('audio uses original sound filenames and stops at finish or session reset',()=>{
  assert.match(snd,/holz_ratsche\.wav/);assert.match(snd,/ding\.wav/);
  assert.match(snd,/gefuehle-rad\/assets\//);assert.match(snd,/rattle=sound\(originalAssets\.rattle,true\)/);
  assert.match(app,/originalWheelAudio\.startRattle\(\)/);
  assert.match(app,/originalWheelAudio\.finish\(duration>0\)/);
  assert.match(app,/function resetWheelSession\(\)\{\s*originalWheelAudio\.stop\(\)/);
});
test('no draw is called on wheel spin and original wheel code is versioned',()=>{
  const spin=app.slice(app.indexOf('function startWheel(index){'),app.lastIndexOf('setup();'));
  assert.match(spin,/planStoredLanding\(/);assert.match(spin,/chooseVisualTurns\(/);assert.match(spin,/easeOutCubic\(p\)/);
  assert.doesNotMatch(spin,/sparkFinalize|balancedDraw|runTransaction|setDoc\(/);
  assert.match(html,/app\.js\?v=12-20261109/);
  assert.match(app,/BUILD_VERSION = 'v12'/);
  assert.match(rules,/match \/sharedRounds\/\{rid\}/);
});

test('browser audio integration and fallback from project assets to original-site WAV files',async()=>{
  const created=[];
  const prior=globalThis.Audio;
  globalThis.Audio=class {
    constructor(url){this.src=url;this.listeners={};this.plays=0;this.pauses=0;created.push(this);}
    addEventListener(event,listener){this.listeners[event]=listener;}
    load(){this.loaded=true;}
    play(){this.plays++;return Promise.resolve();}
    pause(){this.pauses++;}
  };
  try{
    const {createOriginalWheelAudio}=await import('../web/wheel-audio.js');
    const audio=createOriginalWheelAudio();
    audio.preload();
    assert.equal(created.length,2);
    assert.equal(created[0].src,'./assets/holz_ratsche.wav');
    assert.equal(created[1].src,'./assets/ding.wav');
    assert.equal(created[0].loop,true);
    assert.equal(created[1].loop,false);
    for(const el of created){assert.equal(el.volume,0.85);el.listeners.error();}
    assert.equal(created[0].src,'https://gamd25.github.io/gefuehle-rad/assets/holz_ratsche.wav');
    assert.equal(created[1].src,'https://gamd25.github.io/gefuehle-rad/assets/ding.wav');
    audio.startRattle();assert.equal(created[0].plays,1);
    audio.finish(true);assert.equal(created[1].plays,1);assert.ok(created[0].pauses>=1);
    audio.stop();assert.ok(created[0].pauses>=2);
  }finally{if(prior===undefined)delete globalThis.Audio;else globalThis.Audio=prior;}
});
