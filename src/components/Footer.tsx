"use client";

import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "About Us", href: "#about" },
  { name: "Achievers", href: "#achievers" },
  { name: "Gallery", href: "#gallery" },
  { name: "News", href: "#announcements" },
  { name: "Contact", href: "#contact" },
];

const programs = [
  "Navodaya Entrance",
  "Sainik School Entrance",
  "Adarsha Vidyalaya",
  "Kittur School",
  "Murarji School",
  "R.M.S. Entrance",
  "Summer Coaching Camp",
];

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/share/1AijxSbpZd/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/new_oxford_coaching_jamkhandi", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <img
                src="/img/logo.png"
                alt="New Oxford Coaching Classes"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div>
                <h4
                  className="text-lg sm:text-xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  New Oxford Coaching
                </h4>
                <p className="text-xs text-gray-400">Jamkhandi & Athani</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              One of the most trusted coaching institutions in North Karnataka
              for Navodaya, Sainik School & Adarsha Vidyalaya entrance
              preparation since 2023.
            </p>
            {/* Social Links */}
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#c41e3a] hover:text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#f7c52d] transition-colors text-xs sm:text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-bold text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Our Programs</h4>
            <ul className="space-y-2 sm:space-y-3">
              {programs.map((program) => (
                <li key={program}>
                  <span
                    className="text-gray-400 text-xs sm:text-sm"
                  >
                    {program}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Contact Info</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#c41e3a] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 text-xs sm:text-sm font-medium text-white">Jamkhandi:</span>
                  <span className="text-gray-400 text-xs sm:text-sm block">
                    Alguoor RC, Near Helipad,
                    <br />
                    Kunchnoor Road - 587301
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#c41e3a] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 text-xs sm:text-sm font-medium text-white">Athani:</span>
                  <span className="text-gray-400 text-xs sm:text-sm block">
                    HUDKO Colony, IB Road,
                    <br />
                    Athani - 591304
                  </span>
                </div>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#c41e3a] flex-shrink-0" />
                <span className="text-gray-400 text-xs sm:text-sm">+91 9590483488 / 9740412339</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#c41e3a] flex-shrink-0" />
                <span className="text-gray-400 text-xs sm:text-sm">noccj2023@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} New Oxford Coaching Classes. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-300 text-xs sm:text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-300 text-xs sm:text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
