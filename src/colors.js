// =============================================================================
// EVENT HUB — BRAND COLOR CONSTANTS
// -----------------------------------------------------------------------------
// Edit these hex values to change the app's branding colors. They are used
// throughout the components via Tailwind arbitrary-value classes, e.g.
// className={`bg-[${COLORS.navy}]`}.
//
// Navy stays the dominant/brand color (header, bottom nav, primary buttons,
// tile backgrounds). Gold and sky blue are the two accents — apply them with
// intent rather than interchangeably:
//   - gold:    warm highlight — "Family" labels, badges, icon accents,
//              the "Upcoming now" card, anything that should visually pop.
//   - skyBlue: cool/interactive accent — links, focus rings, secondary
//              badges (e.g. group tags), "View on map"/"View menu" actions.
// =============================================================================

export const COLORS = {
  navy: '#0B2A4A',        // primary brand color (header, bottom nav, tiles)
  navyLight: '#15406B',   // gradient/hover companion to navy
  gold: '#C9A227',        // warm accent — highlights, badges, "pop" moments
  goldDeep: '#8A6C14',    // darker gold for text-on-gold-tint (contrast-safe)
  skyBlue: '#3B82C4',     // cool accent — interactive elements, links, focus
  background: '#F7F8FA',  // page/content background
  textDark: '#0B2A4A',    // primary text color

  // Nền trang (áp dụng toàn app, thay thế nền trắng hiện tại)
  pageBackground: '#F3F1EA',

  // Tile trang chủ & card nội dung trang con
  cardBackground: '#FCFAF5',
  cardBorder: '#E3D9B4',

  // Icon-badge nhóm 1 (skyBlue) — dùng cho: Chương trình, Chương trình thể thao, Ghép phòng
  badgeSkyBlueBg: '#E6F1FB',
  badgeSkyBlueIcon: '#185FA5',

  // Icon-badge nhóm 2 (gold) — dùng cho: Người tham dự, Đêm Gala, Lưu ý di chuyển
  badgeGoldBg: '#FAEEDA',
  badgeGoldIcon: '#854F0B',

  // Badge GROUP 1 / GROUP 2 trong trang Chương trình
  group1Bg: '#E6F1FB',
  group1Text: '#185FA5',
  group2Bg: '#DDEEF0',
  group2Text: '#0F6E56',
};
