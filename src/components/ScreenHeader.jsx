import { useLanguage } from '../LanguageContext';

export default function ScreenHeader({ title, onBack }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="bg-[#0B2A4A] px-4 pt-6 pb-4 text-white flex items-center gap-3 sticky top-0 z-10">
      <button
        onClick={onBack}
        aria-label="Back"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors shrink-0"
      >
        <span className="text-lg leading-none">←</span>
      </button>
      <h1 className="text-lg font-bold leading-tight flex-1">{title}</h1>
      <button
        onClick={toggleLang}
        className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-full px-3 py-1.5 transition-colors shrink-0"
        aria-label="Toggle language"
      >
        {lang === 'vi' ? 'VI / EN' : 'EN / VI'}
      </button>
    </div>
  );
}
