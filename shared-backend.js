// GitHub Pages + Cloud Firestore Spark. No Cloud Functions.
// A shared link is an invitation, NOT proof that the typed name belongs to its user.
import {
  collection, doc, getDoc, getDocs, getDocsFromServer, query, where, runTransaction,
  writeBatch, serverTimestamp, deleteDoc
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
import { balancedDraw } from './draw-logic.js';
import {normalizeName, cleanEpisodes} from './shared-logic.js';

const root = (db,rid) => doc(db,'sharedRounds',rid);
const part = (db,rid,type,id) => doc(db,'sharedRounds',rid,type,id);
const signed = (snap,uid) => {
  if(!snap.exists() || snap.data().ownerUid!==uid) throw new Error('Keine Berechtigung für diese Runde.');
  return snap.data();
};
const requireOpen = data => {
  if(data.state!=='checkin') throw new Error('Der Check-in ist geschlossen.');
};
export async function createRound(db,uid,{title,episodes}) {
  const label=String(title??'').trim();
  if(!label || label.length>100)throw new Error('Rundentitel: 1 bis 100 Zeichen erforderlich.');
  const names=cleanEpisodes(episodes);
  const rid=crypto.randomUUID();
  const ep=names.map(name=>({id:crypto.randomUUID(),label:name}));
  const batch=writeBatch(db);
  batch.set(root(db,rid),{ownerUid:uid,title:label,state:'checkin',episodes:ep,createdAt:serverTimestamp()});
  batch.set(part(db,rid,'gate','status'),{state:'checkin',title:label});
  batch.set(part(db,rid,'view','state'),{state:'checkin',title:label});
  await batch.commit();
  return {roundId:rid};
}
export async function checkIn(db,uid,rid,enteredName){
  const {name,nameKey}=normalizeName(enteredName);
  return runTransaction(db,async tx=>{
    const gate=await tx.get(part(db,rid,'gate','status'));
    if(!gate.exists())throw new Error('Runde nicht gefunden. Bitte den Klassenlink prüfen.');
    requireOpen(gate.data());
    const ownRef=part(db,rid,'authorized',uid), auth=await tx.get(ownRef);
    if(auth.exists())return {studentId:auth.data().studentId,name:auth.data().name,already:true};
    // No roster read: only a CREATE is permitted by the rules. Reusing the
    // same normalized name becomes an UPDATE and fails atomically.
    tx.set(part(db,rid,'names',nameKey),{name,nameKey,claimedUid:uid,checkedInAt:serverTimestamp()});
    tx.set(ownRef,{studentId:nameKey,name});
    tx.set(part(db,rid,'presence',uid),{studentId:nameKey,name,authUid:uid,checkedInAt:serverTimestamp()});
    return {studentId:nameKey,name,already:false};
  },{maxAttempts:5});
}
export async function changeEpisodes(db,uid,rid,names){
  const cleaned=cleanEpisodes(names);
  await runTransaction(db,async tx=>{
    const ref=root(db,rid),snap=await tx.get(ref), round=signed(snap,uid);
    requireOpen(round);
    tx.update(ref,{episodes:cleaned.map((label,i)=>({id:round.episodes[i]?.id||crypto.randomUUID(),label}))});
  });
}
export async function revokeCheckIn(db,uid,rid,studentId,authUid){
  await runTransaction(db,async tx=>{
    const refs=[root(db,rid),part(db,rid,'gate','status'),part(db,rid,'names',studentId),part(db,rid,'authorized',authUid),part(db,rid,'presence',authUid)];
    const [round,gate,name,auth,presence]=await Promise.all(refs.map(ref=>tx.get(ref)));
    signed(round,uid);
    if(!gate.exists())throw new Error('Check-in-Status fehlt.');
    requireOpen(gate.data());
    if(!name.exists()||!auth.exists()||!presence.exists()||name.data().claimedUid!==authUid||auth.data().studentId!==studentId||presence.data().studentId!==studentId)throw new Error('Eintrag wurde verändert. Ansicht neu öffnen.');
    refs.slice(2).forEach(ref=>tx.delete(ref));
  });
}
export async function finalizeRound(db,uid,rid){
  // Phase 1: atomic barrier. A check-in reads gate/status in its transaction;
  // changing it invalidates any simultaneous check-in transaction.
  await runTransaction(db,async tx=>{
    const roundRef=root(db,rid),gateRef=part(db,rid,'gate','status');
    const [roundSnap,gateSnap]=await Promise.all([tx.get(roundRef),tx.get(gateRef)]);
    const round=signed(roundSnap,uid);
    if(round.state==='published')return;
    if(round.state==='closing'&&gateSnap.data()?.state==='closing')return;
    requireOpen(round);
    if(gateSnap.data()?.state!=='checkin')throw new Error('Uneinheitlicher Status; nicht auslosen.');
    tx.update(roundRef,{state:'closing'});
    tx.update(gateRef,{state:'closing'});
    tx.update(part(db,rid,'view','state'),{state:'closing'});
  });

  // Phase 2: a stable query after the barrier, then atomic publication. The
  // teacher can safely retry after a network interruption in 'closing'.
  const peopleSnap=await getDocs(collection(db,'sharedRounds',rid,'presence'));
  const people=peopleSnap.docs.map(d=>({studentId:d.data().studentId,name:d.data().name,authUid:d.id}));
  if(!people.length)throw new Error('Keine Check-ins vorhanden. Die Runde ist geschlossen. Bitte eine neue Runde erstellen.');
  if(people.length>160)throw new Error('Mehr als 160 Check-ins; Auslosung nicht möglich. Einträge prüfen.');
  const unique=new Set(people.map(p=>p.studentId));
  if(unique.size!==people.length)throw new Error('Doppelte Namenskennungen in der Check-in-Liste.');
  return runTransaction(db,async tx=>{
    const roundRef=root(db,rid),gateRef=part(db,rid,'gate','status');
    const [roundSnap,gateSnap]=await Promise.all([tx.get(roundRef),tx.get(gateRef)]);
    const round=signed(roundSnap,uid);
    if(round.state==='published')return {alreadyPublished:true,count:round.publishedCount};
    if(round.state!=='closing'||gateSnap.data()?.state!=='closing')throw new Error('Runde ist nicht im abgeschlossenen Zustand.');
    const draw=balancedDraw(people,round.episodes);
    for(const p of draw)tx.set(part(db,rid,'results',p.authUid),{
      studentId:p.studentId,name:p.name,authUid:p.authUid,
      episodeId:p.episode.id,episodeLabel:p.episode.label
    });
    tx.update(roundRef,{state:'published',publishedAt:serverTimestamp(),publishedCount:draw.length});
    tx.update(gateRef,{state:'published'});
    tx.update(part(db,rid,'view','state'),{state:'published',episodes:round.episodes});
    return {alreadyPublished:false,count:draw.length};
  },{maxAttempts:5});
}
export async function deleteRound(db,uid,rid){
  // Prevent a simultaneous finalize/check-in before beginning partial deletion.
  await runTransaction(db,async tx=>{
    const roundRef=root(db,rid),gateRef=part(db,rid,'gate','status');
    const [round,gate]=await Promise.all([tx.get(roundRef),tx.get(gateRef)]);
    const current=signed(round,uid);
    if(current.state==='deleting')return;
    tx.update(roundRef,{state:'deleting'});
    if(gate.exists())tx.update(gateRef,{state:'deleting'});
  });
  // Delete children first and the parent last. Not atomic; retry if interrupted.
  for(const name of ['results','presence','authorized','names','view','gate']){
    // Bei Löschungen keine eventuell veralteten Offline-Cache-Ergebnisse verwenden.
    const snap=await getDocsFromServer(collection(db,'sharedRounds',rid,name));
    for(let i=0;i<snap.docs.length;i+=100){
      const batch=writeBatch(db);
      snap.docs.slice(i,i+100).forEach(d=>batch.delete(d.ref));
      await batch.commit();
    }
  }
  await deleteDoc(root(db,rid));
}
