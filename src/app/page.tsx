"use client";

import { useState } from "react";
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

export default function Home() {
  const [showExamModal, setShowExamModal] = useState(false);
  const router = useRouter();

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
