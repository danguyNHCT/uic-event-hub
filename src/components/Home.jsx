import { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import Header from './Header';
import { TRIP_INFO, DETAILED_AGENDA } from '../content';

const GRID_TILES = [
  { id: 'agenda', icon: '📅', label: { en: 'Agenda', vi: 'Chương trình' } },
  { id: 'attendees', icon: '👥', label: { en: 'Attendees', vi: 'Người tham dự' } },
  { id: 'sport', icon: '🏓', label: { en: 'Sport Program', vi: 'Chương trình thể thao' } },
  { id: 'gala', icon: '🎉', label: { en: 'Gala Night', vi: 'Đêm Gala' } },
  { id: 'roomshare', icon: '🛏️', label: { en: 'Room Share', vi: 'Ghép phòng' } },
  { id: 'travel', icon: '✈️', label: { en: 'Travel Notices', vi: 'Lưu ý di chuyển' } },
];

// Agenda dates ("Friday\n04/09") have no year — the whole trip is Sep 2026.
const EVENT_YEAR = 2026;
const HANOI_UTC_OFFSET_HOURS = 7;
const ONE_HOUR_MS = 60 * 60 * 1000;

// Returns the event's start time as an absolute UTC epoch ms value, computed
// from its Hanoi (UTC+7) wall-clock date/time — never the device's local
// timezone, so this is correct no matter where the viewer's phone is set.
function getEventStartMs(row) {
  if (!row.date || !row.time) return null;
  const dayMonth = row.date.split('\n')[1];
  if (!dayMonth) return null;
  const [day, month] = dayMonth.split('/').map(Number);
  const startTime = row.time.split('-')[0].trim();
  const [hour, minute] = startTime.split(':').map(Number);
  if ([day, month, hour, minute].some((n) => Number.isNaN(n))) return null;
  return Date.UTC(EVENT_YEAR, month - 1, day, hour - HANOI_UTC_OFFSET_HOURS, minute);
}

function getUpcomingEvents(nowMs) {
  const allRows = [...DETAILED_AGENDA.trip1.rows, ...DETAILED_AGENDA.trip2.rows];
  const seen = new Set();
  const upcoming = [];
  for (const row of allRows) {
    if (!row.activity) continue;
    const startMs = getEventStartMs(row);
    if (startMs === null || startMs < nowMs || startMs - nowMs > ONE_HOUR_MS) continue;
    const dedupeKey = `${row.date}|${row.time}|${row.activity}|${row.note ?? ''}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    upcoming.push({ ...row, startMs });
  }
  return upcoming.sort((a, b) => a.startMs - b.startMs);
}

function UpcomingNow({ events }) {
  const { t } = useLanguage();
  if (events.length === 0) return null;

  return (
    <div className="px-4 pt-3">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {t({ en: 'Upcoming now', vi: 'Sắp diễn ra' })}
      </h2>
      <div className="flex flex-col gap-2">
        {events.map((event, idx) => (
          <div key={idx} className="rounded-2xl shadow-sm p-3 bg-[#C9A227]/15 border border-[#C9A227]/40">
            <div className="text-xs font-semibold text-[#8a6c14]">{event.time}</div>
            <div className="text-sm font-semibold text-[#0B2A4A] mt-0.5 whitespace-pre-line">
              {event.activity}
            </div>
            {event.note && <div className="text-xs text-gray-500 mt-1">📍 {event.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home({ onNavigateTile }) {
  const { t } = useLanguage();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(intervalId);
  }, []);

  const upcomingEvents = getUpcomingEvents(nowMs);

  return (
    <div>
      <Header title={t(TRIP_INFO.name)} subtitle={`${t(TRIP_INFO.dateRange)} · ${t(TRIP_INFO.destination)}`} />

      <div className="px-4 pt-3">
        <p className="text-xs text-gray-500 leading-relaxed">{t(TRIP_INFO.welcomeMessage)}</p>
      </div>

      <UpcomingNow events={upcomingEvents} />

      <div className="px-4 pt-3 pb-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {t({ en: 'Explore', vi: 'Khám phá' })}
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {GRID_TILES.map((tile, idx) => (
            <button
              key={tile.id}
              onClick={() => onNavigateTile(tile.id)}
              className="rounded-2xl shadow-sm p-3 text-left bg-[#0B2A4A] text-white flex flex-col gap-2 aspect-[4/3] justify-between"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
                  idx % 2 === 0 ? 'bg-[#C9A227]/40' : 'bg-[#3B82C4]/40'
                }`}
              >
                {tile.icon}
              </span>
              <span className="text-xs font-semibold leading-snug">{t(tile.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
