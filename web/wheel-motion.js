// Original spin settings from the previously recorded Gefühls-Rad comparison.
// Only the visual number of revolutions is random; NEVER the assigned episode.
export const ORIGINAL_WHEEL_SETTINGS = Object.freeze({
  durationMs: 4300,
  minimumTurns: 6,
  maximumTurns: 10,
  audioVolume: 0.85
});
const TAU = 2 * Math.PI;
const modulo = (x,m) => ((x % m) + m) % m;
export function easeOutCubic(progress) {
  if(!Number.isFinite(progress)) throw new TypeError('Ungültiger Animationsfortschritt.');
  const p = Math.max(0, Math.min(1, progress));
  return 1 - (1 - p) ** 3;
}
export function chooseVisualTurns(random=Math.random) {
  const value=Number(random());
  if(!Number.isFinite(value)||value<0||value>1)throw new TypeError('Ungültige visuelle Zufallszahl.');
  return ORIGINAL_WHEEL_SETTINGS.minimumTurns + Math.min(
    ORIGINAL_WHEEL_SETTINGS.maximumTurns-ORIGINAL_WHEEL_SETTINGS.minimumTurns,
    Math.floor(value*(ORIGINAL_WHEEL_SETTINGS.maximumTurns-ORIGINAL_WHEEL_SETTINGS.minimumTurns+1)));
}
export function planStoredLanding({index,episodeCount,currentRotation,turns}) {
  if(!Number.isInteger(episodeCount)||episodeCount<1||episodeCount>30 ||
    !Number.isInteger(index)||index<0||index>=episodeCount ||
    !Number.isFinite(currentRotation)||
    !Number.isInteger(turns)||turns<ORIGINAL_WHEEL_SETTINGS.minimumTurns||turns>ORIGINAL_WHEEL_SETTINGS.maximumTurns){
    throw new TypeError('Ungültige oder nicht zugeteilte Ziel-Episode.');
  }
  const arc=TAU/episodeCount;
  const desired=-(index+0.5)*arc;
  const phase=modulo(desired-currentRotation,TAU);
  // Der feste Zeiger steht bei 12 Uhr. Position des Mittelpunktes der
  // vorher gespeicherten Episode trifft nach jedem Spin exakt den Zeiger.
  const target=currentRotation+TAU*turns+phase;
  return {start:currentRotation,target,turns,phase};
}
