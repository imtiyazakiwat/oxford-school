"use client";

import { useState } from "react";
import { School, Bell, Shield, Database, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { seedAllData } from "@/firebase/seedData";

export default function SettingsModule() {
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<{ results: string[]; errors: string[] } | null>(null);

    const handleSeed = async () => {
        if (!confirm("This will push all default data to Firebase. Existing collections with data will be skipped. Continue?")) return;
        setSeeding(true);
        setSeedResult(null);
        const result = await seedAllData();
        setSeedResult(result);
        setSeeding(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* School Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <School className="w-5 h-5 text-[#c41e3a]" />
                        School Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                            <input
                                type="text"
                                defaultValue="New Oxford Coaching Classes College"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                defaultValue="info@New Oxford Coaching Classes.edu"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                defaultValue="+91 9590483488"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                            />
                        </div>
                        <button className="px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832]">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#c41e3a]" />
                        Notification Settings
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: "Email Notifications", desc: "Receive email for important updates" },
                            { label: "SMS Alerts", desc: "Get SMS for urgent notifications" },
                            { label: "Fee Reminders", desc: "Auto-send fee payment reminders" },
                            { label: "Attendance Alerts", desc: "Notify parents of absences" },
                        ].map((setting) => (
                            <div key={setting.label} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{setting.label}</p>
                                    <p className="text-sm text-gray-500">{setting.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c41e3a]"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#c41e3a]" />
                        Security Settings
                    </h3>
                    <div className="space-y-4">
                        <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                            Change Password
                        </button>
                        <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                            Two-Factor Authentication
                        </button>
                        <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                            Login History
                        </button>
                    </div>
                </div>

                {/* Backup & Seed Data */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#c41e3a]" />
                        Backup & Data
                    </h3>
                    <div className="space-y-4">
                        <button
                            onClick={handleSeed}
                            disabled={seeding}
                            className="w-full px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {seeding ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Seeding Data...</>
                            ) : (
                                <><Upload className="w-4 h-4" /> Seed Default Data to Firebase</>
                            )}
                        </button>
                        {seedResult && (
                            <div className="space-y-2">
                                {seedResult.results.map((r, i) => (
                                    <p key={i} className="text-sm text-green-700 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {r}</p>
                                ))}
                                {seedResult.errors.map((e, i) => (
                                    <p key={i} className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {e}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
