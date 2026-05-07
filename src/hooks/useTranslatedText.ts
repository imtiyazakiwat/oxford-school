"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Hook to translate dynamic text (from DB) live.
 * Returns original text in English mode, translated text in Kannada mode.
 */
export function useTranslatedText(text: string): string {
  const { language, translateText } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (language === "en" || !text) {
      setTranslated(text);
      return;
    }
    translateText(text).then(setTranslated);
  }, [language, text, translateText]);

  return translated;
}

/**
 * Hook to translate an array of objects with specified text fields.
 */
export function useTranslatedArray<T extends Record<string, unknown>>(
  items: T[],
  fields: (keyof T)[]
): T[] {
  const { language, translateText } = useLanguage();
  const [translated, setTranslated] = useState<T[]>(items);

  useEffect(() => {
    if (language === "en" || items.length === 0) {
      setTranslated(items);
      return;
    }

    const translateAll = async () => {
      const results = await Promise.all(
        items.map(async (item) => {
          const translatedItem = { ...item };
          for (const field of fields) {
            const val = item[field];
            if (typeof val === "string" && val) {
              (translatedItem as Record<string, unknown>)[field as string] = await translateText(val);
            }
          }
          return translatedItem;
        })
      );
      setTranslated(results);
    };

    translateAll();
  }, [language, items, fields, translateText]);

  return translated;
}
