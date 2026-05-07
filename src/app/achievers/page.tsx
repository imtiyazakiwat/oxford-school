"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ArrowUpDown, Calendar, Award, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getAllAchievers, getAchieverImageUrl, Achiever } from "@/firebase/achievers";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslatedText } from "@/hooks/useTranslatedText";

const categories = ["All", "Navodaya", "Sainik", "Adarsha", "Morarji", "Kittur", "Others"];
const ITEMS_PER_PAGE = 9;

const categoryDescriptions: { [key: string]: string } = {
    All: "",
    Navodaya: "Jawahar Navodaya Vidyalaya Selection Achievers",
    Sainik: "Sainik School Entrance Exam Achievers",
    Adarsha: "Adarsha Vidyalaya Selection Achievers",
    Morarji: "Morarji Desai Residential School Selections",
    Kittur: "Kittur Rani Channamma Residential School Selections",
    Others: "Other Competitive Exam Achievers",
};

type SortOption = "newest" | "oldest";

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
];

// Year filter options (2019-2025)
const yearOptions = ["All", "2025", "2024", "2023", "2022", "2021", "2020", "2019"];

export default function AchieversPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [achievers, setAchievers] = useState<Achiever[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [selectedYear, setSelectedYear] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [direction, setDirection] = useState(0);
    const gridRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const loadAchievers = async () => {
            setLoading(true);
            const { data } = await getAllAchievers();
            setAchievers(data);
            setLoading(false);
        };
        loadAchievers();
    }, []);

    // Filter and sort achievers
    const filteredAndSortedAchievers = useMemo(() => {
        let filtered = achievers;
        
        // Filter by category
        if (activeCategory !== "All") {
            filtered = filtered.filter(a => a.stream === activeCategory);
        }
        
        // Filter by year
        if (selectedYear !== "All") {
            filtered = filtered.filter(a => a.year === parseInt(selectedYear));
        }

        // Sort based on selected option
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return b.year - a.year || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case "oldest":
                    return a.year - b.year || new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                default:
                    return 0;
            }
        });
    }, [achievers, activeCategory, selectedYear, sortBy]);

    const totalPages = Math.ceil(filteredAndSortedAchievers.length / ITEMS_PER_PAGE);
    const paginatedAchievers = filteredAndSortedAchievers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const goToPage = (page: number) => {
        setDirection(page > currentPage ? 1 : -1);
        setCurrentPage(page);
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Reset page on filter change
    useEffect(() => { setCurrentPage(1); }, [activeCategory, selectedYear, sortBy]);

    // Get unique streams that have achievers for dynamic stats
    const streamCounts = achievers.reduce((acc, a) => {
        acc[a.stream] = (acc[a.stream] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);



    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#c41e3a] py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">{t("page.backHome")}</Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{t("page.achieversTitle")}</h1>
                    <p className="text-white/80 mt-4 max-w-2xl">{t("page.achieversDesc")}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-2 text-sm font-medium transition-all ${activeCategory === category
                                    ? "bg-[#c41e3a] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {category}
                            {category !== "All" && streamCounts[category] && (
                                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                    {streamCounts[category]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{filteredAndSortedAchievers.length} {t("page.achieversFound")}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Year Filter */}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:border-[#c41e3a]"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year === "All" ? t("page.allYears") : year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:border-[#c41e3a]"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Category Header */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                            {activeCategory === "All" ? t("page.allAchievers") : `${activeCategory} Achievers`}
                        </h2>
                        <p className="text-gray-600">{categoryDescriptions[activeCategory]}</p>
                    </motion.div>
                </AnimatePresence>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-12 h-12 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Achievers Grid */}
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={`${activeCategory}-${selectedYear}-${sortBy}-${currentPage}`}
                                ref={gridRef}
                                custom={direction}
                                initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
                                transition={{ duration: 0.3 }}
                                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 scroll-mt-4"
                            >
                                {paginatedAchievers.map((achiever, index) => (
                                    <motion.div
                                        key={achiever.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.4 }}
                                        className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Image Section */}
                                        <div className="relative bg-gray-100 p-6">
                                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                                                {achiever.image_path ? (
                                                    <img
                                                        src={getAchieverImageUrl(achiever.image_path, achiever.id)!}
                                                        alt={achiever.name}
                                                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                        <span className="text-4xl font-bold text-gray-400">
                                                            {achiever.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#c41e3a] flex items-center justify-center shadow-lg">
                                                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 bg-[#f7c52d] text-[#c41e3a] px-3 py-1 text-sm font-bold rounded">
                                                {achiever.year}
                                            </div>
                                            {activeCategory === "All" && (
                                                <div className="absolute top-4 left-4 bg-slate-800 text-white px-2 py-1 text-xs font-medium rounded">
                                                    {achiever.stream}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-5 sm:p-6 text-center">
                                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2">
                                                {achiever.name}
                                            </h3>
                                            <div className="space-y-2">
                                                <p className="text-[#c41e3a] font-bold text-xl sm:text-2xl">
                                                    {achiever.percentage}
                                                </p>
                                                {achiever.rank && (
                                                    <p className="text-gray-600 font-medium text-sm sm:text-base">
                                                        {achiever.rank}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

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
                                {t("page.showing")} {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedAchievers.length)} {t("page.of")} {filteredAndSortedAchievers.length}
                            </p>
                        )}

                        {/* Empty State Message */}
                        {filteredAndSortedAchievers.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Trophy className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">{t("page.noAchievers")}</h3>
                                <p className="text-gray-500">{t("page.noAchieversDesc")}</p>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Stats Section - Dynamic based on actual data */}
                {achievers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
                    >
                        <div className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-lg">
                            <p className="text-2xl sm:text-3xl font-bold text-[#c41e3a]">{achievers.length}</p>
                            <p className="text-gray-600 text-sm mt-1">{t("page.totalAchievers")}</p>
                        </div>
                        {Object.entries(streamCounts).slice(0, 3).map(([stream, count]) => (
                            <div
                                key={stream}
                                className="bg-white rounded-lg p-4 sm:p-6 text-center shadow-lg"
                            >
                                <p className="text-2xl sm:text-3xl font-bold text-[#c41e3a]">{count}</p>
                                <p className="text-gray-600 text-sm mt-1">{stream} Achievers</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-16 bg-[#c41e3a] rounded-lg p-8 sm:p-12 text-center text-white"
                >
                    <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
                        {t("page.joinSuccess")}
                    </h3>
                    <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                        {t("page.joinDesc")}
                    </p>
                    <Link
                        href="/#contact"
                        className="inline-block bg-white text-[#c41e3a] px-8 py-3 font-semibold hover:bg-gray-100 transition-colors"
                    >
                        {t("page.contactToday")}
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
