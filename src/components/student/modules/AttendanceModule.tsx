"use client";

import { CheckCircle, XCircle } from "lucide-react";

export default function AttendanceModule() {
    const monthlyAttendance = [
        { month: "December 2024", present: 18, absent: 2, total: 20, percentage: "90%" },
        { month: "November 2024", present: 22, absent: 1, total: 23, percentage: "95.6%" },
        { month: "October 2024", present: 20, absent: 2, total: 22, percentage: "90.9%" },
        { month: "September 2024", present: 21, absent: 0, total: 21, percentage: "100%" },
    ];

    const recentAttendance = [
        { date: "Dec 13, 2024", day: "Friday", status: "present" },
        { date: "Dec 12, 2024", day: "Thursday", status: "present" },
        { date: "Dec 11, 2024", day: "Wednesday", status: "absent" },
        { date: "Dec 10, 2024", day: "Tuesday", status: "present" },
        { date: "Dec 9, 2024", day: "Monday", status: "present" },
    ];

    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Overall Attendance</p>
                    <p className="text-3xl font-bold text-[#c41e3a] mt-1">94.5%</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Days Present</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">81</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Days Absent</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">5</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Working Days</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">86</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Monthly Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Month</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Present</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Absent</th>
                                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {monthlyAttendance.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.month}</td>
                                        <td className="px-4 py-3 text-sm text-green-600 text-center font-medium">{item.present}</td>
                                        <td className="px-4 py-3 text-sm text-red-600 text-center font-medium">{item.absent}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-center font-medium">{item.percentage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Attendance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Recent Attendance</h3>
                    </div>
                    <div className="divide-y">
                        {recentAttendance.map((item, index) => (
                            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{item.date}</p>
                                    <p className="text-sm text-gray-500">{item.day}</p>
                                </div>
                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${item.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {item.status === "present" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
