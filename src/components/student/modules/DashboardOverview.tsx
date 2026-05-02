"use client";

import { motion } from "motion/react";
import { Calendar, Award, FileText, Library } from "lucide-react";
import { StudentData } from "./types";

interface DashboardOverviewProps {
    studentData: StudentData;
}

export default function DashboardOverview({ studentData }: DashboardOverviewProps) {
    const stats = [
        { label: "Attendance", value: "94.5%", icon: Calendar, color: "bg-green-500" },
        { label: "Current Rank", value: "5th", icon: Award, color: "bg-blue-500" },
        { label: "Pending Assignments", value: "3", icon: FileText, color: "bg-orange-500" },
        { label: "Library Books", value: "2", icon: Library, color: "bg-purple-500" },
    ];

    const upcomingExams = [
        { subject: "Mathematics", date: "Dec 18, 2024", time: "10:00 AM" },
        { subject: "Physics", date: "Dec 20, 2024", time: "10:00 AM" },
        { subject: "Chemistry", date: "Dec 22, 2024", time: "10:00 AM" },
    ];

    const recentGrades = [
        { subject: "English", grade: "A", percentage: "92%" },
        { subject: "Mathematics", grade: "A+", percentage: "96%" },
        { subject: "Physics", grade: "A", percentage: "89%" },
        { subject: "Chemistry", grade: "B+", percentage: "85%" },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {studentData.name}! 👋</h2>
                <p className="text-white/80">Class {studentData.class} | Roll No: {studentData.rollNo}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Exams */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Upcoming Exams</h3>
                        <span className="text-xs bg-[#c41e3a] text-white px-2 py-1 rounded-full">
                            {upcomingExams.length}
                        </span>
                    </div>
                    <div className="divide-y">
                        {upcomingExams.map((exam, index) => (
                            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{exam.subject}</p>
                                    <p className="text-sm text-gray-500">{exam.date}</p>
                                </div>
                                <span className="text-sm text-gray-600">{exam.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Grades */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Recent Grades</h3>
                    </div>
                    <div className="divide-y">
                        {recentGrades.map((item, index) => (
                            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{item.subject}</p>
                                    <p className="text-sm text-gray-500">{item.percentage}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.grade.startsWith("A") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                    {item.grade}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
