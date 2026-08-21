# Task: Fix 2 independent UI bugs

Work through both items below. They are unrelated — fix each independently, don't let one influence the other.

---

## Bug 1 — iOS Safari auto-zoom on search input focus

**Problem:** On Room Share and Attendees screens, tapping into the name search input causes the page to visually zoom in on iOS/Safari. This is standard iOS Safari behavior: it auto-zooms any focused text input whose computed `font-size` is below 16px. It is a CSS issue, not a JS bug.

**Fix:**
- Find the search input component (likely `src/components/PeopleFilterBar.jsx`, from the recent search/filter feature) and ensure its `font-size` is explicitly set to at least `16px` (use an explicit `16px` value, not a relative unit like `1em`/`0.9rem` that could resolve below 16px depending on the app's base font size).
- Since this is a shared component used by both Room Share and Attendees, one fix should cover both — confirm both screens are covered.
- If 16px no longer fits well within the input's current height/padding, make a minimal padding adjustment to keep it looking clean, but don't otherwise redesign the input's appearance.
- This can only be fully verified on an actual iOS device (Chrome DevTools emulation does not reproduce Safari's auto-zoom). Note this in your summary.

## Bug 2 — Agenda time-of-day column overlapping content

**Problem:** On the Agenda screen, the time-of-day label column (MORNING / AFTERNOON / EVENING) is not a fixed width, so rows with the longer word "AFTERNOON" have their label text overlapping or crowding into the adjacent content column (the GROUP badge + activity text). "MORNING" and "EVENING" rows look fine since those words are shorter, but "AFTERNOON" visibly collides with the box next to it.

**Fix:**
- In the Agenda component (`src/components/Agenda.jsx` or wherever this row layout is defined), give the time-of-day label column a fixed width sufficient to comfortably fit "AFTERNOON" (the longest of the three labels) without wrapping or touching the adjacent content.
- Apply this fixed width consistently to all three label variants (MORNING/AFTERNOON/EVENING) so all rows align to the same column boundary regardless of which label is used — the goal is consistent, evenly-spaced rows throughout the Agenda, in both EN and VI (check the Vietnamese labels too, e.g. "SÁNG"/"CHIỀU"/"TỐI" or similar — pick a width that works for whichever language variant is longer).
- Don't change anything else about the Agenda layout — this is purely a column-width/alignment fix.

---

## Final checks
- Run `npm run build` to confirm a clean build after both fixes.
- Run `npm run dev` for a visual sanity check of Bug 2 (Agenda alignment) in the browser — this one IS visible locally, unlike Bug 1.
- Summarize what was changed for each bug.
