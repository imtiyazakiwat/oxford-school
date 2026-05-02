"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Megaphone, Plus, Upload, Trash2, AlertCircle, AlertTriangle, Info, Bell, Eye, EyeOff, Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    Announcement,
    uploadAnnouncementImage,
    createAnnouncement,
    getAllAnnouncements,
    deleteAnnouncement,
    toggleAnnouncementActive,
    getAnnouncementImageUrl,
    updateAnnouncement,
    deleteAnnouncementImage,
} from "@/firebase/announcements";

const PRIORITY_CONFIG = {
    low: { label: "Low", color: "bg-gray-100 text-gray-700", icon: Info },
    normal: { label: "Normal", color: "bg-blue-100 text-blue-700", icon: Bell },
    high: { label: "High", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
    urgent: { label: "Urgent", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

export default function ManageAnnouncementsModule() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; announcement: Announcement | null }>({ show: false, announcement: null });
    const [deleting, setDeleting] = useState(false);
    const [editModal, setEditModal] = useState<{ show: boolean; announcement: Announcement | null }>({ show: false, announcement: null });
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        content: "",
        priority: "normal" as Announcement["priority"],
        image: null as File | null,
        removeImage: false,
    });
    const [form, setForm] = useState({
        title: "",
        content: "",
        priority: "normal" as Announcement["priority"],
        image: null as File | null,
    });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const openEditModal = (announcement: Announcement) => {
        setEditForm({
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            image: null,
            removeImage: false,
        });
        setEditModal({ show: true, announcement });
    };

    const handleEditAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal.announcement || !user) return;

        setEditing(true);
        let newImagePath = editModal.announcement.image_path;

        // Handle image changes
        if (editForm.removeImage && editModal.announcement.image_path) {
            await deleteAnnouncementImage(editModal.announcement.image_path);
            newImagePath = null;
        } else if (editForm.image) {
            const { path, error: uploadError } = await uploadAnnouncementImage(editForm.image, user.uid);
            if (uploadError) {
                alert("Failed to upload image: " + uploadError);
                setEditing(false);
                return;
            }
            if (editModal.announcement.image_path) {
                await deleteAnnouncementImage(editModal.announcement.image_path);
            }
            newImagePath = path;
        }

        const { error } = await updateAnnouncement(editModal.announcement.id, {
            title: editForm.title,
            content: editForm.content,
            priority: editForm.priority,
            image_path: newImagePath,
        });

        if (error) {
            alert("Failed to update announcement: " + error);
            setEditing(false);
            return;
        }

        await loadAnnouncements();
        setEditing(false);
        setEditModal({ show: false, announcement: null });
    };

    const loadAnnouncements = async () => {
        setLoading(true);
        const { data } = await getAllAnnouncements(true);
        setAnnouncements(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !form.title || !form.content) {
            alert("Please fill all required fields");
            return;
        }
        setSubmitting(true);

        let imagePath: string | null = null;
        if (form.image) {
            const { path, error: uploadError } = await uploadAnnouncementImage(form.image, user.uid);
            if (uploadError) {
                alert("Failed to upload image: " + uploadError);
                setSubmitting(false);
                return;
            }
            imagePath = path;
        }

        const { error: createError } = await createAnnouncement(
            { title: form.title, content: form.content, priority: form.priority },
            imagePath,
            user.uid
        );
        if (createError) {
            alert("Failed to create announcement: " + createError);
            setSubmitting(false);
            return;
        }

        setForm({ title: "", content: "", priority: "normal", image: null });
        await loadAnnouncements();
        setSubmitting(false);
    };

    const handleDelete = async () => {
        if (!deleteModal.announcement) return;
        setDeleting(true);
        const { error } = await deleteAnnouncement(deleteModal.announcement.id, deleteModal.announcement.image_path);
        if (error) {
            alert("Failed to delete: " + error);
            setDeleting(false);
            return;
        }
        await loadAnnouncements();
        setDeleting(false);
        setDeleteModal({ show: false, announcement: null });
    };

    const handleToggleActive = async (announcement: Announcement) => {
        const { error } = await toggleAnnouncementActive(announcement.id, !announcement.is_active);
        if (error) {
            alert("Failed to update: " + error);
            return;
        }
        await loadAnnouncements();
    };


    return (
        <div className="space-y-6">
            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.show && deleteModal.announcement && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !deleting && setDeleteModal({ show: false, announcement: null })}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                                <div><h3 className="text-lg font-semibold text-gray-900">Delete Announcement</h3><p className="text-sm text-gray-500">This action cannot be undone</p></div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="font-medium text-gray-900">{deleteModal.announcement.title}</p>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{deleteModal.announcement.content}</p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteModal({ show: false, announcement: null })} disabled={deleting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50">Cancel</button>
                                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50">
                                    {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal.show && editModal.announcement && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !editing && setEditModal({ show: false, announcement: null })}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-[#c41e3a]/10 flex items-center justify-center"><Edit className="w-6 h-6 text-[#c41e3a]" /></div>
                                <div><h3 className="text-lg font-semibold text-gray-900">Edit Announcement</h3><p className="text-sm text-gray-500">Update announcement details</p></div>
                            </div>
                            <form onSubmit={handleEditAnnouncement} className="space-y-6">
                                {/* Image Section */}
                                <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    {editForm.image ? (
                                        <div className="relative">
                                            <img src={URL.createObjectURL(editForm.image)} alt="Preview" className="max-w-sm max-h-32 object-contain rounded-lg" />
                                            <button type="button" onClick={() => setEditForm({ ...editForm, image: null })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                                        </div>
                                    ) : editModal.announcement.image_path && !editForm.removeImage ? (
                                        <div className="relative">
                                            <img src={getAnnouncementImageUrl(editModal.announcement.image_path)} alt="" className="max-w-sm max-h-32 object-contain rounded-lg" />
                                            <button type="button" onClick={() => setEditForm({ ...editForm, removeImage: true })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No image</p>
                                    )}
                                    <label className="cursor-pointer">
                                        <span className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 inline-flex items-center gap-2"><Upload className="w-4 h-4" />{editModal.announcement.image_path ? "Change" : "Add"} Image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setEditForm({ ...editForm, image: e.target.files[0], removeImage: false }); }} />
                                    </label>
                                </div>
                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" required /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Content *</label><textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] resize-none" required /></div>
                                    <div className="max-w-xs"><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value as Announcement["priority"] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4 border-t">
                                    <button type="button" onClick={() => setEditModal({ show: false, announcement: null })} disabled={editing} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50">Cancel</button>
                                    <button type="submit" disabled={editing} className="px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] font-medium flex items-center gap-2 disabled:opacity-50">
                                        {editing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Edit className="w-4 h-4" />Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Announcement Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[#c41e3a]" />
                    Create Announcement
                </h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Image Upload (Optional) */}
                    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        {form.image ? (
                            <div className="relative">
                                <img src={URL.createObjectURL(form.image)} alt="Preview" className="max-w-sm max-h-40 object-contain rounded-lg" />
                                <button type="button" onClick={() => setForm({ ...form, image: null })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-gray-400" />
                                <p className="text-gray-600 text-sm">Add an image to your announcement (optional)</p>
                            </>
                        )}
                        <label className="cursor-pointer">
                            <span className="px-4 py-2 bg-[#c41e3a] text-white text-sm rounded-lg hover:bg-[#a81832] inline-flex items-center gap-2"><Upload className="w-4 h-4" />Choose Image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setForm({ ...form, image: e.target.files[0] }); }} />
                        </label>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Title *</label>
                            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" placeholder="Enter announcement title" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] resize-none" placeholder="Enter announcement content..." required />
                        </div>
                        <div className="max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Announcement["priority"] })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]">
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setForm({ title: "", content: "", priority: "normal", image: null })} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Clear</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] flex items-center gap-2 disabled:opacity-50">
                            {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing...</> : <><Plus className="w-4 h-4" />Publish Announcement</>}
                        </button>
                    </div>
                </form>
            </motion.div>


            {/* Existing Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">All Announcements ({announcements.length})</h4>
                {loading ? (
                    <div className="text-center py-8"><div className="w-8 h-8 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : announcements.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                        No announcements created yet. Create your first announcement above.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {announcements.map(announcement => {
                            const priorityConfig = PRIORITY_CONFIG[announcement.priority];
                            const PriorityIcon = priorityConfig.icon;
                            return (
                                <div key={announcement.id} className={`border rounded-lg overflow-hidden flex flex-col transition-colors ${announcement.is_active ? "border-gray-200 hover:border-gray-300" : "border-gray-200 bg-gray-50 opacity-60"}`}>
                                    {announcement.image_path && (
                                        <img src={getAnnouncementImageUrl(announcement.image_path)} alt="" className="w-full h-32 object-cover" />
                                    )}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.color}`}>
                                                <PriorityIcon className="w-3 h-3" />
                                                {priorityConfig.label}
                                            </span>
                                            {!announcement.is_active && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                                                    <EyeOff className="w-3 h-3" />Hidden
                                                </span>
                                            )}
                                        </div>
                                        <h5 className="font-semibold text-gray-900 mb-1 line-clamp-1">{announcement.title}</h5>
                                        <p className="text-sm text-gray-600 line-clamp-2 flex-1">{announcement.content}</p>
                                        <span className="text-xs text-gray-400 mt-2">{new Date(announcement.created_at).toLocaleDateString()}</span>
                                        <div className="flex mt-3 gap-2 pt-3 border-t border-gray-100">
                                            <button onClick={() => openEditModal(announcement)} className="text-blue-600 hover:bg-blue-50 text-xs font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors">
                                                <Edit className="w-3.5 h-3.5" />Edit
                                            </button>
                                            <button onClick={() => handleToggleActive(announcement)} className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors ${announcement.is_active ? "text-gray-600 hover:bg-gray-100" : "text-green-600 hover:bg-green-50"}`}>
                                                {announcement.is_active ? <><EyeOff className="w-3.5 h-3.5" />Hide</> : <><Eye className="w-3.5 h-3.5" />Show</>}
                                            </button>
                                            <button onClick={() => setDeleteModal({ show: true, announcement })} className="text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1 px-2 py-1 rounded transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
