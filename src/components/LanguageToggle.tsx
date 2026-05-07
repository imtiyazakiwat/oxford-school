"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Languages } from "lucide-react";

export default function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a81832] text-white px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
      aria-label={`Switch to ${language === "en" ? "Kannada" : "English"}`}
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">{t("lang.switch")}</span>
    </button>
  );
}
