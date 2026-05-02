"use client";

export default function FeesModule() {
    const feeStructure = [
        { type: "Tuition Fee", amount: "₹45,000", status: "paid" },
        { type: "Lab Fee", amount: "₹5,000", status: "paid" },
        { type: "Library Fee", amount: "₹2,000", status: "paid" },
        { type: "Sports Fee", amount: "₹3,000", status: "pending" },
        { type: "Exam Fee", amount: "₹2,500", status: "pending" },
    ];

    const paymentHistory = [
        { date: "Nov 15, 2024", amount: "₹25,000", method: "UPI", reference: "TXN123456" },
        { date: "Aug 10, 2024", amount: "₹27,000", method: "Bank Transfer", reference: "TXN789012" },
    ];

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Fee</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹57,500</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">₹52,000</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Balance Due</p>
                    <p className="text-2xl font-bold text-[#c41e3a] mt-1">₹5,500</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fee Structure */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Fee Structure</h3>
                    </div>
                    <div className="divide-y">
                        {feeStructure.map((item, index) => (
                            <div key={index} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{item.type}</p>
                                    <p className="text-sm text-gray-500">{item.amount}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Payment History</h3>
                    </div>
                    <div className="divide-y">
                        {paymentHistory.map((item, index) => (
                            <div key={index} className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-gray-900">{item.amount}</p>
                                    <p className="text-sm text-gray-500">{item.date}</p>
                                </div>
                                <p className="text-sm text-gray-500">{item.method} • Ref: {item.reference}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
