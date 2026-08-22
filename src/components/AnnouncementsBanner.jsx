import { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useAdmin } from '../AdminContext';
import { useTripData } from '../DataContext';
import { COLORS } from '../colors';
import AnnouncementsManager from './AnnouncementsManager';

function isActive(announcement, nowMs) {
  const start = announcement.startTime ? new Date(announcement.startTime).getTime() : NaN;
  const end = announcement.endTime ? new Date(announcement.endTime).getTime() : NaN;
  if (!Number.isNaN(start) && nowMs < start) return false;
  if (!Number.isNaN(end) && nowMs > end) return false;
  return true;
}

// Highest element on the Home screen, above "Upcoming now" and the tile
// grid. Renders nothing (no reserved space) when no announcement is active.
export default function AnnouncementsBanner() {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();
  const { announcements } = useTripData();
  const [showManager, setShowManager] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(intervalId);
  }, []);

  const active = announcements.filter((a) => isActive(a, nowMs));

  if (active.length === 0 && !isAdminMode) return null;

  return (
    <div className="px-4 pt-3">
      {isAdminMode && (
        <button
          onClick={() => setShowManager(true)}
          className="text-xs font-semibold text-[#3B82C4] mb-1.5"
        >
          📢 {t({ en: 'Manage announcements', vi: 'Quản lý thông báo' })}
        </button>
      )}
      {active.length > 0 && (
        <div className="flex flex-col gap-2">
          {active.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl shadow-sm p-3 flex items-start gap-2"
              style={{ backgroundColor: COLORS.warningBg, color: COLORS.warningText }}
            >
              <span className="text-base leading-none">📢</span>
              <p className="text-sm font-semibold whitespace-pre-line">{a.content}</p>
            </div>
          ))}
        </div>
      )}
      {showManager && <AnnouncementsManager onClose={() => setShowManager(false)} />}
    </div>
  );
}
