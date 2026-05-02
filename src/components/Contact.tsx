"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { submitContactForm } from "@/firebase/contactSubmissions";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 9590483488", "+91 9740412339"],
  },
  {
    icon: MapPin,
    title: "Jamkhandi Branch",
    details: ["Alguoor RC, Near Helipad", "Kunchnoor Road - 587301"],
  },
  {
    icon: MapPin,
    title: "Athani Branch",
    details: ["HUDKO Colony, IB Road", "Athani - 591304"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: ["Mon - Sat: 9:00 AM - 6:00 PM", "Sunday: Closed"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["noccj2023@gmail.com"],
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [activeMap, setActiveMap] = useState<"jamkhandi" | "athani">("jamkhandi");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.subject || !form.message) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setSubmitStatus("idle");

    const { success, error } = await submitContactForm({
      full_name: form.fullName,
      email: form.email || "",
      phone: form.phone || undefined,
      subject: form.subject,
      message: form.message,
    });

    setSubmitting(false);

    if (success) {
      setSubmitStatus("success");
      setForm({ fullName: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } else {
      setSubmitStatus("error");
      console.error("Contact form error:", error);
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-xs sm:text-sm">
            GET IN TOUCH
          </p>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Contact Us
          </h2>
          <p className="text-gray-600 mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base px-4">
            Have questions about admissions or our coaching programs?
            We&apos;d love to hear from you. Reach out and we&apos;ll
            respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-sm order-2 lg:order-1"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Send us a Message
            </h3>

            {/* Success/Error Messages */}
            {submitStatus === "success" && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm">Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.</p>
              </div>
            )}
            {submitStatus === "error" && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">Something went wrong. Please try again or contact us directly.</p>
              </div>
            )}

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Subject *
                </label>
                <select 
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors text-sm sm:text-base"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="admissions">Admissions Inquiry</option>
                  <option value="navodaya">Navodaya Coaching</option>
                  <option value="sainik">Sainik School Coaching</option>
                  <option value="hostel">Hostel Facilities</option>
                  <option value="fees">Fee Structure</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Message *
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors resize-none text-sm sm:text-base"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>


          {/* Contact Info & Map */}
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            {/* Contact Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#c41e3a]/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#c41e3a]" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 sm:mb-2">
                    {item.title}
                  </h4>
                  {item.details.map((detail, i) => (
                    <p key={i} className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Map with branch toggle */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Branch Toggle */}
              <div className="flex mb-3 bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setActiveMap("jamkhandi")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeMap === "jamkhandi"
                      ? "bg-[#c41e3a] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  📍 Jamkhandi
                </button>
                <button
                  onClick={() => setActiveMap("athani")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeMap === "athani"
                      ? "bg-[#c41e3a] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  📍 Athani
                </button>
              </div>

              <div className="h-[200px] sm:h-[250px] md:h-[300px] rounded-lg overflow-hidden shadow-sm">
                {activeMap === "jamkhandi" ? (
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3821.5!2d75.5596!3d16.5026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc3a2c0e2b8b64d%3A0x0!2sNew+Oxford+Coaching+Classes+Jamkhandi!5e0!3m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="New Oxford Coaching Classes - Jamkhandi"
                  />
                ) : (
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3831.5!2d75.0596!3d16.7246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc3a2c0e2b8b64d%3A0x0!2sNew+Oxford+Coaching+Classes+Athani!5e0!3m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="New Oxford Coaching Classes - Athani"
                  />
                )}
              </div>

              {/* Direct links to Google Maps */}
              <div className="mt-3 flex gap-3">
                <a
                  href="https://maps.app.goo.gl/katomgsTeb5DfYxy8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs sm:text-sm text-[#c41e3a] hover:text-[#a81832] font-medium py-2 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Open Jamkhandi in Maps →
                </a>
                <a
                  href="https://maps.app.goo.gl/uRBSUGLQ5WzjWU9R7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs sm:text-sm text-[#c41e3a] hover:text-[#a81832] font-medium py-2 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Open Athani in Maps →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
