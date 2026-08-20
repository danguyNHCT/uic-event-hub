import { useLanguage } from '../LanguageContext';
import Header from './Header';
import { TRIP_INFO } from '../content';

const GRID_TILES = [
  { id: 'agenda', icon: '📅', label: { en: 'Agenda', vi: 'Chương trình' } },
  { id: 'attendees', icon: '👥', label: { en: 'Attendees', vi: 'Người tham dự' } },
  { id: 'sport', icon: '🏓', label: { en: 'Sport Program', vi: 'Chương trình thể thao' } },
  { id: 'gala', icon: '🎉', label: { en: 'Gala Night', vi: 'Đêm Gala' } },
  { id: 'roomshare', icon: '🛏️', label: { en: 'Room Share', vi: 'Ghép phòng' } },
  { id: 'travel', icon: '✈️', label: { en: 'Travel Notices', vi: 'Lưu ý di chuyển' } },
];

export default function Home({ onNavigateTile }) {
  const { t } = useLanguage();

  return (
    <div>
      <Header title={TRIP_INFO.name} subtitle={`${TRIP_INFO.dateRange} · ${TRIP_INFO.destination}`} />

      <div className="px-4 pt-3">
        <p className="text-xs text-gray-500 leading-relaxed">{TRIP_INFO.welcomeMessage}</p>
      </div>

      <div className="px-4 pt-3 pb-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {t({ en: 'Explore', vi: 'Khám phá' })}
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {GRID_TILES.map((tile) => (
            <button
              key={tile.id}
              onClick={() => onNavigateTile(tile.id)}
              className="rounded-2xl shadow-sm p-3 text-left bg-[#0B2A4A] text-white flex flex-col gap-2 aspect-[4/3] justify-between"
            >
              <span className="text-xl">{tile.icon}</span>
              <span className="text-xs font-semibold leading-snug">{t(tile.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
