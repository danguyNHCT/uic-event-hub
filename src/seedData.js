// =============================================================================
// SEED DATA — Attendees & Room Share
// -----------------------------------------------------------------------------
// Read-only attendee and room-share lists, copied straight from
// trip-data.json — kept in a separate module purely for naming clarity.
// =============================================================================

import tripData from '../trip-data.json';

export const SEED_ATTENDEES = tripData.attendees;
export const SEED_ROOM_SHARE = tripData.roomShare;
