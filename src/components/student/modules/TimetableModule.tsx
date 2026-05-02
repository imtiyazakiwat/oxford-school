"use client";

export default function TimetableModule() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const periods = [
        { time: "8:00 - 8:45", period: 1 },
        { time: "8:45 - 9:30", period: 2 },
        { time: "9:30 - 10:15", period: 3 },
        { time: "10:15 - 10:30", period: "Break" },
        { time: "10:30 - 11:15", period: 4 },
        { time: "11:15 - 12:00", period: 5 },
        { time: "12:00 - 12:45", period: 6 },
        { time: "12:45 - 1:30", period: "Lunch" },
        { time: "1:30 - 2:15", period: 7 },
        { time: "2:15 - 3:00", period: 8 },
    ];

    const schedule: { [key: string]: string[] } = {
        Monday: ["Math", "Physics", "English", "", "Chemistry", "CS", "Hindi", "", "Sports", "Library"],
        Tuesday: ["Physics", "Math", "Chemistry", "", "English", "Hindi", "CS", "", "Math", "Physics"],
        Wednesday: ["Chemistry", "English", "Math", "", "Physics", "CS", "Hindi", "", "Chemistry", "English"],
        Thursday: ["English", "Chemistry", "Physics", "", "Math", "Hindi", "CS", "", "Physics", "Math"],
        Friday: ["CS", "Hindi", "Math", "", "Chemistry", "Physics", "English", "", "Lab", "Lab"],
        Saturday: ["Math", "Physics", "Chemistry", "", "English", "Hindi", "-", "", "-", "-"],
    };

    const getSubjectColor = (subject: string) => {
        const colors: { [key: string]: string } = {
            Math: "bg-blue-100 text-blue-700",
            Physics: "bg-purple-100 text-purple-700",
            Chemistry: "bg-green-100 text-green-700",
            English: "bg-orange-100 text-orange-700",
            Hindi: "bg-yellow-100 text-yellow-700",
            CS: "bg-pink-100 text-pink-700",
            Sports: "bg-red-100 text-red-700",
            Library: "bg-indigo-100 text-indigo-700",
            Lab: "bg-teal-100 text-teal-700",
        };
        return colors[subject] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Weekly Timetable - Class 12-A</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 w-32">Time</th>
                            {days.map((day) => (
                                <th key={day} className="text-center px-4 py-3 text-sm font-semibold text-gray-600">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {periods.map((period, idx) => (
                            <tr key={idx} className={period.period === "Break" || period.period === "Lunch" ? "bg-gray-50" : ""}>
                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                    <div className="font-medium">{period.time}</div>
                                    <div className="text-xs text-gray-400">
                                        {typeof period.period === "number" ? `Period ${period.period}` : period.period}
                                    </div>
                                </td>
                                {days.map((day) => {
                                    const subject = schedule[day][idx];
                                    if (period.period === "Break" || period.period === "Lunch") {
                                        return (
                                            <td key={day} className="px-4 py-3 text-center text-sm text-gray-500 italic">
                                                {period.period}
                                            </td>
                                        );
                                    }
                                    return (
                                        <td key={day} className="px-4 py-3 text-center">
                                            {subject && subject !== "-" ? (
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSubjectColor(subject)}`}>
                                                    {subject}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
