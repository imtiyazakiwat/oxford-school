"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Users, Phone, BookOpen, CheckCircle, Loader2, Copy, Check, Upload, Camera, Download,
} from "lucide-react";
import {
  submitExamRegistration, photoToDataUrl, ExamRegistrationInput, ExamRegistration,
} from "@/firebase/examRegistrations";
import GlobalPopup from "./GlobalPopup";

interface ExamRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExamRegistrationModal({ isOpen, onClose }: ExamRegistrationModalProps) {
  const [step, setStep] = useState<"form" | "payment" | "hallticket">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ExamRegistration | null>(null);
  const [copied, setCopied] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ExamRegistrationInput>({
    full_name: "", gender: "", date_of_birth: "", father_name: "", mother_name: "",
    mobile_number: "", school_name: "", sts_number: "", current_class: "",
    exam_medium: "", caste_category: "", village_address: "", district_taluk: "",
  });

  const handleChange = (field: keyof ExamRegistrationInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) { setError("Please upload a photo"); return; }
    setLoading(true);
    setError(null);

    const url = await photoToDataUrl(photoFile);
    const { data, error: submitErr } = await submitExamRegistration(formData, url);
    if (submitErr || !data) { setError(submitErr || "Failed to submit"); setLoading(false); return; }

    setRegistration(data);
    setStep("payment");
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintHallTicket = () => {
    const printContent = document.getElementById("hall-ticket-print");
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Hall Ticket - ${registration?.hall_ticket_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
        .ticket { border: 3px solid #c41e3a; border-radius: 12px; max-width: 700px; margin: auto; overflow: hidden; }
        .header { background: #c41e3a; color: white; padding: 20px; text-align: center; }
        .header h1 { font-size: 22px; margin-bottom: 4px; }
        .header p { font-size: 13px; opacity: 0.9; }
        .body { padding: 24px; }
        .photo-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .ht-number { font-size: 18px; font-weight: bold; color: #c41e3a; }
        .photo { width: 100px; height: 120px; border: 2px solid #c41e3a; border-radius: 8px; object-fit: cover; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .field p { font-size: 14px; font-weight: 600; color: #111; margin-top: 2px; }
        .footer { border-top: 2px dashed #ddd; padding: 16px 24px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { padding: 0; } .ticket { border-width: 2px; } }
      </style></head><body>
      <div class="ticket">
        <div class="header"><h1>New Oxford Coaching Classes</h1><p>Exam Hall Ticket</p></div>
        <div class="body">
          <div class="photo-row">
            <div><p class="ht-number">Hall Ticket: ${registration?.hall_ticket_number}</p><p style="font-size:13px;color:#666;margin-top:4px">${registration?.full_name}</p></div>
            ${registration?.photo_url ? `<img class="photo" src="${registration.photo_url}" alt="Photo"/>` : ""}
          </div>
          <div class="grid">
            <div class="field"><label>Father's Name</label><p>${registration?.father_name}</p></div>
            <div class="field"><label>Mother's Name</label><p>${registration?.mother_name}</p></div>
            <div class="field"><label>Date of Birth</label><p>${registration?.date_of_birth}</p></div>
            <div class="field"><label>Gender</label><p>${registration?.gender}</p></div>
            <div class="field"><label>School Name</label><p>${registration?.school_name}</p></div>
            <div class="field"><label>STS Number</label><p>${registration?.sts_number}</p></div>
            <div class="field"><label>Current Class</label><p>${registration?.current_class}</p></div>
            <div class="field"><label>Exam Medium</label><p>${registration?.exam_medium}</p></div>
            <div class="field"><label>Caste/Category</label><p>${registration?.caste_category}</p></div>
            <div class="field"><label>District & Taluk</label><p>${registration?.district_taluk}</p></div>
            <div class="field" style="grid-column:span 2"><label>Village & Address</label><p>${registration?.village_address}</p></div>
          </div>
        </div>
        <div class="footer">This is a computer-generated hall ticket. Please bring this to the exam center.<br/>Contact: +91 95919 57558</div>
      </div></body></html>`);
    win.document.close();
    win.print();
  };

  const handleClose = () => {
    setStep("form");
    setRegistration(null);
    setError(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({
      full_name: "", gender: "", date_of_birth: "", father_name: "", mother_name: "",
      mobile_number: "", school_name: "", sts_number: "", current_class: "",
      exam_medium: "", caste_category: "", village_address: "", district_taluk: "",
    });
    onClose();
  };

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]";

  // Step 3: Hall Ticket
  if (step === "hallticket" && registration) {
    return (
      <GlobalPopup isOpen={isOpen} onClose={handleClose} size="full" showCloseButton={false}>
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <CheckCircle className="w-20 h-20 text-green-500 mb-4 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Hall Ticket</h2>
          <p className="text-gray-500 text-sm mb-6">Please save or print this for the exam</p>

          {/* Hall Ticket Card */}
          <div id="hall-ticket-print" className="w-full max-w-2xl border-2 border-[#c41e3a] rounded-xl overflow-hidden">
            <div className="bg-[#c41e3a] text-white px-6 py-4 text-center">
              <h3 className="text-xl font-bold">New Oxford Coaching Classes</h3>
              <p className="text-white/80 text-sm">Exam Hall Ticket</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-lg font-bold text-[#c41e3a]">Hall Ticket: {registration.hall_ticket_number}</p>
                  <p className="text-gray-600 text-sm mt-1">{registration.full_name}</p>
                </div>
                {registration.photo_url && (
                  <img src={registration.photo_url} alt="Photo" className="w-24 h-28 object-cover rounded-lg border-2 border-[#c41e3a]" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Father's Name", registration.father_name],
                  ["Mother's Name", registration.mother_name],
                  ["Date of Birth", registration.date_of_birth],
                  ["Gender", registration.gender],
                  ["School Name", registration.school_name],
                  ["STS Number", registration.sts_number],
                  ["Current Class", registration.current_class],
                  ["Exam Medium", registration.exam_medium],
                  ["Caste/Category", registration.caste_category],
                  ["District & Taluk", registration.district_taluk],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                    <p className="font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Village & Address</p>
                  <p className="font-semibold text-gray-900">{registration.village_address}</p>
                </div>
              </div>
            </div>
            <div className="border-t-2 border-dashed px-6 py-3 text-center text-xs text-gray-500">
              This is a computer-generated hall ticket. Please bring this to the exam center. Contact: +91 95919 57558
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handlePrintHallTicket} className="px-6 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Print / Save
            </button>
            <button onClick={handleClose} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      </GlobalPopup>
    );
  }

  const UPI_ID = "9591957558@ybl";
  const UPI_NAME = "New Oxford Coaching Classes";
  const UPI_AMOUNT = "1000";
  const UPI_NOTE = registration ? `Exam Reg ${registration.hall_ticket_number}` : "Exam Registration";
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${UPI_AMOUNT}&cu=INR&tn=${encodeURIComponent(UPI_NOTE)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const upiApps = [
    { name: "PhonePe", scheme: `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${UPI_AMOUNT}&cu=INR&tn=${encodeURIComponent(UPI_NOTE)}`, color: "bg-[#5f259f]", icon: "📱" },
    { name: "Google Pay", scheme: `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${UPI_AMOUNT}&cu=INR&tn=${encodeURIComponent(UPI_NOTE)}`, color: "bg-[#1a73e8]", icon: "💳" },
    { name: "Paytm", scheme: `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${UPI_AMOUNT}&cu=INR&tn=${encodeURIComponent(UPI_NOTE)}`, color: "bg-[#00baf2]", icon: "💰" },
    { name: "BHIM UPI", scheme: upiUrl, color: "bg-[#00796b]", icon: "🏦" },
  ];

  // Step 2: Payment Info
  if (step === "payment" && registration) {
    return (
      <GlobalPopup isOpen={isOpen} onClose={handleClose} size="lg" title="Complete Payment" subtitle="Pay ₹1,000 registration fee via UPI">
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-800">Form Submitted Successfully!</p>
            <p className="text-sm text-green-600">Hall Ticket: <span className="font-bold">{registration.hall_ticket_number}</span></p>
          </div>

          {/* QR Code */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Registration Fee: ₹1,000</h3>
            <p className="text-gray-500 text-sm mb-4">Scan QR code with any UPI app to pay</p>
            <div className="inline-block bg-white p-3 rounded-xl shadow-sm border border-gray-200">
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-[200px] h-[200px] mx-auto" />
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-sm text-gray-600">{UPI_ID}</span>
              <button onClick={() => handleCopy(UPI_ID)} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Copy UPI ID">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* UPI App Buttons */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Or pay directly with</p>
            <div className="grid grid-cols-2 gap-3">
              {upiApps.map((app) => (
                <a
                  key={app.name}
                  href={app.scheme}
                  className={`${app.color} text-white rounded-xl py-3 px-4 font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                >
                  <span className="text-lg">{app.icon}</span>
                  {app.name}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">📌 Important</p>
            <p>After payment, your hall ticket is ready. Payment will be verified by the admin at the exam center.</p>
          </div>

          <button onClick={() => setStep("hallticket")} className="w-full py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors font-semibold">
            View & Download Hall Ticket →
          </button>
        </div>
      </GlobalPopup>
    );
  }

  // Step 1: Registration Form
  return (
    <GlobalPopup isOpen={isOpen} onClose={handleClose} size="full" title="Exam Registration Form" subtitle="Fill in the details to register for the exam">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Personal Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c41e3a]" /> Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student&apos;s Full Name *</label>
              <input type="text" required value={formData.full_name} onChange={(e) => handleChange("full_name", e.target.value)} className={inputClass} placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select required value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} className={inputClass}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input type="date" required value={formData.date_of_birth} onChange={(e) => handleChange("date_of_birth", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s Name *</label>
              <input type="text" required value={formData.father_name} onChange={(e) => handleChange("father_name", e.target.value)} className={inputClass} placeholder="Enter father's name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s Name *</label>
              <input type="text" required value={formData.mother_name} onChange={(e) => handleChange("mother_name", e.target.value)} className={inputClass} placeholder="Enter mother's name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (WhatsApp) *</label>
              <input type="tel" required value={formData.mobile_number} onChange={(e) => handleChange("mobile_number", e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c41e3a]" /> Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name & Village/Town *</label>
              <input type="text" required value={formData.school_name} onChange={(e) => handleChange("school_name", e.target.value)} className={inputClass} placeholder="School name and village" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School STS Number *</label>
              <input type="text" required value={formData.sts_number} onChange={(e) => handleChange("sts_number", e.target.value)} className={inputClass} placeholder="Enter STS number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currently Studying Class *</label>
              <select required value={formData.current_class} onChange={(e) => handleChange("current_class", e.target.value)} className={inputClass}>
                <option value="">Select Class</option>
                <option value="4th Standard">4th Standard</option>
                <option value="5th Standard">5th Standard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Medium *</label>
              <select required value={formData.exam_medium} onChange={(e) => handleChange("exam_medium", e.target.value)} className={inputClass}>
                <option value="">Select Medium</option>
                <option value="Kannada">Kannada</option>
                <option value="English">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caste/Category *</label>
              <input type="text" required value={formData.caste_category} onChange={(e) => handleChange("caste_category", e.target.value)} className={inputClass} placeholder="Enter caste/category" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#c41e3a]" /> Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village and Full Address *</label>
              <textarea rows={2} required value={formData.village_address} onChange={(e) => handleChange("village_address", e.target.value)} className={inputClass} placeholder="Enter complete address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District and Taluk *</label>
              <input type="text" required value={formData.district_taluk} onChange={(e) => handleChange("district_taluk", e.target.value)} className={inputClass} placeholder="e.g., Bagalkot, Jamkhandi" />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#c41e3a]" /> Upload Photo *
          </h3>
          <div className="flex items-center gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-36 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#c41e3a] transition-colors overflow-hidden"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Click to upload</span>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <p className="text-sm text-gray-500">Upload a recent passport-size photo.<br />JPG, PNG accepted. Max 5MB.</p>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
            <p className="font-medium mb-1">📋 Registration Fee: ₹1,000</p>
            <p>After submitting the form, you will be shown UPI payment details. Hall ticket will be generated immediately.</p>
          </div>
          <div className="flex gap-4 justify-end">
            <button type="button" onClick={handleClose} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors font-semibold disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting..." : "Register & Pay"}
            </button>
          </div>
        </div>
      </form>
    </GlobalPopup>
  );
}
