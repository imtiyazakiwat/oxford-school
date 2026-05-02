"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Upload, Plus, Star, Trash2, AlertCircle, Users, Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    Achiever,
    uploadAchieverImage,
    createAchiever,
    getAllAchievers,
    deleteAchiever,
    toggleFeatured,
    getAchieverImageUrl,
    updateAchiever,
    deleteAchieverImage,
} from "@/firebase/achievers";

export default function ManageAchieversModule() {
    const { user } = useAuth();
    const [achievers, setAchievers] = useState<Achiever[]>([]);
    const [loadingAchievers, setLoadingAchievers] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; achiever: Achiever | null }>({ show: false, achiever: null });
    const [deleting, setDeleting] = useState(false);
    const [editModal, setEditModal] = useState<{ show: boolean; achiever: Achiever | null }>({ show: false, achiever: null });
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        stream: "NEET",
        year: "",
        percentage: "",
        rank: "",
        is_featured: false,
        image: null as File | null,
    });
    const [achieverForm, setAchieverForm] = useState({
        name: "",
        stream: "NEET",
        year: new Date().getFullYear().toString(),
        percentage: "",
        rank: "",
        is_featured: false,
        image: null as File | null,
    });

    const streams = ["NEET", "CET", "JEE", "PUC", "SSLC", "Commerce", "Arts"];
    const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
    const featuredCount = achievers.filter(a => a.is_featured).length;
    const MAX_FEATURED = 6;

    const openEditModal = (achiever: Achiever) => {
        setEditForm({
            name: achiever.name,
            stream: achiever.stream,
            year: achiever.year.toString(),
            percentage: achiever.percentage,
            rank: achiever.rank || "",
            is_featured: achiever.is_featured,
            image: null,
        });
        setEditModal({ show: true, achiever });
    };

    const handleEditAchiever = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal.achiever || !user) return;
        
        setEditing(true);
        let newImagePath = editModal.achiever.image_path;

        // If new image uploaded, upload it and delete old one
        if (editForm.image) {
            const { path, error: uploadError } = await uploadAchieverImage(editForm.image, user.uid);
            if (uploadError) {
                alert("Failed to upload image: " + uploadError);
                setEditing(false);
                return;
            }
            // Delete old image
            await deleteAchieverImage(editModal.achiever.image_path);
            newImagePath = path;
        }

        const { error } = await updateAchiever(editModal.achiever.id, {
            name: editForm.name,
            stream: editForm.stream,
            year: parseInt(editForm.year),
            percentage: editForm.percentage,
            rank: editForm.rank || undefined,
            is_featured: editForm.is_featured,
            image_path: newImagePath,
        });

        if (error) {
            alert("Failed to update achiever: " + error);
            setEditing(false);
            return;
        }

        await loadAchievers();
        setEditing(false);
        setEditModal({ show: false, achiever: null });
    };

    useEffect(() => {
        loadAchievers();
    }, []);

    const loadAchievers = async () => {
        setLoadingAchievers(true);
        const { data } = await getAllAchievers();
        setAchievers(data);
        setLoadingAchievers(false);
    };

    const handleAddAchiever = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !achieverForm.image || !achieverForm.name || !achieverForm.percentage) {
            alert("Please fill all required fields and upload an image");
            return;
        }
        setSubmitting(true);
        const { path, error: uploadError } = await uploadAchieverImage(achieverForm.image, user.uid);
        if (uploadError) {
            alert("Failed to upload image: " + uploadError);
            setSubmitting(false);
            return;
        }
        const { error: createError } = await createAchiever(
            { name: achieverForm.name, stream: achieverForm.stream, year: parseInt(achieverForm.year), percentage: achieverForm.percentage, rank: achieverForm.rank || undefined, is_featured: achieverForm.is_featured },
            path,
            user.uid
        );
        if (createError) {
            alert("Failed to create achiever: " + createError);
            setSubmitting(false);
            return;
        }
        setAchieverForm({ name: "", stream: "NEET", year: new Date().getFullYear().toString(), percentage: "", rank: "", is_featured: false, image: null });
        await loadAchievers();
        setSubmitting(false);
    };

    const handleDeleteAchiever = async () => {
        if (!deleteModal.achiever) return;
        setDeleting(true);
        const { error } = await deleteAchiever(deleteModal.achiever.id, deleteModal.achiever.image_path);
        if (error) {
            alert("Failed to delete: " + error);
            setDeleting(false);
            return;
        }
        await loadAchievers();
        setDeleting(false);
        setDeleteModal({ show: false, achiever: null });
    };

    const handleToggleFeatured = async (achiever: Achiever) => {
        if (!achiever.is_featured && featuredCount >= MAX_FEATURED) {
            alert(`Maximum ${MAX_FEATURED} achievers can be featured on the landing page. Please unfeature one to add another.`);
            return;
        }
        const { error } = await toggleFeatured(achiever.id, !achiever.is_featured);
        if (error) {
            alert("Failed to update: " + error);
            return;
        }
        await loadAchievers();
    };

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.show && deleteModal.achiever && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !deleting && setDeleteModal({ show: false, achiever: null })}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                                <div><h3 className="text-lg font-semibold text-gray-900">Delete Achiever</h3><p className="text-sm text-gray-500">This action cannot be undone</p></div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center gap-3">
                                {getAchieverImageUrl(deleteModal.achiever.image_path, deleteModal.achiever.id) ? (
                                    <img src={getAchieverImageUrl(deleteModal.achiever.image_path, deleteModal.achiever.id)!} alt={deleteModal.achiever.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"><Users className="w-6 h-6 text-gray-400" /></div>
                                )}
                                <div><p className="font-medium text-gray-900">{deleteModal.achiever.name}</p><p className="text-sm text-gray-500">{deleteModal.achiever.stream} - {deleteModal.achiever.year}</p></div>
                            </div>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete <span className="font-semibold">{deleteModal.achiever.name}</span>? This will permanently remove their record and image from the system.</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteModal({ show: false, achiever: null })} disabled={deleting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50">Cancel</button>
                                <button onClick={handleDeleteAchiever} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50">
                                    {deleting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>) : (<><Trash2 className="w-4 h-4" />Delete</>)}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal.show && editModal.achiever && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !editing && setEditModal({ show: false, achiever: null })}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-[#c41e3a]/10 flex items-center justify-center"><Edit className="w-6 h-6 text-[#c41e3a]" /></div>
                                <div><h3 className="text-lg font-semibold text-gray-900">Edit Achiever</h3><p className="text-sm text-gray-500">Update achiever details</p></div>
                            </div>
                            <form onSubmit={handleEditAchiever} className="space-y-6">
                                <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                        {editForm.image ? (
                                            <img src={URL.createObjectURL(editForm.image)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : getAchieverImageUrl(editModal.achiever.image_path, editModal.achiever.id) ? (
                                            <img src={getAchieverImageUrl(editModal.achiever.image_path, editModal.achiever.id)!} alt={editModal.achiever.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>
                                    <label className="cursor-pointer">
                                        <span className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 inline-flex items-center gap-2"><Upload className="w-4 h-4" />Change Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setEditForm({ ...editForm, image: e.target.files[0] }); }} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" required /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Stream / Exam *</label><select value={editForm.stream} onChange={(e) => setEditForm({ ...editForm, stream: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]">{streams.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><select value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]">{years.map((y) => (<option key={y} value={y}>{y}</option>))}</select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Percentage / Score *</label><input type="text" value={editForm.percentage} onChange={(e) => setEditForm({ ...editForm, percentage: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" required /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Rank (Optional)</label><input type="text" value={editForm.rank} onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" /></div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <input type="checkbox" id="edit_is_featured" checked={editForm.is_featured} onChange={(e) => { if (e.target.checked && featuredCount >= MAX_FEATURED && !editModal.achiever?.is_featured) { alert(`Maximum ${MAX_FEATURED} achievers can be featured.`); return; } setEditForm({ ...editForm, is_featured: e.target.checked }); }} className="w-4 h-4 text-[#c41e3a] border-gray-300 rounded focus:ring-[#c41e3a]" />
                                        <label htmlFor="edit_is_featured" className="text-sm font-medium text-gray-700 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />Featured</label>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4 border-t">
                                    <button type="button" onClick={() => setEditModal({ show: false, achiever: null })} disabled={editing} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50">Cancel</button>
                                    <button type="submit" disabled={editing} className="px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] font-medium flex items-center gap-2 disabled:opacity-50">
                                        {editing ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>) : (<><Edit className="w-4 h-4" />Save Changes</>)}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add New Achiever Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#c41e3a]" />
                    Add New Achiever
                </h3>
                <form className="space-y-6" onSubmit={handleAddAchiever}>
                    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl">
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                            {achieverForm.image ? (<img src={URL.createObjectURL(achieverForm.image)} alt="Preview" className="w-full h-full object-cover" />) : (<Users className="w-16 h-16 text-gray-400" />)}
                        </div>
                        <label className="cursor-pointer">
                            <span className="px-4 py-2 bg-[#c41e3a] text-white text-sm rounded-lg hover:bg-[#a81832] inline-flex items-center gap-2"><Upload className="w-4 h-4" />Upload Photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setAchieverForm({ ...achieverForm, image: e.target.files[0] }); }} />
                        </label>
                        <p className="text-xs text-gray-500">JPG, PNG or WebP. Will be compressed to 512×512</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label><input type="text" value={achieverForm.name} onChange={(e) => setAchieverForm({ ...achieverForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" placeholder="Enter student name" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Stream / Exam *</label><select value={achieverForm.stream} onChange={(e) => setAchieverForm({ ...achieverForm, stream: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]">{streams.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><select value={achieverForm.year} onChange={(e) => setAchieverForm({ ...achieverForm, year: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]">{years.map((y) => (<option key={y} value={y}>{y}</option>))}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Percentage / Score *</label><input type="text" value={achieverForm.percentage} onChange={(e) => setAchieverForm({ ...achieverForm, percentage: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" placeholder="e.g., 95% or 650/720" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Rank (Optional)</label><input type="text" value={achieverForm.rank} onChange={(e) => setAchieverForm({ ...achieverForm, rank: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" placeholder="e.g., AIR 5000" /></div>
                        <div className="flex items-center gap-3 pt-6">
                            <input type="checkbox" id="is_featured" checked={achieverForm.is_featured} onChange={(e) => { if (e.target.checked && featuredCount >= MAX_FEATURED) { alert(`Maximum ${MAX_FEATURED} achievers can be featured.`); return; } setAchieverForm({ ...achieverForm, is_featured: e.target.checked }); }} disabled={featuredCount >= MAX_FEATURED && !achieverForm.is_featured} className="w-4 h-4 text-[#c41e3a] border-gray-300 rounded focus:ring-[#c41e3a] disabled:opacity-50" />
                            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />Feature on Landing Page ({featuredCount}/{MAX_FEATURED})</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setAchieverForm({ name: "", stream: "NEET", year: new Date().getFullYear().toString(), percentage: "", rank: "", is_featured: false, image: null })} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Clear</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] flex items-center gap-2 disabled:opacity-50">
                            {submitting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>) : (<><Plus className="w-4 h-4" />Add Achiever</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* Existing Achievers List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">All Achievers ({achievers.length})</h4>
                {loadingAchievers ? (
                    <div className="text-center py-8"><div className="w-8 h-8 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : achievers.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No achievers added yet.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievers.map((achiever) => (
                            <div key={achiever.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
                                <div className="relative bg-gray-50 pt-6 pb-8 px-4">
                                    <div className="relative w-28 h-28 mx-auto">
                                        {getAchieverImageUrl(achiever.image_path, achiever.id) ? (
                                            <img src={getAchieverImageUrl(achiever.image_path, achiever.id)!} alt={achiever.name} className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg"><Users className="w-12 h-12 text-gray-400" /></div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#c41e3a] flex items-center justify-center shadow-lg border-2 border-white"><Trophy className="w-4 h-4 text-white" /></div>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-[#f7c52d] text-[#c41e3a] px-2 py-0.5 text-xs font-bold rounded">{achiever.year}</div>
                                    <div className="absolute top-3 left-3 bg-slate-800 text-white px-2 py-0.5 text-xs font-medium rounded">{achiever.stream}</div>
                                </div>
                                <div className="p-4 text-center">
                                    <h5 className="font-bold text-gray-900 text-sm truncate">{achiever.name}</h5>
                                    <p className="text-[#c41e3a] font-bold text-lg mt-1">{achiever.percentage}</p>
                                    {achiever.rank && <p className="text-gray-500 text-xs mt-0.5">{achiever.rank}</p>}
                                </div>
                                <div className="flex items-center justify-center gap-2 px-4 pb-4">
                                    <button onClick={() => openEditModal(achiever)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Edit className="w-3.5 h-3.5" />Edit</button>
                                    <button onClick={() => handleToggleFeatured(achiever)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${achiever.is_featured ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                        <Star className={`w-3.5 h-3.5 ${achiever.is_featured ? "fill-yellow-500" : ""}`} />{achiever.is_featured ? "Featured" : "Feature"}
                                    </button>
                                    <button onClick={() => setDeleteModal({ show: true, achiever })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
