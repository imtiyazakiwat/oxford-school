"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, Language, TranslationKey } from "@/translations";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  translateText: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key) => key,
  translateText: async (text) => text,
});

export const useLanguage = () => useContext(LanguageContext);

// In-memory cache for API translations
const translationCache: Record<string, string> = {};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("preferred-language") as Language | null;
    if (saved && (saved === "en" || saved === "kn")) {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "kn" : "en";
    setLanguage(newLang);
    localStorage.setItem("preferred-language", newLang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  // Translate dynamic DB content using Google Translate API
  const translateText = useCallback(async (text: string): Promise<string> => {
    if (language === "en" || !text) return text;

    const cacheKey = `${language}:${text}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) return text;

    try {
      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: text, target: "kn", source: "en" }),
        }
      );
      const data = await res.json();
      const translated = data?.data?.translations?.[0]?.translatedText || text;
      translationCache[cacheKey] = translated;
      return translated;
    } catch {
      return text;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
};
