"use client";

import { useEffect, useState } from "react";
import { Bell, Calendar, Award } from "lucide-react";
import { getActiveMarqueeMessages } from "@/firebase/marqueeMessages";
import { useLanguage } from "@/context/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Bell, Calendar, Award };

export default function Marquee() {
  const { translateText, language } = useLanguage();
  const [messages, setMessages] = useState<{ text: string; icon: string; highlight: boolean }[]>([]);
  const [displayMessages, setDisplayMessages] = useState<{ text: string; icon: string; highlight: boolean }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await getActiveMarqueeMessages();
      if (!error && data.length > 0) {
        setMessages(data.map((m) => ({ text: m.text, icon: m.icon, highlight: m.highlight })));
      }
      setLoaded(true);
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    if (language === "en") {
      setDisplayMessages(messages);
      return;
    }
    const translateAll = async () => {
      const translated = await Promise.all(
        messages.map(async (m) => ({ ...m, text: await translateText(m.text) }))
      );
      setDisplayMessages(translated);
    };
    translateAll();
  }, [language, messages, translateText]);

  if (loaded && messages.length === 0) return null;

  const doubled = [...displayMessages, ...displayMessages];

  return (
    <div className="bg-[#f7c52d] py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Bell;
          return (
            <div key={index} className="flex items-center gap-2 mx-8">
              <IconComponent className="w-4 h-4 text-[#c41e3a]" />
              <span className={`font-medium ${item.highlight ? "text-[#c41e3a]" : "text-gray-800"}`}>{item.text}</span>
              {item.highlight && <span className="bg-[#c41e3a] text-white text-xs px-2 py-0.5 rounded font-bold">NEW</span>}
              <span className="text-gray-600 mx-4">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
