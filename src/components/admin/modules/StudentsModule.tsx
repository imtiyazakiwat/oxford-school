"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
    Users,
    UserCog,
    GraduationCap,
    CreditCard,
    Search,
    Loader2,
    AlertCircle,
    Edit,
    Eye,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Award,
    BarChart3,
    Key,
    Copy,
    Check,
    Trash2,
} from "lucide-react";
import { getStudents, updateStudent, deleteStudent, Student } from "@/firebase/students";
import AdminPopup, {
    PopupPrimaryButton,
    PopupSecondaryButton,
    PopupSection,
    PopupInfoGrid,
} from "../AdminPopup";

export default function StudentsModule() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [editData, setEditData] = useState<Partial<Student>>({});

    useEffect(() => {
        fetchStudents();
    }, [classFilter]);

    const fetchStudents = async () => {
        setLoading(true);
        const filters = classFilter !== "all" ? { class: classFilter } : undefined;
        const { data } = await getStudents(filters);
        setStudents(data);
        setLoading(false);
    };

    const filteredStudents = students.filter((student) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
        return (
            fullName.includes(search) ||
            student.student_id?.toLowerCase().includes(search) ||
            student.email.toLowerCase().includes(search)
        );
    });

    const handleView = (student: Student) => {
        setSelectedStudent(student);
        setShowViewModal(true);
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setEditData({
            first_name: student.first_name,
            middle_name: student.middle_name,
            last_name: student.last_name,
            email: student.email,
            phone: student.phone,
            class: student.class,
            section: student.section,
            roll_number: student.roll_number,
            current_address: student.current_address,
            father_name: student.father_name,
            mother_name: student.mother_name,
            emergency_contact: student.emergency_contact,
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedStudent) return;
        setSaving(true);
        const { error } = await updateStudent(selectedStudent.id, editData);
        if (!error) {
            setShowEditModal(false);
            fetchStudents();
        }
        setSaving(false);
    };

    const handleResetPassword = async () => {
        if (!selectedStudent?.user_id) return;
        setResettingPassword(true);
        try {
            const response = await fetch("/api/admin/reset-student-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedStudent.user_id }),
            });
            const data = await response.json();
            if (response.ok) {
                setNewPassword(data.newPassword);
            } else {
                alert("Failed to reset password: " + data.error);
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("Failed to reset password");
        }
        setResettingPassword(false);
    };

    const handleCopyPassword = () => {
        if (newPassword) {
            navigator.clipboard.writeText(newPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDelete = async () => {
        if (!selectedStudent) return;
        setDeleting(true);
        const { error } = await deleteStudent(selectedStudent.id);
        if (error) {
            alert("Failed to delete student: " + error);
        } else {
            setShowDeleteModal(false);
            fetchStudents();
        }
        setDeleting(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-600";
            case "inactive": return "bg-gray-100 text-gray-600";
            case "graduated": return "bg-blue-100 text-blue-600";
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
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] w-64"
                        />
                    </div>
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                    >
                        <option value="all">All Classes</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11 - Science">Class 11 - Science</option>
                        <option value="Class 11 - Commerce">Class 11 - Commerce</option>
                        <option value="Class 11 - Arts">Class 11 - Arts</option>
                        <option value="Class 12 - Science">Class 12 - Science</option>
                        <option value="Class 12 - Commerce">Class 12 - Commerce</option>
                        <option value="Class 12 - Arts">Class 12 - Arts</option>
                    </select>
                </div>
                <div className="text-sm text-gray-500">
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a] mx-auto" />
                        <p className="text-gray-500 mt-2">Loading students...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No students found</p>
                        <p className="text-sm text-gray-400 mt-1">Students are added through the Admissions module</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Student</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Class</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fees</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] flex items-center justify-center text-white font-bold text-sm">
                                                    {student.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{student.student_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{student.class}</p>
                                            {student.section && <p className="text-xs text-gray-500">Section {student.section}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{student.email}</p>
                                            <p className="text-xs text-gray-400">{student.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusBadge(student.status || "active")}`}>
                                                {student.status || "active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${student.fee_status === "Paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                                                {student.fee_status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleView(student)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View"><Eye className="w-4 h-4 text-gray-600" /></button>
                                                <button onClick={() => handleEdit(student)} className="p-1.5 hover:bg-blue-100 rounded-lg" title="Edit"><Edit className="w-4 h-4 text-blue-600" /></button>
                                                <button onClick={() => { setSelectedStudent(student); setShowResetPasswordModal(true); setNewPassword(null); }} className="p-1.5 hover:bg-orange-100 rounded-lg" title="Reset Password"><Key className="w-4 h-4 text-orange-600" /></button>
                                                <button onClick={() => { setSelectedStudent(student); setShowDeleteModal(true); }} className="p-1.5 hover:bg-red-100 rounded-lg" title="Delete"><Trash2 className="w-4 h-4 text-red-600" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Student Modal */}
            <AdminPopup
                isOpen={showViewModal && !!selectedStudent}
                onClose={() => setShowViewModal(false)}
                title={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : "Student Details"}
                subtitle={selectedStudent?.student_id}
                size="full"
                headerIcon={<Eye className="w-5 h-5" />}
                footer={
                    <PopupPrimaryButton onClick={() => { setShowViewModal(false); if (selectedStudent) handleEdit(selectedStudent); }}>
                        <Edit className="w-4 h-4" /> Edit Student
                    </PopupPrimaryButton>
                }
            >
                {selectedStudent && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <BarChart3 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-gray-900">94.5%</p>
                                <p className="text-xs text-gray-500">Attendance</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <Award className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-gray-900">87.5%</p>
                                <p className="text-xs text-gray-500">Last Exam</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <GraduationCap className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-gray-900">5th</p>
                                <p className="text-xs text-gray-500">Class Rank</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <CreditCard className="w-5 h-5 text-[#c41e3a] mx-auto mb-1" />
                                <p className="text-2xl font-bold text-gray-900">{selectedStudent.due_fees || "₹0"}</p>
                                <p className="text-xs text-gray-500">Due Fees</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <PopupSection title="Personal Information" icon={<Users className="w-5 h-5" />}>
                                <PopupInfoGrid columns={1}>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <div><p className="text-gray-500 text-xs">Date of Birth</p><p className="font-medium">{selectedStudent.date_of_birth || "-"}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <div><p className="text-gray-500 text-xs">Gender</p><p className="font-medium">{selectedStudent.gender || "-"}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{selectedStudent.email}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{selectedStudent.phone || "-"}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <div><p className="text-gray-500 text-xs">Address</p><p className="font-medium">{selectedStudent.current_address || "-"}</p></div>
                                    </div>
                                </PopupInfoGrid>
                            </PopupSection>

                            {/* Parent Information */}
                            <PopupSection title="Parent/Guardian Information" icon={<UserCog className="w-5 h-5" />}>
                                <PopupInfoGrid columns={1}>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-xs">Father&apos;s Name</p>
                                        <p className="font-medium">{selectedStudent.father_name || "-"}</p>
                                        {selectedStudent.father_phone && <p className="text-xs text-gray-400 mt-1">{selectedStudent.father_phone}</p>}
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-xs">Mother&apos;s Name</p>
                                        <p className="font-medium">{selectedStudent.mother_name || "-"}</p>
                                        {selectedStudent.mother_phone && <p className="text-xs text-gray-400 mt-1">{selectedStudent.mother_phone}</p>}
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-xs">Emergency Contact</p>
                                        <p className="font-medium">{selectedStudent.emergency_contact || "-"}</p>
                                    </div>
                                </PopupInfoGrid>
                            </PopupSection>

                            {/* Academic Information */}
                            <PopupSection title="Academic Information" icon={<GraduationCap className="w-5 h-5" />}>
                                <PopupInfoGrid columns={2}>
                                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500 text-xs">Class</p><p className="font-medium">{selectedStudent.class}</p></div>
                                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500 text-xs">Section</p><p className="font-medium">{selectedStudent.section || "-"}</p></div>
                                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500 text-xs">Roll Number</p><p className="font-medium">{selectedStudent.roll_number || "-"}</p></div>
                                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500 text-xs">Academic Year</p><p className="font-medium">{selectedStudent.academic_year || "-"}</p></div>
                                </PopupInfoGrid>
                            </PopupSection>

                            {/* Fee Information */}
                            <PopupSection title="Fee Information" icon={<CreditCard className="w-5 h-5" />}>
                                <PopupInfoGrid columns={2}>
                                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500 text-xs">Total Fees</p><p className="font-medium">{selectedStudent.total_fees || "₹0"}</p></div>
                                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500 text-xs">Paid Amount</p><p className="font-medium text-green-600">{selectedStudent.paid_fees || "₹0"}</p></div>
                                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500 text-xs">Due Amount</p><p className="font-medium text-red-600">{selectedStudent.due_fees || "₹0"}</p></div>
                                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500 text-xs">Status</p><span className={`text-xs px-2 py-1 rounded-full ${selectedStudent.fee_status === "Paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>{selectedStudent.fee_status || "Pending"}</span></div>
                                </PopupInfoGrid>
                            </PopupSection>
                        </div>
                    </div>
                )}
            </AdminPopup>

            {/* Edit Student Modal */}
            <AdminPopup
                isOpen={showEditModal && !!selectedStudent}
                onClose={() => setShowEditModal(false)}
                title="Edit Student"
                subtitle={selectedStudent?.student_id}
                size="full"
                headerIcon={<Edit className="w-5 h-5" />}
                footer={
                    <>
                        <PopupSecondaryButton onClick={() => setShowEditModal(false)} disabled={saving}>Cancel</PopupSecondaryButton>
                        <PopupPrimaryButton onClick={handleSaveEdit} loading={saving}>{saving ? "Saving..." : "Save Changes"}</PopupPrimaryButton>
                    </>
                }
            >
                <div className="space-y-6">
                    {/* Personal Info */}
                    <PopupSection title="Personal Information" icon={<Users className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label><input type="text" value={editData.first_name || ""} onChange={(e) => setEditData({ ...editData, first_name: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label><input type="text" value={editData.middle_name || ""} onChange={(e) => setEditData({ ...editData, middle_name: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label><input type="text" value={editData.last_name || ""} onChange={(e) => setEditData({ ...editData, last_name: e.target.value })} className={inputClass} /></div>
                        </div>
                    </PopupSection>

                    {/* Contact Info */}
                    <PopupSection title="Contact Information" icon={<Phone className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className={inputClass} /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={editData.current_address || ""} onChange={(e) => setEditData({ ...editData, current_address: e.target.value })} className={inputClass} /></div>
                        </div>
                    </PopupSection>

                    {/* Academic Info */}
                    <PopupSection title="Academic Information" icon={<GraduationCap className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <select value={editData.class || ""} onChange={(e) => setEditData({ ...editData, class: e.target.value })} className={inputClass}>
                                    <option value="">Select</option>
                                    <option>Class 9</option><option>Class 10</option>
                                    <option>Class 11 - Science</option><option>Class 11 - Commerce</option><option>Class 11 - Arts</option>
                                    <option>Class 12 - Science</option><option>Class 12 - Commerce</option><option>Class 12 - Arts</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <select value={editData.section || ""} onChange={(e) => setEditData({ ...editData, section: e.target.value })} className={inputClass}>
                                    <option value="">Select</option>
                                    <option>A</option><option>B</option><option>C</option>
                                </select>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label><input type="text" value={editData.roll_number || ""} onChange={(e) => setEditData({ ...editData, roll_number: e.target.value })} className={inputClass} /></div>
                        </div>
                    </PopupSection>

                    {/* Parent Info */}
                    <PopupSection title="Parent Information" icon={<UserCog className="w-4 h-4" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Name</label><input type="text" value={editData.father_name || ""} onChange={(e) => setEditData({ ...editData, father_name: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Name</label><input type="text" value={editData.mother_name || ""} onChange={(e) => setEditData({ ...editData, mother_name: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label><input type="tel" value={editData.emergency_contact || ""} onChange={(e) => setEditData({ ...editData, emergency_contact: e.target.value })} className={inputClass} /></div>
                        </div>
                    </PopupSection>
                </div>
            </AdminPopup>

            {/* Reset Password Modal */}
            <AdminPopup
                isOpen={showResetPasswordModal && !!selectedStudent}
                onClose={() => { setShowResetPasswordModal(false); setNewPassword(null); }}
                title="Reset Password"
                size="full"
                headerIcon={<Key className="w-5 h-5" />}
                showCloseButton={!newPassword}
                footer={!newPassword ? (
                    <>
                        <PopupSecondaryButton onClick={() => { setShowResetPasswordModal(false); setNewPassword(null); }} disabled={resettingPassword}>Cancel</PopupSecondaryButton>
                        <PopupPrimaryButton onClick={handleResetPassword} loading={resettingPassword}>{resettingPassword ? "Resetting..." : "Reset Password"}</PopupPrimaryButton>
                    </>
                ) : undefined}
            >
                {selectedStudent && (
                    newPassword ? (
                        <div className="text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                            </motion.div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successfully!</h3>
                            <p className="text-sm text-gray-500 mb-4">New password for {selectedStudent.first_name} {selectedStudent.last_name}</p>
                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <span className="font-mono text-lg font-bold text-[#c41e3a]">{newPassword}</span>
                                <button onClick={handleCopyPassword} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">Please share this password with the student securely.</p>
                            <button onClick={() => { setShowResetPasswordModal(false); setNewPassword(null); }} className="mt-4 px-6 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832]">
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-4">Are you sure you want to reset the password for:</p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="font-semibold text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                                <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                                <p className="text-xs text-gray-400 font-mono mt-1">{selectedStudent.student_id}</p>
                            </div>
                            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                                This will generate a new random password. The student will need to use this new password to login.
                            </p>
                        </>
                    )
                )}
            </AdminPopup>

            {/* Delete Student Modal */}
            <AdminPopup
                isOpen={showDeleteModal && !!selectedStudent}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Student"
                size="full"
                headerIcon={<Trash2 className="w-5 h-5" />}
                headerClassName="bg-gradient-to-r from-red-600 to-red-700"
                footer={
                    <>
                        <PopupSecondaryButton onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</PopupSecondaryButton>
                        <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50">
                            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete Student</>}
                        </button>
                    </>
                }
            >
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            <p className="text-red-700">This action cannot be undone. The student record will be permanently deleted.</p>
                        </div>
                        <p className="text-gray-600">Are you sure you want to delete this student?</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] flex items-center justify-center text-white font-bold">
                                    {selectedStudent.first_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                                    <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                                    <p className="text-xs text-gray-400 font-mono">{selectedStudent.student_id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AdminPopup>
        </div>
    );
}
