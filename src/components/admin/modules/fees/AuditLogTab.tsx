"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  FeeAuditLog,
  getFeeAuditLogs,
} from "@/firebase/fees";

export default function AuditLogTab() {
  const [logs, setLogs] = useState<FeeAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState<"INSERT" | "UPDATE" | "DELETE" | "all">("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const filters: {
      action?: "INSERT" | "UPDATE" | "DELETE";
      table_name?: string;
      start_date?: string;
      end_date?: string;
    } = {};
    
    if (actionFilter !== "all") filters.action = actionFilter;
    if (tableFilter !== "all") filters.table_name = tableFilter;
    if (dateFrom) filters.start_date = dateFrom;
    if (dateTo) filters.end_date = dateTo;

    const { data } = await getFeeAuditLogs(Object.keys(filters).length > 0 ? filters : undefined);
    setLogs(data || []);
    setLoading(false);
  }, [actionFilter, tableFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    const colors = {
      INSERT: "bg-green-100 text-green-700",
      UPDATE: "bg-blue-100 text-blue-700",
      DELETE: "bg-red-100 text-red-700",
    };
    return colors[action as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getTableLabel = (tableName: string) => {
    const labels: Record<string, string> = {
      fee_structures: "Fee Structure",
      fee_records: "Fee Record",
      fee_payments: "Payment",
    };
    return labels[tableName] || tableName;
  };

  const formatChanges = (oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) => {
    if (!oldData && newData) {
      return Object.entries(newData)
        .filter(([key]) => !["id", "created_at", "updated_at", "created_by"].includes(key))
        .map(([key, value]) => ({ key, old: null, new: value }));
    }
    if (oldData && !newData) {
      return Object.entries(oldData)
        .filter(([key]) => !["id", "created_at", "updated_at", "created_by"].includes(key))
        .map(([key, value]) => ({ key, old: value, new: null }));
    }
    if (oldData && newData) {
      const changes: { key: string; old: unknown; new: unknown }[] = [];
      const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
      allKeys.forEach((key) => {
        if (["id", "created_at", "updated_at", "created_by"].includes(key)) return;
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
          changes.push({ key, old: oldData[key], new: newData[key] });
        }
      });
      return changes;
    }
    return [];
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
        >
          <option value="all">All Tables</option>
          <option value="fee_structures">Fee Structures</option>
          <option value="fee_records">Fee Records</option>
          <option value="fee_payments">Payments</option>
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as typeof actionFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
        >
          <option value="all">All Actions</option>
          <option value="INSERT">Created</option>
          <option value="UPDATE">Updated</option>
          <option value="DELETE">Deleted</option>
        </select>
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
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Audit Log List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a] mx-auto" />
            <p className="text-gray-500 mt-2">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const changes = formatChanges(log.old_data, log.new_data);
              const isExpanded = expandedLog === log.id;

              return (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{getTableLabel(log.table_name)}</p>
                        <p className="text-xs text-gray-500">
                          by {log.admin_user?.name || log.admin_user?.email || "Unknown"} • {new Date(log.changed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button className="p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && changes.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          {changes.map((change, idx) => (
                            <div key={idx} className="flex items-start gap-4 text-sm">
                              <span className="font-medium text-gray-600 w-32 flex-shrink-0">
                                {change.key.replace(/_/g, " ")}:
                              </span>
                              {log.action === "INSERT" ? (
                                <span className="text-green-600">
                                  {typeof change.new === "object" ? JSON.stringify(change.new) : String(change.new ?? "-")}
                                </span>
                              ) : log.action === "DELETE" ? (
                                <span className="text-red-600 line-through">
                                  {typeof change.old === "object" ? JSON.stringify(change.old) : String(change.old ?? "-")}
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 line-through">
                                    {typeof change.old === "object" ? JSON.stringify(change.old) : String(change.old ?? "-")}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-green-600">
                                    {typeof change.new === "object" ? JSON.stringify(change.new) : String(change.new ?? "-")}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
