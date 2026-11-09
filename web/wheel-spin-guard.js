// Client-side display guard. An episode is never drawn or reallocated here.
// The target must be derived from an already published Firestore result.
export function canSpinStoredWheel({published, target, uid, roundId, spinning, episodes}) {
  return published === true && spinning === false && Boolean(uid && roundId) &&
    target?.uid === uid && target?.roundId === roundId &&
    typeof target.episodeId === 'string' && target.episodeId.length > 0 &&
    Number.isInteger(target.index) && Array.isArray(episodes) &&
    target.index >= 0 && target.index < episodes.length &&
    episodes[target.index]?.id === target.episodeId;
}
