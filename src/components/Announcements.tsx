"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { getFeaturedNews, getNewsImageUrl, NewsItem } from "@/firebase/news";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslatedText } from "@/hooks/useTranslatedText";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function NewsArticle({ item }: { item: NewsItem }) {
  const { t } = useLanguage();
  const translatedTitle = useTranslatedText(item.title);
  const translatedDesc = useTranslatedText(item.description);

  return (
    <article className="flex flex-col md:flex-row gap-6 bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {item.image_path ? (
        <img src={getNewsImageUrl(item.image_path)} alt={translatedTitle} className="w-full md:w-48 h-48 object-cover" />
      ) : (
        <div className="w-full md:w-48 h-48 bg-gray-200 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
      )}
      <div className="p-6 md:p-4 flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-xs font-semibold text-[#c41e3a] bg-[#c41e3a]/10 px-2 py-1 rounded">{item.category}</span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />{formatDate(item.published_at)}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">{translatedTitle}</h3>
        <p className="text-gray-600 text-sm mb-3">{translatedDesc}</p>
        <Link href={`/news/${item.id}`} className="text-[#c41e3a] font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
          {t("news.readMore")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

export default function Announcements({ onApplyClick }: { onApplyClick?: () => void }) {
  const { t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const quickLinks = [
    { title: t("announcements.academicCalendar"), href: "/academic-calendar" },
    { title: t("announcements.examSchedule"), href: "/exam-schedule" },
    { title: t("announcements.feeStructure"), href: "/fee-structure" },
    { title: t("announcements.scholarshipInfo"), href: "/scholarships" },
    { title: t("announcements.downloadForms"), href: "/downloads" },
  ];

  useEffect(() => {
    async function loadNews() {
      const { data } = await getFeaturedNews();
      setNews(data);
      setLoading(false);
    }
    loadNews();
  }, []);

  return (
    <section id="announcements" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
              <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-sm">{t("announcements.tag")}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>{t("announcements.title")}</h2>
            </motion.div>

            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#c41e3a]" /></div>
              ) : news.length === 0 ? (
                <p className="text-gray-500 text-center py-12">{t("announcements.noNews")}</p>
              ) : (
                news.map((item, index) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                    <NewsArticle item={item} />
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-8">
              <Link href="/news" className="text-[#c41e3a] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                {t("announcements.viewAll")} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#c41e3a] text-white p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-4">{t("announcements.quickLinks")}</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}><Link href={link.href} className="flex items-center gap-2 hover:translate-x-2 transition-transform"><ArrowRight className="w-4 h-4" />{link.title}</Link></li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-gray-100 p-6 rounded-lg">
              <h3 className="font-bold text-xl text-gray-900 mb-4">{t("announcements.needHelp")}</h3>
              <p className="text-gray-600 text-sm mb-4">{t("announcements.helpDesc")}</p>
              <div className="space-y-1 mb-4">
                <p className="font-semibold text-[#c41e3a]">{t("footer.jamakhandi")}: +91 9590483488</p>
                <p className="font-semibold text-[#c41e3a]">{t("footer.athani")}: +91 9740412339</p>
              </div>
              <p className="text-gray-600 text-sm font-medium">{t("announcements.officeHours")}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
