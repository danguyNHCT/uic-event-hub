// =============================================================================
// UIC COMPANY TRIP 2026 — CONTENT FILE
// -----------------------------------------------------------------------------
// Static, rarely-changing trip content (trip info, agenda, travel notices).
// Sourced directly from trip-data.json at the project root — edit that file
// and these exports pick up the change automatically, no need to retype data.
//
// Attendees and Room Share are NOT here: they are admin-editable, so they
// live in local persistent storage instead (see seedData.js + store.js).
// =============================================================================

import tripData from '../trip-data.json';

export const TRIP_INFO = tripData.tripInfo;
export const GENERAL_AGENDA = tripData.generalAgenda;
export const DETAILED_AGENDA = tripData.detailedAgenda;
export const TRAVEL_NOTICES = tripData.travelNotices;

// Placeholder PIN gating the admin edit mode (Attendees / Room Share editing,
// Photo Walls / Chat moderation). Replace with a real PIN before real use —
// this is a client-side UI gate only, not real authentication/security.
export const ADMIN_PIN = '0000';
