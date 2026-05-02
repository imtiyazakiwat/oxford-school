"use client";

import { Users, GraduationCap, Phone, FileText, AlertCircle, Loader2, UserCog } from "lucide-react";
import { StudentData } from "./types";
import { Student } from "@/firebase/students";

interface DetailsModuleProps {
    studentData: StudentData;
    studentRecord: Student | null;
    loadingStudent: boolean;
}

export default function DetailsModule({ studentData, studentRecord, loadingStudent }: DetailsModuleProps) {
    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700";

    if (loadingStudent) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#c41e3a] mx-auto mb-3" />
                    <p className="text-gray-500">Loading your details...</p>
                </div>
            </div>
        );
    }

    // Create empty record for display when no student record exists
    const displayRecord = studentRecord || {
        first_name: "",
        middle_name: "",
        last_name: "",
        student_id: "",
        class: "",
        section: "",
        status: "",
        photo_url: "",
        date_of_birth: "",
        gender: "",
        blood_group: "",
        religion: "",
        nationality: "",
        aadhar_number: "",
        father_name: "",
        father_occupation: "",
        father_phone: "",
        mother_name: "",
        mother_occupation: "",
        mother_phone: "",
        emergency_contact: "",
        roll_number: "",
        academic_year: "",
        admission_date: "",
        previous_school: "",
        email: studentData.email || "",
        phone: "",
        current_address: "",
        permanent_address: "",
        medical_conditions: "",
    };

    const isProfileIncomplete = !studentRecord;

    return (
        <div className="w-full space-y-6">
            {/* Info Banner */}
            {isProfileIncomplete ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Profile Not Yet Configured</p>
                        <p className="text-sm mt-1">Your student profile details have not been set up by the admin yet. The fields below will be populated once your profile is configured. Please contact the admin office if you need assistance.</p>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">Your profile details are managed by the admin. Contact the office if you need to make changes.</p>
                </div>
            )}

            {/* Photo & Basic Info Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b1528] flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                        {displayRecord.photo_url ? (
                            <img src={displayRecord.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-white">
                                {displayRecord.first_name ? displayRecord.first_name.charAt(0) : studentData.name?.charAt(0) || "?"}
                            </span>
                        )}
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {displayRecord.first_name || displayRecord.middle_name || displayRecord.last_name 
                                ? `${displayRecord.first_name} ${displayRecord.middle_name} ${displayRecord.last_name}`.trim()
                                : studentData.name || "Name Not Set"}
                        </h2>
                        <p className="text-gray-500 font-mono mt-1">{displayRecord.student_id || "ID Not Assigned"}</p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                            <span className="px-3 py-1 bg-[#c41e3a]/10 text-[#c41e3a] rounded-full text-sm font-medium">
                                {displayRecord.class || "Class Not Set"}
                            </span>
                            {displayRecord.section && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Section {displayRecord.section}</span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm ${
                                displayRecord.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}>
                                {displayRecord.status || "Pending"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#c41e3a]" />
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                            <input type="text" value={displayRecord.first_name || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Middle Name</label>
                            <input type="text" value={displayRecord.middle_name || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                            <input type="text" value={displayRecord.last_name || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                            <input type="text" value={displayRecord.date_of_birth || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                            <input type="text" value={displayRecord.gender || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Blood Group</label>
                            <input type="text" value={displayRecord.blood_group || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Religion</label>
                            <input type="text" value={displayRecord.religion || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Nationality</label>
                            <input type="text" value={displayRecord.nationality || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Aadhar Number</label>
                            <input type="text" value={displayRecord.aadhar_number || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-[#c41e3a]" />
                    <h3 className="font-semibold text-gray-900">Parent/Guardian Information</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Father&apos;s Name</label>
                            <input type="text" value={displayRecord.father_name || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Father&apos;s Occupation</label>
                            <input type="text" value={displayRecord.father_occupation || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Father&apos;s Phone</label>
                            <input type="text" value={displayRecord.father_phone || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Mother&apos;s Name</label>
                            <input type="text" value={displayRecord.mother_name || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Mother&apos;s Occupation</label>
                            <input type="text" value={displayRecord.mother_occupation || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Mother&apos;s Phone</label>
                            <input type="text" value={displayRecord.mother_phone || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Emergency Contact</label>
                            <input type="text" value={displayRecord.emergency_contact || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>


            {/* Academic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#c41e3a]" />
                    <h3 className="font-semibold text-gray-900">Academic Information</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Student ID</label>
                            <input type="text" value={displayRecord.student_id || ""} placeholder="Not assigned" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Class</label>
                            <input type="text" value={displayRecord.class || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Section</label>
                            <input type="text" value={displayRecord.section || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Roll Number</label>
                            <input type="text" value={displayRecord.roll_number || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Academic Year</label>
                            <input type="text" value={displayRecord.academic_year || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Admission Date</label>
                            <input type="text" value={displayRecord.admission_date || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Previous School</label>
                            <input type="text" value={displayRecord.previous_school || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#c41e3a]" />
                    <h3 className="font-semibold text-gray-900">Contact Information</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                            <input type="text" value={displayRecord.email || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                            <input type="text" value={displayRecord.phone || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Current Address</label>
                            <textarea rows={2} value={displayRecord.current_address || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Permanent Address</label>
                            <textarea rows={2} value={displayRecord.permanent_address || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            {displayRecord.medical_conditions && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#c41e3a]" />
                        <h3 className="font-semibold text-gray-900">Additional Information</h3>
                    </div>
                    <div className="p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Medical Conditions</label>
                            <textarea rows={2} value={displayRecord.medical_conditions || ""} placeholder="Not set" disabled className={inputClass} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
