"use client";

export default function LibraryModule() {
    const issuedBooks = [
        { title: "NCERT Physics Part 2", author: "NCERT", issueDate: "Dec 1, 2024", dueDate: "Dec 15, 2024", status: "due_soon" },
        { title: "HC Verma - Concepts of Physics", author: "H.C. Verma", issueDate: "Nov 25, 2024", dueDate: "Dec 25, 2024", status: "active" },
    ];

    const history = [
        { title: "RD Sharma Mathematics", returned: "Nov 20, 2024" },
        { title: "English Grammar & Composition", returned: "Nov 15, 2024" },
        { title: "Organic Chemistry - Morrison Boyd", returned: "Oct 28, 2024" },
    ];

    return (
        <div className="space-y-6">
            {/* Currently Issued */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Currently Issued Books</h3>
                </div>
                <div className="divide-y">
                    {issuedBooks.map((book, index) => (
                        <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <p className="font-medium text-gray-900">{book.title}</p>
                                <p className="text-sm text-gray-500">By {book.author}</p>
                                <p className="text-xs text-gray-400 mt-1">Issued: {book.issueDate} | Due: {book.dueDate}</p>
                            </div>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${book.status === "due_soon" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                                {book.status === "due_soon" ? "Due Soon" : "Active"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Return History</h3>
                </div>
                <div className="divide-y">
                    {history.map((book, index) => (
                        <div key={index} className="p-4 flex items-center justify-between">
                            <p className="font-medium text-gray-900">{book.title}</p>
                            <span className="text-sm text-gray-500">Returned: {book.returned}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
