import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInAnonymously, signOut } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';
import { getFirestore, collection, doc, getDocFromServer, onSnapshot, query, where } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
import { createRound as createSparkRound, checkIn as sparkCheckIn, changeEpisodes as sparkChangeEpisodes, revokeCheckIn as sparkRevoke, finalizeRound as sparkFinalize, deleteRound as sparkDelete } from './shared-backend.js';
import { firebaseConfig } from './config.js';
import { resolveStoredAssignment, visitedWheelKey } from './episode-result.js';
import { createMembershipWitness } from './checkin-status.js';

const $ = id => document.getElementById(id);
const hide = id => $(id).classList.add('hidden');
const show = id => $(id).classList.remove('hidden');
const colors = ['#268c94','#e9ae52','#7daed0','#ce746a','#7e9e7e','#927eb5','#d38e58','#46a4a7','#b46d8c','#97a45b'];
const rowSplit = raw => raw.split(/\r?\n/u).map(s=>s.trim()).filter(Boolean);
const namesSorter = new Intl.Collator('de',{sensitivity:'base'});
let app,auth,db;
let mode = 'landing', user=null, currentRoundId=null, studentRoundId=null, studentIdentity=null;
let teacherUnsubs=[], studentUnsubs=[], currentRound=null, currentResults=[], currentPresence=[], currentView=null;
let teacherRounds=[], studentEpisode=null, spinning=false, currentRotation=0, activeAnimation=0, wheelEpisodes=[];
let shownAssignment=null;
let studentWatchSerial=0; // Ungueltige alte Listener- und Serverantworten nicht auf aktuelle Anmeldungen anwenden.
let toastTimer;
const deletingRoundIds = new Set();
const BUILD_VERSION = 'v6';
const teacherProvider = new GoogleAuthProvider();
teacherProvider.setCustomParameters({prompt:'select_account'});
function toast(message,ms=5000){ const e=$('globalStatus');e.textContent=message;show('globalStatus');clearTimeout(toastTimer);toastTimer=setTimeout(()=>hide('globalStatus'),ms); }
function message(error) { const raw=String(error?.message||error||'Unbekannter Fehler.'); return raw.replace(/^FirebaseError:\s*/u,'').replace(/^functions\/[\w-]+:\s*/u,'').slice(0,400); }
function safeRun(label, callback) { return async (...args)=>{ try { await callback(...args); } catch(e) { console.error(label,e); toast(`${label}: ${message(e)}`,8000); } }; }
function setBusy(button,busy,label) { button.disabled=busy; if(busy) {button.dataset.oldLabel=button.textContent;button.textContent=label||'Bitte warten …';} else if(button.dataset.oldLabel) {button.textContent=button.dataset.oldLabel;delete button.dataset.oldLabel;} }
function setScreen(next) { mode=next; ['landing','studentApp','teacherAuth','teacherApp'].forEach(id=>hide(id));show(next==='landing'?'landing':next==='student'?'studentApp':next==='teacher'?'teacherApp':'teacherAuth'); }
function clearListeners(list){ list.splice(0).forEach(unsub=>{try{unsub();}catch{}}); }
function linkBase(){return `${location.origin}${location.pathname}`;}
function studentUrl(roundId){return `${linkBase()}#r=${encodeURIComponent(roundId)}`;}
function downloadCSV(filename,rows){
 const csv='\ufeff'+rows.map(row=>row.map(value=>{const item=String(value??''); const escaped=/^[=+\-@\t\r]/u.test(item)?"'"+item:item; return '"'+escaped.replace(/"/gu,'""')+'"';}).join(';')).join('\r\n')+'\r\n';
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function call(name,data){
  if(!user) throw new Error('Bitte zuerst anmelden.');
  const id=data?.roundId;
  switch(name){
    case 'createRound': return createSparkRound(db,user.uid,data);
    case 'checkIn': return sparkCheckIn(db,user.uid,id,data.name);
    case 'changeEpisodes': return sparkChangeEpisodes(db,user.uid,id,data.episodes);
    case 'finalizeRound': return sparkFinalize(db,user.uid,id);
    case 'revokeCheckIn': return sparkRevoke(db,user.uid,id,data.studentId,data.authUid);
    case 'deleteRound': return sparkDelete(db,user.uid,id);
    default: throw new Error('Unbekannte Aktion.');
  }
}
function configured(){return Boolean(firebaseConfig?.apiKey && !String(firebaseConfig.apiKey).startsWith('HIER_') && firebaseConfig.projectId && !String(firebaseConfig.projectId).startsWith('HIER_'));}
function updateInputCounts(){$('episodeInputCount').textContent=`${rowSplit($('episodesInput').value).length} Episoden`;}
function parseRoute(){const args=new URLSearchParams(location.hash.replace(/^#/u,''));return {roundId:args.get('r')};}
function makeElement(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=String(text);return e;}
function makeButton(label,fn){const b=makeElement('button','btn-mini',label);b.type='button';b.addEventListener('click',safeRun(label,fn));return b;}

function setup() {
  const buildBadge=$('buildBadge')||document.querySelector('.build-version');
  if(buildBadge)buildBadge.textContent=BUILD_VERSION+' · JS geladen';
  $('teacherNav').addEventListener('click',()=>openTeacher());
  $('landingTeacher').addEventListener('click',()=>openTeacher());
  $('loginBtn').addEventListener('click',safeRun('Anmeldung',async()=>{
    const credential=await signInWithPopup(auth,teacherProvider);
    if(credential.user) openTeacher();
  }));
  $('newRoundBtn').addEventListener('click',()=>{show('createBox');$('classTitle').focus();});
  $('deleteRoundBtn').addEventListener('click',safeRun('Runde löschen',deleteRound));
  $('logoutBtn').addEventListener('click',safeRun('Abmeldung',async()=>{clearListeners(teacherUnsubs);await signOut(auth);user=null;setScreen('teacherAuth');}));
  $('createForm').addEventListener('submit',event=>{event.preventDefault();createRound().catch(e=>{console.error(e);toast(message(e),8000);});});
  $('episodesInput').addEventListener('input',updateInputCounts);
  $('saveEpisodes').addEventListener('click',safeRun('Episoden speichern',saveEpisodes));
  $('finalizeBtn').addEventListener('click',safeRun('Auslosung',finalizeRound));
  $('copySharedLink').addEventListener('click',safeRun('Klassenlink kopieren',async()=>{
    const link=$('sharedLink').value;
    if(!link)throw new Error('Keine Runde ausgewählt.');
    try{await navigator.clipboard.writeText(link);toast('Gemeinsamer Klassenlink kopiert.');}
    catch { $('sharedLink').focus(); $('sharedLink').select(); toast('Bitte den markierten Link mit Strg+C kopieren.'); }
  }));
  $('exportResults').addEventListener('click',()=>{
    if(!currentResults.length){toast('Noch keine veröffentlichten Ergebnisse.');return;}
    const byId=new Map(currentRound.episodes.map(e=>[e.id,e.label]));
    const sorted=[...currentResults].sort((a,b)=>namesSorter.compare(a.name,b.name));
    downloadCSV('episoden-ergebnisse.csv',[['Name','Episode'],...sorted.map(s=>[s.name,byId.get(s.episodeId)||s.episodeLabel])]);
  });
  $('printBtn').addEventListener('click',()=>window.print());
  $('joinBtn').addEventListener('click',safeRun('Check-in',checkIn));
  updateInputCounts();
  const route=parseRoute();
  if(route.roundId){studentRoundId=route.roundId;setScreen('student');}else{setScreen('landing');}
  if(!configured()){
    $('connection').textContent='Einrichtung fehlt';
    $('loginBtn').disabled=true;$('joinBtn').disabled=true;
    const tip='Firebase ist noch nicht eingerichtet. Bitte web/config.js mit der Firebase-Webkonfiguration ausfüllen und die Firestore-Regeln bereitstellen.';
    $('studentError').textContent=tip;show('studentError');toast(tip,12000);return;
  }
  app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
  onAuthStateChanged(auth,async loggedInUser=>{
    user=loggedInUser;$('connection').textContent=loggedInUser?'Verbunden':'Nicht angemeldet';
    if(mode==='student'){
      if(!loggedInUser){try{await signInAnonymously(auth);}catch(e){setStudentError(message(e));}}
      else {await startStudentSession();}
    } else if(mode==='teacher' || mode==='teacherAuth'){
      if(isGoogleUser()) await startTeacherSession();else setScreen('teacherAuth');
    }
  },e=>{console.error(e);$('connection').textContent='Verbindungsfehler';toast(message(e));});
}
function isGoogleUser(){return Boolean(user?.providerData?.some(p=>p.providerId==='google.com'));}
function openTeacher(){++studentWatchSerial;clearListeners(studentUnsubs);studentIdentity=null;mode='teacherAuth';if(!configured()){setScreen('teacherAuth');return;}if(isGoogleUser()) startTeacherSession().catch(e=>toast(message(e)));else setScreen('teacherAuth');}

async function startTeacherSession(){
  if(!isGoogleUser())return;
  setScreen('teacher');
  clearListeners(teacherUnsubs);
  teacherUnsubs.push(onSnapshot(query(collection(db,'sharedRounds'),where('ownerUid','==',user.uid)),snap=>{
    teacherRounds=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0));
    renderRoundList();
    if(currentRoundId){const item=teacherRounds.find(r=>r.id===currentRoundId);if(item){currentRound=item;renderDetail();}}
  },e=>toast('Rundenliste: '+message(e))));
  if(currentRoundId) openRound(currentRoundId);
}
function renderRoundList(){
  const list=$('roundList');list.replaceChildren();$('roundTotal').textContent=teacherRounds.length;
  if(!teacherRounds.length){list.append(makeElement('p','microcopy','Noch keine gemeinsamen Klassenrunden vorhanden.'));return;}
  for(const round of teacherRounds){
    // Kein verschachtelter Button: Auswahl und Löschen bleiben getrennte Aktionen.
    const row=makeElement('div','round-row');
    const b=makeElement('button','round-item'+(round.id===currentRoundId?' active':''));b.type='button';
    const state=round.state==='published'?'Ausgelost':round.state==='deleting'?'Löschung noch offen':round.state==='closing'?'Auslosung läuft':'Check-in offen';
    b.append(makeElement('strong','',round.title),makeElement('small','',state));
    b.addEventListener('click',()=>openRound(round.id));
    const remove=makeElement('button','round-delete',round.state==='deleting'?'Fortsetzen':'Löschen');remove.type='button';
    remove.setAttribute('aria-label',`Runde ${round.title} löschen`);
    remove.disabled=deletingRoundIds.has(round.id);
    remove.addEventListener('click',safeRun('Runde löschen',async()=>{
      await deleteRoundById(round.id,round.title);
    }));
    row.append(b,remove);list.append(row);
  }
}
async function createRound(){
  const button=$('createBtn');setBusy(button,true,'Erstelle Runde …');
  try{
    if(!isGoogleUser())throw new Error('Nur die Lehrperson darf Runden erstellen.');
    const result=await call('createRound',{title:$('classTitle').value,episodes:rowSplit($('episodesInput').value)});
    currentRoundId=result.roundId;
    toast('Runde erstellt. Den gemeinsamen Klassenlink findest du in den Rundendetails.',8000);
    openRound(result.roundId);
    $('createBox').classList.add('hidden');
  }finally{setBusy(button,false);}
}
function openRound(roundId){
  currentRoundId=roundId;
  currentRound=teacherRounds.find(r=>r.id===roundId)||null;
  currentResults=[];currentPresence=[];currentView=null;
  clearListeners(teacherUnsubs);
  // Die Rundenliste bleibt mit einer eigenen Subscription aktuell.
  teacherUnsubs.push(onSnapshot(query(collection(db,'sharedRounds'),where('ownerUid','==',user.uid)),snap=>{
    teacherRounds=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0));
    renderRoundList();
    const newer=teacherRounds.find(r=>r.id===currentRoundId);
    if(newer){const oldEpisodes=JSON.stringify(currentRound?.episodes);currentRound=newer;if(oldEpisodes!==JSON.stringify(newer.episodes) && document.activeElement!==$('editEpisodes'))$('editEpisodes').value=newer.episodes.map(e=>e.label).join('\n');renderDetail();}
  },e=>toast('Rundenübersicht: '+message(e))));
  const ref=doc(db,'sharedRounds',roundId);
  
  teacherUnsubs.push(onSnapshot(collection(ref,'presence'),snap=>{
    currentPresence=snap.docs.map(d=>d.data()).sort((a,b)=>namesSorter.compare(a.name,b.name));
    renderRoster();renderDetail();
  },e=>toast('Check-ins: '+message(e))));
  teacherUnsubs.push(onSnapshot(doc(ref,'view','state'),snap=>{currentView=snap.data();renderDetail();},e=>toast('Rundenstatus: '+message(e))));
  teacherUnsubs.push(onSnapshot(collection(ref,'results'),snap=>{
    currentResults=snap.docs.map(d=>d.data());renderGroups();
  },e=>toast('Ergebnisse: '+message(e))));
  $('editEpisodes').value=(currentRound?.episodes||[]).map(e=>e.label).join('\n');
  $('sharedLink').value=studentUrl(roundId);
  show('roundDetail');renderRoundList();renderDetail();
}
function renderDetail(){
  if(!currentRound){return;}
  const open=currentRound.state==='checkin', closing=currentRound.state==='closing';
  $('detailTitle').textContent=currentRound.title;
  $('detailCount').textContent=currentPresence.length;
  $('detailEpisodeCount').textContent=currentRound.episodes?.length??0;
  $('detailRosterCount').textContent='1';
  $('roundStateLabel').textContent=currentRound.state==='deleting'?'LÖSCHUNG UNVOLLSTÄNDIG':open?'CHECK-IN OFFEN':closing?'AUSLOSUNG WIRD VORBEREITET':'ERGEBNISSE FREIGEGEBEN';
  if(currentRound.state==='deleting'){
    hide('openRoundControls');hide('publishedControls');hide('printBtn');
    $('deleteRoundBtn').textContent='Löschung fortsetzen';return;
  }
  $('deleteRoundBtn').textContent='Runde löschen';
  if(open||closing){show('openRoundControls');hide('publishedControls');hide('printBtn');$('saveEpisodes').disabled=closing;$('finalizeBtn').disabled=closing;
    $('finalizeBtn').textContent=closing?'Auslosung läuft. Bei Problemen nach 30 Sekunden erneut versuchen.':'Check-in abschließen und auslosen';
    if(closing){$('finalizeBtn').disabled=false;$('finalizeBtn').textContent='Auslosung fortsetzen (ggf. nach 30 Sekunden)';}
  } else {hide('openRoundControls');show('publishedControls');show('printBtn');renderGroups();}
}
function renderRoster(){
  const node=$('rosterList');node.replaceChildren();
  for(const student of currentPresence){
    const item=makeElement('div','roster-item');
    const left=makeElement('div');
    left.append(makeElement('strong','',student.name),makeElement('div','status-in','✓ Eingecheckt'));
    const actions=makeElement('div','roster-actions');
    if(currentRound?.state==='checkin'){
      actions.append(makeButton('Check-in entfernen',async()=>{
        if(!confirm(`Check-in von ${student.name} entfernen? Die Person kann den Namen erneut eingeben.`))return;
        await call('revokeCheckIn',{roundId:currentRoundId,studentId:student.studentId,authUid:student.authUid});
        toast('Check-in entfernt. Die Teilnehmerliste wird aktualisiert.');
      }));
    }
    item.append(left,actions);node.append(item);
  }
}
async function saveEpisodes(){
  const lines=rowSplit($('editEpisodes').value);
  if(!lines.length)throw new Error('Mindestens eine Episode erforderlich.');
  if(!confirm('Episodenanzahl und Episodennamen für diese noch offene Runde aktualisieren?'))return;
  await call('changeEpisodes',{roundId:currentRoundId,episodes:lines});toast('Episoden gespeichert.');
}
async function deleteRound(){
  if(!currentRoundId || !currentRound) return;
  await deleteRoundById(currentRoundId,currentRound.title);
}
async function deleteRoundById(roundId,title){
  // Das Ziel vor jeder Rückfrage fixieren; eine parallele Listenauswahl darf
  // nicht versehentlich die falsche Runde löschen.
  const round=teacherRounds.find(r=>r.id===roundId);
  if(!round || round.title!==title || !isGoogleUser()){
    throw new Error('Runde nicht gefunden oder kein berechtigter Lehrerzugang. Bitte die Liste neu laden.');
  }
  if(deletingRoundIds.has(roundId))return;
  const typed=prompt(`Runde „${title}“ samt Check-ins und Episodenergebnissen endgültig löschen?\n\nGib exakt LÖSCHEN ein:`);
  if(typed!=='LÖSCHEN')return;
  deletingRoundIds.add(roundId);renderRoundList();
  try{
    await call('deleteRound',{roundId});
    // Erst nach bestätigter Datenbank-Löschung die UI ändern.
    if(currentRoundId===roundId){
      clearListeners(teacherUnsubs);currentRoundId=null;currentRound=null;
      currentPresence=[];currentResults=[];currentView=null;
      hide('roundDetail');show('createBox');
      await startTeacherSession();
    }
    // Keine anderen geöffneten Runden antasten.
    toast(`Runde „${title}“ wurde gelöscht.`,6500);
  }catch(e){
    toast(`Löschen nicht abgeschlossen: ${message(e)}. Bitte dieselbe Runde später erneut löschen.`,11000);
    throw e;
  }finally{deletingRoundIds.delete(roundId);renderRoundList();}
}
async function finalizeRound(){
  if(!currentRound||(currentRound.state==='checkin'&&!currentPresence.length)){toast('Es muss mindestens eine Person eingecheckt haben.');return;}
  if(!confirm(`Check-in verbindlich schließen und ${currentPresence.length} Namen auf ${currentRound.episodes.length} Episoden auslosen? Die Namen müssen zuvor mit den Anwesenden abgeglichen sein. Danach sind keine weiteren Check-ins möglich.`))return;
  const b=$('finalizeBtn');setBusy(b,true,'Auslosung läuft …');
  try{const result=await call('finalizeRound',{roundId:currentRoundId});toast(result.alreadyPublished?'Runde ist bereits ausgelost.':`${result.count} Personen wurden erfolgreich zugeteilt.`,8000);}
  finally{setBusy(b,false);}
}
function renderGroups(){
  const host=$('groupGrid');host.replaceChildren();
  if(!currentRound||currentRound.state!=='published')return;
  for(const [i,episode] of currentRound.episodes.entries()){
    const card=makeElement('section','group-card');card.style.setProperty('--group-color',colors[i%colors.length]);
    const names=currentResults.filter(x=>x.episodeId===episode.id).map(x=>x.name).sort(namesSorter.compare);
    card.append(makeElement('h4','',episode.label),makeElement('div','group-count',`${names.length} Personen`));
    const list=makeElement('ul');names.forEach(name=>list.append(makeElement('li','',name)));card.append(list);host.append(card);
  }
}

function setStudentError(text){$('studentError').textContent=text;show('studentError');}
async function startStudentSession(){
  if(mode!=='student'||!studentRoundId||!user)return;
  ++studentWatchSerial;
  clearListeners(studentUnsubs);
  hide('studentError');
  const ref=doc(db,'sharedRounds',studentRoundId,'authorized',user.uid);
  try{
    const member=await getDocFromServer(ref);
    if(member.exists()){
      studentIdentity=member.data();watchStudent({alreadyVerified:true});
    } else {
      studentIdentity=null;
      show('studentJoinArea');hide('studentWaiting');hide('studentResult');hide('waitingSidebar');
      $('joinBtn').disabled=false;
    }
  }catch(e){setStudentError('Dein Zugang konnte nicht geprüft werden: '+message(e));}
}
async function checkIn(){
  if(!user||!studentRoundId){setStudentError('Klassenlink fehlt.');return;}
  if(isGoogleUser()){setStudentError('Bitte den Schülerlink in einem privaten Browserfenster öffnen.');return;}
  const b=$('joinBtn');setBusy(b,true,'Check-in wird gespeichert …');
  try{
    const result=await call('checkIn',{roundId:studentRoundId,name:$('studentNameInput').value});
    studentIdentity={studentId:result.studentId,name:result.name};
    try { history.replaceState(null,'',`${linkBase()}#r=${encodeURIComponent(studentRoundId)}`); } catch { /* iFrame-Sandbox */ }
    hide('studentError');watchStudent({alreadyVerified:false});
  } catch(e){setStudentError(e?.code==='permission-denied'?'Check-in abgelehnt. Möglicherweise ist der Name schon belegt, die Runde geschlossen oder die neuen Firestore-Regeln fehlen. Bitte Lehrperson informieren.':message(e));} finally{setBusy(b,false);}
}
function watchStudent({alreadyVerified=false}={}){
  clearListeners(studentUnsubs);
  if(!studentIdentity)return;
  // Alte Zeichnungen/Ergebnisse dürfen nicht in eine neue Sitzung hineinragen.
  spinning=false;activeAnimation++;shownAssignment=null;studentEpisode=null;
  hide('myEpisode');
  const watchId=++studentWatchSerial;
  const watchedUid=user.uid;
  const watchedStudentId=studentIdentity.studentId;
  let checkingRemoval=false;
  const witness=createMembershipWitness({alreadyVerified});
  hide('studentJoinArea');show('studentWaiting');show('waitingSidebar');hide('studentResult');
  $('selfName').textContent=studentIdentity.name;
  $('studentHeading').textContent='Du bist dabei!';
  $('studentSub').textContent='Dein Check-in wurde übernommen. Warte auf den Abschluss durch die Lehrperson.';
  const roundRef=doc(db,'sharedRounds',studentRoundId);
  const authRef=doc(roundRef,'authorized',watchedUid);
  // Nur ein zuvor vom Server bestaetigter Check-in darf nach einer weiteren
  // unabhaengigen Serverkontrolle als nicht mehr vorhanden gelten.
  // Ein initiales 'nicht vorhanden' nach erfolgreicher Transaktion oder aus
  // dem Offline-Cache ist KEIN Beleg fuer das Entfernen durch die Lehrperson.
  studentUnsubs.push(onSnapshot(authRef,async snap=>{
    if(watchId!==studentWatchSerial || !studentIdentity || user?.uid!==watchedUid || studentIdentity.studentId!==watchedStudentId)return;
    if(snap.exists() && snap.data().studentId!==watchedStudentId){
      setStudentError('Dein Anmeldestatus passt nicht zu deinem Check-in. Bitte die Lehrperson informieren.');return;
    }
    const observation=witness.observe({exists:snap.exists(),fromCache:snap.metadata.fromCache});
    if(observation==='present'){
      hide('studentError');return;
    }
    if(observation!=='verify-absence' || checkingRemoval)return;
    checkingRemoval=true;
    try{
      const verified=await getDocFromServer(authRef);
      if(watchId!==studentWatchSerial || !studentIdentity || user?.uid!==watchedUid || studentIdentity.studentId!==watchedStudentId)return;
      if(verified.exists()){
        if(verified.data().studentId!==watchedStudentId)setStudentError('Dein Anmeldestatus passt nicht zu deinem Check-in. Bitte die Lehrperson informieren.');
        else {witness.serverConfirmed();hide('studentError');}
        return;
      }
      // Der erste fehlende Server-Lesewert reicht noch nicht: nochmals pruefen.
      const secondCheck=await getDocFromServer(authRef);
      if(watchId!==studentWatchSerial || !studentIdentity || user?.uid!==watchedUid || studentIdentity.studentId!==watchedStudentId)return;
      if(secondCheck.exists()){
        if(secondCheck.data().studentId!==watchedStudentId)setStudentError('Dein Anmeldestatus passt nicht zu deinem Check-in. Bitte die Lehrperson informieren.');
        else {witness.serverConfirmed();hide('studentError');}
        return;
      }
      ++studentWatchSerial;
      clearListeners(studentUnsubs);studentIdentity=null;spinning=false;activeAnimation++;resultUnsub=null;shownAssignment=null;studentEpisode=null;hide('myEpisode');
      hide('studentWaiting');hide('studentResult');hide('waitingSidebar');show('studentJoinArea');$('joinBtn').disabled=false;
      $('studentHeading').textContent='Check-in nicht mehr aktiv';
      $('studentSub').textContent='Die Anmeldung ist nicht mehr in Firebase gespeichert.';
      setStudentError('Dein Check-in ist nicht mehr aktiv. Bitte informiere die Lehrperson oder melde dich erneut an, solange die Runde offen ist.');
    }catch(e){
      if(watchId===studentWatchSerial)setStudentError('Dein Anmeldestatus konnte gerade nicht geprüft werden: '+message(e));
    }finally{checkingRemoval=false;}
  },e=>setStudentError('Anmeldestatus: '+message(e))));
  studentUnsubs.push(onSnapshot(doc(roundRef,'view','state'),snap=>{
    if(!snap.exists()){setStudentError('Rundenstatus nicht verfügbar.');return;}
    const data=snap.data();
    $('studentEyebrow').textContent=data.title||'Deine Gruppeneinteilung';
    wheelEpisodes=data.episodes||[];
    if(data.state==='published'){hide('studentWaiting');hide('waitingSidebar');show('studentResult');$('studentHeading').textContent='Deine Auslosung';$('studentSub').textContent='Die Lehrperson hat den Check-in abgeschlossen.';subscribeResult();}
    else {show('studentWaiting');show('waitingSidebar');hide('studentResult');$('studentHeading').textContent=data.state==='closing'?'Die Auslosung wird vorbereitet …':'Du bist dabei!';$('studentSub').textContent=data.state==='closing'?'Dein Check-in wurde übernommen. Die Auslosung wird vorbereitet.':'Dein Check-in wurde übernommen. Alle eingecheckten Personen warten gemeinsam auf die Freigabe.';}
  },e=>setStudentError('Status: '+message(e))));
  studentUnsubs.push(onSnapshot(collection(roundRef,'presence'),snap=>{
    const people=snap.docs.map(d=>d.data()).sort((a,b)=>namesSorter.compare(a.name,b.name));
    $('studentCount').textContent=people.length;
    const names=$('studentNames');names.replaceChildren();people.forEach(p=>names.append(makeElement('li','',p.name)));
  },e=>setStudentError('Teilnehmerliste: '+message(e))));
}
let resultUnsub=null;
function subscribeResult(){
  if(resultUnsub)return;
  const subscribedRound=studentRoundId, subscribedUid=user.uid;
  resultUnsub=onSnapshot(doc(db,'sharedRounds',subscribedRound,'results',subscribedUid),snap=>{
    if(subscribedRound!==studentRoundId || subscribedUid!==user?.uid || !studentIdentity)return;
    if(!snap.exists()){
      $('spinningLabel').textContent='Deine freigegebene Episode wird geladen …';
      return;
    }
    let assignment;
    try{assignment=resolveStoredAssignment(snap.data(),wheelEpisodes,subscribedUid);}
    catch(e){setStudentError(message(e));return;}
    const assignmentKey=`${subscribedRound}:${subscribedUid}:${assignment.episodeId}`;
    studentEpisode=snap.data();
    show('studentResult');
    // Wichtig: Die dauerhafte Textanzeige hängt ausschließlich an dem aus
    // Firestore geladenen Ergebnis, NICHT am Animationsende oder an localStorage.
    $('episodeName').textContent=assignment.label;
    $('resultOwner').textContent=`Für ${studentIdentity.name}`;
    show('myEpisode');
    if(shownAssignment===assignmentKey)return;
    shownAssignment=assignmentKey;
    renderWheel(wheelEpisodes,currentRotation);
    if(!spinning)startWheel(assignment.index,studentEpisode);
  },e=>setStudentError('Zuteilung: '+message(e)));
  studentUnsubs.push(()=>{resultUnsub?.();resultUnsub=null;});
}
function renderWheel(episodes,rotation){
  const canvas=$('wheel'),ctx=canvas.getContext('2d');
  const size=canvas.width,center=size/2,r=size*.47;
  ctx.clearRect(0,0,size,size);
  if(!episodes.length)return;
  const arc=2*Math.PI/episodes.length;
  ctx.save();ctx.translate(center,center);ctx.rotate(rotation);
  episodes.forEach((episode,i)=>{
    const start=-Math.PI/2+i*arc,end=start+arc;
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,start,end);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
    ctx.save();ctx.rotate(start+arc/2);ctx.translate(r*.68,0);
    const font=Math.max(15,Math.min(28,Math.floor(330/(episodes.length+3))));
    ctx.font=`800 ${font}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
    let label=episode.label;
    if(episodes.length>12 || label.length>18)label=`${i+1}`;
    ctx.rotate(Math.PI/2);
    ctx.fillText(label,0,0,r*.52);
    ctx.restore();
  });
  ctx.restore();
  ctx.beginPath();ctx.arc(center,center,r*.14,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#d1dbd8';ctx.stroke();
  ctx.fillStyle='#1b6670';ctx.font='bold 55px system-ui';ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText('✳',center,center+2);
}
function startWheel(index,result){
  spinning=true;const key=visitedWheelKey(studentRoundId,user.uid);
  const arc=2*Math.PI/wheelEpisodes.length;
  const desired=-(index+.5)*arc;
  const diff=(desired-(currentRotation%(2*Math.PI))+Math.PI*6)%(2*Math.PI);
  const start=currentRotation, target=start+Math.PI*2*5+diff;
  let already=false;try { already=localStorage.getItem(key)==='1'; } catch { /* Browser blockiert Speicherung */ }
  const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches||already?0:3200;
  $('spinningLabel').textContent=duration?'Das Glücksrad dreht …':'Auslosung abgeschlossen';
  // Ergebnisbox bleibt auch WÄHREND der Animation sichtbar.
  function finish(){currentRotation=target;renderWheel(wheelEpisodes,currentRotation);$('spinningLabel').textContent='Deine Episode wurde verbindlich zugeteilt.';try { localStorage.setItem(key,'1'); } catch { /* Browser blockiert Speicherung */ } spinning=false;}
  if(!duration){finish();return;}
  const started=performance.now(),animationId=++activeAnimation;
  function frame(now){if(animationId!==activeAnimation)return;const p=Math.min((now-started)/duration,1),easing=1-Math.pow(1-p,4);currentRotation=start+(target-start)*easing;renderWheel(wheelEpisodes,currentRotation);if(p<1)requestAnimationFrame(frame);else finish();}
  requestAnimationFrame(frame);
}
setup();
