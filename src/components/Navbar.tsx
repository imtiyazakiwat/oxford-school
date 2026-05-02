"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";
import { getAdmissionBanner } from "@/firebase/admissionBanner";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Achievers", href: "#achievers" },
  { name: "Gallery", href: "#gallery" },
  { name: "News", href: "#announcements" },
  { name: "Contact", href: "#contact" },
];

interface NavbarProps {
  onLoginSuccess?: () => void;
}

export default function Navbar({ onLoginSuccess }: NavbarProps) {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Admission banner state
  const [bannerText, setBannerText] = useState("Admissions Open for 2026-27 — Navodaya, Sainik School & Adarsha Vidyalaya Coaching — Limited Seats!");
  const [bannerEmoji, setBannerEmoji] = useState("🎓");
  const [showBanner, setShowBanner] = useState(true);

  const isLoggedIn = !!user;
  const userName = user?.displayName || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchBanner = async () => {
      const { data } = await getAdmissionBanner();
      if (data) {
        setBannerText(data.text);
        setBannerEmoji(data.emoji);
        setShowBanner(data.is_active);
      }
    };
    fetchBanner();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const openAuth = (mode: "signin" | "register") => {
    setAuthMode(mode);
    setShowAuth(true);
    setIsOpen(false);
  };

  const handleLoginSuccess = () => {
    setShowAuth(false);
    onLoginSuccess?.();
  };

  const handleLogout = async () => {
    await signOut();
    setShowProfileMenu(false);
    router.push("/");
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname !== "/") {
      router.push("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {showBanner && (
        <div className="bg-[#c41e3a] text-white text-sm py-2 hidden md:block overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="animate-marquee whitespace-nowrap">
              <span className="inline-block">
                {bannerEmoji} {bannerText} {bannerEmoji} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {bannerEmoji} {bannerText} {bannerEmoji} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {bannerEmoji} {bannerText} {bannerEmoji}
              </span>
            </div>
          </div>
        </div>
      )}

      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-white"}`}
      >
        <nav className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer">
              <img src="/img/logo.png" alt="New Oxford Coaching Classes" className="w-14 h-14 object-contain rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-[#c41e3a]" style={{ fontFamily: "var(--font-display)" }}>
                  New Oxford Coaching Classes
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Jamkhandi & Athani</p>
              </div>
            </a>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#c41e3a] transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#c41e3a] group-hover:w-3/4 transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : isLoggedIn ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] flex items-center justify-center text-white font-bold text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{userName}</span>
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-gray-200 py-1.5 z-50 overflow-hidden"
                      >
                        <a href="/student" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#c41e3a] transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </a>
                        <a href="/student" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#c41e3a] transition-colors">
                          <User className="w-4 h-4" />
                          Profile
                        </a>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#c41e3a] transition-colors">
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => openAuth("signin")} className="btn-primary">
                  Login
                </button>
              )}
            </div>


            <div className="lg:hidden flex items-center gap-3">
              {!loading && isLoggedIn && (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] flex items-center justify-center text-white font-bold text-xs"
                  >
                    {userName.charAt(0).toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-11 w-44 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                      >
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="font-medium text-gray-900 text-sm truncate">{userName}</p>
                          <p className="text-xs text-gray-500">Student</p>
                        </div>
                        <a href="/student" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </a>
                        <a href="/student" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4" />
                          Profile
                        </a>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 flex items-center justify-center">
                {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden border-t"
              >
                <div className="py-4 space-y-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="block px-4 py-3 text-gray-700 hover:text-[#c41e3a] hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </a>
                  ))}
                  {!isLoggedIn && (
                    <div className="pt-4 px-4">
                      <button onClick={() => openAuth("signin")} className="btn-primary w-full">
                        Login
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
