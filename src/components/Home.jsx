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

      <div className="px-4 pt-5">
        <p className="text-sm text-gray-500 leading-relaxed">{TRIP_INFO.welcomeMessage}</p>
      </div>

      <div className="px-4 pt-5 pb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t({ en: 'Explore', vi: 'Khám phá' })}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {GRID_TILES.map((tile) => (
            <button
              key={tile.id}
              onClick={() => onNavigateTile(tile.id)}
              className="rounded-2xl shadow-sm p-4 text-left bg-[#0B2A4A] text-white flex flex-col gap-4 aspect-square justify-between"
            >
              <span className="text-2xl">{tile.icon}</span>
              <span className="text-sm font-semibold leading-snug">{t(tile.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
