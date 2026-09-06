import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../types';
import { translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the 3-language cycle order: English -> Hindi -> Marathi -> English
const LANGUAGE_CYCLE: Language[] = ['en', 'hi', 'mr'];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('krishi_sarthak_lang') as Language;
    return LANGUAGE_CYCLE.includes(saved) ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('krishi_sarthak_lang', lang);
  };

  const toggleLanguage = () => {
    const currentIndex = LANGUAGE_CYCLE.indexOf(language);
    const nextIndex = (currentIndex + 1) % LANGUAGE_CYCLE.length;
    setLanguage(LANGUAGE_CYCLE[nextIndex]);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
