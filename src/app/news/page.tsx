"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ArrowRight, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getActiveNews, getNewsImageUrl, NewsItem } from "@/firebase/news";

const categories = ["All", "Events", "Academic", "Admissions", "Sports", "Achievements"];
const ITEMS_PER_PAGE = 6;

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNews = async () => {
      const { data, error } = await getActiveNews(true);
      if (error) {
        console.error("Failed to load news:", error);
      }
      setNews(data);
      setLoading(false);
    };
    loadNews();
  }, []);

  const filteredNews = activeCategory === "All"
    ? news
    : news.filter((item) => item.category === activeCategory);

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setDirection(page > currentPage ? 1 : -1);
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Reset page on category change
  useEffect(() => { setCurrentPage(1); }, [activeCategory]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#c41e3a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">← Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>News & Events</h1>
          <p className="text-white/80 mt-4 max-w-2xl">Stay updated with the latest news, events, and happenings at New Oxford Coaching Classes.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-[#c41e3a] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category}
              {category !== "All" && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {news.filter((item) => item.category === category).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{activeCategory === "All" ? "No news available yet." : `No news in ${activeCategory} category.`}</p>
          </div>
        ) : (
          <>
            <div ref={gridRef} className="scroll-mt-4">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`${activeCategory}-${currentPage}`}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-6"
                >
                  {paginatedNews.map((item, index) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex flex-col md:flex-row gap-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {item.image_path ? (
                        <div className="w-full md:w-80 shrink-0 bg-gray-50 flex items-center justify-center p-2">
                          <img src={getNewsImageUrl(item.image_path)} alt={item.title} className="w-full h-auto max-h-64 md:max-h-72 object-contain" />
                        </div>
                      ) : (
                        <div className="w-full md:w-80 shrink-0 h-48 md:h-auto min-h-[12rem] bg-gray-100 flex items-center justify-center">
                          <Newspaper className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      <div className="p-6 flex flex-col justify-center flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-semibold text-[#c41e3a] bg-[#c41e3a]/10 px-3 py-1 rounded">{item.category}</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(item.published_at)}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                        <Link href={`/news/${item.id}`} className="text-[#c41e3a] font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all w-fit">
                          Read More <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-[#c41e3a] text-white shadow-md scale-110"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {totalPages > 1 && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredNews.length)} of {filteredNews.length}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
