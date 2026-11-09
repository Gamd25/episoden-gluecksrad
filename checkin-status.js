// A missing Firestore snapshot is not proof that a teacher removed a check-in.
// Only a previously server-observed membership followed by independent server
// verification of its absence is a reason to return to the registration form.
// This module does not write any data and does not decide an episode.
export function createMembershipWitness({alreadyVerified = false} = {}) {
  let witnessedOnServer = Boolean(alreadyVerified);
  return {
    observe({exists, fromCache}) {
      if (exists) {
        if (!fromCache) witnessedOnServer = true;
        return 'present';
      }
      if (fromCache) return 'ignore-cache';
      return witnessedOnServer ? 'verify-absence' : 'await-confirmation';
    },
    serverConfirmed() { witnessedOnServer = true; },
    hasServerWitness() { return witnessedOnServer; }
  };
}
