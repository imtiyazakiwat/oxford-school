"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Achievers from "@/components/Achievers";
import Gallery from "@/components/Gallery";
import Announcements from "@/components/Announcements";
import VirtualTour from "@/components/VirtualTour";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ExamRegistrationModal from "@/components/ExamRegistrationModal";

// One-time cache bust — remove after deploy
const CACHE_VERSION = "v2_firebase";
function bustStaleCache() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("cache_version") !== CACHE_VERSION) {
    const keys = Object.keys(localStorage);
    keys.forEach(k => { if (k.startsWith("news_") || k.startsWith("achievers_") || k.startsWith("gallery_") || k.startsWith("announcements_") || k.startsWith("marquee_")) localStorage.removeItem(k); });
    localStorage.setItem("cache_version", CACHE_VERSION);
  }
}

export default function Home() {
  const [showExamModal, setShowExamModal] = useState(false);
  const router = useRouter();

  useEffect(() => { bustStaleCache(); }, []);

  const handleLoginSuccess = () => {
    router.push("/student");
  };

  return (
    <main className="relative">
      <Navbar onLoginSuccess={handleLoginSuccess} />
      <Hero onExamRegisterClick={() => setShowExamModal(true)} />
      <Marquee />
      <About />
      <Achievers />
      <Gallery />
      <Announcements />
      <VirtualTour />
      <Contact />
      <Footer />

      <ExamRegistrationModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
      />
    </main>
  );
}
