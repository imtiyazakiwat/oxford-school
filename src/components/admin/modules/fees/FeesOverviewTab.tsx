"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  UserX,
} from "lucide-react";
import {
  FeeStatistics,
  getFeeStatistics,
  updateOverdueStatuses,
} from "@/supabase/fees";
import { formatCurrency, formatDate, StatusBadge, StatCard } from "./shared";

interface FeesOverviewTabProps {
  academicYear: string;
}

export default function FeesOverviewTab({ academicYear }: FeesOverviewTabProps) {
  const [statistics, setStatistics] = useState<FeeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Update overdue statuses first
    await updateOverdueStatuses();
    
    const { data, error: fetchError } = await getFeeStatistics(academicYear);
    if (fetchError) {
      setError(fetchError);
    } else {
      setStatistics(data);
    }
    setLoading(false);
  }, [academicYear]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a] mx-auto" />
        <p className="text-gray-500 mt-2">Loading statistics...</p>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{error || "Failed to load statistics"}</p>
        <button
          onClick={fetchStatistics}
          className="mt-4 px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expected"
          value={formatCurrency(statistics.totalExpected)}
          icon={<IndianRupee className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Collected This Month"
          value={formatCurrency(statistics.totalCollectedThisMonth)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(statistics.totalOutstanding)}
          icon={<TrendingDown className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          title="Overdue Students"
          value={statistics.overdueStudentCount.toString()}
          icon={<UserX className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Trend (Last 6 Months)</h3>
          <div className="space-y-3">
            {statistics.monthlyTrend.map((item, index) => {
              const maxAmount = Math.max(...statistics.monthlyTrend.map(t => t.amount));
              const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20">{item.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-[#c41e3a] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          {statistics.recentPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent payments</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {statistics.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.student?.first_name} {payment.student?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{payment.receipt_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(payment.payment_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Defaulters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Defaulters</h3>
        {statistics.topDefaulters.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No defaulters found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Total Fees</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Due Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Due Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {statistics.topDefaulters.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {record.student?.first_name} {record.student?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{record.student?.student_id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{record.student?.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(record.total_fees)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600 text-right">{formatCurrency(record.due_fees)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(record.due_date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={record.fee_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
