import { useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useAdmin } from '../AdminContext';
import PinModal from './admin/PinModal';
import OfflineBanner from './admin/OfflineBanner';

const TRIPLE_TAP_WINDOW_MS = 2000;

export default function Header({ title, subtitle }) {
  const { lang, toggleLang } = useLanguage();
  const { isAdminMode } = useAdmin();
  const [showPinModal, setShowPinModal] = useState(false);
  const tapTimestampsRef = useRef([]);

  // 3 taps on the header within 2s opens the admin PIN prompt.
  const handleHeaderTap = () => {
    if (isAdminMode) return;
    const now = Date.now();
    const recentTaps = tapTimestampsRef.current.filter((ts) => now - ts < TRIPLE_TAP_WINDOW_MS);
    recentTaps.push(now);
    tapTimestampsRef.current = recentTaps;
    if (recentTaps.length >= 3) {
      tapTimestampsRef.current = [];
      setShowPinModal(true);
    }
  };

  return (
    <div>
      <div className="bg-[#0B2A4A] px-5 pt-5 pb-4 text-white relative" onClick={handleHeaderTap}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLang();
          }}
          className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
          aria-label="Toggle language"
        >
          {lang === 'vi' ? 'VI / EN' : 'EN / VI'}
        </button>
        <h1 className="text-xl font-bold pr-20 rounded-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-white/80 mt-1">{subtitle}</p>}
      </div>
      <OfflineBanner />
      {showPinModal && <PinModal onClose={() => setShowPinModal(false)} />}
    </div>
  );
}
