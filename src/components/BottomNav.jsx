import { useLanguage } from '../LanguageContext';

const TABS = [
  { id: 'home', icon: '🏠', label: { en: 'Home', vi: 'Trang chủ' } },
  { id: 'contact', icon: '☎️', label: { en: 'Contact', vi: 'Liên hệ' } },
];

export default function BottomNav({ activeTab, onSelectTab }) {
  const { t } = useLanguage();

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 flex shadow-[0_-2px_8px_rgba(0,0,0,0.05)] pb-[max(0.875rem,env(safe-area-inset-bottom))]">
      {TABS.flatMap((tab, idx) => {
        const isActive = tab.id === activeTab;
        const button = (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className="flex-1 flex flex-col items-center py-3.5 transition-colors"
          >
            <span
              aria-hidden="true"
              className={`w-8 h-[3px] rounded-b-[3px] mb-1 ${isActive ? 'bg-[#C9A227]' : 'bg-transparent'}`}
            />
            <span className="text-2xl leading-none">{tab.icon}</span>
            <span
              className={`text-xs font-medium mt-0.5 ${isActive ? 'text-[#0B2A4A]' : 'text-gray-400'}`}
            >
              {t(tab.label)}
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
