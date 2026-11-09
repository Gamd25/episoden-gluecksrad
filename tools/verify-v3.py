from pathlib import Path
from html.parser import HTMLParser
import re
root=Path(__file__).resolve().parents[1]
html=(root/'web/index.html').read_text()
js=(root/'web/app.js').read_text()
backend=(root/'web/shared-backend.js').read_text()
rules=(root/'firestore.rules').read_text()
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.ids=set()
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:
   assert d['id'] not in self.ids, f'duplicate id {d["id"]}'
   self.ids.add(d['id'])
p=Parser();p.feed(html)
ids=set(re.findall(r"\$\('([^']+)'\)",js))
assert not (ids-p.ids),f'missing HTML ids: {ids-p.ids}'
assert "import { createRound as createSparkRound" in js and "from './shared-backend.js'" in js
assert "studentUrl(roundId){return" in js
assert not re.search(r"studentsInput|downloadLinks|freshLinks|joinToken|Personal.*Zugang",js)
assert "sharedRounds" in rules and "match /rounds/{rid}" in rules
assert "request.resource.data.nameKey == key" in rules
assert "key == request.resource.data.name.lower().trim().replace(' +', ' ')" in rules
assert "allow update: if false;" in rules
assert 'getAfter(sAuth(' in rules and 'getAfter(sPresence(' in rules
assert "requireOpen(gate.data())" in backend and "tx.set(part(db,rid,'names',nameKey)" in backend
assert "state:'closing'" in backend and "state:'published'" in backend
assert "getDocs(collection(db,'sharedRounds',rid,'presence'))" in backend
assert "state:'deleting'" in backend
# Brace/parenthesis gross sanity only, not a Firestore rules compilation.
assert rules.count('{') == rules.count('}')
assert js.count('import ')>=4
print('STATIC_CONTRACT: PASS (DOM IDs, isolated collection, route, atomic protocol and rule invariants)')
print('RULES_COMPILER: NOT RUN; test in Firebase Emulator/Rules Playground before real student data')
