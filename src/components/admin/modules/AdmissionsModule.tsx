"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
    Plus,
    Eye,
    CheckCircle,
    XCircle,
    Search,
    Loader2,
    Users,
    UserCog,
    GraduationCap,
    Phone,
    BookOpen,
    Copy,
    Check,
    AlertCircle,
    Trash2,
} from "lucide-react";
import {
    getApplications,
    approveApplication,
    rejectApplication,
    updateApplicationUserId,
    deleteApplication,
    Application,
} from "@/firebase/applications";
import { createStudent } from "@/firebase/students";
import { useAuth } from "@/context/AuthContext";
import AdminPopup, {
    PopupSecondaryButton,
    PopupSuccessButton,
    PopupDangerButton,
    PopupSection,
    PopupInfoGrid,
} from "../AdminPopup";

export default function AdmissionsModule() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showNewAdmissionModal, setShowNewAdmissionModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [assignedSection, setAssignedSection] = useState("");
    const [createdCredentials, setCreatedCredentials] = useState<{
        email: string;
        password: string;
        studentId: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        const { data } = await getApplications(statusFilter);
        setApplications(data);
        setLoading(false);
    };

    const filteredApplications = applications.filter((app) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            app.first_name.toLowerCase().includes(search) ||
            app.last_name.toLowerCase().includes(search) ||
            app.application_number.toLowerCase().includes(search) ||
            app.email.toLowerCase().includes(search)
        );
    });

    const handleApprove = async () => {
        if (!selectedApp || !user) return;
        setProcessing(true);

        try {
            await approveApplication(selectedApp.id, user.uid, selectedApp.applying_for_class, assignedSection);

            const response = await fetch("/api/admin/create-student-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: selectedApp.email,
                    fullName: `${selectedApp.first_name} ${selectedApp.last_name}`,
                    applicationId: selectedApp.id,
                }),
            });

            const userData = await response.json();
            if (!response.ok) throw new Error(userData.error);

            const { data: student } = await createStudent({
                user_id: userData.userId,
                application_id: selectedApp.id,
                first_name: selectedApp.first_name,
                middle_name: selectedApp.middle_name,
                last_name: selectedApp.last_name,
                date_of_birth: selectedApp.date_of_birth,
                gender: selectedApp.gender,
                blood_group: selectedApp.blood_group,
                religion: selectedApp.religion,
                nationality: selectedApp.nationality,
                aadhar_number: selectedApp.aadhar_number,
                photo_url: selectedApp.photo_url,
                father_name: selectedApp.father_name,
                father_occupation: selectedApp.father_occupation,
                father_phone: selectedApp.father_phone,
                mother_name: selectedApp.mother_name,
                mother_occupation: selectedApp.mother_occupation,
                mother_phone: selectedApp.mother_phone,
                emergency_contact: selectedApp.emergency_contact,
                class: selectedApp.applying_for_class,
                section: assignedSection,
                academic_year: selectedApp.academic_year,
                previous_school: selectedApp.previous_school,
                email: selectedApp.email,
                phone: selectedApp.phone,
                current_address: selectedApp.current_address,
                medical_conditions: selectedApp.medical_conditions,
            });

            await updateApplicationUserId(selectedApp.id, userData.userId);

            setCreatedCredentials({
                email: selectedApp.email,
                password: userData.temporaryPassword,
                studentId: student?.student_id || "",
            });

            setShowApproveModal(false);
            setShowSuccessModal(true);
            fetchApplications();
        } catch (error) {
            console.error("Error approving application:", error);
            alert("Failed to approve application. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApp || !user || !rejectReason.trim()) return;
        setProcessing(true);

        const { error } = await rejectApplication(selectedApp.id, user.uid, rejectReason);
        if (!error) {
            setShowRejectModal(false);
            setRejectReason("");
            fetchApplications();
        }
        setProcessing(false);
    };

    const handleCopyCredentials = () => {
        if (!createdCredentials) return;
        const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nStudent ID: ${createdCredentials.studentId}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeleteApplication = async () => {
        if (!selectedApp) return;
        setDeleting(true);
        const { error } = await deleteApplication(selectedApp.id);
        if (error) {
            alert("Failed to delete application: " + error);
        } else {
            setShowDeleteModal(false);
            fetchApplications();
        }
        setDeleting(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved": return "bg-green-100 text-green-600";
            case "rejected": return "bg-red-100 text-red-600";
            default: return "bg-yellow-100 text-yellow-600";
        }
    };

    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]";

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-3 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <button
                    onClick={() => setShowNewAdmissionModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Admission
                </button>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a] mx-auto" />
                        <p className="text-gray-500 mt-2">Loading applications...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No applications found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Application ID</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Student Name</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Class</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{app.application_number}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">{app.first_name} {app.last_name}</p>
                                            <p className="text-xs text-gray-500">{app.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{app.applying_for_class}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(app.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusBadge(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setSelectedApp(app); setShowViewModal(true); }}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                </button>
                                                {app.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedApp(app); setShowApproveModal(true); }}
                                                            className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedApp(app); setShowRejectModal(true); }}
                                                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedApp(app); setShowDeleteModal(true); }}
                                                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Application Modal */}
            <AdminPopup
                isOpen={showViewModal && !!selectedApp}
                onClose={() => setShowViewModal(false)}
                title="Application Details"
                subtitle={selectedApp?.application_number}
                size="full"
                headerIcon={<Eye className="w-5 h-5" />}
                footer={selectedApp?.status === "pending" ? (
                    <>
                        <PopupSecondaryButton onClick={() => { setShowViewModal(false); setShowRejectModal(true); }}>
                            Reject
                        </PopupSecondaryButton>
                        <PopupSuccessButton onClick={() => { setShowViewModal(false); setShowApproveModal(true); }}>
                            Approve
                        </PopupSuccessButton>
                    </>
                ) : undefined}
            >
                {selectedApp && (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${selectedApp.status === "approved" ? "bg-green-50 text-green-700" : selectedApp.status === "rejected" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
                            {selectedApp.status === "approved" ? <CheckCircle className="w-5 h-5" /> : selectedApp.status === "rejected" ? <XCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <div>
                                <p className="font-medium capitalize">{selectedApp.status}</p>
                                {selectedApp.rejection_reason && <p className="text-sm">Reason: {selectedApp.rejection_reason}</p>}
                            </div>
                        </div>

                        <PopupSection title="Personal Information" icon={<Users className="w-5 h-5" />}>
                            <PopupInfoGrid columns={3}>
                                <div><p className="text-gray-500 text-xs">Full Name</p><p className="font-medium">{selectedApp.first_name} {selectedApp.middle_name} {selectedApp.last_name}</p></div>
                                <div><p className="text-gray-500 text-xs">Date of Birth</p><p className="font-medium">{selectedApp.date_of_birth}</p></div>
                                <div><p className="text-gray-500 text-xs">Gender</p><p className="font-medium">{selectedApp.gender}</p></div>
                                <div><p className="text-gray-500 text-xs">Blood Group</p><p className="font-medium">{selectedApp.blood_group || "-"}</p></div>
                                <div><p className="text-gray-500 text-xs">Religion</p><p className="font-medium">{selectedApp.religion || "-"}</p></div>
                                <div><p className="text-gray-500 text-xs">Nationality</p><p className="font-medium">{selectedApp.nationality}</p></div>
                            </PopupInfoGrid>
                        </PopupSection>

                        <PopupSection title="Parent/Guardian Information" icon={<UserCog className="w-5 h-5" />}>
                            <PopupInfoGrid columns={3}>
                                <div><p className="text-gray-500 text-xs">Father&apos;s Name</p><p className="font-medium">{selectedApp.father_name}</p></div>
                                <div><p className="text-gray-500 text-xs">Father&apos;s Occupation</p><p className="font-medium">{selectedApp.father_occupation || "-"}</p></div>
                                <div><p className="text-gray-500 text-xs">Father&apos;s Phone</p><p className="font-medium">{selectedApp.father_phone || "-"}</p></div>
                                <div><p className="text-gray-500 text-xs">Mother&apos;s Name</p><p className="font-medium">{selectedApp.mother_name}</p></div>
                                <div><p className="text-gray-500 text-xs">Mother&apos;s Occupation</p><p className="font-medium">{selectedApp.mother_occupation || "-"}</p></div>
                                <div><p className="text-gray-500 text-xs">Mother&apos;s Phone</p><p className="font-medium">{selectedApp.mother_phone || "-"}</p></div>
                            </PopupInfoGrid>
                        </PopupSection>

                        <PopupSection title="Academic Information" icon={<GraduationCap className="w-5 h-5" />}>
                            <PopupInfoGrid columns={3}>
                                <div><p className="text-gray-500 text-xs">Applying for Class</p><p className="font-medium">{selectedApp.applying_for_class}</p></div>
                                <div><p className="text-gray-500 text-xs">Academic Year</p><p className="font-medium">{selectedApp.academic_year}</p></div>
                                <div><p className="text-gray-500 text-xs">Previous School</p><p className="font-medium">{selectedApp.previous_school || "-"}</p></div>
                            </PopupInfoGrid>
                        </PopupSection>

                        <PopupSection title="Contact Information" icon={<Phone className="w-5 h-5" />}>
                            <PopupInfoGrid columns={2}>
                                <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{selectedApp.email}</p></div>
                                <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{selectedApp.phone}</p></div>
                            </PopupInfoGrid>
                        </PopupSection>
                    </div>
                )}
            </AdminPopup>

            {/* Approve Modal */}
            <AdminPopup
                isOpen={showApproveModal && !!selectedApp}
                onClose={() => setShowApproveModal(false)}
                title="Approve Application"
                size="full"
                headerIcon={<CheckCircle className="w-5 h-5" />}
                headerClassName="bg-gradient-to-r from-green-600 to-green-700"
                footer={
                    <>
                        <PopupSecondaryButton onClick={() => setShowApproveModal(false)} disabled={processing}>Cancel</PopupSecondaryButton>
                        <PopupSuccessButton onClick={handleApprove} loading={processing}>{processing ? "Processing..." : "Approve & Create Account"}</PopupSuccessButton>
                    </>
                }
            >
                {selectedApp && (
                    <div className="space-y-4">
                        <p className="text-gray-600">You are about to approve the application for:</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold text-gray-900">{selectedApp.first_name} {selectedApp.last_name}</p>
                            <p className="text-sm text-gray-500">{selectedApp.email}</p>
                            <p className="text-sm text-gray-500">Applying for: {selectedApp.applying_for_class}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Section (Optional)</label>
                            <select value={assignedSection} onChange={(e) => setAssignedSection(e.target.value)} className={inputClass}>
                                <option value="">Select Section</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="C">Section C</option>
                            </select>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                            <p className="font-medium mb-1">This will:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Create a student account with temporary password</li>
                                <li>Add student to the students database</li>
                                <li>Send login credentials (displayed after approval)</li>
                            </ul>
                        </div>
                    </div>
                )}
            </AdminPopup>

            {/* Reject Modal */}
            <AdminPopup
                isOpen={showRejectModal && !!selectedApp}
                onClose={() => { setShowRejectModal(false); setRejectReason(""); }}
                title="Reject Application"
                size="full"
                headerIcon={<XCircle className="w-5 h-5" />}
                headerClassName="bg-gradient-to-r from-red-600 to-red-700"
                footer={
                    <>
                        <PopupSecondaryButton onClick={() => { setShowRejectModal(false); setRejectReason(""); }} disabled={processing}>Cancel</PopupSecondaryButton>
                        <PopupDangerButton onClick={handleReject} loading={processing} disabled={!rejectReason.trim()}>{processing ? "Processing..." : "Reject Application"}</PopupDangerButton>
                    </>
                }
            >
                {selectedApp && (
                    <div className="space-y-4">
                        <p className="text-gray-600">You are about to reject the application for:</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold text-gray-900">{selectedApp.first_name} {selectedApp.last_name}</p>
                            <p className="text-sm text-gray-500">{selectedApp.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason *</label>
                            <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className={inputClass} placeholder="Please provide a reason for rejection..." required />
                        </div>
                    </div>
                )}
            </AdminPopup>

            {/* Success Modal */}
            <AdminPopup
                isOpen={showSuccessModal && !!createdCredentials}
                onClose={() => { setShowSuccessModal(false); setCreatedCredentials(null); }}
                title="Student Account Created!"
                size="full"
                headerIcon={<CheckCircle className="w-5 h-5" />}
                headerClassName="bg-gradient-to-r from-green-600 to-green-700"
                showCloseButton={false}
            >
                {createdCredentials && (
                    <div className="text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-gray-500 mb-6">The application has been approved and student account created.</p>
                        <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Student ID</span>
                                <span className="font-mono font-medium">{createdCredentials.studentId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Email</span>
                                <span className="font-medium">{createdCredentials.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Temporary Password</span>
                                <span className="font-mono font-medium text-[#c41e3a]">{createdCredentials.password}</span>
                            </div>
                        </div>
                        <button onClick={handleCopyCredentials} className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy Credentials"}
                        </button>
                        <p className="text-xs text-gray-400 mt-4">Please share these credentials with the student securely.</p>
                        <button onClick={() => { setShowSuccessModal(false); setCreatedCredentials(null); }} className="mt-6 px-8 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832]">
                            Done
                        </button>
                    </div>
                )}
            </AdminPopup>

            {/* Delete Application Modal */}
            <AdminPopup
                isOpen={showDeleteModal && !!selectedApp}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Application"
                size="full"
                headerIcon={<Trash2 className="w-5 h-5" />}
                headerClassName="bg-gradient-to-r from-red-600 to-red-700"
                footer={
                    <>
                        <PopupSecondaryButton onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</PopupSecondaryButton>
                        <PopupDangerButton onClick={handleDeleteApplication} loading={deleting}>{deleting ? "Deleting..." : "Delete Application"}</PopupDangerButton>
                    </>
                }
            >
                {selectedApp && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            <p className="text-red-700">This action cannot be undone. The application will be permanently deleted.</p>
                        </div>
                        <p className="text-gray-600">Are you sure you want to delete this application?</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold text-gray-900">{selectedApp.first_name} {selectedApp.last_name}</p>
                            <p className="text-sm text-gray-500">{selectedApp.email}</p>
                            <p className="text-xs text-gray-400 font-mono mt-1">{selectedApp.application_number}</p>
                            <p className="text-xs text-gray-500 mt-1">Applying for: {selectedApp.applying_for_class}</p>
                        </div>
                    </div>
                )}
            </AdminPopup>

            {/* New Admission Modal */}
            <NewAdmissionForm
                isOpen={showNewAdmissionModal}
                onClose={() => setShowNewAdmissionModal(false)}
                onSuccess={fetchApplications}
            />
        </div>
    );
}


// Full New Admission Form Component - Using AdminPopup for consistency
function NewAdmissionForm({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "", middle_name: "", last_name: "", date_of_birth: "", gender: "", blood_group: "",
        religion: "", nationality: "Indian", aadhar_number: "", father_name: "", father_occupation: "",
        father_phone: "", mother_name: "", mother_occupation: "", mother_phone: "", emergency_contact: "",
        applying_for_class: "", academic_year: "2024-25", previous_school: "", previous_class: "",
        previous_percentage: "", email: "", phone: "", current_address: "", reason_to_join: "", medical_conditions: "",
    });

    const handleChange = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));
    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { submitApplication } = await import("@/firebase/applications");
        const { error } = await submitApplication(formData);
        if (!error) { onSuccess(); onClose(); }
        setLoading(false);
    };

    return (
        <AdminPopup
            isOpen={isOpen}
            onClose={onClose}
            title="Student Application Form"
            subtitle="Fill in the details to apply for admission"
            size="full"
            headerIcon={<Users className="w-5 h-5" />}
            footer={
                <>
                    <PopupSecondaryButton onClick={onClose} disabled={loading}>Cancel</PopupSecondaryButton>
                    <button
                        type="submit"
                        form="new-admission-form"
                        disabled={loading}
                        className="px-6 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Submitting..." : "Submit Application"}
                    </button>
                </>
            }
        >
            <form id="new-admission-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <PopupSection title="Personal Information" icon={<Users className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" required value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} className={inputClass} placeholder="Enter first name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label><input type="text" value={formData.middle_name} onChange={(e) => handleChange("middle_name", e.target.value)} className={inputClass} placeholder="Enter middle name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" required value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} className={inputClass} placeholder="Enter last name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label><input type="date" required value={formData.date_of_birth} onChange={(e) => handleChange("date_of_birth", e.target.value)} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label><select required value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} className={inputClass}><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label><select value={formData.blood_group} onChange={(e) => handleChange("blood_group", e.target.value)} className={inputClass}><option value="">Select Blood Group</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Religion</label><input type="text" value={formData.religion} onChange={(e) => handleChange("religion", e.target.value)} className={inputClass} placeholder="Enter religion" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label><input type="text" value={formData.nationality} onChange={(e) => handleChange("nationality", e.target.value)} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label><input type="text" value={formData.aadhar_number} onChange={(e) => handleChange("aadhar_number", e.target.value)} className={inputClass} placeholder="XXXX XXXX XXXX" /></div>
                    </div>
                </PopupSection>

                {/* Parent/Guardian Information */}
                <PopupSection title="Parent/Guardian Information" icon={<UserCog className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Name *</label><input type="text" required value={formData.father_name} onChange={(e) => handleChange("father_name", e.target.value)} className={inputClass} placeholder="Enter father's name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Occupation</label><input type="text" value={formData.father_occupation} onChange={(e) => handleChange("father_occupation", e.target.value)} className={inputClass} placeholder="Enter occupation" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Phone</label><input type="tel" value={formData.father_phone} onChange={(e) => handleChange("father_phone", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Name *</label><input type="text" required value={formData.mother_name} onChange={(e) => handleChange("mother_name", e.target.value)} className={inputClass} placeholder="Enter mother's name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Occupation</label><input type="text" value={formData.mother_occupation} onChange={(e) => handleChange("mother_occupation", e.target.value)} className={inputClass} placeholder="Enter occupation" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Phone</label><input type="tel" value={formData.mother_phone} onChange={(e) => handleChange("mother_phone", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact *</label><input type="tel" required value={formData.emergency_contact} onChange={(e) => handleChange("emergency_contact", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" /></div>
                    </div>
                </PopupSection>

                {/* Academic Information */}
                <PopupSection title="Academic Information" icon={<GraduationCap className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Applying for Class *</label><select required value={formData.applying_for_class} onChange={(e) => handleChange("applying_for_class", e.target.value)} className={inputClass}><option value="">Select Class</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="Class 11 - Science">Class 11 - Science</option><option value="Class 11 - Commerce">Class 11 - Commerce</option><option value="Class 11 - Arts">Class 11 - Arts</option><option value="Class 12 - Science">Class 12 - Science</option><option value="Class 12 - Commerce">Class 12 - Commerce</option><option value="Class 12 - Arts">Class 12 - Arts</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label><select value={formData.academic_year} onChange={(e) => handleChange("academic_year", e.target.value)} className={inputClass}><option value="2024-25">2024-25</option><option value="2025-26">2025-26</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label><input type="text" value={formData.previous_school} onChange={(e) => handleChange("previous_school", e.target.value)} className={inputClass} placeholder="Previous school name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Previous Class</label><input type="text" value={formData.previous_class} onChange={(e) => handleChange("previous_class", e.target.value)} className={inputClass} placeholder="Last class attended" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Previous Percentage</label><input type="text" value={formData.previous_percentage} onChange={(e) => handleChange("previous_percentage", e.target.value)} className={inputClass} placeholder="e.g., 85%" /></div>
                    </div>
                </PopupSection>

                {/* Contact Information */}
                <PopupSection title="Contact Information" icon={<Phone className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><input type="email" required value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={inputClass} placeholder="student@email.com" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><input type="tel" required value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label><textarea rows={2} required value={formData.current_address} onChange={(e) => handleChange("current_address", e.target.value)} className={inputClass} placeholder="Enter complete address" /></div>
                    </div>
                </PopupSection>

                {/* Additional Information */}
                <PopupSection title="Additional Information" icon={<BookOpen className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join New Oxford Coaching Classes?</label><textarea rows={3} value={formData.reason_to_join} onChange={(e) => handleChange("reason_to_join", e.target.value)} className={inputClass} placeholder="Tell us why you want to be part of our institution..." /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Any Medical Conditions or Special Requirements</label><textarea rows={2} value={formData.medical_conditions} onChange={(e) => handleChange("medical_conditions", e.target.value)} className={inputClass} placeholder="Please mention any medical conditions or special requirements" /></div>
                    </div>
                </PopupSection>
            </form>
        </AdminPopup>
    );
}
