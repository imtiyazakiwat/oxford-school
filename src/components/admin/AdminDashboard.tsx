"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    ClipboardList,
    MessageSquare,
    Newspaper,
    Image,
    Trophy,
    FileText,
    Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    DashboardOverview,
    ExamRegistrationsModule,
    ContactSubmissionsModule,
    ManageNewsModule,
    ManageGalleryModule,
    ManageAchieversModule,
    AdmissionsModule,
    StudentsModule,
} from "./modules";

interface AdminDashboardProps {
    onLogout: () => void;
}

type ActiveModule =
    | "dashboard"
    | "exam-registrations"
    | "contact-submissions"
    | "news"
    | "gallery"
    | "achievers"
    | "admissions"
    | "students";

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "exam-registrations", label: "Exam Registrations", icon: ClipboardList },
    { id: "contact-submissions", label: "Contact Submissions", icon: MessageSquare },
    { id: "news", label: "Manage News", icon: Newspaper },
    { id: "gallery", label: "Manage Gallery", icon: Image },
    { id: "achievers", label: "Manage Achievers", icon: Trophy },
    { id: "admissions", label: "Admissions", icon: FileText },
    { id: "students", label: "Students", icon: Users },
];

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get admin info from auth
    const adminName = user?.displayName || user?.email?.split("@")[0] || "Admin";

    const handleLogoClick = () => {
        router.push("/");
    };

    const getHeaderTitle = () => {
        const mainItem = menuItems.find((m) => m.id === activeModule);
        if (mainItem) return mainItem.label;
        return "Dashboard";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar - Desktop */}
            <aside
                className={`fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-40 hidden lg:block ${sidebarOpen ? "w-64" : "w-20"}`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                    {sidebarOpen && (
                        <button
                            onClick={handleLogoClick}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
                        >
                            <img src="/img/logo.png" alt="Logo" className="w-9 h-9 object-contain flex-shrink-0" />
                            <div className="min-w-0">
                                <span className="font-bold text-sm leading-tight block truncate" style={{ fontFamily: "var(--font-display)" }}>
                                    New Oxford
                                </span>
                                <span className="text-[10px] text-white/60 leading-tight block">
                                    Coaching Classes
                                </span>
                            </div>
                        </button>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeModule === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id as ActiveModule)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? "bg-[#c41e3a] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50">
                <button onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="/img/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <div>
                        <span className="font-bold text-sm block leading-tight" style={{ fontFamily: "var(--font-display)" }}>New Oxford</span>
                        <span className="text-[10px] text-white/60 leading-tight block">Admin Panel</span>
                    </div>
                </button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-white/10 rounded-lg">
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>


            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 top-16 bg-black/50 z-40"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.2 }}
                            className="lg:hidden fixed left-0 top-16 bottom-0 w-2/3 max-w-[250px] bg-slate-900 z-50 p-3 shadow-xl overflow-y-auto"
                        >
                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeModule === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveModule(item.id as ActiveModule);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${isActive ? "bg-[#c41e3a] text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
                                        >
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="font-medium truncate">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg mt-4 text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={`transition-all duration-300 pt-16 lg:pt-0 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
                {/* Header */}
                <header className="h-16 bg-white border-b px-6">
                    <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                            {getHeaderTitle()}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] flex items-center justify-center text-white font-bold text-sm">
                                    {adminName.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">{adminName}</p>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-6">
                    <div className="max-w-6xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeModule}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeModule === "dashboard" && <DashboardOverview onNavigate={(module) => setActiveModule(module as ActiveModule)} />}
                                {activeModule === "exam-registrations" && <ExamRegistrationsModule />}
                                {activeModule === "contact-submissions" && <ContactSubmissionsModule />}
                                {activeModule === "news" && <ManageNewsModule />}
                                {activeModule === "gallery" && <ManageGalleryModule />}
                                {activeModule === "achievers" && <ManageAchieversModule />}
                                {activeModule === "admissions" && <AdmissionsModule />}
                                {activeModule === "students" && <StudentsModule />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
