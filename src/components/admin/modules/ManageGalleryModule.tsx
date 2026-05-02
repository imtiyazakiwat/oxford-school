"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image, Upload, Plus, Star, Trash2, AlertCircle, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    GalleryImage,
    uploadGalleryImage,
    createGalleryImage,
    getAllGalleryImages,
    deleteGalleryImage,
    toggleGalleryFeatured,
    getGalleryImageUrl,
} from "@/firebase/gallery";

const CATEGORIES = ["Achievements", "Events", "Admissions", "Press Coverage"] as const;
type Category = typeof CATEGORIES[number];

export default function ManageGalleryModule() {
    const { user } = useAuth();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filterCategory, setFilterCategory] = useState<Category | "All">("All");
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; image: GalleryImage | null }>({ show: false, image: null });
    const [deleting, setDeleting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        category: "Achievements" as Category,
        is_featured: false,
        image: null as File | null,
    });

    const featuredCount = images.filter(i => i.is_featured).length;
    const MAX_FEATURED = 6;

    const filteredImages = filterCategory === "All" 
        ? images 
        : images.filter(i => i.category === filterCategory);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        setLoading(true);
        const { data } = await getAllGalleryImages(true);
        setImages(data);
        setLoading(false);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !form.image || !form.title) {
            alert("Please fill all required fields and upload an image");
            return;
        }
        setSubmitting(true);
        
        const { path, error: uploadError } = await uploadGalleryImage(form.image, user.uid);
        if (uploadError) {
            alert("Failed to upload image: " + uploadError);
            setSubmitting(false);
            return;
        }
        
        const { error: createError } = await createGalleryImage(
            { title: form.title, category: form.category, is_featured: form.is_featured },
            path,
            user.uid
        );
        if (createError) {
            alert("Failed to add image: " + createError);
            setSubmitting(false);
            return;
        }
        
        setForm({ title: "", category: "Achievements", is_featured: false, image: null });
        await loadImages();
        setSubmitting(false);
    };

    const handleDelete = async () => {
        if (!deleteModal.image) return;
        setDeleting(true);
        const { error } = await deleteGalleryImage(deleteModal.image.id, deleteModal.image.image_path);
        if (error) {
            alert("Failed to delete: " + error);
            setDeleting(false);
            return;
        }
        await loadImages();
        setDeleting(false);
        setDeleteModal({ show: false, image: null });
    };

    const handleToggleFeatured = async (image: GalleryImage) => {
        if (!image.is_featured && featuredCount >= MAX_FEATURED) {
            alert(`Maximum ${MAX_FEATURED} images can be featured. Please unfeature one first.`);
            return;
        }
        const { error } = await toggleGalleryFeatured(image.id, !image.is_featured);
        if (error) {
            alert("Failed to update: " + error);
            return;
        }
        await loadImages();
    };

    return (
        <div className="space-y-6">
            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.show && deleteModal.image && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !deleting && setDeleteModal({ show: false, image: null })}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                                <div><h3 className="text-lg font-semibold text-gray-900">Delete Image</h3><p className="text-sm text-gray-500">This action cannot be undone</p></div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                {getGalleryImageUrl(deleteModal.image.image_path, deleteModal.image.id) ? (
                                    <img src={getGalleryImageUrl(deleteModal.image.image_path, deleteModal.image.id)!} alt={deleteModal.image.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                                ) : (
                                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-lg mb-2"><Image className="w-8 h-8 text-gray-400" /></div>
                                )}
                                <p className="font-medium text-gray-900">{deleteModal.image.title}</p>
                                <p className="text-sm text-gray-500">{deleteModal.image.category}</p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteModal({ show: false, image: null })} disabled={deleting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50">Cancel</button>
                                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50">
                                    {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Add New Image Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Image className="w-5 h-5 text-[#c41e3a]" />
                    Add Gallery Image
                </h3>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        {form.image ? (
                            <div className="relative">
                                <img src={URL.createObjectURL(form.image)} alt="Preview" className="max-w-sm max-h-48 object-contain rounded-lg" />
                                <button type="button" onClick={() => setForm({ ...form, image: null })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-gray-400" />
                                <p className="text-gray-600">Drag and drop an image, or click to browse</p>
                            </>
                        )}
                        <label className="cursor-pointer">
                            <span className="px-4 py-2 bg-[#c41e3a] text-white text-sm rounded-lg hover:bg-[#a81832] inline-flex items-center gap-2"><Upload className="w-4 h-4" />Choose File</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setForm({ ...form, image: e.target.files[0] }); }} />
                        </label>
                        <p className="text-xs text-gray-500">JPG, PNG or WebP. Will be compressed to 1200px width</p>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image Title *</label>
                            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]" placeholder="Enter image title" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]">
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={e => {
                            if (e.target.checked && featuredCount >= MAX_FEATURED) { alert(`Maximum ${MAX_FEATURED} images can be featured.`); return; }
                            setForm({ ...form, is_featured: e.target.checked });
                        }} disabled={featuredCount >= MAX_FEATURED && !form.is_featured} className="w-4 h-4 text-[#c41e3a] border-gray-300 rounded focus:ring-[#c41e3a] disabled:opacity-50" />
                        <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />Feature on Landing Page ({featuredCount}/{MAX_FEATURED})</label>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setForm({ title: "", category: "Achievements", is_featured: false, image: null })} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Clear</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] flex items-center gap-2 disabled:opacity-50">
                            {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</> : <><Plus className="w-4 h-4" />Add Image</>}
                        </button>
                    </div>
                </form>
            </div>


            {/* Gallery Images List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h4 className="font-semibold text-gray-900">All Images ({images.length})</h4>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as Category | "All")} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c41e3a]">
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8"><div className="w-8 h-8 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : filteredImages.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                        {filterCategory === "All" ? "No images added yet. Add your first image above." : `No images in ${filterCategory} category.`}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.map((image) => {
                            const imageUrl = getGalleryImageUrl(image.image_path, image.id);
                            return (
                                <div key={image.id} className="relative group rounded-lg overflow-hidden bg-gray-100">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={image.title} className="w-full h-40 object-cover" />
                                    ) : (
                                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                                            <Image className="w-10 h-10 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />
                                
                                    {/* Category Badge */}
                                    <div className="absolute top-2 left-2 bg-slate-800 text-white px-2 py-0.5 text-xs font-medium rounded">
                                        {image.category}
                                    </div>
                                    
                                    {/* Featured Badge */}
                                    {image.is_featured && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
                                            <Star className="w-3 h-3 fill-white" />
                                        </div>
                                    )}
                                    
                                    {/* Hover Actions */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-medium truncate mb-2">{image.title}</p>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleToggleFeatured(image)} 
                                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${image.is_featured ? "bg-yellow-500 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
                                            >
                                                <Star className={`w-3 h-3 ${image.is_featured ? "fill-white" : ""}`} />
                                                {image.is_featured ? "Featured" : "Feature"}
                                            </button>
                                            <button 
                                                onClick={() => setDeleteModal({ show: true, image })} 
                                                className="px-2 py-1 rounded text-xs font-medium bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
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
