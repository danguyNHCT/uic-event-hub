import { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';

const TABS = [
  { id: 'home', icon: '🏠', label: { en: 'Home', vi: 'Trang chủ' } },
  { id: 'contact', icon: '☎️', label: { en: 'Contact', vi: 'Liên hệ' } },
];

const SCROLL_EDGE_TOLERANCE_PX = 10;

// Whole page scrolls via window (no dedicated scroll container in this
// app) — true when the page is at its top or bottom edge (a page too
// short to scroll counts as "always at an edge", by construction below).
function isAtScrollEdge() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const clientHeight = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight;
  const atTop = scrollTop <= SCROLL_EDGE_TOLERANCE_PX;
  const atBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_EDGE_TOLERANCE_PX;
  return atTop || atBottom;
}

// Tracks whether the page is currently scrolled to an edge (top/bottom) or
// stuck in the middle. Only active while `enabled` — the Home screen
// doesn't need this at all (it's always "Full" regardless of scroll).
function useAtScrollEdge(enabled) {
  const [atEdge, setAtEdge] = useState(true);

  useEffect(() => {
    if (!enabled) return undefined;

    let rafId = null;
    const recompute = () => {
      rafId = null;
      setAtEdge(isAtScrollEdge());
    };
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(recompute);
    };

    recompute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  return atEdge;
}

// 3 states: Full (Home, always), Compact (elsewhere, scrolled to an edge —
// label only, no icon), Hidden (elsewhere, scrolled to the middle).
export default function BottomNav({ activeTab, onSelectTab, isHome }) {
  const { t } = useLanguage();
  const atEdge = useAtScrollEdge(!isHome);

  const isCompact = !isHome && atEdge;
  const isHidden = !isHome && !atEdge;

  const paddingBottomClass = isCompact
    ? 'pb-[max(0.5rem,env(safe-area-inset-bottom))]'
    : 'pb-[max(0.875rem,env(safe-area-inset-bottom))]';

  return (
    <nav
      className={`sticky bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 flex shadow-[0_-2px_8px_rgba(0,0,0,0.05)] transition-all duration-[250ms] ease-out ${paddingBottomClass} ${
        isHidden ? 'opacity-0 translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      {TABS.flatMap((tab, idx) => {
        const isActive = tab.id === activeTab;
        const button = (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center transition-all duration-[250ms] ease-out ${
              isCompact ? 'py-2' : 'py-3.5'
            }`}
          >
            {/* Pinned to the button's top edge, out of the flex flow, so it
                never shifts and never affects the icon+text centering. */}
            <span
              aria-hidden="true"
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-[3px] transition-colors duration-[250ms] ease-out ${
                isActive ? 'bg-[#C9A227]' : 'bg-transparent'
              }`}
            />
            <span className="flex flex-col items-center justify-center">
              <span
                aria-hidden="true"
                className={`flex items-center justify-center overflow-hidden transition-all duration-[250ms] ease-out ${
                  isCompact ? 'h-0 opacity-0' : 'h-6 opacity-100'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm leading-none ${
                    tab.id === 'home' ? 'bg-[#E6F1FB] text-[#185FA5]' : 'bg-[#FAEEDA] text-[#854F0B]'
                  }`}
                >
                  {tab.icon}
                </span>
              </span>
              <span
                className={`text-xs font-medium transition-all duration-[250ms] ease-out ${
                  isCompact ? 'mt-0' : 'mt-0.5'
                } ${isActive ? 'text-[#0B2A4A]' : 'text-gray-400'}`}
              >
                {t(tab.label)}
              </span>
            </span>
          </button>
        );

        if (idx === TABS.length - 1) return [button];
        return [
          button,
          <div key={`${tab.id}-divider`} aria-hidden="true" className="self-center w-[0.5px] h-11 bg-gray-200" />,
        ];
      })}
    </nav>
  );
}
