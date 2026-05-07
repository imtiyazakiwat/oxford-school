"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { submitContactForm } from "@/firebase/contactSubmissions";
import { useLanguage } from "@/context/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [activeMap, setActiveMap] = useState<"jamkhandi" | "athani">("jamkhandi");

  const getContactInfo = () => [
    { icon: Phone, title: t("contact.phoneLabel"), details: activeMap === "jamkhandi" ? ["Jamkhandi: +91 9590483488"] : ["Athani: +91 9740412339"] },
    { icon: Clock, title: t("contact.officeHours"), details: [t("contact.officeHoursDetail")] },
    { icon: AlertCircle, title: t("contact.needHelp"), details: [t("contact.needHelpDetail")] },
    { icon: MapPin, title: activeMap === "jamkhandi" ? t("contact.jamakhandiBranch") : t("contact.athaniBranch"), details: activeMap === "jamkhandi" ? ["Alguoor RC, Near Helipad", "Kunchnoor Road - 587301"] : ["HUDKO Colony, IB Road", "Athani - 591304"] },
    { icon: Mail, title: t("contact.emailLabel"), details: ["noccj2023@gmail.com"] },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.subject || !form.message) return;
    setSubmitting(true);
    setSubmitStatus("idle");
    const { success } = await submitContactForm({ full_name: form.fullName, email: form.email || "", phone: form.phone || undefined, subject: form.subject, message: form.message });
    setSubmitting(false);
    if (success) {
      setSubmitStatus("success");
      setForm({ fullName: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } else {
      setSubmitStatus("error");
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-12 md:mb-16">
          <p className="text-[#c41e3a] font-semibold mb-2 tracking-wide text-xs sm:text-sm">{t("contact.tag")}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>{t("contact.title")}</h2>
          <p className="text-gray-600 mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base px-4">{t("contact.subtitle")}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-sm order-2 lg:order-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{t("contact.sendMessage")}</h3>

            {submitStatus === "success" && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm">{t("contact.success")}</p>
              </div>
            )}
            {submitStatus === "error" && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{t("contact.error")}</p>
              </div>
            )}

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t("contact.fullName")}</label>
                  <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors text-sm sm:text-base" required />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t("contact.phone")}</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors text-sm sm:text-base" required />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t("contact.email")}</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t("contact.subject")}</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors text-sm sm:text-base" required>
                  <option value="">{t("contact.selectSubject")}</option>
                  <option value="admissions">{t("contact.admissions")}</option>
                  <option value="navodaya">{t("contact.navodaya")}</option>
                  <option value="sainik">{t("contact.sainik")}</option>
                  <option value="hostel">{t("contact.hostel")}</option>
                  <option value="fees">{t("contact.fees")}</option>
                  <option value="other">{t("contact.other")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{t("contact.message")}</label>
                <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded focus:outline-none focus:border-[#c41e3a] transition-colors resize-none text-sm sm:text-base" required />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3 disabled:opacity-50">
                {submitting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("contact.sending")}</>) : (<>{t("contact.send")}<Send className="w-4 h-4" /></>)}
              </button>
            </form>
          </motion.div>

          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {getContactInfo().map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#c41e3a]/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#c41e3a]" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 sm:mb-2">{item.title}</h4>
                  {item.details.map((detail, i) => (<p key={i} className="text-gray-600 text-xs sm:text-sm leading-relaxed">{detail}</p>))}
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex mb-3 bg-white rounded-lg shadow-sm overflow-hidden">
                <button onClick={() => setActiveMap("jamkhandi")} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeMap === "jamkhandi" ? "bg-[#c41e3a] text-white" : "text-gray-600 hover:bg-gray-50"}`}>📍 {t("footer.jamakhandi")}</button>
                <button onClick={() => setActiveMap("athani")} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeMap === "athani" ? "bg-[#c41e3a] text-white" : "text-gray-600 hover:bg-gray-50"}`}>📍 {t("footer.athani")}</button>
              </div>
              <div className="h-[200px] sm:h-[250px] md:h-[300px] rounded-lg overflow-hidden shadow-sm">
                {activeMap === "jamkhandi" ? (
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.3010184042882!2d75.3059597!3d16.510894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc73dead6c1df95%3A0xa83dc27a384ce231!2sNew%20Oxford%20Coaching%20Class%20Jamakhandi!5e0!3m2!1sen!2sin!4v1777731595170!5m2!1sen!2sin" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Jamkhandi" />
                ) : (
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1910.5018595224244!2d75.04788937768937!3d16.72666625449889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc72b000a459e99%3A0x7738f08210c5efc5!2sNew%20Oxford%20Coaching%20Classes%20Athani!5e0!3m2!1sen!2sin!4v1777731550944!5m2!1sen!2sin" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Athani" />
                )}
              </div>
              <div className="mt-3 flex gap-3">
                <a href="https://maps.app.goo.gl/katomgsTeb5DfYxy8" target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs sm:text-sm text-[#c41e3a] hover:text-[#a81832] font-medium py-2 bg-white rounded-lg shadow-sm hover:shadow transition-all">{t("contact.openJamakhandi")}</a>
                <a href="https://maps.app.goo.gl/uRBSUGLQ5WzjWU9R7" target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs sm:text-sm text-[#c41e3a] hover:text-[#a81832] font-medium py-2 bg-white rounded-lg shadow-sm hover:shadow transition-all">{t("contact.openAthani")}</a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
