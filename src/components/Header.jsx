import { useLanguage } from '../LanguageContext';

export default function Header({ title, subtitle }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="bg-[#0B2A4A] px-5 pt-6 pb-5 text-white relative">
      <button
        onClick={toggleLang}
        className="absolute top-5 right-4 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
        aria-label="Toggle language"
      >
        {lang === 'vi' ? 'VI / EN' : 'EN / VI'}
      </button>
      <h1 className="text-2xl font-bold pr-20 rounded-lg leading-tight">{title}</h1>
      {subtitle && <p className="text-sm text-white/80 mt-1">{subtitle}</p>}
    </div>
  );
}
