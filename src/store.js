// =============================================================================
// LOCAL PERSISTENT STORE
// -----------------------------------------------------------------------------
// Stand-in for a future Firestore-backed store (no Firebase project is wired
// up yet). Data is persisted to localStorage per-device only — it is NOT
// shared across attendees' devices. Consumers use the same
// [value, setValue] shape a Firestore-backed hook would expose, so swapping
// the implementation later shouldn't require touching component code.
// =============================================================================

import { useState, useCallback } from 'react';

function readStorage(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) return JSON.parse(raw);
  } catch {
    // corrupt or inaccessible storage — fall back to seed
  }
  return seed;
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // e.g. quota exceeded, or storage disabled
  }
}

// Always pass the fully-resolved next value (not an updater function) —
// callers already have the current value from this hook's return.
// Returns [value, setValue] where setValue(next) returns true/false for
// whether the write to storage succeeded (UI state updates either way).
export function usePersistentState(key, seed) {
  const [value, setValue] = useState(() => readStorage(key, seed));

  const set = useCallback(
    (next) => {
      const ok = writeStorage(key, next);
      setValue(next);
      return ok;
    },
    [key]
  );

  return [value, set];
}
