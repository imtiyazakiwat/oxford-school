"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
    Users,
    UserCog,
    GraduationCap,
    Phone,
    BookOpen,
    CheckCircle,
    Loader2,
    Copy,
    Check,
} from "lucide-react";
import { submitApplication, ApplicationData } from "@/firebase/applications";
import GlobalPopup from "./GlobalPopup";

interface ApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ApplyModal({ isOpen, onClose }: ApplyModalProps) {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [applicationNumber, setApplicationNumber] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState<ApplicationData>({
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        blood_group: "",
        religion: "",
        nationality: "Indian",
        aadhar_number: "",
        father_name: "",
        father_occupation: "",
        father_phone: "",
        mother_name: "",
        mother_occupation: "",
        mother_phone: "",
        emergency_contact: "",
        applying_for_class: "",
        academic_year: "2024-25",
        previous_school: "",
        previous_class: "",
        previous_percentage: "",
        email: "",
        phone: "",
        current_address: "",
        reason_to_join: "",
        medical_conditions: "",
    });

    const handleChange = (field: keyof ApplicationData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: submitError } = await submitApplication(formData);

        if (submitError || !data) {
            setError(submitError || "Failed to submit application");
            setLoading(false);
            return;
        }

        setApplicationNumber(data.application_number);
        setSubmitted(true);
        setLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(applicationNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setSubmitted(false);
        setApplicationNumber("");
        setError(null);
        setFormData({
            first_name: "",
            middle_name: "",
            last_name: "",
            date_of_birth: "",
            gender: "",
            blood_group: "",
            religion: "",
            nationality: "Indian",
            aadhar_number: "",
            father_name: "",
            father_occupation: "",
            father_phone: "",
            mother_name: "",
            mother_occupation: "",
            mother_phone: "",
            emergency_contact: "",
            applying_for_class: "",
            academic_year: "2024-25",
            previous_school: "",
            previous_class: "",
            previous_percentage: "",
            email: "",
            phone: "",
            current_address: "",
            reason_to_join: "",
            medical_conditions: "",
        });
        onClose();
    };

    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]";

    // Success state content
    if (submitted) {
        return (
            <GlobalPopup
                isOpen={isOpen}
                onClose={handleClose}
                size="full"
                showCloseButton={false}
            >
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Application Submitted!
                    </h2>
                    <p className="text-gray-500 text-center mb-6">
                        Thank you for applying. We will review your application and get back to you soon.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-500 mb-2">Your Application Number</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl font-bold text-[#c41e3a]">{applicationNumber}</span>
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Copy"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Copy className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                            Please save this number for future reference
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        We will contact you at <span className="font-medium">{formData.email}</span>
                    </p>
                    <button
                        onClick={handleClose}
                        className="mt-6 px-8 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </GlobalPopup>
        );
    }

    return (
        <GlobalPopup
            isOpen={isOpen}
            onClose={handleClose}
            size="full"
            title="Student Application Form"
            subtitle="Fill in the details to apply for admission"
        >
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#c41e3a]" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input type="text" required value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} className={inputClass} placeholder="Enter first name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                            <input type="text" value={formData.middle_name} onChange={(e) => handleChange("middle_name", e.target.value)} className={inputClass} placeholder="Enter middle name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input type="text" required value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} className={inputClass} placeholder="Enter last name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                            <input type="date" required value={formData.date_of_birth} onChange={(e) => handleChange("date_of_birth", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                            <select required value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} className={inputClass}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                            <select value={formData.blood_group} onChange={(e) => handleChange("blood_group", e.target.value)} className={inputClass}>
                                <option value="">Select Blood Group</option>
                                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                            <input type="text" value={formData.religion} onChange={(e) => handleChange("religion", e.target.value)} className={inputClass} placeholder="Enter religion" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                            <input type="text" value={formData.nationality} onChange={(e) => handleChange("nationality", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                            <input type="text" value={formData.aadhar_number} onChange={(e) => handleChange("aadhar_number", e.target.value)} className={inputClass} placeholder="XXXX XXXX XXXX" />
                        </div>
                    </div>
                </div>

                {/* Parent/Guardian Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-[#c41e3a]" />
                        Parent/Guardian Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Name *</label>
                            <input type="text" required value={formData.father_name} onChange={(e) => handleChange("father_name", e.target.value)} className={inputClass} placeholder="Enter father's name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Occupation</label>
                            <input type="text" value={formData.father_occupation} onChange={(e) => handleChange("father_occupation", e.target.value)} className={inputClass} placeholder="Enter occupation" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Phone</label>
                            <input type="tel" value={formData.father_phone} onChange={(e) => handleChange("father_phone", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Name *</label>
                            <input type="text" required value={formData.mother_name} onChange={(e) => handleChange("mother_name", e.target.value)} className={inputClass} placeholder="Enter mother's name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Occupation</label>
                            <input type="text" value={formData.mother_occupation} onChange={(e) => handleChange("mother_occupation", e.target.value)} className={inputClass} placeholder="Enter occupation" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Phone</label>
                            <input type="tel" value={formData.mother_phone} onChange={(e) => handleChange("mother_phone", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact *</label>
                            <input type="tel" required value={formData.emergency_contact} onChange={(e) => handleChange("emergency_contact", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[#c41e3a]" />
                        Academic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Applying for Class *</label>
                            <select required value={formData.applying_for_class} onChange={(e) => handleChange("applying_for_class", e.target.value)} className={inputClass}>
                                <option value="">Select Class</option>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                            <select value={formData.academic_year} onChange={(e) => handleChange("academic_year", e.target.value)} className={inputClass}>
                                <option value="2024-25">2024-25</option>
                                <option value="2025-26">2025-26</option>
                                <option value="2026-27">2026-27</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                            <input type="text" value={formData.previous_school} onChange={(e) => handleChange("previous_school", e.target.value)} className={inputClass} placeholder="Previous school name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Class</label>
                            <input type="text" value={formData.previous_class} onChange={(e) => handleChange("previous_class", e.target.value)} className={inputClass} placeholder="Last class attended" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Percentage</label>
                            <input type="text" value={formData.previous_percentage} onChange={(e) => handleChange("previous_percentage", e.target.value)} className={inputClass} placeholder="e.g., 85%" />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-[#c41e3a]" />
                        Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input type="email" required value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={inputClass} placeholder="student@email.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                            <input type="tel" required value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label>
                            <textarea rows={2} required value={formData.current_address} onChange={(e) => handleChange("current_address", e.target.value)} className={inputClass} placeholder="Enter complete address" />
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#c41e3a]" />
                        Additional Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join New Oxford Coaching Classes?</label>
                            <textarea rows={3} value={formData.reason_to_join} onChange={(e) => handleChange("reason_to_join", e.target.value)} className={inputClass} placeholder="Tell us why you want to be part of our institution..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Any Medical Conditions or Special Requirements</label>
                            <textarea rows={2} value={formData.medical_conditions} onChange={(e) => handleChange("medical_conditions", e.target.value)} className={inputClass} placeholder="Please mention any medical conditions or special requirements" />
                        </div>
                    </div>
                </div>

                {/* Terms and Submit */}
                <div className="border-t pt-6">
                    <label className="flex items-start gap-3 mb-6">
                        <input type="checkbox" required className="mt-1 rounded border-gray-300 text-[#c41e3a] focus:ring-[#c41e3a]" />
                        <span className="text-sm text-gray-600">
                            I hereby declare that all the information provided above is true and correct to the best of my knowledge.
                            I understand that any false information may result in rejection of my application.
                        </span>
                    </label>
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={handleClose} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors font-semibold disabled:opacity-50 flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Submitting..." : "Submit Application"}
                        </button>
                    </div>
                </div>
            </form>
        </GlobalPopup>
    );
}
