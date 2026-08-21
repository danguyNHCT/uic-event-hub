# Task: Fix vertical alignment in Agenda rows

## Problem
In the Agenda screen, each row has 3 elements side by side: a time-of-day label (MORNING/AFTERNOON/EVENING — width already fixed in a previous fix), an optional GROUP badge, and the activity text. These 3 elements are not vertically centered relative to each other within the row — the time label sits visibly higher than the center of the GROUP badge and activity text next to it. This should be true for every row (with or without a GROUP badge present).

## Fix
- In `Agenda.jsx` (the row rendering, likely the same `GeneralAgendaTable`-style structure touched in the previous width fix), find the flex container for each row and ensure it uses proper vertical centering (e.g. `items-center` in Tailwind, or `align-items: center` if plain CSS) so the time label, the GROUP badge, and the activity text all share the same horizontal center line.
- Check both row variants — rows with a GROUP badge (e.g. "GROUP 1 | Arrive at Quy Nhon") and rows without one (e.g. "SPORT ACTIVITIES", "GALA DINNER", "END TRIP") — both should have their time label vertically centered relative to whatever content sits next to it.
- Apply this consistently to every row across all days/dates in the Agenda, and in both the General/Overview tab and the Trip 1/Trip 2 tabs if they share the same row component.
- Don't change the column width, spacing, or anything else already fixed in the previous pass — this is purely about vertical centering within the row.

## Verification
- Run `npm run dev` and visually inspect the Agenda screen (General tab and at least one Trip tab) to confirm all 3 elements in each row line up on the same horizontal center, for rows both with and without a GROUP badge.
- Run `npm run build` to confirm a clean build.
