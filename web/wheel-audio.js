import { ORIGINAL_WHEEL_SETTINGS } from './wheel-motion.js?v=9-20261109';

// Prefer the user's exact original sound files in this project's assets folder.
// When not yet copied, use the existing Gefühls-Rad's GitHub-Pages assets.
// No synthesized sound is presented as the original recording.
const originalAssets = Object.freeze({
  rattle: 'holz_ratsche.wav',
  ding: 'ding.wav'
});
const originalSite = 'https://gamd25.github.io/gefuehle-rad/assets/';
function sound(filename,loop){
  const element=new Audio(`./assets/${filename}`);
  element.preload='auto'; element.loop=loop;
  element.volume=ORIGINAL_WHEEL_SETTINGS.audioVolume;
  let fallback=false;
  element.addEventListener('error',()=>{
    if(fallback)return;
    fallback=true;
    element.src=originalSite+filename;
    element.load();
  });
  return element;
}
function safePlay(element){
  try{const promise=element.play();promise?.catch(()=>{});}catch{ /* Tonoptionen des Browsers respektieren. */ }
}
export function createOriginalWheelAudio(){
  // Lazy construction is important for module checks without browser APIs.
  let rattle, ding;
  function ready(){
    if(!rattle){rattle=sound(originalAssets.rattle,true);ding=sound(originalAssets.ding,false);}
  }
  function stopElement(el){if(!el)return;try{el.pause();el.currentTime=0;}catch{}}
  return {
    preload(){ready();try{rattle.load();ding.load();}catch{}},
    startRattle(){ready();stopElement(ding);stopElement(rattle);safePlay(rattle);},
    pauseRattle(){if(rattle){try{rattle.pause();}catch{}}},
    finish(playDing){stopElement(rattle);if(playDing){ready();stopElement(ding);safePlay(ding);}},
    stop(){stopElement(rattle);stopElement(ding);}
  };
}
