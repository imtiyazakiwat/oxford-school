"use client";

import { FeeStatus } from "@/firebase/fees";

// Current academic year helper
export const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Academic year starts in April (month 3)
  if (month >= 3) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
};

// Format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Status badge component
export const StatusBadge = ({ status }: { status: FeeStatus }) => {
  const colors = {
    Paid: "bg-green-100 text-green-700",
    Partial: "bg-yellow-100 text-yellow-700",
    Pending: "bg-blue-100 text-blue-700",
    Overdue: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

// Input class for forms
export const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]";
export const selectClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] bg-white";

// Academic year options (only 2025-2026 for now)
export const academicYearOptions = ["2025-2026"];

// Class options organized by category
export const classOptions = [
  // Pre-Primary
  "LKG A",
  "LKG B",
  "UKG A",
  "UKG B",
  // Primary
  "1A", "1B", "1C", "1D",
  "2A", "2B",
  "3A", "3B",
  "4A", "4B",
  "5",
  // Upper Primary / High School
  "6A", "6B",
  "7A", "7B",
  "8A", "8B",
  "9A", "9B",
  "10A", "10B",
  // College (PU) - Science
  "PU-I Science",
  "PU-II Science",
  // College (PU) - Arts
  "PU-I Arts",
  "PU-II Arts",
  // College (PU) - Commerce
  "PU-I Commerce",
  "PU-II Commerce",
];

// Sections map for classes that need section assignment during admission
export const sectionsMap: Record<string, string[]> = {
  "PU-I Science": ["A", "B", "C", "D", "E", "F"],
  "PU-II Science": ["A", "B", "C", "D", "E"],
  "PU-I Arts": ["A"],
  "PU-II Arts": ["A"],
  "PU-I Commerce": ["A"],
  "PU-II Commerce": ["A"],
};

// Stat Card Component
export function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
