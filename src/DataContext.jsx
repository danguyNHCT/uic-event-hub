import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GENERAL_AGENDA, DETAILED_AGENDA, TRAVEL_NOTICES } from './content';
import { SEED_ATTENDEES, SEED_ROOM_SHARE } from './seedData';
import { getAllData } from './services/dataService';
import { useAutoReload } from './hooks/useAutoReload';
import { COLORS } from './colors';

// Static fallback, same shape the transformed Apps Script data resolves to.
// `generalAgendaRows` (flat, with row ids) has no static equivalent — it's
// only used by the admin drag-reorder view, and admin mode can't be entered
// at all while offline (verifyPin also requires the backend), so this is
// never actually read in fallback mode.
const STATIC_DATA = {
  generalAgenda: GENERAL_AGENDA,
  generalAgendaRows: [],
  detailedAgenda: DETAILED_AGENDA,
  attendees: SEED_ATTENDEES,
  roomShare: SEED_ROOM_SHARE,
  travelNotices: TRAVEL_NOTICES,
  announcements: [],
};

const DataContext = createContext(null);

// Simple placeholder shown only while the very first fetch is in flight —
// avoids flashing stale STATIC_DATA before the real data (or the offline
// fallback) is known. No animation, just block shapes in app colors.
function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex justify-center" style={{ backgroundColor: COLORS.pageBackground }}>
      <div className="w-full max-w-[480px] min-h-screen flex flex-col gap-3 p-4">
        <div className="h-16 rounded-2xl" style={{ backgroundColor: COLORS.cardBackground }} />
        <div className="h-24 rounded-2xl" style={{ backgroundColor: COLORS.cardBackground }} />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 rounded-2xl" style={{ backgroundColor: COLORS.cardBackground }} />
          <div className="h-28 rounded-2xl" style={{ backgroundColor: COLORS.cardBackground }} />
          <div className="h-28 rounded-2xl" style={{ backgroundColor: COLORS.cardBackground }} />
          <div className="h-28 rounded-2xl" style={{ backgroundColor: COLORS.cardBackground }} />
        </div>
      </div>
    </div>
  );
}

// Fetches all trip data from the Apps Script backend on mount and every
// ~60s after (reusing useAutoReload's existing interval rather than a
// second parallel one). Falls back to the static bundled data — and flags
// isOfflineMode — whenever the backend can't be reached.
export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const refreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const result = await getAllData();
      if (result.ok) {
        setData(result.data);
        setIsOfflineMode(false);
      } else {
        setData(STATIC_DATA);
        setIsOfflineMode(true);
      }
    } finally {
      refreshingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useAutoReload(refresh);

  if (isLoading || !data) {
    return <LoadingSkeleton />;
  }

  return <DataContext.Provider value={{ ...data, isOfflineMode, refresh }}>{children}</DataContext.Provider>;
}

export function useTripData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useTripData must be used within a DataProvider');
  return ctx;
}
