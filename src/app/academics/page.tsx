"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
    ArrowLeft,
    Atom,
    Calculator,
    BookOpen,
    Stethoscope,
    Cpu,
    GraduationCap,
    Users,
    Trophy,
    Clock,
    Target,
    CheckCircle2,
    Microscope,
    FlaskConical,
    BookMarked,
} from "lucide-react";

const streams = [
    {
        title: "Science Stream",
        icon: Atom,
        description: "Build a strong foundation in scientific principles with hands-on laboratory experience and expert guidance.",
        subjects: ["Physics", "Chemistry", "Biology", "Mathematics"],
        careers: ["Medicine", "Engineering", "Research", "Technology"],
        highlights: [
            "State-of-the-art laboratories",
            "NEET & JEE focused coaching",
            "Regular practical sessions",
            "Expert faculty from IITs & AIIMS",
        ],
    },
    {
        title: "Commerce Stream",
        icon: Calculator,
        description: "Develop strong business acumen and financial expertise for careers in banking, finance, and entrepreneurship.",
        subjects: ["Accountancy", "Economics", "Business Studies", "Mathematics"],
        careers: ["CA", "Banking", "Finance", "Business Management"],
        highlights: [
            "Industry-aligned curriculum",
            "CA foundation coaching",
            "Financial modeling workshops",
            "Business case studies",
        ],
    },
    {
        title: "Arts Stream",
        icon: BookOpen,
        description: "Explore humanities and social sciences to build critical thinking and communication skills.",
        subjects: ["History", "Political Science", "Sociology", "Languages"],
        careers: ["Civil Services", "Law", "Journalism", "Education"],
        highlights: [
            "UPSC preparatory guidance",
            "Debate & discussion forums",
            "Guest lectures by experts",
            "Research methodology training",
        ],
    },
];

const examPrep = [
    {
        title: "NEET Preparation",
        icon: Stethoscope,
        description: "Comprehensive medical entrance exam preparation with proven results.",
        features: [
            "Daily practice tests",
            "Biology & Chemistry modules",
            "Mock NEET exams",
            "Doubt clearing sessions",
        ],
    },
    {
        title: "JEE Preparation",
        icon: Cpu,
        description: "Rigorous engineering entrance preparation for JEE Main & Advanced.",
        features: [
            "Physics problem solving",
            "Mathematics coaching",
            "Online test series",
            "Rank improvement program",
        ],
    },
    {
        title: "CET Preparation",
        icon: GraduationCap,
        description: "Karnataka CET focused coaching for local engineering & medical admissions.",
        features: [
            "State syllabus coverage",
            "Previous year papers",
            "Speed & accuracy drills",
            "Subject-wise analysis",
        ],
    },
];

const stats = [
    { value: "2000+", label: "Students Enrolled", icon: Users },
    { value: "50+", label: "Expert Faculty", icon: BookMarked },
    { value: "25+", label: "Years of Excellence", icon: Clock },
    { value: "500+", label: "Top Rankers", icon: Trophy },
];

const features = [
    {
        icon: Microscope,
        title: "Modern Laboratories",
        description: "Well-equipped physics, chemistry, biology, and computer labs.",
    },
    {
        icon: Users,
        title: "Expert Faculty",
        description: "Experienced teachers from prestigious institutions.",
    },
    {
        icon: Target,
        title: "Focused Coaching",
        description: "Targeted preparation for competitive exams.",
    },
    {
        icon: FlaskConical,
        title: "Practical Learning",
        description: "Emphasis on hands-on experiments and projects.",
    },
];

export default function AcademicsPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#c41e3a] to-[#8b1528] py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <Link
                        href="/"
                        className="text-white/80 hover:text-white mb-4 inline-flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Academic Programs
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/80 mt-4 max-w-2xl text-lg"
                    >
                        Discover our comprehensive academic programs designed to nurture
                        excellence and prepare students for successful careers in Science,
                        Commerce, and Arts.
                    </motion.p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-12 h-12 bg-[#c41e3a]/10 rounded-full flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-[#c41e3a]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
                {/* Streams Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center mb-10">
                        <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-sm">
                            OUR PROGRAMS
                        </p>
                        <h2
                            className="text-3xl md:text-4xl font-bold text-gray-900"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Academic <span className="text-[#c41e3a]">Streams</span>
                        </h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            Choose from our three comprehensive streams, each designed to build
                            strong foundations for your future career.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {streams.map((stream, index) => (
                            <motion.div
                                key={stream.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-br from-[#c41e3a] to-[#8b1528] p-6 text-white">
                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                        <stream.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{stream.title}</h3>
                                    <p className="text-white/90 text-sm">{stream.description}</p>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Subjects */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            Core Subjects
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {stream.subjects.map((subject) => (
                                                <span
                                                    key={subject}
                                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                                >
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Careers */}
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            Career Paths
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {stream.careers.map((career) => (
                                                <span
                                                    key={career}
                                                    className="px-3 py-1 bg-[#f7c52d]/20 text-[#8b6914] text-sm rounded-full font-medium"
                                                >
                                                    {career}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Highlights */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            Highlights
                                        </p>
                                        <ul className="space-y-2">
                                            {stream.highlights.map((highlight) => (
                                                <li
                                                    key={highlight}
                                                    className="flex items-center gap-2 text-sm text-gray-600"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    {highlight}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Exam Preparation Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center mb-10">
                        <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-sm">
                            COMPETITIVE EXAMS
                        </p>
                        <h2
                            className="text-3xl md:text-4xl font-bold text-gray-900"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Exam <span className="text-[#c41e3a]">Preparation</span>
                        </h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            Specialized coaching programs to help students excel in national and state-level competitive examinations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {examPrep.map((exam, index) => (
                            <motion.div
                                key={exam.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#c41e3a]/30 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-[#c41e3a]/10 rounded-xl flex items-center justify-center mb-4">
                                    <exam.icon className="w-7 h-7 text-[#c41e3a]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{exam.description}</p>
                                <ul className="space-y-2">
                                    {exam.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-center gap-2 text-sm text-gray-700"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-[#c41e3a] flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Why Choose Us */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center mb-10">
                        <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-sm">
                            WHY SARVODAYA
                        </p>
                        <h2
                            className="text-3xl md:text-4xl font-bold text-gray-900"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Our <span className="text-[#c41e3a]">Advantages</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-[#c41e3a] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-[#c41e3a] to-[#8b1528] rounded-2xl p-8 md:p-12 text-center text-white"
                >
                    <h3
                        className="text-2xl md:text-3xl font-bold mb-4"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Ready to Start Your Academic Journey?
                    </h3>
                    <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                        Join Sarvodaya Group of Institutions and unlock your potential with our world-class academic programs and dedicated faculty.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/#contact"
                            className="inline-block bg-white text-[#c41e3a] px-8 py-3 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/achievers"
                            className="inline-block bg-[#f7c52d] text-gray-900 px-8 py-3 font-semibold rounded-lg hover:bg-[#e6b627] transition-colors"
                        >
                            View Our Achievers
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
