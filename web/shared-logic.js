// Identical canonicalization must be enforced by Firestore Rules on create.
// A shared name is NOT a verified identity; the teacher verifies attendance.
export const normalizeName = raw => {
  const name = String(raw ?? '').trim().replace(/ +/gu,' ');
  if(name.length < 2 || name.length > 60 || name === '.' || name === '..' || /[\x00-\x1f\x7f/#?\\]/u.test(name)) {
    throw new Error('Bitte einen Namen mit 2 bis 60 Zeichen eingeben (ohne /, #, ? oder Steuerzeichen).');
  }
  return {name, nameKey:name.toLowerCase()};
};
export const cleanEpisodes = raw => {
  if(!Array.isArray(raw) || raw.length < 1 || raw.length > 30) throw new Error('Bitte 1 bis 30 Episoden eingeben.');
  const names = raw.map(s=>String(s??'').trim());
  if(names.some(s=>s.length<1 || s.length>100) || new Set(names.map(s=>s.toLowerCase())).size!==names.length) throw new Error('Episoden müssen eindeutig sein (1–100 Zeichen).');
  return names;
};
