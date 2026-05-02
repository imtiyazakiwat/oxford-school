"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Trash2, AlertCircle, Eye, CheckCircle, Archive, X, Phone, Calendar, Filter } from "lucide-react";
import {
    ContactSubmission,
    getAllContactSubmissions,
    updateContactStatus,
    deleteContactSubmission,
} from "@/firebase/contactSubmissions";

const STATUS_CONFIG = {
    new: { label: "New", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500" },
    read: { label: "Read", color: "bg-yellow-100 text-yellow-700", dotColor: "bg-yellow-500" },
    replied: { label: "Replied", color: "bg-green-100 text-green-700", dotColor: "bg-green-500" },
    archived: { label: "Archived", color: "bg-gray-100 text-gray-600", dotColor: "bg-gray-400" },
};

const SUBJECT_LABELS: Record<string, string> = {
    admissions: "Admissions Inquiry",
    navodaya: "Navodaya Coaching",
    sainik: "Sainik School Coaching",
    hostel: "Hostel Facilities",
    fees: "Fee Structure",
    other: "Other",
};

export default function ContactSubmissionsModule() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<ContactSubmission["status"] | "all">("all");
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; submission: ContactSubmission | null }>({ show: false, submission: null });
    const [deleting, setDeleting] = useState(false);

    const filteredSubmissions = filterStatus === "all" 
        ? submissions 
        : submissions.filter(s => s.status === filterStatus);

    const statusCounts = {
        all: submissions.length,
        new: submissions.filter(s => s.status === "new").length,
        read: submissions.filter(s => s.status === "read").length,
        replied: submissions.filter(s => s.status === "replied").length,
        archived: submissions.filter(s => s.status === "archived").length,
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        setLoading(true);
        const { data } = await getAllContactSubmissions();
        setSubmissions(data);
        setLoading(false);
    };

    const handleStatusChange = async (submission: ContactSubmission, newStatus: ContactSubmission["status"]) => {
        const { error } = await updateContactStatus(submission.id, newStatus);
        if (error) {
            alert("Failed to update status: " + error);
            return;
        }
        await loadSubmissions();
        if (selectedSubmission?.id === submission.id) {
            setSelectedSubmission({ ...selectedSubmission, status: newStatus });
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.submission) return;
        setDeleting(true);
        const { error } = await deleteContactSubmission(deleteModal.submission.id);
        if (error) {
            alert("Failed to delete: " + error);
            setDeleting(false);
            return;
        }
        await loadSubmissions();
        setDeleting(false);
        setDeleteModal({ show: false, submission: null });
        if (selectedSubmission?.id === deleteModal.submission.id) {
            setSelectedSubmission(null);
        }
    };

    const handleViewSubmission = async (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        if (submission.status === "new") {
            await handleStatusChange(submission, "read");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };


    return (
        <div className="space-y-6">
            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.show && deleteModal.submission && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !deleting && setDeleteModal({ show: false, submission: null })}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                                <div><h3 className="text-lg font-semibold text-gray-900">Delete Submission</h3><p className="text-sm text-gray-500">This action cannot be undone</p></div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="font-medium text-gray-900">{deleteModal.submission.full_name}</p>
                                <p className="text-sm text-gray-500">{deleteModal.submission.email}</p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteModal({ show: false, submission: null })} disabled={deleting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50">Cancel</button>
                                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50">
                                    {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedSubmission && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSubmission(null)} className="fixed inset-0 bg-black/50 z-50" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full bg-white rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[selectedSubmission.status].color}`}>{STATUS_CONFIG[selectedSubmission.status].label}</span>
                                    <span className="text-sm text-gray-500">{SUBJECT_LABELS[selectedSubmission.subject] || selectedSubmission.subject}</span>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedSubmission.full_name}</h2>
                                        <a href={`mailto:${selectedSubmission.email}`} className="text-[#c41e3a] hover:underline text-sm">{selectedSubmission.email}</a>
                                        {selectedSubmission.phone && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3.5 h-3.5" />{selectedSubmission.phone}</p>}
                                    </div>
                                    <div className="text-right text-xs text-gray-500"><Calendar className="w-3.5 h-3.5 inline mr-1" />{formatDate(selectedSubmission.created_at)}</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.message}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-sm text-gray-600 mr-2">Mark as:</span>
                                    {(["read", "replied", "archived"] as const).map(status => (
                                        <button key={status} onClick={() => handleStatusChange(selectedSubmission, status)} disabled={selectedSubmission.status === status} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedSubmission.status === status ? STATUS_CONFIG[status].color : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                            {STATUS_CONFIG[status].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 border-t flex justify-between">
                                <button onClick={() => setDeleteModal({ show: true, submission: selectedSubmission })} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-1"><Trash2 className="w-4 h-4" />Delete</button>
                                <a href={`mailto:${selectedSubmission.email}?subject=Re: ${SUBJECT_LABELS[selectedSubmission.subject] || selectedSubmission.subject}`} className="px-4 py-2 bg-[#c41e3a] text-white rounded-lg text-sm font-medium hover:bg-[#a81832]">Reply via Email</a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-[#c41e3a]" />
                            Contact Submissions
                            {statusCounts.new > 0 && <span className="bg-[#c41e3a] text-white text-xs px-2 py-0.5 rounded-full">{statusCounts.new} new</span>}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">View and manage contact form submissions</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c41e3a]">
                            <option value="all">All ({statusCounts.all})</option>
                            <option value="new">New ({statusCounts.new})</option>
                            <option value="read">Read ({statusCounts.read})</option>
                            <option value="replied">Replied ({statusCounts.replied})</option>
                            <option value="archived">Archived ({statusCounts.archived})</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12"><div className="w-8 h-8 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">{filterStatus === "all" ? "No contact submissions yet." : `No ${filterStatus} submissions.`}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSubmissions.map(submission => {
                            const statusConfig = STATUS_CONFIG[submission.status];
                            return (
                                <div key={submission.id} onClick={() => handleViewSubmission(submission)} className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${submission.status === "new" ? "border-blue-200 bg-blue-50/30" : "border-gray-200 hover:border-gray-300"}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${statusConfig.dotColor}`} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-semibold text-gray-900">{submission.full_name}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                                                </div>
                                                <p className="text-sm text-gray-500">{submission.email}</p>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{submission.message}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-gray-500">{formatDate(submission.created_at)}</p>
                                            <p className="text-xs text-gray-400 mt-1">{SUBJECT_LABELS[submission.subject] || submission.subject}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
