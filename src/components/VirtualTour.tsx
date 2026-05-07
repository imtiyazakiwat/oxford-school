"use client";

import { motion } from "motion/react";
import { useLanguage } from "@/context/LanguageContext";

export default function VirtualTour() {
    const { t } = useLanguage();
    return (
        <section id="virtual-tour" className="py-16 md:py-20 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
                    <p className="text-[#f7c52d] font-semibold mb-2 tracking-wide text-sm">{t("tour.tag")}</p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{t("tour.title")}</h2>
                    <p className="text-gray-400 mt-4 max-w-2xl mx-auto">{t("tour.desc")}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="relative w-full rounded-xl overflow-hidden shadow-2xl">
                    <div className="relative w-full aspect-video">
                        <img src="/img/tour-image.jpeg" alt="New Oxford Coaching Classes Campus Tour" className="absolute top-0 left-0 w-full h-full object-cover" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
