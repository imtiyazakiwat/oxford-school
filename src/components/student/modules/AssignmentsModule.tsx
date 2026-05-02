"use client";

import { AlertCircle, CheckCircle, Award } from "lucide-react";

export default function AssignmentsModule() {
    const assignments = [
        { subject: "Mathematics", title: "Chapter 12 - Probability Problems", dueDate: "Dec 15, 2024", status: "pending" },
        { subject: "Physics", title: "Lab Report - Ohm's Law", dueDate: "Dec 16, 2024", status: "pending" },
        { subject: "Chemistry", title: "Organic Chemistry Worksheet", dueDate: "Dec 18, 2024", status: "pending" },
        { subject: "English", title: "Essay - Climate Change", dueDate: "Dec 10, 2024", status: "submitted" },
        { subject: "Computer Science", title: "Python Project - Data Analysis", dueDate: "Dec 8, 2024", status: "graded", grade: "A" },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Assignments</h3>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    3 Pending
                </span>
            </div>
            <div className="divide-y">
                {assignments.map((item, index) => (
                    <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                        <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.subject} • Due: {item.dueDate}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${item.status === "pending" ? "bg-orange-100 text-orange-700" :
                            item.status === "submitted" ? "bg-blue-100 text-blue-700" :
                                "bg-green-100 text-green-700"
                            }`}>
                            {item.status === "pending" && <AlertCircle className="w-4 h-4" />}
                            {item.status === "submitted" && <CheckCircle className="w-4 h-4" />}
                            {item.status === "graded" && <Award className="w-4 h-4" />}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            {item.grade && ` - ${item.grade}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
