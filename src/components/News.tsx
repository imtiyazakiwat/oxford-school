"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, ArrowRight, AlertCircle, Bell, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getActiveAnnouncements, getAnnouncementImageUrl, Announcement } from "@/firebase/announcements";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslatedText } from "@/hooks/useTranslatedText";

const priorityConfig = {
  urgent: { icon: AlertCircle, color: "bg-red-500" },
  high: { icon: AlertTriangle, color: "bg-orange-500" },
  normal: { icon: Bell, color: "bg-[#c41e3a]" },
  low: { icon: Info, color: "bg-gray-500" },
};

function NewsCard({ item }: { item: Announcement }) {
  const { t } = useLanguage();
  const translatedTitle = useTranslatedText(item.title);
  const translatedContent = useTranslatedText(item.content);
  const PriorityIcon = priorityConfig[item.priority].icon;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <article className="flex flex-col md:flex-row gap-6 bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {item.image_path ? (
        <img src={getAnnouncementImageUrl(item.image_path)} alt={translatedTitle} className="w-full md:w-48 h-48 object-cover" />
      ) : (
        <div className="w-full md:w-48 h-48 bg-gray-200 flex items-center justify-center">
          <Bell className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <div className="p-6 md:p-4 flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-2">
          <span className={`flex items-center gap-1 text-xs font-semibold text-white px-2 py-1 rounded ${priorityConfig[item.priority].color}`}>
            <PriorityIcon className="w-3 h-3" />
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(item.created_at)}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">{translatedTitle}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{translatedContent}</p>
        <Link href={`/news/${item.id}`} className="text-[#c41e3a] font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
          {t("news.readMore")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

export default function News() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      const { data } = await getActiveAnnouncements();
      setAnnouncements(data.slice(0, 3));
      setLoading(false);
    };
    loadAnnouncements();
  }, []);

  return (
    <section id="news" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-xs sm:text-sm">{t("news.tag")}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
            {t("news.title")}
          </h2>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>{t("news.noNews")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <NewsCard item={item} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10"
        >
          <Link href="/news" className="inline-block bg-[#c41e3a] text-white px-6 sm:px-8 py-2.5 sm:py-3 font-semibold hover:bg-[#a01830] transition-colors text-sm sm:text-base">
            {t("news.viewAll")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
