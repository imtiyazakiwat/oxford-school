"use client";

import { School, Bell, Shield, Database } from "lucide-react";

export default function SettingsModule() {
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

                {/* Backup Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#c41e3a]" />
                        Backup & Data
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Last backup: December 14, 2024</p>
                        </div>
                        <button className="w-full px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832]">
                            Create Backup Now
                        </button>
                        <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Export All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
