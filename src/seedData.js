// =============================================================================
// SEED DATA — Attendees & Room Share
// -----------------------------------------------------------------------------
// Attendees and Room Share are admin-editable, so they live in local
// persistent storage (see store.js) rather than this static file. This
// module only supplies the *initial* seed, copied straight from
// trip-data.json, used the first time the app runs on a device (or after
// local storage is cleared).
//
// If this later moves to a real backend (Firestore), a one-time seed script
// pushing SEED_ATTENDEES / SEED_ROOM_SHARE into the relevant collections
// would use this same shape.
// =============================================================================

import tripData from '../trip-data.json';

export const SEED_ATTENDEES = tripData.attendees;
export const SEED_ROOM_SHARE = tripData.roomShare;
