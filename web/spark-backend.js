// Spark-only persistence. No Cloud Functions or paid services required.
// Teacher is the trusted draw operator; Firestore Rules guard participant writes.
import {
  collection, doc, getDoc, getDocs, query, where, runTransaction,
  writeBatch, serverTimestamp, deleteDoc
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
import { balancedDraw } from './draw-logic.js';

const clean = value => String(value ?? '').trim();
const unique = (items, type, max) => {
  if (!Array.isArray(items) || items.length < 1 || items.length > max) throw new Error(`${type}: 1 bis ${max} Einträge erforderlich.`);
  const data = items.map(clean);
  if (data.some(x => !x || x.length > 100)) throw new Error(`${type}: Leere oder zu lange Einträge sind unzulässig (max. 100 Zeichen).`);
  if (new Set(data.map(x => x.toLocaleLowerCase('de'))).size !== data.length) throw new Error(`${type}: Namen müssen eindeutig sein.`);
  return data;
};
const token = () => {
  const bytes = new Uint8Array(32); crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
};
const rref = (db, rid) => doc(db, 'rounds', rid);
const sub = (db, rid, subcol, id) => doc(db, 'rounds', rid, subcol, id);
const checkOwner = (round, uid) => {
  if (!round.exists() || round.data().ownerUid !== uid) throw new Error('Keine Berechtigung für diese Runde.');
  return round.data();
};
const checkOpen = round => {
  if (round.state !== 'checkin') throw new Error('Der Check-in ist bereits abgeschlossen.');
};

export async function createRound(db, uid, input) {
  const title = clean(input.title);
  if (!title || title.length > 100) throw new Error('Bitte einen Rundentitel (maximal 100 Zeichen) angeben.');
  const students = unique(input.students, 'Schülernamen', 160);
  const episodeNames = unique(input.episodes, 'Episoden', 30);
  const episodes = episodeNames.map(label => ({id: crypto.randomUUID(), label}));
  const rid = crypto.randomUUID();
  const links = students.map(name => ({name, token: token()}));
  const batch = writeBatch(db);
  batch.set(rref(db, rid), {
    ownerUid: uid, title, state: 'checkin', episodes,
    rosterIds: links.map(l => l.token), createdAt: serverTimestamp()
  });
  batch.set(sub(db, rid, 'view', 'state'), {title, state:'checkin'});
  batch.set(sub(db, rid, 'checkinGate', 'status'), {state:'checkin'});
  for (const l of links) batch.set(sub(db, rid, 'roster', l.token), {name:l.name, claimedUid:null, checkedInAt:null});
  await batch.commit();
  return {roundId: rid, links:links.map(l=>({...l,studentId:l.token}))};
}

export async function checkIn(db, uid, rid, invite) {
  if (!/^[0-9a-f]{64}$/u.test(invite)) throw new Error('Ungültiger persönlicher Zugangslink.');
  const result = await runTransaction(db, async tx => {
    const gateRef = sub(db, rid, 'checkinGate', 'status'), inviteRef = sub(db, rid, 'roster', invite);
    const authRef = sub(db, rid, 'authorized', uid), presenceRef = sub(db, rid, 'presence', uid);
    const [gateDoc, itemDoc, authDoc] = await Promise.all([tx.get(gateRef), tx.get(inviteRef), tx.get(authRef)]);
    if (!gateDoc.exists()) throw new Error('Die Runde existiert nicht.');
    checkOpen(gateDoc.data());
    if (!itemDoc.exists()) throw new Error('Der persönliche Link ist ungültig oder wurde ersetzt.');
    if (authDoc.exists()) {
      if (authDoc.data().studentId === invite) return {studentId:invite,name:authDoc.data().name};
      throw new Error('Du bist in dieser Runde bereits mit einem anderen Link eingecheckt.');
    }
    const item = itemDoc.data();
    if (item.claimedUid) throw new Error('Dieser Link wurde bereits verwendet. Bitte die Lehrperson informieren.');
    tx.update(inviteRef, {claimedUid:uid,checkedInAt:serverTimestamp()});
    tx.set(authRef, {studentId:invite,name:item.name});
    tx.set(presenceRef, {studentId:invite,name:item.name,authUid:uid,checkedInAt:serverTimestamp()});
    return {studentId:invite,name:item.name};
  });
  return result;
}

export async function changeEpisodes(db, uid, rid, names) {
  const cleaned = unique(names,'Episoden',30);
  await runTransaction(db, async tx => {
    const ref = rref(db,rid), round = tx.get(ref);
    const value=checkOwner(await round,uid); checkOpen(value);
    const episodes = cleaned.map((label,i)=> ({id:value.episodes[i]?.id || crypto.randomUUID(),label}));
    tx.update(ref,{episodes});
  });
}

export async function rotateInvite(db,uid,rid,oldId,allowClaimed=false) {
  const newToken = token();
  return runTransaction(db, async tx=>{
    const roundRef=rref(db,rid), oldRef=sub(db,rid,'roster',oldId);
    const [roundSnap,oldSnap]=await Promise.all([tx.get(roundRef),tx.get(oldRef)]);
    const round=checkOwner(roundSnap,uid); checkOpen(round);
    if(!oldSnap.exists() || !round.rosterIds.includes(oldId)) throw new Error('Der Zugang wurde bereits verändert. Ansicht aktualisieren.');
    const item=oldSnap.data();
    if(item.claimedUid&&!allowClaimed)throw new Error('Der Zugang ist eingecheckt. Bitte zunächst den Check-in aufheben.');
    if(!item.claimedUid&&allowClaimed)throw new Error('Diese Person ist nicht eingecheckt.');
    // In one atomic transaction, revoke all old links and replace the roster ID.
    if(item.claimedUid){
      tx.delete(sub(db,rid,'authorized',item.claimedUid));
      tx.delete(sub(db,rid,'presence',item.claimedUid));
    }
    tx.delete(oldRef);
    tx.set(sub(db,rid,'roster',newToken),{name:item.name,claimedUid:null,checkedInAt:null});
    tx.update(roundRef,{rosterIds:round.rosterIds.map(id=>id===oldId?newToken:id)});
    return {studentId:newToken,token:newToken,name:item.name};
  });
}

export async function finalizeRound(db,uid,rid) {
  const result = await runTransaction(db,async tx=>{
    const roundRef=rref(db,rid), roundDoc=await tx.get(roundRef);
    const round=checkOwner(roundDoc,uid);
    if(round.state==='published')return {alreadyPublished:true,count:0};
    checkOpen(round);
    const ids=round.rosterIds;
    if(!Array.isArray(ids)||ids.length<1||ids.length>160)throw new Error('Ungültige Zugangsübersicht.');
    // Every roster document is read inside the same transaction. A concurrent
    // check-in alters one of them and forces Firestore to retry the entire draw.
    const docs=await Promise.all(ids.map(id=>tx.get(sub(db,rid,'roster',id))));
    if(docs.some(x=>!x.exists()))throw new Error('Eine Teilnehmerkennung fehlt. Auslosung abgebrochen.');
    const people=docs.filter(x=>x.data().claimedUid).map(x=>({studentId:x.id,name:x.data().name,authUid:x.data().claimedUid}));
    if(!people.length)throw new Error('Noch keine Person eingecheckt.');
    if(!Array.isArray(round.episodes)||!round.episodes.length)throw new Error('Keine Episoden definiert.');
    const draw=balancedDraw(people,round.episodes);
    for(const p of draw){
      tx.set(sub(db,rid,'results',p.authUid),{studentId:p.studentId,authUid:p.authUid,name:p.name,episodeId:p.episode.id,episodeLabel:p.episode.label});
    }
    tx.update(roundRef,{state:'published',publishedAt:serverTimestamp(),publishedCount:draw.length});
    tx.update(sub(db,rid,'view','state'),{state:'published',episodes:round.episodes});
    tx.update(sub(db,rid,'checkinGate','status'),{state:'published'});
    return {alreadyPublished:false,count:draw.length};
  },{maxAttempts:5});
  return result;
}

export async function deleteRound(db,uid,rid){
  checkOwner(await getDoc(rref(db,rid)),uid);
  // Children first, then parent; retries are safe for partially completed deletions.
  for(const name of ['results','presence','authorized','roster','view','checkinGate']){
    const snapshot=await getDocs(collection(db,'rounds',rid,name));
    for(let i=0;i<snapshot.docs.length;i+=100){
      const batch=writeBatch(db);
      snapshot.docs.slice(i,i+100).forEach(d=>batch.delete(d.ref));
      await batch.commit();
    }
  }
  await deleteDoc(rref(db,rid));
}
