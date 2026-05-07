"use client";

import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DownloadsPage() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#c41e3a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> {t("page.backHome").replace("← ", "")}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{t("page.downloads")}</h1>
          <p className="text-white/80 mt-4 max-w-2xl">{t("page.downloadsDesc")}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-[#c41e3a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="w-10 h-10 text-[#c41e3a]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("page.comingSoon")}</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">{t("page.comingSoonDesc")}</p>
          <Link href="/" className="inline-block bg-[#c41e3a] text-white px-6 py-3 font-semibold hover:bg-[#a81832] transition-colors">{t("page.returnHome")}</Link>
        </div>
      </div>
    </main>
  );
}
