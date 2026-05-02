"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2, Download } from "lucide-react";
import Link from "next/link";
import { getAllGalleryImages, getGalleryImageUrl, getMockGalleryImage } from "@/firebase/gallery";

const ITEMS_PER_PAGE = 12;

interface DisplayImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

const categories = ["All", "Achievements", "Events", "Admissions", "Press Coverage"];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [images, setImages] = useState<DisplayImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadImages = async () => {
      const { data } = await getAllGalleryImages();
      setImages(data.map(img => ({
        id: img.id,
        url: getGalleryImageUrl(img.image_path, img.id)!,
        title: img.title,
        category: img.category,
      })));
      setLoading(false);
    };
    loadImages();
  }, []);

  const filteredImages = activeCategory === "All"
    ? images
    : images.filter((img) => img.category === activeCategory);

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const paginatedImages = filteredImages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setDirection(page > currentPage ? 1 : -1);
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Reset page on category change
  useEffect(() => { setCurrentPage(1); }, [activeCategory]);

  const selectedImage = selectedImageIndex !== null ? paginatedImages[selectedImageIndex] : null;

  const goToNext = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex < paginatedImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
      setZoom(1);
    }
  }, [selectedImageIndex, paginatedImages.length]);

  const goToPrevious = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
      setZoom(1);
    }
  }, [selectedImageIndex]);

  const closeLightbox = useCallback(() => {
    setSelectedImageIndex(null);
    setZoom(1);
  }, []);


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      switch (e.key) {
        case "ArrowRight": goToNext(); break;
        case "ArrowLeft": goToPrevious(); break;
        case "Escape": closeLightbox(); break;
        case "+": case "=": setZoom(prev => Math.min(prev + 0.25, 3)); break;
        case "-": setZoom(prev => Math.max(prev - 0.25, 0.5)); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, goToNext, goToPrevious, closeLightbox]);

  // Touch swipe
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) goToNext();
    else if (distance < -minSwipeDistance) goToPrevious();
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => setZoom(1);
  const openLightbox = (index: number) => { setSelectedImageIndex(index); setZoom(1); };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#c41e3a] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">← Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Photo Gallery</h1>
          <p className="text-white/80 mt-4 max-w-2xl">Explore our achievements, events, admissions, and press coverage through our photo gallery.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 text-sm font-medium transition-all ${activeCategory === category ? "bg-[#c41e3a] text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
            >
              {category}
              {category !== "All" && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {images.filter(img => img.category === category).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">{activeCategory === "All" ? "No gallery images available yet." : `No images in ${activeCategory} category.`}</p>
          </div>
        ) : (
          <>
            <div ref={gridRef} className="scroll-mt-4">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`${activeCategory}-${currentPage}`}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {paginatedImages.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="relative group cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => openLightbox(index)}
                    >
                      <img src={image.url} alt={image.title} className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-white">
                          <Maximize2 className="w-8 h-8 mx-auto mb-2" />
                          <p className="font-semibold text-sm">{image.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-[#c41e3a] text-white shadow-md scale-110"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {totalPages > 1 && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredImages.length)} of {filteredImages.length}
              </p>
            )}
          </>
        )}
      </div>


      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && selectedImageIndex !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeLightbox} className="fixed inset-0 bg-black/95 z-[100]" />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[101] flex items-center justify-center">
              {/* Left Arrow */}
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                disabled={selectedImageIndex === 0}
                className={`hidden md:flex absolute left-6 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 transition-all ${selectedImageIndex === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                disabled={selectedImageIndex === paginatedImages.length - 1}
                className={`hidden md:flex absolute right-6 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 transition-all ${selectedImageIndex === paginatedImages.length - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Image Container */}
              <div
                ref={imageContainerRef}
                className="relative w-full h-full max-w-[90vw] max-h-[85vh] md:max-w-[80vw] md:max-h-[80vh] mx-auto flex items-center justify-center overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={selectedImage.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-full object-contain rounded-lg cursor-grab active:cursor-grabbing"
                  style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease-out" }}
                  draggable={false}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white">{selectedImage.title}</h3>
                      <p className="text-white/70 text-sm">{selectedImage.category}</p>
                    </div>
                    <p className="text-white/60 text-sm">{selectedImageIndex + 1} / {paginatedImages.length}</p>
                  </div>
                </div>
              </div>

              {/* Top Controls */}
              <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                  <button onClick={zoomOut} disabled={zoom <= 0.5} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30"><ZoomOut className="w-4 h-4" /></button>
                  <button onClick={resetZoom} className="text-white text-sm font-medium px-2 hover:bg-white/10 rounded">{Math.round(zoom * 100)}%</button>
                  <button onClick={zoomIn} disabled={zoom >= 3} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30"><ZoomIn className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-2">
                  <a href={selectedImage.url} download onClick={(e) => e.stopPropagation()} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20"><Download className="w-5 h-5 md:w-6 md:h-6" /></a>
                  <button onClick={closeLightbox} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
                </div>
              </div>

              <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">Use ← → arrow keys to navigate • + - to zoom • Esc to close</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
