// =============================================================================
// PEOPLE FILTER — shared search/filter logic for Attendees & Room Share
// -----------------------------------------------------------------------------
// Attendees (flat list) and Room Share (grouped by room) render very
// differently, so this module only owns the matching/derivation logic and
// filter state — each screen keeps its own render tree and decides how to
// use the result (Attendees hides non-matching rows; Room Share hides rooms
// left with zero matching members).
// =============================================================================

import { useState } from 'react';

const COMBINING_DIACRITICS_RE = /[̀-ͯ]/g;

function stripDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS_RE, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function normalizeWhitespace(str) {
  return str.trim().replace(/\s+/g, ' ');
}

export function normalizeForSearch(str) {
  return stripDiacritics(normalizeWhitespace(str || '')).toLowerCase();
}

// Manages just the filter state (query/office/dept) — independent of
// whichever dataset (Attendees list, Room Share members) it's applied to.
export function usePeopleFilter() {
  const [query, setQuery] = useState('');
  const [office, setOffice] = useState('');
  const [dept, setDept] = useState('');

  // Dept options depend on the selected office, so a dept chosen under a
  // previous office is no longer meaningful once office changes.
  const handleOfficeChange = (nextOffice) => {
    setOffice(nextOffice);
    setDept('');
  };

  return { query, setQuery, office, setOffice: handleOfficeChange, dept, setDept };
}

// True when `person` matches the current name query AND the office/dept
// selection (an empty selection means "don't filter on this field").
export function personMatches(person, { query, office, dept }) {
  if (query) {
    const normalizedQuery = normalizeForSearch(query);
    if (normalizedQuery && !normalizeForSearch(person.name).includes(normalizedQuery)) {
      return false;
    }
  }
  if (office && person.office !== office) return false;
  if (dept && person.dept !== dept) return false;
  return true;
}

// Derives { offices, deptsByOffice } from a flat list of people, for driving
// the two hierarchical dropdowns. People with no office (e.g. family
// members) are skipped — there's nothing useful to filter them by.
export function getOfficeDeptOptions(people) {
  const offices = new Set();
  const deptsByOffice = {};
  for (const person of people) {
    if (!person.office) continue;
    offices.add(person.office);
    if (!person.dept) continue;
    if (!deptsByOffice[person.office]) deptsByOffice[person.office] = new Set();
    deptsByOffice[person.office].add(person.dept);
  }
  return {
    offices: [...offices].sort(),
    deptsByOffice: Object.fromEntries(
      Object.entries(deptsByOffice).map(([office, depts]) => [office, [...depts].sort()])
    ),
  };
}
