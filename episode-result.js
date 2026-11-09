// Read-only presentation of an already published server assignment.
// Neither localStorage nor the wheel animation ever allocates an episode.
export function resolveStoredAssignment(result, episodes, uid){
  if(!result || result.authUid!==uid)throw new Error('Die Zuteilung stimmt nicht mit deiner Anmeldung überein.');
  if(!Array.isArray(episodes) || !episodes.length)throw new Error('Keine veröffentlichten Episoden vorhanden.');
  const index=episodes.findIndex(e=>e && e.id===result.episodeId);
  if(index<0 || typeof episodes[index].label!=='string' || !episodes[index].label.trim()){
    throw new Error('Die freigegebene Episode ist nicht in der Radliste enthalten.');
  }
  return {index,episodeId:result.episodeId,label:episodes[index].label};
}
export function visitedWheelKey(roundId,uid){
  return `episoden-wheel-seen:v4:${roundId}:${uid}`;
}
