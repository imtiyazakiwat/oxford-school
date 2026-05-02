"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Download,
} from "lucide-react";
import {
  CollectionReport,
  DefaultersReport,
  ClassWiseReport,
  getCollectionReport,
  getDefaultersReport,
  getClassWiseReport,
  exportReportToCSV,
} from "@/supabase/fees";
import { formatCurrency, formatDate, classOptions } from "./shared";

interface ReportsTabProps {
  academicYear: string;
}

export default function ReportsTab({ academicYear }: ReportsTabProps) {
  const [activeReport, setActiveReport] = useState<"collection" | "defaulters" | "classwise">("collection");
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [classFilter, setClassFilter] = useState("all");

  const [collectionReport, setCollectionReport] = useState<CollectionReport | null>(null);
  const [defaultersReport, setDefaultersReport] = useState<DefaultersReport | null>(null);
  const [classWiseReport, setClassWiseReport] = useState<ClassWiseReport | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    
    if (activeReport === "collection") {
      const { data } = await getCollectionReport({
        start_date: dateFrom,
        end_date: dateTo,
        class: classFilter !== "all" ? classFilter : undefined,
      });
      setCollectionReport(data);
    } else if (activeReport === "defaulters") {
      const { data } = await getDefaultersReport({
        academic_year: academicYear,
        class: classFilter !== "all" ? classFilter : undefined,
      });
      setDefaultersReport(data);
    } else if (activeReport === "classwise") {
      const { data } = await getClassWiseReport(academicYear);
      setClassWiseReport(data);
    }
    
    setLoading(false);
  }, [activeReport, dateFrom, dateTo, classFilter, academicYear]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCSV = () => {
    let csvContent = "";
    let filename = "";

    if (activeReport === "collection" && collectionReport) {
      csvContent = exportReportToCSV(collectionReport.payments, "payments");
      filename = `collection_report_${dateFrom}_to_${dateTo}.csv`;
    } else if (activeReport === "defaulters" && defaultersReport) {
      csvContent = exportReportToCSV(defaultersReport.defaulters, "records");
      filename = `defaulters_report_${academicYear}.csv`;
    } else if (activeReport === "classwise" && classWiseReport) {
      const headers = ["Class", "Students", "Expected", "Collected", "Outstanding", "Paid", "Partial", "Pending", "Overdue"];
      const rows = classWiseReport.classes.map((c) => [
        c.class,
        c.totalStudents.toString(),
        c.totalExpected.toString(),
        c.totalCollected.toString(),
        c.totalOutstanding.toString(),
        c.paidCount.toString(),
        c.partialCount.toString(),
        c.pendingCount.toString(),
        c.overdueCount.toString(),
      ]);
      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      filename = `classwise_report_${academicYear}.csv`;
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Report Type Selection */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveReport("collection")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeReport === "collection"
              ? "bg-[#c41e3a] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Collection Report
        </button>
        <button
          onClick={() => setActiveReport("defaulters")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeReport === "defaulters"
              ? "bg-[#c41e3a] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Defaulters Report
        </button>
        <button
          onClick={() => setActiveReport("classwise")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeReport === "classwise"
              ? "bg-[#c41e3a] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Class-wise Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {activeReport === "collection" && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
          </>
        )}
        {(activeReport === "collection" || activeReport === "defaulters") && (
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
          >
            <option value="all">All Classes</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        )}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a] mx-auto" />
            <p className="text-gray-500 mt-2">Generating report...</p>
          </div>
        ) : (
          <>
            {/* Collection Report */}
            {activeReport === "collection" && collectionReport && (
              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total Collected</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(collectionReport.totalCollected)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Payment Count</p>
                    <p className="text-2xl font-bold text-blue-600">{collectionReport.paymentCount}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Average Payment</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(collectionReport.paymentCount > 0 ? collectionReport.totalCollected / collectionReport.paymentCount : 0)}
                    </p>
                  </div>
                </div>

                {/* By Class */}
                {collectionReport.byClass.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Collection by Class</h4>
                    <div className="space-y-2">
                      {collectionReport.byClass.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{item.class}</span>
                          <div className="text-right">
                            <span className="font-semibold text-green-600">{formatCurrency(item.amount)}</span>
                            <span className="text-sm text-gray-500 ml-2">({item.count} payments)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Defaulters Report */}
            {activeReport === "defaulters" && defaultersReport && (
              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total Defaulters</p>
                    <p className="text-2xl font-bold text-red-600">{defaultersReport.totalDefaulters}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total Overdue Amount</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(defaultersReport.totalOverdueAmount)}</p>
                  </div>
                </div>

                {/* Defaulters List */}
                {defaultersReport.defaulters.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Due Amount</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {defaultersReport.defaulters.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium">{record.student?.first_name} {record.student?.last_name}</p>
                              <p className="text-xs text-gray-500">{record.student?.student_id}</p>
                            </td>
                            <td className="px-4 py-3 text-sm">{record.student?.class}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-red-600 text-right">
                              {formatCurrency(record.due_fees)}
                            </td>
                            <td className="px-4 py-3 text-sm">{formatDate(record.due_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No defaulters found</p>
                )}
              </div>
            )}

            {/* Class-wise Report */}
            {activeReport === "classwise" && classWiseReport && (
              <div className="p-6">
                {classWiseReport.classes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Students</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Expected</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Collected</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Outstanding</th>
                          <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Status Breakdown</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {classWiseReport.classes.map((cls, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{cls.class}</td>
                            <td className="px-4 py-3 text-right">{cls.totalStudents}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(cls.totalExpected)}</td>
                            <td className="px-4 py-3 text-right text-green-600">{formatCurrency(cls.totalCollected)}</td>
                            <td className="px-4 py-3 text-right text-red-600">{formatCurrency(cls.totalOutstanding)}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{cls.paidCount} Paid</span>
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">{cls.partialCount} Partial</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{cls.pendingCount} Pending</span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">{cls.overdueCount} Overdue</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No data available for this academic year</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
