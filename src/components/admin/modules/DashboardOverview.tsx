"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ClipboardList, CheckCircle, Clock, Calendar, ArrowRight } from "lucide-react";
import { getAllExamRegistrations, ExamRegistration } from "@/firebase/examRegistrations";

interface DashboardOverviewProps {
    onNavigate?: (module: string) => void;
}

export default function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
    const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
    const [loading, setLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await getAllExamRegistrations();
            setRegistrations(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const paidCount = registrations.filter(r => r.payment_verified).length;
    const unpaidCount = registrations.length - paidCount;
    const recent = registrations.slice(0, 5);

    const getTimeAgo = (dateString: string) => {
        const diffMs = Date.now() - new Date(dateString).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-white/70 text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold mt-2">{getGreeting()}! 👋</h1>
                        <p className="text-white/80 mt-1">Here&apos;s your exam registration overview.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                            <p className="text-3xl font-bold">{loading ? "–" : registrations.length}</p>
                            <p className="text-xs text-white/70">Total Registrations</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
                            <p className="text-3xl font-bold">{loading ? "–" : unpaidCount}</p>
                            <p className="text-xs text-white/70">Payment Pending</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Registrations", value: registrations.length, icon: ClipboardList, color: "bg-blue-500" },
                    { label: "Payment Verified", value: paidCount, icon: CheckCircle, color: "bg-green-500" },
                    { label: "Payment Pending", value: unpaidCount, icon: Clock, color: "bg-amber-500" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "–" : stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}><Icon className="w-5 h-5 text-white" /></div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Registrations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-[#c41e3a]" /> Recent Registrations
                    </h3>
                    <button onClick={() => onNavigate?.("exam-registrations")} className="text-sm text-[#c41e3a] hover:underline flex items-center gap-1">
                        View all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="divide-y">
                    {loading ? (
                        <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#c41e3a] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                    ) : recent.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No registrations yet</div>
                    ) : (
                        recent.map((reg) => (
                            <div key={reg.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onNavigate?.("exam-registrations")}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {reg.photo_url ? (
                                            <img src={reg.photo_url} alt="" className="w-9 h-9 rounded-full object-cover border" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">{reg.full_name.charAt(0)}</div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{reg.full_name}</p>
                                            <p className="text-xs text-gray-500">{reg.hall_ticket_number} • {reg.current_class}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${reg.payment_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                            {reg.payment_verified ? "Paid" : "Pending"}
                                        </span>
                                        <span className="text-xs text-gray-400">{getTimeAgo(reg.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
