// =============================================================================
// DATA SERVICE — Apps Script backend, with static fallback
// -----------------------------------------------------------------------------
// Talks to the Google Apps Script web app that reads/writes the trip's
// Google Sheet. `getAllData()` fetches + transforms everything into the
// shape the rest of the app already expects (same shape as trip-data.json
// via content.js/seedData.js); if that fails for any reason, the caller
// falls back to the static bundled data.
//
// All mutating admin actions (verifyPin/update/create/delete/rollback/
// reorder) POST a plain-text JSON body (no explicit Content-Type header) —
// Apps Script web apps don't handle CORS preflight, and setting
// Content-Type: application/json would force one. This is the standard,
// documented workaround.
// =============================================================================

import { APPS_SCRIPT_URL, ADMIN_PIN } from '../content';

const FETCH_TIMEOUT_MS = 8000;
const PERIOD_ORDER = ['Morning', 'Afternoon', 'Evening'];

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function postAction(body) {
  try {
    const res = await fetchWithTimeout(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch {
    return { success: false };
  }
}

// ---- row -> app-shape transforms -------------------------------------------

function toPersonObject(row, idx) {
  return {
    id: row.id,
    no: idx + 1,
    empCode: row.empCode || null,
    name: row.name,
    office: row.office || null,
    dept: row.dept || null,
    isFamily: !!row.isFamily,
  };
}

// NOTE: the spec says "sort by startTime" without mentioning date — taken
// literally, that sorts the WHOLE multi-day array by time-of-day alone,
// interleaving different dates (e.g. Sat 07:00 would sort before Fri
// 07:10). The timeline UI groups consecutive same-date rows, so date must
// be the primary sort key with startTime only breaking ties *within* a
// date. Date order = order of first appearance in the sheet's own `order`
// column (same rule GeneralAgenda's `days` list uses).
function transformDetailedAgenda(rows) {
  const byOrder = [...rows].sort((a, b) => a.order - b.order);
  const dateOrder = [];
  for (const row of byOrder) {
    const date = `${row.dayName}\n${row.dateShort}`;
    if (!dateOrder.includes(date)) dateOrder.push(date);
  }

  const withSortKey = rows.map((row) => {
    const date = `${row.dayName}\n${row.dateShort}`;
    return {
      id: row.id,
      date,
      time: row.endTime ? `${row.startTime} - ${row.endTime}` : row.startTime,
      group: row.group || null,
      activity: row.activity || null,
      note: row.note || null,
      mapsUrl: row.mapsUrl || undefined,
      menu: row.menu ? row.menu.split(';').filter(Boolean) : undefined,
      _dateIdx: dateOrder.indexOf(date),
      _order: row.order,
      _startTime: row.startTime,
    };
  });

  withSortKey.sort((a, b) => {
    if (a._dateIdx !== b._dateIdx) return a._dateIdx - b._dateIdx;
    if (!a._startTime && !b._startTime) return a._order - b._order;
    if (!a._startTime) return 1;
    if (!b._startTime) return -1;
    if (a._startTime === b._startTime) return a._order - b._order;
    return a._startTime < b._startTime ? -1 : 1;
  });

  return { rows: withSortKey.map(({ _dateIdx, _order, _startTime, ...row }) => row) };
}

function transformGeneralAgenda(rows) {
  const sorted = [...rows].sort((a, b) => a.order - b.order);

  const days = [];
  for (const row of sorted) {
    if (!days.includes(row.date)) days.push(row.date);
  }

  const tableRows = PERIOD_ORDER.map((period) => ({
    period,
    cells: days.map((day) =>
      sorted
        .filter((row) => row.period === period && row.date === day)
        .map((row) => (row.group ? `${row.group}: ${row.content}` : row.content))
        .join('\n')
    ),
  }));

  return { days, rows: tableRows };
}

function transformAttendees(rows) {
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  return {
    bookedByUIC: sorted.filter((row) => row.bookingType === 'bookedByUIC').map(toPersonObject),
    selfBooking: sorted.filter((row) => row.bookingType === 'selfBooking').map(toPersonObject),
  };
}

function transformRoomShare(rows) {
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  const byRoom = new Map();
  for (const row of sorted) {
    if (!byRoom.has(row.roomNo)) byRoom.set(row.roomNo, []);
    byRoom.get(row.roomNo).push(row);
  }
  return [...byRoom.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([roomNo, members]) => ({ roomNo, members: members.map(toPersonObject) }));
}

function transformTravelNotices(rows) {
  return [...rows]
    .sort((a, b) => a.order - b.order)
    .map((row) => ({ id: row.id, icon: row.icon, en: row.textEn, vi: row.textVi }));
}

function transformAnnouncements(rows) {
  return [...rows]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((row) => ({ id: row.id, content: row.content, startTime: row.startTime, endTime: row.endTime }));
}

// Full transform: Apps Script's raw { tabName: rows[] } -> the shape the
// rest of the app consumes. `generalAgendaRows` is kept alongside the
// transformed matrix — the admin flat-list/drag view (General Agenda) needs
// individual row ids that the merged matrix cells don't carry.
function transformAll(raw) {
  return {
    generalAgenda: transformGeneralAgenda(raw.GeneralAgenda ?? []),
    generalAgendaRows: [...(raw.GeneralAgenda ?? [])].sort((a, b) => a.order - b.order),
    detailedAgenda: {
      trip1: transformDetailedAgenda(raw.DetailedAgenda_Trip1 ?? []),
      trip2: transformDetailedAgenda(raw.DetailedAgenda_Trip2 ?? []),
    },
    attendees: {
      trip1: transformAttendees(raw.Attendees_Trip1 ?? []),
      trip2: transformAttendees(raw.Attendees_Trip2 ?? []),
    },
    roomShare: {
      trip1: transformRoomShare(raw.RoomShare_Trip1 ?? []),
      trip2: transformRoomShare(raw.RoomShare_Trip2 ?? []),
    },
    travelNotices: transformTravelNotices(raw.TravelNotices ?? []),
    announcements: transformAnnouncements(raw.Announcements ?? []),
  };
}

const REQUIRED_TABS = [
  'GeneralAgenda',
  'DetailedAgenda_Trip1',
  'DetailedAgenda_Trip2',
  'Attendees_Trip1',
  'Attendees_Trip2',
  'RoomShare_Trip1',
  'RoomShare_Trip2',
  'TravelNotices',
  'Announcements',
];

// Fetches + transforms all data. Returns { ok: true, data } on success, or
// { ok: false } on any failure (network error, timeout, success:false, or a
// response missing an expected tab) — callers fall back to static data.
export async function getAllData() {
  try {
    const res = await fetchWithTimeout(`${APPS_SCRIPT_URL}?action=getAll`);
    if (!res.ok) return { ok: false };
    const json = await res.json();
    if (!json.success || !json.data) return { ok: false };
    if (!REQUIRED_TABS.every((tab) => Array.isArray(json.data[tab]))) return { ok: false };
    return { ok: true, data: transformAll(json.data) };
  } catch {
    return { ok: false };
  }
}

export async function verifyPin(pin) {
  const result = await postAction({ action: 'verifyPin', pin });
  return result?.valid === true;
}

export async function updateRow(targetTab, rowId, rowData) {
  return postAction({ action: 'update', pin: ADMIN_PIN, targetTab, rowId, rowData });
}

export async function createRow(targetTab, rowData, insertAt = 'end') {
  return postAction({ action: 'create', pin: ADMIN_PIN, targetTab, rowData, insertAt });
}

export async function deleteRow(targetTab, rowId) {
  return postAction({ action: 'delete', pin: ADMIN_PIN, targetTab, rowId });
}

export async function rollbackEdit(editHistoryId) {
  return postAction({ action: 'rollback', pin: ADMIN_PIN, editHistoryId });
}

export async function reorderRows(targetTab, orderedIds) {
  return postAction({ action: 'reorder', pin: ADMIN_PIN, targetTab, orderedIds });
}
