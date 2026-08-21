# Task: Fix Agenda time label alignment — align to FIRST row only, not the whole group block

## Context
Previous fix made the time-of-day label (MORNING/AFTERNOON/EVENING) vertically centered — but it centered the label against the ENTIRE block of content for that time period, which is wrong when a period has multiple sub-rows (e.g. "Sat, 5 Sep — MORNING" has two rows: "GROUP 1 | Local Tour" and "GROUP 2 | Arrive at Quy Nhon"). The label ended up vertically centered between both rows, rather than aligned with the first row.

## Required behavior
When a time period (MORNING/AFTERNOON/EVENING) has multiple content rows (multiple GROUP entries) stacked under it:
- The time-of-day label should align with (vertically center against) ONLY the FIRST content row in that group — not the midpoint of the whole stacked block.
- The label is NOT repeated for subsequent rows in the same time period (this part is already correct — e.g. "GROUP 2 | Arrive at Quy Nhon" currently has no repeated "MORNING" label, which is correct and should stay that way).
- Subsequent rows (2nd, 3rd GROUP entries) should be indented/aligned under the content column, without their own time label, exactly as currently shown — only the vertical position of the FIRST row needs to align with the label.

When a time period has only ONE content row (e.g. "AFTERNOON — SPORT ACTIVITIES" with no GROUP badge), the existing single-row vertical-center fix from the previous pass is already correct and should remain unchanged.

## Implementation approach
- In the Agenda row rendering, restructure so the time-of-day label is only vertically centered against the first sub-row's height, not the full multi-row block's height. This likely means the label needs `align-self: flex-start` (or similar) within a container that centers it against just the first row's own flex/grid cell, rather than being centered against a parent that spans multiple rows — or alternatively, wrap the label + first row together in their own inner flex container, separate from subsequent rows.
- Apply consistently across all days and all periods that have multiple GROUP rows (check "Sat, 5 Sep", "Sun, 6 Sep" — both have periods with 2 rows, per the reference screenshot) as well as periods with only 1 row (should remain correctly centered as before).

## Verification
- Run `npm run dev`, check the Agenda screen (General tab): confirm "MORNING" on Sat 5 Sep aligns with "GROUP 1 | Local Tour" (the first row), not centered between it and "GROUP 2 | Arrive at Quy Nhon". Check the same pattern on Sun 6 Sep (both MORNING and AFTERNOON have 2 rows there).
- Confirm single-row periods (e.g. "AFTERNOON — SPORT ACTIVITIES", "EVENING — GALA DINNER") still look correctly centered as fixed previously.
- Run `npm run build` to confirm a clean build.
