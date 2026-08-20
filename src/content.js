// =============================================================================
// UIC COMPANY TRIP 2026 — CONTENT FILE
// -----------------------------------------------------------------------------
// Static, rarely-changing trip content (trip info, agenda, travel notices).
// Sourced directly from trip-data.json at the project root — edit that file
// and these exports pick up the change automatically, no need to retype data.
//
// Attendees and Room Share are NOT here: they live in seedData.js instead.
// =============================================================================

import tripData from '../trip-data.json';

export const TRIP_INFO = tripData.tripInfo;
export const GENERAL_AGENDA = tripData.generalAgenda;
export const DETAILED_AGENDA = tripData.detailedAgenda;
export const TRAVEL_NOTICES = tripData.travelNotices;
