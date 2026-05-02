"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Megaphone, AlertCircle, AlertTriangle, Info, Bell, X, Calendar } from "lucide-react";
import { getActiveAnnouncements, getAnnouncementImageUrl, Announcement } from "@/firebase/announcements";

const PRIORITY_CONFIG = {
    low: { label: "Low", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Info, accent: "border-l-gray-400" },
    normal: { label: "Normal", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Bell, accent: "border-l-blue-500" },
    high: { label: "High", color: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertTriangle, accent: "border-l-orange-500" },
    urgent: { label: "Urgent", color: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle, accent: "border-l-red-500" },
};

export default function AnnouncementsModule() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        const loadAnnouncements = async () => {
            const { data } = await getActiveAnnouncements();
            setAnnouncements(data);
            setLoading(false);
        };
        loadAnnouncements();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-[#c41e3a]" />
                        Announcements
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Stay updated with the latest news and notices</p>
                </div>
            </div>

            {/* Announcements List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : announcements.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
                    <p className="text-gray-500">There are no announcements at the moment. Check back later!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement, index) => {
                        const priorityConfig = PRIORITY_CONFIG[announcement.priority];
                        const PriorityIcon = priorityConfig.icon;
                        return (
                            <motion.div
                                key={announcement.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedAnnouncement(announcement)}
                                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-all border-l-4 ${priorityConfig.accent}`}
                            >
                                <div className="flex items-start gap-4">
                                    {announcement.image_path && (
                                        <img src={getAnnouncementImageUrl(announcement.image_path)} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.color}`}>
                                                <PriorityIcon className="w-3 h-3" />
                                                {priorityConfig.label}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                                        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(announcement.created_at)} at {formatTime(announcement.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}


            {/* Announcement Detail Modal */}
            <AnimatePresence>
                {selectedAnnouncement && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAnnouncement(null)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full bg-white rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const config = PRIORITY_CONFIG[selectedAnnouncement.priority];
                                        const Icon = config.icon;
                                        return (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                                                <Icon className="w-3 h-3" />
                                                {config.label} Priority
                                            </span>
                                        );
                                    })()}
                                </div>
                                <button
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {selectedAnnouncement.image_path && (
                                    <img
                                        src={getAnnouncementImageUrl(selectedAnnouncement.image_path)}
                                        alt=""
                                        className="w-full h-48 sm:h-64 object-cover rounded-lg mb-6"
                                    />
                                )}
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedAnnouncement.title}</h2>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(selectedAnnouncement.created_at)} at {formatTime(selectedAnnouncement.created_at)}
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                    {selectedAnnouncement.content}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
