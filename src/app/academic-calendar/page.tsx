"use client";

import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";

export default function AcademicCalendarPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#c41e3a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Academic Calendar
          </h1>
          <p className="text-white/80 mt-4 max-w-2xl">
            View important academic dates, holidays, and events for the academic year.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-[#c41e3a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-[#c41e3a]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            We&apos;re working on bringing you the complete academic calendar. Check back soon for important dates and events.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#c41e3a] text-white px-6 py-3 font-semibold hover:bg-[#a81832] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
