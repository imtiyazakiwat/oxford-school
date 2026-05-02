"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard,
    BarChart3,
    Calendar,
    Clock,
    BookOpen,
    Library,
    CreditCard,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    Megaphone,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getActiveAnnouncements, Announcement } from "@/firebase/announcements";
import { getStudentByUserId, Student } from "@/firebase/students";
import {
    DashboardOverview,
    ResultsModule,
    AttendanceModule,
    TimetableModule,
    AssignmentsModule,
    LibraryModule,
    FeesModule,
    DetailsModule,
    AnnouncementsModule,
} from "./modules";

interface StudentDashboardProps {
    onLogout: () => void;
}

type ActiveModule =
    | "dashboard"
    | "results"
    | "attendance"
    | "timetable"
    | "assignments"
    | "library"
    | "fees"
    | "details"
    | "announcements";

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "results", label: "Results", icon: BarChart3 },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "timetable", label: "Timetable", icon: Clock },
    { id: "assignments", label: "Assignments", icon: BookOpen },
    { id: "library", label: "Library", icon: Library },
    { id: "fees", label: "Fees", icon: CreditCard },
    { id: "details", label: "My Details", icon: User },
];

export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [viewedAnnouncementIds, setViewedAnnouncementIds] = useState<string[]>([]);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [studentRecord, setStudentRecord] = useState<Student | null>(null);
    const [loadingStudent, setLoadingStudent] = useState(true);

    // Load viewed announcements from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("viewedAnnouncements");
        if (stored) {
            setViewedAnnouncementIds(JSON.parse(stored));
        }
    }, []);

    // Fetch student record from database
    useEffect(() => {
        const fetchStudentRecord = async () => {
            if (!user?.uid) return;
            setLoadingStudent(true);
            const { data } = await getStudentByUserId(user.uid);
            setStudentRecord(data);
            setLoadingStudent(false);
        };
        fetchStudentRecord();
    }, [user?.uid]);

    // Fetch active announcements
    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data } = await getActiveAnnouncements();
            setAnnouncements(data);
        };
        fetchAnnouncements();
    }, []);

    // Calculate unread count
    const unreadAnnouncements = announcements.filter(a => !viewedAnnouncementIds.includes(a.id));
    const unreadCount = unreadAnnouncements.length;

    // Mark announcements as viewed
    const markAsViewed = () => {
        const allIds = announcements.map(a => a.id);
        const newViewedIds = [...new Set([...viewedAnnouncementIds, ...allIds])];
        setViewedAnnouncementIds(newViewedIds);
        localStorage.setItem("viewedAnnouncements", JSON.stringify(newViewedIds));
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    // Get student data from database record or fallback to auth data
    const studentData = {
        name: studentRecord 
            ? `${studentRecord.first_name} ${studentRecord.last_name}` 
            : user?.displayName || user?.email?.split("@")[0] || "Student",
        email: studentRecord?.email || user?.email || "",
        studentId: studentRecord?.student_id || "",
        class: studentRecord?.class || "",
        section: studentRecord?.section || "",
        rollNo: studentRecord?.roll_number || "",
    };

    const handleLogoClick = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar - Desktop */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-[#1e3a5f] to-[#0f1f30] text-white z-30 hidden lg:block">
                <button onClick={handleLogoClick} className="p-4 flex items-center gap-3 border-b border-white/10 w-full hover:bg-white/5 transition-colors">
                    <img
                        src="/img/logo.png"
                        alt="New Oxford Coaching Classes"
                        className="w-10 h-10 object-contain rounded-full"
                    />
                    <div className="text-left">
                        <h1 className="text-lg font-bold">New Oxford Coaching</h1>
                        <p className="text-xs text-white/60">Student Portal</p>
                    </div>
                </button>

                <nav className="p-2 space-y-1 mt-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeModule === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id as ActiveModule)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? "bg-[#c41e3a] text-white"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#1e3a5f] text-white z-40 flex items-center justify-between px-3">
                <button onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img
                        src="/img/logo.png"
                        alt="New Oxford Coaching Classes"
                        className="w-7 h-7 object-contain rounded-full"
                    />
                    <span className="font-bold text-sm">Student Portal</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] flex items-center justify-center text-white font-bold text-xs">
                        {studentData.name.charAt(0)}
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1.5 hover:bg-white/10 rounded-lg"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu - 50% width */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 top-14 bg-black/50 z-40"
                        />
                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.2 }}
                            className="lg:hidden fixed left-0 top-14 bottom-0 w-1/2 max-w-[200px] bg-[#1e3a5f] z-50 p-3 shadow-xl overflow-y-auto"
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
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${isActive
                                                ? "bg-[#c41e3a] text-white"
                                                : "text-white/70 hover:text-white hover:bg-white/10"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="font-medium truncate">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg mt-4 text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="transition-all duration-300 pt-14 lg:pt-0 lg:ml-64">
                {/* Header - Hidden on mobile since we have mobile header */}
                <header className="hidden lg:flex h-16 bg-white border-b px-6">
                    <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                        <h1
                            className="text-xl font-bold text-gray-900"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {menuItems.find((m) => m.id === activeModule)?.label}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                                    className="relative p-2 hover:bg-gray-100 rounded-full"
                                    title="View Announcements"
                                >
                                    <Bell className="w-5 h-5 text-gray-600" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-[#c41e3a] text-white text-xs font-medium min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Popup */}
                                <AnimatePresence>
                                    {showNotificationPopup && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowNotificationPopup(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                                            >
                                                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                                                    <h4 className="font-semibold text-gray-900 text-sm">Announcements</h4>
                                                    <span className="text-xs text-gray-500">{unreadCount > 0 ? `${unreadCount} new` : "All read"}</span>
                                                </div>
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    {announcements.length === 0 ? (
                                                        <div className="p-6 text-center text-gray-500 text-sm">
                                                            No announcements
                                                        </div>
                                                    ) : (
                                                        announcements.slice(0, 3).map((announcement) => (
                                                            <div
                                                                key={announcement.id}
                                                                className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                                                onClick={() => {
                                                                    markAsViewed();
                                                                    setActiveModule("announcements");
                                                                    setShowNotificationPopup(false);
                                                                }}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{announcement.title}</p>
                                                                    <span className="text-xs text-gray-400 whitespace-nowrap">{getTimeAgo(announcement.created_at)}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                                                                <span className={`text-xs px-1.5 py-0.5 rounded mt-2 inline-block ${
                                                                    announcement.priority === "urgent" ? "bg-red-100 text-red-700" :
                                                                    announcement.priority === "high" ? "bg-orange-100 text-orange-700" :
                                                                    announcement.priority === "normal" ? "bg-blue-100 text-blue-700" :
                                                                    "bg-gray-100 text-gray-700"
                                                                }`}>
                                                                    {announcement.priority}
                                                                </span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                {announcements.length > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            markAsViewed();
                                                            setActiveModule("announcements");
                                                            setShowNotificationPopup(false);
                                                        }}
                                                        className="w-full p-3 text-center text-sm font-medium text-[#c41e3a] hover:bg-gray-50 border-t"
                                                    >
                                                        View All Announcements →
                                                    </button>
                                                )}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] flex items-center justify-center text-white font-bold text-sm">
                                    {studentData.name.charAt(0)}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">{studentData.name}</p>
                                    <p className="text-xs text-gray-500">Class {studentData.class}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-3 sm:p-4 lg:p-6">
                    <div className="max-w-6xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeModule}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeModule === "dashboard" && <DashboardOverview studentData={studentData} />}
                                {activeModule === "announcements" && <AnnouncementsModule />}
                                {activeModule === "results" && <ResultsModule />}
                                {activeModule === "attendance" && <AttendanceModule />}
                                {activeModule === "timetable" && <TimetableModule />}
                                {activeModule === "assignments" && <AssignmentsModule />}
                                {activeModule === "library" && <LibraryModule />}
                                {activeModule === "fees" && <FeesModule />}
                                {activeModule === "details" && <DetailsModule studentData={studentData} studentRecord={studentRecord} loadingStudent={loadingStudent} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
