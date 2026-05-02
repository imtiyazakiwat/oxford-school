"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Bell,
    Award,
    Calendar,
    GripVertical,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import {
    MarqueeMessage,
    getAllMarqueeMessages,
    createMarqueeMessage,
    updateMarqueeMessage,
    deleteMarqueeMessage,
    reorderMarqueeMessages,
} from "@/firebase/marqueeMessages";
import {
    AdmissionBanner,
    getOrCreateAdmissionBanner,
    updateAdmissionBanner,
} from "@/firebase/admissionBanner";
import { useAuth } from "@/context/AuthContext";

const iconOptions = [
    { value: "Bell", label: "Bell", icon: Bell },
    { value: "Award", label: "Award", icon: Award },
    { value: "Calendar", label: "Calendar", icon: Calendar },
];

const getIconComponent = (iconName: string) => {
    const found = iconOptions.find((opt) => opt.value === iconName);
    return found ? found.icon : Bell;
};

export default function ManageTopMessageModule() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<MarqueeMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Admission Banner state
    const [admissionBanner, setAdmissionBanner] = useState<AdmissionBanner | null>(null);
    const [editingBanner, setEditingBanner] = useState(false);
    const [bannerForm, setBannerForm] = useState({ text: "", emoji: "🎓", is_active: true });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        text: "",
        icon: "Bell",
        highlight: false,
        is_active: true,
    });

    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
        fetchAdmissionBanner();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await getAllMarqueeMessages();
        if (error) {
            setError(error);
        } else {
            setMessages(data);
        }
        setLoading(false);
    };

    const fetchAdmissionBanner = async () => {
        const { data } = await getOrCreateAdmissionBanner();
        if (data) {
            setAdmissionBanner(data);
            setBannerForm({ text: data.text, emoji: data.emoji, is_active: data.is_active });
        }
    };

    const handleSaveBanner = async () => {
        if (!admissionBanner || !bannerForm.text.trim()) {
            showNotification("Please enter banner text", "error");
            return;
        }

        setSaving(true);
        const { error } = await updateAdmissionBanner(admissionBanner.id, {
            text: bannerForm.text,
            emoji: bannerForm.emoji,
            is_active: bannerForm.is_active,
            updated_by: user?.uid || null,
        });

        if (error) {
            showNotification(error, "error");
        } else {
            showNotification("Admission banner updated successfully", "success");
            setEditingBanner(false);
            fetchAdmissionBanner();
        }
        setSaving(false);
    };

    const showNotification = (message: string, type: "success" | "error") => {
        if (type === "success") {
            setSuccess(message);
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError(message);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleAdd = async () => {
        if (!formData.text.trim()) {
            showNotification("Please enter message text", "error");
            return;
        }

        setSaving(true);
        const { error } = await createMarqueeMessage({
            text: formData.text,
            icon: formData.icon,
            highlight: formData.highlight,
            is_active: formData.is_active,
            display_order: messages.length + 1,
            created_by: user?.uid || null,
        });

        if (error) {
            showNotification(error, "error");
        } else {
            showNotification("Message added successfully", "success");
            setShowAddForm(false);
            setFormData({ text: "", icon: "Bell", highlight: false, is_active: true });
            fetchMessages();
        }
        setSaving(false);
    };

    const handleUpdate = async (id: string) => {
        if (!formData.text.trim()) {
            showNotification("Please enter message text", "error");
            return;
        }

        setSaving(true);
        const { error } = await updateMarqueeMessage(id, {
            text: formData.text,
            icon: formData.icon,
            highlight: formData.highlight,
            is_active: formData.is_active,
        });

        if (error) {
            showNotification(error, "error");
        } else {
            showNotification("Message updated successfully", "success");
            setEditingId(null);
            fetchMessages();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        const { error } = await deleteMarqueeMessage(id);
        if (error) {
            showNotification(error, "error");
        } else {
            showNotification("Message deleted successfully", "success");
            fetchMessages();
        }
    };

    const handleToggleActive = async (message: MarqueeMessage) => {
        const { error } = await updateMarqueeMessage(message.id, {
            is_active: !message.is_active,
        });

        if (error) {
            showNotification(error, "error");
        } else {
            fetchMessages();
        }
    };

    const startEdit = (message: MarqueeMessage) => {
        setEditingId(message.id);
        setFormData({
            text: message.text,
            icon: message.icon,
            highlight: message.highlight,
            is_active: message.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ text: "", icon: "Bell", highlight: false, is_active: true });
    };

    const handleDragStart = (id: string) => {
        setDraggedItem(id);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === targetId) return;

        const draggedIndex = messages.findIndex((m) => m.id === draggedItem);
        const targetIndex = messages.findIndex((m) => m.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newMessages = [...messages];
        const [removed] = newMessages.splice(draggedIndex, 1);
        newMessages.splice(targetIndex, 0, removed);
        setMessages(newMessages);
    };

    const handleDragEnd = async () => {
        if (!draggedItem) return;

        const orderedIds = messages.map((m) => m.id);
        const { error } = await reorderMarqueeMessages(orderedIds);

        if (error) {
            showNotification("Failed to save order", "error");
            fetchMessages();
        }
        setDraggedItem(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c41e3a]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notifications */}
            <AnimatePresence>
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-lg flex items-center gap-3 ${
                            error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                        }`}
                    >
                        {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        <span>{error || success}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admission Banner Section */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-[#c41e3a]/5">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#c41e3a]"></span>
                        Admission Banner (Red Bar)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        The red scrolling banner shown at the very top of the navbar
                    </p>
                </div>
                
                {/* Banner Preview */}
                <div className="bg-[#c41e3a] text-white text-sm py-2 overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap">
                        <span className="inline-block">
                            {bannerForm.emoji} {bannerForm.text} {bannerForm.emoji} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {bannerForm.emoji} {bannerForm.text} {bannerForm.emoji} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {bannerForm.emoji} {bannerForm.text} {bannerForm.emoji}
                        </span>
                    </div>
                </div>

                <div className="p-4">
                    {editingBanner ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Text</label>
                                <input
                                    type="text"
                                    value={bannerForm.text}
                                    onChange={(e) => setBannerForm({ ...bannerForm, text: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                                    placeholder="Enter banner text..."
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                                    <input
                                        type="text"
                                        value={bannerForm.emoji}
                                        onChange={(e) => setBannerForm({ ...bannerForm, emoji: e.target.value })}
                                        className="w-20 px-3 py-2 border rounded-lg text-center text-lg"
                                        maxLength={2}
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer mt-6">
                                    <input
                                        type="checkbox"
                                        checked={bannerForm.is_active}
                                        onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                                        className="w-4 h-4 text-[#c41e3a] rounded"
                                    />
                                    <span className="text-sm text-gray-700">Show Banner</span>
                                </label>
                                <div className="flex gap-2 ml-auto mt-6">
                                    <button
                                        onClick={() => {
                                            setEditingBanner(false);
                                            if (admissionBanner) {
                                                setBannerForm({
                                                    text: admissionBanner.text,
                                                    emoji: admissionBanner.emoji,
                                                    is_active: admissionBanner.is_active,
                                                });
                                            }
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveBanner}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830] disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{admissionBanner?.emoji || "🎓"}</span>
                                <div>
                                    <p className="font-medium text-gray-900">{admissionBanner?.text || "No banner text"}</p>
                                    {!admissionBanner?.is_active && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Hidden</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingBanner(true)}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Yellow Marquee Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#f7c52d]"></span>
                        Announcements Marquee (Yellow Bar)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Multiple scrolling messages displayed below the navbar
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Message
                </button>
            </div>

            {/* Preview */}
            <div className="bg-[#f7c52d] py-3 overflow-hidden rounded-lg">
                <div className="flex animate-marquee whitespace-nowrap">
                    {[...messages.filter((m) => m.is_active), ...messages.filter((m) => m.is_active)].map(
                        (item, index) => {
                            const IconComponent = getIconComponent(item.icon);
                            return (
                                <div key={index} className="flex items-center gap-2 mx-8">
                                    <IconComponent className="w-4 h-4 text-[#c41e3a]" />
                                    <span
                                        className={`font-medium ${
                                            item.highlight ? "text-[#c41e3a]" : "text-gray-800"
                                        }`}
                                    >
                                        {item.text}
                                    </span>
                                    {item.highlight && (
                                        <span className="bg-[#c41e3a] text-white text-xs px-2 py-0.5 rounded font-bold">
                                            NEW
                                        </span>
                                    )}
                                    <span className="text-gray-600 mx-4">•</span>
                                </div>
                            );
                        }
                    )}
                </div>
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white border rounded-xl p-6 shadow-sm"
                    >
                        <h3 className="font-semibold text-gray-900 mb-4">Add New Message</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message Text
                                </label>
                                <input
                                    type="text"
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                                    placeholder="Enter message text..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                                    >
                                        {iconOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.highlight}
                                            onChange={(e) =>
                                                setFormData({ ...formData, highlight: e.target.checked })
                                            }
                                            className="w-4 h-4 text-[#c41e3a] rounded focus:ring-[#c41e3a]"
                                        />
                                        <span className="text-sm text-gray-700">Highlight (NEW badge)</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) =>
                                                setFormData({ ...formData, is_active: e.target.checked })
                                            }
                                            className="w-4 h-4 text-[#c41e3a] rounded focus:ring-[#c41e3a]"
                                        />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setFormData({ text: "", icon: "Bell", highlight: false, is_active: true });
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01830] transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? "Saving..." : "Save Message"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages List */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <p className="text-sm text-gray-600">
                        Drag and drop to reorder messages. Changes are saved automatically.
                    </p>
                </div>
                <div className="divide-y">
                    {messages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No messages yet. Add your first message above.
                        </div>
                    ) : (
                        messages.map((message) => {
                            const IconComponent = getIconComponent(message.icon);
                            const isEditing = editingId === message.id;

                            return (
                                <div
                                    key={message.id}
                                    draggable={!isEditing}
                                    onDragStart={() => handleDragStart(message.id)}
                                    onDragOver={(e) => handleDragOver(e, message.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`p-4 ${
                                        draggedItem === message.id ? "opacity-50 bg-gray-100" : ""
                                    } ${!message.is_active ? "bg-gray-50" : ""}`}
                                >
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={formData.text}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, text: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent"
                                            />
                                            <div className="flex flex-wrap items-center gap-4">
                                                <select
                                                    value={formData.icon}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, icon: e.target.value })
                                                    }
                                                    className="px-3 py-1.5 border rounded-lg text-sm"
                                                >
                                                    {iconOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.highlight}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                highlight: e.target.checked,
                                                            })
                                                        }
                                                        className="w-4 h-4 text-[#c41e3a] rounded"
                                                    />
                                                    <span className="text-sm">Highlight</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_active}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                is_active: e.target.checked,
                                                            })
                                                        }
                                                        className="w-4 h-4 text-[#c41e3a] rounded"
                                                    />
                                                    <span className="text-sm">Active</span>
                                                </label>
                                                <div className="flex gap-2 ml-auto">
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate(message.id)}
                                                        disabled={saving}
                                                        className="p-2 text-white bg-[#c41e3a] hover:bg-[#a01830] rounded-lg disabled:opacity-50"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="cursor-grab text-gray-400 hover:text-gray-600">
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    message.highlight ? "bg-[#c41e3a]/10" : "bg-gray-100"
                                                }`}
                                            >
                                                <IconComponent
                                                    className={`w-5 h-5 ${
                                                        message.highlight ? "text-[#c41e3a]" : "text-gray-600"
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`font-medium truncate ${
                                                        !message.is_active ? "text-gray-400" : "text-gray-900"
                                                    }`}
                                                >
                                                    {message.text}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {message.highlight && (
                                                        <span className="text-xs bg-[#c41e3a] text-white px-2 py-0.5 rounded">
                                                            NEW
                                                        </span>
                                                    )}
                                                    {!message.is_active && (
                                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(message)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        message.is_active
                                                            ? "text-green-600 hover:bg-green-50"
                                                            : "text-gray-400 hover:bg-gray-100"
                                                    }`}
                                                    title={message.is_active ? "Hide message" : "Show message"}
                                                >
                                                    {message.is_active ? (
                                                        <Eye className="w-4 h-4" />
                                                    ) : (
                                                        <EyeOff className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => startEdit(message)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(message.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
