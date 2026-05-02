"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, Search, CheckCircle, XCircle, Eye, X, IndianRupee } from "lucide-react";
import { getAllExamRegistrations, togglePaymentVerification, ExamRegistration } from "@/firebase/examRegistrations";

export default function ExamRegistrationsModule() {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [selected, setSelected] = useState<ExamRegistration | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await getAllExamRegistrations();
    setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = registrations.filter((r) => {
    const matchesSearch = r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.hall_ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      r.mobile_number.includes(search);
    const matchesFilter = filter === "all" || (filter === "paid" ? r.payment_verified : !r.payment_verified);
    return matchesSearch && matchesFilter;
  });

  const handleTogglePayment = async (reg: ExamRegistration) => {
    setToggling(reg.id);
    const { error } = await togglePaymentVerification(reg.id, !reg.payment_verified);
    if (!error) {
      setRegistrations((prev) => prev.map((r) => r.id === reg.id ? { ...r, payment_verified: !r.payment_verified } : r));
      if (selected?.id === reg.id) setSelected({ ...selected, payment_verified: !selected.payment_verified });
    }
    setToggling(null);
  };

  const paidCount = registrations.filter((r) => r.payment_verified).length;
  const unpaidCount = registrations.length - paidCount;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Registrations", value: registrations.length, color: "text-gray-900" },
          { label: "Payment Verified", value: paidCount, color: "text-green-600" },
          { label: "Payment Pending", value: unpaidCount, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search by name, hall ticket, or mobile..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#c41e3a] text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "paid", "unpaid"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === f ? "bg-[#c41e3a] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              {f === "all" ? "All" : f === "paid" ? "✅ Paid" : "⏳ Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No registrations found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Hall Ticket</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Mobile</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Class</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Payment</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {reg.photo_url ? (
                          <img src={reg.photo_url} alt="" className="w-9 h-9 rounded-full object-cover border" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                            {reg.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{reg.full_name}</p>
                          <p className="text-xs text-gray-500 md:hidden">{reg.hall_ticket_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#c41e3a] font-medium hidden md:table-cell">{reg.hall_ticket_number}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{reg.mobile_number}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{reg.current_class}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePayment(reg)}
                        disabled={toggling === reg.id}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          reg.payment_verified
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        }`}
                      >
                        {reg.payment_verified ? <><CheckCircle className="w-3.5 h-3.5" /> Verified</> : <><XCircle className="w-3.5 h-3.5" /> Pending</>}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelected(reg)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white rounded-2xl z-50 overflow-y-auto"
            >
              <div className="bg-[#c41e3a] px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Registration Details</h3>
                  <p className="text-white/80 text-sm">{selected.hall_ticket_number}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5 text-white" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  {selected.photo_url && <img src={selected.photo_url} alt="" className="w-20 h-24 object-cover rounded-lg border-2 border-[#c41e3a]" />}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selected.full_name}</h4>
                    <p className="text-gray-500">{selected.gender} • DOB: {selected.date_of_birth}</p>
                    <button
                      onClick={() => handleTogglePayment(selected)}
                      disabled={toggling === selected.id}
                      className={`mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${
                        selected.payment_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <IndianRupee className="w-4 h-4" />
                      {selected.payment_verified ? "Payment Verified ✓" : "Mark as Paid"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Father's Name", selected.father_name],
                    ["Mother's Name", selected.mother_name],
                    ["Mobile Number", selected.mobile_number],
                    ["School Name", selected.school_name],
                    ["STS Number", selected.sts_number],
                    ["Current Class", selected.current_class],
                    ["Exam Medium", selected.exam_medium],
                    ["Caste/Category", selected.caste_category],
                    ["District & Taluk", selected.district_taluk],
                    ["Registered On", new Date(selected.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-medium text-gray-900">{value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Village & Address</p>
                    <p className="font-medium text-gray-900">{selected.village_address}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
