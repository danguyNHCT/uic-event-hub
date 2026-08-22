// =============================================================================
// UIC COMPANY TRIP 2026
// -----------------------------------------------------------------------------
// This app was scaffolded via Claude Code.
// To customize:
//   - Edit trip-data.json for agenda/attendees/room share/travel notices —
//     content.js and seedData.js both read from it directly.
//   - Edit colors.js (COLORS constants) for branding colors.
// =============================================================================

import { useState } from 'react';
import { LanguageProvider } from './LanguageContext';
import { DataProvider } from './DataContext';
import { AdminProvider, useAdmin } from './AdminContext';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import Contact from './components/Contact';
import Agenda from './components/Agenda';
import Attendees from './components/Attendees';
import SportProgram from './components/SportProgram';
import GalaNight from './components/GalaNight';
import RoomShare from './components/RoomShare';
import TravelNotices from './components/TravelNotices';

// Sub-screens reachable from Home's grid tiles. Each has a back button that
// returns to Home.
const SUB_SCREENS = {
  agenda: Agenda,
  attendees: Attendees,
  sport: SportProgram,
  gala: GalaNight,
  roomshare: RoomShare,
  travel: TravelNotices,
};

// Static (non-pulsing) pink border pinned to the viewport for the entire
// duration of Admin Edit Mode — a persistent visual reminder that edits are
// live, independent of scroll position.
function AdminModeBorder() {
  const { isAdminMode } = useAdmin();
  if (!isAdminMode) return null;
  return <div className="fixed inset-0 pointer-events-none z-[9999] border-[5px] border-[#F9C6D3]" />;
}

function AppShell() {
  const [tab, setTab] = useState('home');
  const [subScreen, setSubScreen] = useState(null);

  const handleSelectTab = (nextTab) => {
    setSubScreen(null);
    setTab(nextTab);
    window.scrollTo(0, 0);
  };

  const handleNavigateTile = (screenId) => {
    setSubScreen(screenId);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setSubScreen(null);
    setTab('home');
    window.scrollTo(0, 0);
  };

  let content;
  if (subScreen) {
    const SubScreenComponent = SUB_SCREENS[subScreen];
    content = <SubScreenComponent onBack={handleBackToHome} />;
  } else {
    switch (tab) {
      case 'contact':
        content = <Contact />;
        break;
      case 'home':
      default:
        content = <Home onNavigateTile={handleNavigateTile} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F1EA] flex justify-center">
      <AdminModeBorder />
      <div className="w-full max-w-[480px] min-h-screen bg-[#F3F1EA] flex flex-col">
        <div className="flex-1 pb-2">{content}</div>
        <BottomNav
          activeTab={subScreen ? 'home' : tab}
          onSelectTab={handleSelectTab}
          isHome={!subScreen && tab === 'home'}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <AdminProvider>
          <AppShell />
        </AdminProvider>
      </DataProvider>
    </LanguageProvider>
  );
}
