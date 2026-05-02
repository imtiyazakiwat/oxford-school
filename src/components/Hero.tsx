"use client";

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

interface HeroProps {
  onExamRegisterClick?: () => void;
}

export default function Hero({ onExamRegisterClick }: HeroProps) {
  return (
    <section id="home" className="relative min-h-[100vh] md:min-h-[85vh]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/img/admissions/admission4.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 flex items-center md:items-end min-h-[100vh] md:min-h-[85vh] pb-48 sm:pb-44 md:pb-32">
        <div className="max-w-2xl w-full">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#f7c52d] font-semibold mb-3 sm:mb-4 tracking-wide text-xs sm:text-sm"
          >
            NEW OXFORD COACHING CLASSES — JAMKHANDI & ATHANI
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Devotion towards
            <br />
            Dedication &amp; Determination
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/90 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-xl"
          >
            Preparing students for Navodaya, Sainik School, Adarsha Vidyalaya
            & other competitive entrance exams. Building future leaders through
            discipline, dedication & academic excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <button
              onClick={onExamRegisterClick}
              className="bg-white text-[#c41e3a] px-6 sm:px-8 py-3 sm:py-4 font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Register for Exam
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <a
              href="#contact"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 font-semibold hover:bg-white hover:text-[#c41e3a] transition-colors text-center text-sm sm:text-base"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: "4+", label: "Years of Excellence" },
              { value: "200+", label: "Students Trained" },
              { value: "95%", label: "Selection Rate" },
              { value: "6th", label: "Rank in Belagavi District" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <div
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#c41e3a]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
