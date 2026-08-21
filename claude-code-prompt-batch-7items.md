# Task: UIC Event Hub — batch update (7 items, ordered by dependency)

## Context
Static React + Vite + Tailwind app, no backend, no login/admin (removed in v2). Deployed to Netlify via manual drag-and-drop of `dist`. Already has: auto-reload (`src/hooks/useAutoReload.js`), 2-item bottom nav (Home/Contact), 6 main tiles (Agenda, Attendees, SportProgram, GalaNight, RoomShare, TravelNotices).

**Work through the 7 items below IN THE ORDER GIVEN.** They are ordered so that later items build cleanly on earlier ones (e.g. new data fields are added before UI that reads them; language-toggle audit happens after all new content exists; color/spacing polish happens last so it covers everything, old and new). Do not reorder or parallelize — finish one item, then move to the next.

Before starting, read the actual current contents of relevant files (don't assume) — especially `content.js`, `seedData.js`, `colors.js`, `LanguageContext.jsx`, and each component file you touch.

---

## Item 1 — Remove "UIC" from all user-facing display text

- Search the entire `src/` tree for the literal string "UIC" (case-sensitive and case-insensitive) in any text that is actually rendered/displayed to the user — titles, headers, footers, labels, any screen.
- Remove just the "UIC" part, keep the rest of the surrounding text unchanged. E.g. "UIC Event Hub" → "Event Hub". Do this consistently everywhere it appears in EN and VI content alike.
- Do NOT touch: the GitHub repo name, the local folder name, the Netlify site name, variable names, comments, or any internal/code-only identifier — those are not user-facing and must stay as-is.
- Do NOT rename any component files or JS identifiers just because they contain "UIC" in code — this item is about display text only.

## Item 2 — Add Google Maps link and menu structure to Agenda data

- Find where Agenda items are defined (likely `content.js` or `seedData.js`) and identify entries that relate to a physical location.
- Add an optional field for a Google Maps link to each location-related Agenda item (e.g. `mapsUrl: ""` — leave it as an empty string / null placeholder; Long will provide real links later). Don't invent URLs.
- For Agenda items specifically about meals/dining, add an additional optional field for a text-based menu (e.g. `menu: []` as an empty array of strings, or similar simple structure — Long will provide actual menu content per meal later).
- Update the Agenda screen UI to conditionally show: a "View on map" affordance (e.g. a button/link icon) when `mapsUrl` is present and non-empty, and a "View menu" affordance when `menu` is present and non-empty. When these fields are empty/placeholder (as they will be right after this change), the UI should simply not show these affordances — don't show broken/empty buttons.
- Keep this data-structure change backward compatible — existing Agenda items without these new fields must continue to render exactly as before.

## Item 3 — "Upcoming now" section on Home screen

- Add a new section on `Home.jsx` that reads Agenda data and shows any event(s) starting within the next 1 hour, compared against Hanoi time (GMT+7) — not the device's local time. Compute "now" as UTC+7 explicitly rather than relying on `new Date()` local timezone, since users' phones may be in different timezones.
- When there is at least one such upcoming event: show this "Upcoming now" section at the top of the Home screen (above the 6 main tiles), and the 6 tiles move down below it — condensed/compacted so the whole thing still works on a phone screen (scrolling down to see all 6 tiles is acceptable here, per the earlier one-viewport work — this section takes priority for above-the-fold space).
- When there is no event in the next 1 hour: hide this section completely, and the 6 tiles display exactly as they currently do (no layout change in that case).
- This section should just display info (time, name, and if available, location) — no interactivity beyond what a simple info card needs. It doesn't need the Maps/menu affordances from Item 2 unless it's trivial to reuse that same rendering — use your judgment, but don't over-engineer this.

## Item 4 — Search and Office/Dept filter for Room Share and Attendees

Build ONE shared search/filter mechanism (e.g. a reusable hook or utility function) and use it in both `RoomShare.jsx` and `Attendees.jsx` — do not duplicate the logic across both files.

**Name search:**
- A search input at the top of each screen (above the existing content — for Room Share, above the Đợt 1/Đợt 2 tabs).
- Matching must be diacritic-insensitive (Vietnamese-aware): normalize both the query and the stored names by stripping diacritics before comparing (e.g. strip Vietnamese diacritics via NFD Unicode normalization + regex removal, a standard technique — implement it yourself, don't add a new npm dependency for this). Typing "thao" (no diacritics) must match "Thảo".
- Normalize whitespace before comparing: collapse multiple consecutive spaces into one, and trim leading/trailing spaces.

**Office → Dept hierarchical filter:**
- Two dropdowns/selectors: Office first, then Dept.
- The Dept options must be dynamically derived from which Dept values actually exist within the currently-selected Office (not a static full list) — i.e. Dept is dependent on Office, not an independent filter.
- When both are set, show only people matching both Office AND Dept.

**Display behavior when filtering (name search OR Office/Dept filter, or both combined):**
- Room Share: KEEP the existing grouped-by-Room layout (Room 1, Room 2, etc.) — just hide any Room card that ends up with zero matching members after filtering. Don't flatten the display into a plain list.
- Attendees: keep this screen's existing layout, just hide any row/entry that doesn't match.

## Item 5 — Travel Notices icons + full EN/VI audit

**Icons:** The Travel Notices screen has 4 sub-items, all currently showing the same airplane icon regardless of content. Give each sub-item a distinct, semantically appropriate icon based on what that sub-item is actually about (read the actual content of each of the 4 sub-items first, then pick fitting icons — e.g. if one is about transport-to-airport vs. transport-to-hotel vs. local shuttle vs. luggage/check-in, each should get its own relevant icon rather than reusing the plane icon for all 4).

**EN/VI audit (broader scope — whole app, not just Travel Notices):**
- There is a known bug: on the Travel Notices screen, toggling EN/VI does not actually change the displayed language — content stays in one language regardless of the toggle. Investigate the root cause (likely this screen is pulling text from a source that bypasses `LanguageContext.jsx`, e.g. hardcoded strings or reading directly from `seedData.js` instead of going through the translation/context mechanism the rest of the app uses) and fix it properly at the source, not by patching the display.
- Beyond fixing that specific screen, audit every other screen and every piece of user-facing text added or modified anywhere in this batch of work (including the new content from Items 1–4 above) to confirm it responds correctly to the EN/VI toggle. Flag and fix any other screen where you find hardcoded single-language text that should be translated.

## Item 6 — Netlify badge overlap fix

- The default Netlify deploy badge (bottom-right corner) currently overlaps or interferes with the bottom nav bar / page content on some screens.
- Fix this via appropriate CSS — e.g. add bottom padding/margin to the app's main content area so nothing sits underneath where the badge renders, and/or check z-index stacking so the badge doesn't visually collide with the bottom nav. Use your judgment on the exact CSS technique; the goal is that no app content or the bottom nav bar is ever visually obscured by the badge on any screen.

## Item 7 — Refresh color palette (do this LAST, after everything above)

- Current palette (`colors.js`) is almost entirely navy blue — flat and monotonous. Introduce 1–2 accent colors alongside the existing navy (e.g. a warm accent for highlights/badges/icons, keeping navy as the dominant/header color) to make the UI more visually engaging, without a full redesign.
- Since this step runs last, make sure the refreshed palette is applied consistently to EVERYTHING at this point — including any new UI elements added in Items 1–6 above (the "Upcoming now" card, the new search/filter controls, the new Maps/menu affordances, the updated Travel Notices icons) — not just the pre-existing screens. Do a final pass across all screens to confirm color consistency.
- Keep navy as the primary/brand color (header, bottom nav) — this is about adding tasteful accents, not replacing the identity.

---

## Final checks
- After all 7 items, run `npm run build` to confirm a clean build, and `npm run dev` for a manual sanity check.
- Summarize at the end: for each of the 7 items, what was changed and which files were touched. Flag anything you were unsure about or had to make a judgment call on.
