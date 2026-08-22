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
import { AdminProvider } from './AdminContext';
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

function AppShell() {
  const [tab, setTab] = useState('home');
  const [subScreen, setSubScreen] = useState(null);

  const handleSelectTab = (nextTab) => {
    setSubScreen(null);
    setTab(nextTab);
  };

  const handleNavigateTile = (screenId) => {
    setSubScreen(screenId);
  };

  const handleBackToHome = () => {
    setSubScreen(null);
    setTab('home');
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
    <div className="min-h-screen bg-[#F7F8FA] flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-[#F7F8FA] flex flex-col">
        <div className="flex-1 pb-2">{content}</div>
        <BottomNav activeTab={subScreen ? 'home' : tab} onSelectTab={handleSelectTab} />
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
