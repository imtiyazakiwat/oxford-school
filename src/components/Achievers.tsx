"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getFeaturedAchievers, getAchieverImageUrl, getMockAchieverImage, Achiever } from "@/firebase/achievers";

// Fallback data for when no achievers are in database
const fallbackAchievers: Achiever[] = [
  {
    id: "1",
    name: "Star Achiever",
    stream: "NEET",
    year: 2024,
    percentage: "650/720",
    rank: "AIR 5000",
    image_path: "",
    is_featured: true,
    display_order: 0,
    created_at: "",
    created_by: null,
  },
  {
    id: "2",
    name: "Star Achiever",
    stream: "CET",
    year: 2024,
    percentage: "195/200",
    rank: "Top 100",
    image_path: "",
    is_featured: true,
    display_order: 1,
    created_at: "",
    created_by: null,
  },
  {
    id: "3",
    name: "Star Achiever",
    stream: "JEE",
    year: 2023,
    percentage: "280/300",
    rank: "AIR 2000",
    image_path: "",
    is_featured: true,
    display_order: 2,
    created_at: "",
    created_by: null,
  },
];

export default function Achievers() {
  const [achievers, setAchievers] = useState<Achiever[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievers = async () => {
      const { data } = await getFeaturedAchievers();
      setAchievers(data.length > 0 ? data : fallbackAchievers);
      setLoading(false);
    };
    loadAchievers();
  }, []);

  return (
    <section id="achievers" className="py-12 sm:py-16 md:py-20 bg-[#c41e3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <p className="text-[#f7c52d] font-semibold mb-2 tracking-wide text-xs sm:text-sm">
            OUR PRIDE
          </p>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Star Achievers
          </h2>
          <p className="text-white/80 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Our students continue to make us proud with outstanding selections
            in Navodaya, Sainik School, Adarsha Vidyalaya & other competitive exams.
          </p>
        </motion.div>

        {/* Achievers Grid - 3x2 = 6 cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {achievers.slice(0, 6).map((achiever, index) => (
              <motion.div
                key={achiever.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative bg-gray-50 pt-6 pb-8 px-4">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                    {achiever.image_path ? (
                      <img
                        src={getAchieverImageUrl(achiever.image_path)}
                        alt={achiever.name}
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                      />
                    ) : achiever.id.startsWith("mock-") ? (
                      <img
                        src={getMockAchieverImage(achiever.id)}
                        alt={achiever.name}
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-bold text-blue-400">
                          {achiever.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#c41e3a] flex items-center justify-center shadow-lg border-2 border-white">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-[#f7c52d] text-[#c41e3a] px-2 py-0.5 text-xs sm:text-sm font-bold rounded">
                    {achiever.year}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 text-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 truncate">
                    {achiever.name}
                  </h3>
                  <p className="text-[#c41e3a] font-bold text-lg sm:text-xl">
                    {achiever.percentage}
                  </p>
                  {achiever.rank && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {achiever.rank}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10 sm:mt-12"
        >
          <Link
            href="/achievers"
            className="inline-block bg-white text-[#c41e3a] px-6 sm:px-8 py-2.5 sm:py-3 font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            View All Achievers →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
