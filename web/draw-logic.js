// Uses Web Crypto rejection sampling, not Math.random(), for equal-probability indices.
export function randomIndex(max) {
  if (!Number.isInteger(max) || max <= 0 || max > 0x100000000) throw new Error('Ungültiger Zufallsbereich.');
  const bound = Math.floor(0x100000000 / max) * max;
  let n;
  do { const one = new Uint32Array(1); crypto.getRandomValues(one); n = one[0]; } while (n >= bound);
  return n % max;
}
export function balancedDraw(people, episodes) {
  if (!Array.isArray(people) || !people.length || !Array.isArray(episodes) || !episodes.length) throw new Error('Teilnehmer und Episoden erforderlich.');
  const shuffled = people.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.map((person, i) => ({ ...person, episode: episodes[i % episodes.length] }));
}
