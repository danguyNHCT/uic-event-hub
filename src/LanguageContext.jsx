import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

// Default language is Vietnamese, per spec. Toggle is in-memory React state
// only (no localStorage), so it resets on reload — that's expected.
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('vi');

  const toggleLang = () => setLang((prev) => (prev === 'vi' ? 'en' : 'vi'));

  // Small helper: pass a { en, vi } object, get back the string for the
  // current language. Falls back to plain strings if one is passed directly.
  const t = (field) => {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    return field[lang] ?? '';
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
