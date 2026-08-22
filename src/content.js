// =============================================================================
// UIC COMPANY TRIP 2026 — CONTENT FILE
// -----------------------------------------------------------------------------
// Static, rarely-changing trip content (trip info, agenda, travel notices).
// Sourced directly from trip-data.json at the project root — edit that file
// and these exports pick up the change automatically, no need to retype data.
//
// Attendees and Room Share are NOT here: they live in seedData.js instead.
//
// GENERAL_AGENDA / DETAILED_AGENDA / TRAVEL_NOTICES below (and the seed data
// in seedData.js) now serve as the STATIC FALLBACK only — the live source of
// truth is the Apps Script backend (see src/services/dataService.js), used
// whenever it's reachable. This file's data is what the app falls back to
// when that backend can't be reached.
// =============================================================================

import tripData from '../trip-data.json';

export const TRIP_INFO = tripData.tripInfo;
export const GENERAL_AGENDA = tripData.generalAgenda;
export const DETAILED_AGENDA = tripData.detailedAgenda;
export const TRAVEL_NOTICES = tripData.travelNotices;

// The trip only spans these 4 fixed calendar days — used by both
// DetailedAgenda's date select (Agenda.jsx) and Announcements' start/end
// date select (AnnouncementsManager.jsx), so admin date pickers never allow
// a value that could be auto-converted/misparsed by Google Sheets.
export const FIXED_TRIP_DATES = [
  { dayName: 'Friday', dateShort: '04/09', isoDate: '2026-09-04' },
  { dayName: 'Saturday', dateShort: '05/09', isoDate: '2026-09-05' },
  { dayName: 'Sunday', dateShort: '06/09', isoDate: '2026-09-06' },
  { dayName: 'Monday', dateShort: '07/09', isoDate: '2026-09-07' },
];

// Admin backend (Google Apps Script bound to the trip's Google Sheet).
// Replace ADMIN_PIN here if it's ever rotated on the backend side too.
export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxQi1BSQfPIpvJ3HuUr4w_o8QWmP4lfYppL0seBPKhWPDGe9hSppqbAxsPz7dDPeG24/exec';
export const ADMIN_PIN = '9292';
