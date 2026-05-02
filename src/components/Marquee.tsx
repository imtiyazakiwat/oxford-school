"use client";

import { useEffect, useState } from "react";
import { Bell, Calendar, Award } from "lucide-react";
import { getActiveMarqueeMessages, MarqueeMessage } from "@/firebase/marqueeMessages";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bell,
  Calendar,
  Award,
};

const defaultAnnouncements = [
  { text: "Admissions Open for 2026-27 — Navodaya, Sainik School, Adarsha Vidyalaya Coaching", icon: "Bell", highlight: true },
  { text: "6th Rank in Belagavi District — 64 out of 68 selections!", icon: "Award", highlight: true },
  { text: "New Branch at Athani — Hostel Facilities Available", icon: "Bell", highlight: true },
  { text: "Jamkhandi: Alguoor RC, Near Helipad, Kunchnoor Road", icon: "Calendar", highlight: false },
  { text: "Contact: 9590483488 / 9740412339", icon: "Bell", highlight: false },
];

export default function Marquee() {
  const [messages, setMessages] = useState<{ text: string; icon: string; highlight: boolean }[]>(defaultAnnouncements);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await getActiveMarqueeMessages();
      if (!error && data.length > 0) {
        setMessages(data.map((m) => ({ text: m.text, icon: m.icon, highlight: m.highlight })));
      }
    };
    fetchMessages();
  }, []);

  const doubledAnnouncements = [...messages, ...messages];

  return (
    <div className="bg-[#f7c52d] py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubledAnnouncements.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Bell;
          return (
            <div key={index} className="flex items-center gap-2 mx-8">
              <IconComponent className="w-4 h-4 text-[#c41e3a]" />
              <span
                className={`font-medium ${
                  item.highlight ? "text-[#c41e3a]" : "text-gray-800"
                }`}
              >
                {item.text}
              </span>
              {item.highlight && (
                <span className="bg-[#c41e3a] text-white text-xs px-2 py-0.5 rounded font-bold">
                  NEW
                </span>
              )}
              <span className="text-gray-600 mx-4">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
