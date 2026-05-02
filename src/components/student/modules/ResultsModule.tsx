"use client";

export default function ResultsModule() {
    const examResults = [
        {
            exam: "Mid-Term Examination",
            date: "October 2024",
            subjects: [
                { name: "English", marks: 92, total: 100, grade: "A" },
                { name: "Mathematics", marks: 96, total: 100, grade: "A+" },
                { name: "Physics", marks: 89, total: 100, grade: "A" },
                { name: "Chemistry", marks: 85, total: 100, grade: "B+" },
                { name: "Computer Science", marks: 94, total: 100, grade: "A" },
            ],
            totalMarks: 456,
            totalPossible: 500,
            percentage: "91.2%",
            rank: "5th",
        },
        {
            exam: "Unit Test 2",
            date: "September 2024",
            subjects: [
                { name: "English", marks: 45, total: 50, grade: "A" },
                { name: "Mathematics", marks: 48, total: 50, grade: "A+" },
                { name: "Physics", marks: 42, total: 50, grade: "A" },
                { name: "Chemistry", marks: 40, total: 50, grade: "B+" },
                { name: "Computer Science", marks: 47, total: 50, grade: "A" },
            ],
            totalMarks: 222,
            totalPossible: 250,
            percentage: "88.8%",
            rank: "7th",
        },
    ];

    return (
        <div className="space-y-6">
            {examResults.map((result, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-gray-900">{result.exam}</h3>
                            <p className="text-sm text-gray-500">{result.date}</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                {result.percentage}
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                Rank: {result.rank}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Subject</th>
                                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Marks</th>
                                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Grade</th>
                                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {result.subjects.map((subject, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                                            {subject.marks}/{subject.total}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${subject.grade.startsWith("A") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                                {subject.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-[#c41e3a] rounded-full h-2"
                                                    style={{ width: `${(subject.marks / subject.total) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t">
                                <tr>
                                    <td className="px-6 py-3 text-sm font-bold text-gray-900">Total</td>
                                    <td className="px-6 py-3 text-sm font-bold text-gray-900 text-center">
                                        {result.totalMarks}/{result.totalPossible}
                                    </td>
                                    <td className="px-6 py-3 text-sm font-bold text-[#c41e3a] text-center">{result.percentage}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
