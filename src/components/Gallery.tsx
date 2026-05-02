"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import Link from "next/link";
import { getFeaturedGalleryImages, getGalleryImageUrl, getMockGalleryImage } from "@/firebase/gallery";

interface DisplayImage {
  id: string;
  title: string;
  category: string;
  url: string;
}

export default function Gallery() {
  const [images, setImages] = useState<DisplayImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<DisplayImage | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const { data } = await getFeaturedGalleryImages();
      setImages(data.map(img => ({
        id: img.id,
        title: img.title,
        category: img.category,
        url: img.image_path ? getGalleryImageUrl(img.image_path) : getMockGalleryImage(img.id),
      })));
      setLoading(false);
    };
    loadImages();
  }, []);

  return (
    <section id="gallery" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-xs sm:text-sm">
            CAMPUS LIFE
          </p>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Photo Gallery
          </h2>
        </motion.div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No gallery images available yet.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {images.slice(0, 6).map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative group cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10"
        >
          <Link
            href="/gallery"
            className="inline-block bg-[#c41e3a] text-white px-6 sm:px-8 py-2.5 sm:py-3 font-semibold hover:bg-[#a01830] transition-colors text-sm sm:text-base"
          >
            View Full Gallery →
          </Link>
        </motion.div>
      </div>


      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/90 z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-5xl w-full">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedImage.title}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base">{selectedImage.category}</p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
