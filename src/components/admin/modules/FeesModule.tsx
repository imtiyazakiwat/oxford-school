"use client";

import { Banknote } from "lucide-react";

export default function FeesModule() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="w-20 h-20 bg-[#c41e3a]/10 rounded-full flex items-center justify-center mb-6">
                <Banknote className="w-10 h-10 text-[#c41e3a]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fees Management</h2>
            <p className="text-gray-500 text-center max-w-md mb-4">
                Fee structure, payment tracking, and financial reports will be available here.
            </p>
            <span className="px-4 py-2 bg-[#f7c52d] text-gray-900 font-semibold rounded-full text-sm">
                Coming Soon
            </span>
        </div>
    );
}
