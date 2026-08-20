import { useLanguage } from '../LanguageContext';

const TABS = [
  { id: 'home', icon: '🏠', label: { en: 'Home', vi: 'Trang chủ' } },
  { id: 'contact', icon: '☎️', label: { en: 'Contact', vi: 'Liên hệ' } },
];

export default function BottomNav({ activeTab, onSelectTab }) {
  const { t } = useLanguage();

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              isActive ? 'text-[#0B2A4A]' : 'text-gray-400'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{t(tab.label)}</span>
          </button>
        );
      })}
    </nav>
  );
}
