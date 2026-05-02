"use client";

import { useState, useEffect, use } from "react";
import { motion } from "motion/react";
import { Calendar, ArrowLeft, Newspaper } from "lucide-react";
import Link from "next/link";
import { getNewsById, getNewsImageUrl, NewsItem } from "@/firebase/news";
import { MOCK_NEWS_IMAGES } from "@/data/mockData";

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      const { data, error } = await getNewsById(id);
      if (error) {
        setError(error);
      } else {
        setNewsItem(data);
      }
      setLoading(false);
    };
    loadNews();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !newsItem) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="bg-[#c41e3a] py-16">
          <div className="max-w-7xl mx-auto px-4">
            <Link href="/news" className="text-white/80 hover:text-white mb-4 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to News
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">News Not Found</h1>
          <p className="text-gray-600 mb-6">The news article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/news" className="inline-block bg-[#c41e3a] text-white px-6 py-3 font-semibold hover:bg-[#a01830] transition-colors">
            View All News
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#c41e3a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/news" className="text-white/80 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded">
                {newsItem.category}
              </span>
              <span className="text-white/80 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(newsItem.published_at)}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              {newsItem.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {(newsItem.image_path || MOCK_NEWS_IMAGES[newsItem.id]) ? (
            <div className="w-full bg-gray-50 flex items-center justify-center p-4">
              <img
                src={newsItem.image_path ? getNewsImageUrl(newsItem.image_path) : MOCK_NEWS_IMAGES[newsItem.id]}
                alt={newsItem.title}
                className="w-full h-auto max-h-[32rem] object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-64 md:h-96 bg-gray-100 flex items-center justify-center">
              <Newspaper className="w-24 h-24 text-gray-300" />
            </div>
          )}
          <div className="p-6 md:p-10">
            <p className="text-lg text-gray-700 mb-6 font-medium">{newsItem.description}</p>
            {newsItem.content && (
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                {newsItem.content}
              </div>
            )}
          </div>
        </motion.article>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-[#c41e3a] font-semibold hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Back to All News
          </Link>
        </div>
      </div>
    </main>
  );
}
