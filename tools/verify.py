from pathlib import Path
import json, re
base=Path(__file__).resolve().parent.parent
checks={
 'spark backend exists':(base/'web/spark-backend.js').is_file(),
 'draw logic exists':(base/'web/draw-logic.js').is_file(),
 'firestore rules exists':(base/'firestore.rules').is_file(),
 'no functions folder':not (base/'functions').exists(),
 'firebase project config':"projectId: 'episoden-gluecksrad'" in (base/'web/config.js').read_text(),
 'no functions SDK': 'firebase-functions' not in (base/'web/app.js').read_text(),
 'no https callable': 'httpsCallable' not in (base/'web/app.js').read_text(),
 'transaction gate': "'checkinGate', 'status'" in (base/'web/spark-backend.js').read_text(),
 'transaction all roster': "Promise.all(ids.map(id=>tx.get" in (base/'web/spark-backend.js').read_text(),
 'atomic publish': "tx.update(sub(db,rid,'checkinGate','status'),{state:'published'})" in (base/'web/spark-backend.js').read_text(),
 'student list only member': 'allow get, list: if owner(rid) || member(rid);' in (base/'firestore.rules').read_text(),
 'result requires published': "get(gatePath(rid)).data.state == 'published'" in (base/'firestore.rules').read_text(),
 'invites cannot list': 'allow list: if owner(rid);' in (base/'firestore.rules').read_text(),
 'rules linked checkin': 'getAfter(authPath' in (base/'firestore.rules').read_text(),
 'rules only teacher creates rounds': 'allow create: if teacher()' in (base/'firestore.rules').read_text(),
 'hosting exists': (base/'web/index.html').exists(),
 'no functions deployment': 'functions' not in json.loads((base/'firebase.json').read_text()),
 'tests present':(base/'tests/draw.test.mjs').is_file(),
 'windows deploy helper':(base/'JETZT-VEROEFFENTLICHEN.cmd').is_file(),
}
for k,v in checks.items():print(('OK' if v else 'FAIL'), k)
print(f'{sum(checks.values())}/{len(checks)} Checks')
if not all(checks.values()): raise SystemExit(1)
