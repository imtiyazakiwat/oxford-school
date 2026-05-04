"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Users, Award, Target } from "lucide-react";
import { getAboutImages, getAboutImageUrl, AboutImage } from "@/firebase/aboutImages";

const features = [
  {
    icon: Trophy,
    title: "Competitive Exam Training",
    description:
      "Expert coaching for Navodaya, Sainik School, Adarsha Vidyalaya, Kittur, Murarji & R.M.S. entrance exams.",
  },
  {
    icon: Users,
    title: "Experienced Faculty",
    description:
      "Learn from dedicated educators with proven track records in competitive exam preparation.",
  },
  {
    icon: Award,
    title: "Outstanding Results",
    description:
      "64 out of 68 selections in 2025–26. Top achievement: 258/300 marks in Sainik School entrance exam.",
  },
  {
    icon: Target,
    title: "Holistic Development",
    description:
      "Yoga, meditation, karate & Surya Namaskar for fitness, concentration, and inner strength.",
  },
];

const FALLBACK_IMAGES = [
  { position: 1, src: "", alt: "Student Felicitation" },
  { position: 2, src: "", alt: "Achievement Ceremony" },
  { position: 3, src: "", alt: "Campus & Students" },
  { position: 4, src: "", alt: "Results Celebration" },
];

export default function About() {
  const [images, setImages] = useState<{ position: number; src: string; alt: string }[]>(FALLBACK_IMAGES);

  useEffect(() => {
    const loadImages = async () => {
      const { data } = await getAboutImages();
      if (data.length > 0) {
        const mapped = data.map(img => ({
          position: img.position,
          src: img.image_path ? getAboutImageUrl(img.image_path) : FALLBACK_IMAGES[img.position - 1].src,
          alt: img.alt_text || FALLBACK_IMAGES[img.position - 1].alt,
        }));
        setImages(mapped);
      }
    };
    loadImages();
  }, []);

  const getImage = (position: number) => images.find(img => img.position === position) || FALLBACK_IMAGES[position - 1];

  const AboutImg = ({ position, className }: { position: number; className: string }) => {
    const img = getImage(position);
    if (!img.src) return <div className={`${className} bg-gray-200`} />;
    return <img src={img.src} alt={img.alt} className={className} />;
  };

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-xs sm:text-sm">
              ABOUT US
            </p>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Building futures through{" "}
              <span className="text-[#c41e3a]">excellence.</span>
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              New Oxford Coaching Classes stands today as one of the most trusted
              and result-oriented educational institutions for students across
              North Karnataka. Built on the strong foundation of discipline,
              dedication, and academic excellence, the institution has become a
              preferred choice for thousands of parents seeking a brighter future
              for their children.
            </p>
            <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              The journey began in 2023 under the visionary leadership of
              Mr. Vijaykumar Kumathalli and journalist Mr. Jagadeesh Khobri.
              What started with just 38 students has grown into a remarkable
              institution with branches in Jamkhandi and Athani, delivering
              exceptional results in Navodaya, Sainik School, and Adarsha
              Vidyalaya entrance examinations year after year.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a href="#contact" className="btn-primary text-center text-sm sm:text-base">
                Learn More
              </a>
              <a href="#virtual-tour" className="btn-secondary text-center text-sm sm:text-base">
                Virtual Tour
              </a>
            </div>
          </motion.div>

          {/* Right Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <AboutImg position={1} className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg" />
                <AboutImg position={2} className="w-full h-44 sm:h-52 md:h-64 object-cover rounded-lg" />
              </div>
              <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                <AboutImg position={3} className="w-full h-44 sm:h-52 md:h-64 object-cover rounded-lg" />
                <AboutImg position={4} className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg" />
              </div>
            </div>
            {/* Accent */}
            <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-[#f7c52d] rounded-lg -z-10" />
            <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-[#c41e3a] rounded-lg -z-10" />
          </motion.div>
        </div>


        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-16 md:mt-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow bg-gray-50"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#c41e3a] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
