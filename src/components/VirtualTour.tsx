"use client";

import { motion } from "motion/react";

export default function VirtualTour() {
    return (
        <section id="virtual-tour" className="py-16 md:py-20 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <p className="text-[#f7c52d] font-semibold mb-2 tracking-wide text-sm">
                        EXPLORE OUR CAMPUS
                    </p>
                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Virtual Tour
                    </h2>
                    <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                        Take a virtual walk through our campus and experience the vibrant atmosphere of New Oxford Coaching Classes.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="relative w-full rounded-xl overflow-hidden shadow-2xl"
                >
                    {/* 16:9 Aspect Ratio Container */}
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        {/* TODO: Replace with actual YouTube/Facebook video URL when provided by client */}
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=mock&autoplay=0&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=1&rel=0&modestbranding=1"
                            title="New Oxford Coaching Classes Campus Tour"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
