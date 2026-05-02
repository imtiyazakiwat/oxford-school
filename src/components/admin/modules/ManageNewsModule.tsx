"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Newspaper, Upload, Plus, Star, Trash2, AlertCircle, Filter, Eye, EyeOff, Pencil, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  NewsItem,
  uploadNewsImage,
  createNews,
  getAllNews,
  deleteNews,
  toggleNewsFeatured,
  toggleNewsActive,
  getNewsImageUrl,
  updateNews,
} from "@/firebase/news";

const CATEGORIES = ["Events", "Academic", "Admissions", "Sports", "Achievements"] as const;
type Category = (typeof CATEGORIES)[number];

export default function ManageNewsModule() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | "All">("All");
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; item: NewsItem | null }>({ show: false, item: null });
  const [deleting, setDeleting] = useState(false);
  const [editModal, setEditModal] = useState<{ show: boolean; item: NewsItem | null }>({ show: false, item: null });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "Events" as Category,
    is_featured: false,
    image: null as File | null,
    keepExistingImage: true,
  });
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "Events" as Category,
    is_featured: false,
    image: null as File | null,
  });

  const featuredCount = news.filter((n) => n.is_featured).length;
  const MAX_FEATURED = 3;

  const filteredNews = filterCategory === "All" ? news : news.filter((n) => n.category === filterCategory);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    const { data } = await getAllNews(true);
    setNews(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title || !form.description) {
      alert("Please fill all required fields");
      return;
    }
    setSubmitting(true);

    let imagePath: string | null = null;
    if (form.image) {
      const { path, error: uploadError } = await uploadNewsImage(form.image, user.uid);
      if (uploadError) {
        alert("Failed to upload image: " + uploadError);
        setSubmitting(false);
        return;
      }
      imagePath = path;
    }

    const { error: createError } = await createNews(
      {
        title: form.title,
        description: form.description,
        content: form.content || undefined,
        category: form.category,
        is_featured: form.is_featured,
      },
      imagePath,
      user.uid
    );

    if (createError) {
      alert("Failed to add news: " + createError);
      setSubmitting(false);
      return;
    }

    setForm({ title: "", description: "", content: "", category: "Events", is_featured: false, image: null });
    await loadNews();
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    setDeleting(true);
    const { error } = await deleteNews(deleteModal.item.id, deleteModal.item.image_path);
    if (error) {
      alert("Failed to delete: " + error);
      setDeleting(false);
      return;
    }
    await loadNews();
    setDeleting(false);
    setDeleteModal({ show: false, item: null });
  };

  const handleToggleFeatured = async (item: NewsItem) => {
    if (!item.is_featured && featuredCount >= MAX_FEATURED) {
      alert(`Maximum ${MAX_FEATURED} news items can be featured. Please unfeature one first.`);
      return;
    }
    const { error } = await toggleNewsFeatured(item.id, !item.is_featured);
    if (error) {
      alert("Failed to update: " + error);
      return;
    }
    await loadNews();
  };

  const handleToggleActive = async (item: NewsItem) => {
    const { error } = await toggleNewsActive(item.id, !item.is_active);
    if (error) {
      alert("Failed to update: " + error);
      return;
    }
    await loadNews();
  };

  const openEditModal = (item: NewsItem) => {
    setEditForm({
      title: item.title,
      description: item.description,
      content: item.content || "",
      category: item.category,
      is_featured: item.is_featured,
      image: null,
      keepExistingImage: true,
    });
    setEditModal({ show: true, item });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.item || !user) return;
    
    setEditing(true);
    
    let imagePath: string | null | undefined = undefined;
    
    // Handle image changes
    if (editForm.image) {
      // Upload new image
      const { path, error: uploadError } = await uploadNewsImage(editForm.image, user.uid);
      if (uploadError) {
        alert("Failed to upload image: " + uploadError);
        setEditing(false);
        return;
      }
      imagePath = path;
    } else if (!editForm.keepExistingImage) {
      // Remove existing image
      imagePath = null;
    }
    
    const updateData: Parameters<typeof updateNews>[1] = {
      title: editForm.title,
      description: editForm.description,
      content: editForm.content || undefined,
      category: editForm.category,
      is_featured: editForm.is_featured,
    };
    
    if (imagePath !== undefined) {
      updateData.image_path = imagePath;
    }
    
    const { error } = await updateNews(editModal.item.id, updateData);
    
    if (error) {
      alert("Failed to update: " + error);
      setEditing(false);
      return;
    }
    
    await loadNews();
    setEditing(false);
    setEditModal({ show: false, item: null });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.show && deleteModal.item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setDeleteModal({ show: false, item: null })}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete News</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-medium text-gray-900">{deleteModal.item.title}</p>
                <p className="text-sm text-gray-500">{deleteModal.item.category}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModal({ show: false, item: null })}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal.show && editModal.item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => !editing && setEditModal({ show: false, item: null })}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-[#c41e3a]" />
                  Edit News / Event
                </h3>
                <button
                  onClick={() => setEditModal({ show: false, item: null })}
                  disabled={editing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-4">
                {/* Image Section */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                  {editForm.image ? (
                    <div className="relative inline-block">
                      <img src={URL.createObjectURL(editForm.image)} alt="New preview" className="max-h-32 object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, image: null })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : editForm.keepExistingImage && editModal.item.image_path ? (
                    <div className="relative inline-block">
                      <img src={getNewsImageUrl(editModal.item.image_path)} alt="Current" className="max-h-32 object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, keepExistingImage: false })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No image</p>
                  )}
                  <label className="cursor-pointer mt-3 inline-block">
                    <span className="px-3 py-1.5 bg-[#c41e3a] text-white text-sm rounded-lg hover:bg-[#a81832] inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      {editModal.item.image_path ? "Change Image" : "Add Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setEditForm({ ...editForm, image: e.target.files[0], keepExistingImage: false });
                      }}
                    />
                  </label>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Content (optional)</label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                    rows={4}
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="edit_is_featured"
                    checked={editForm.is_featured}
                    onChange={(e) => {
                      const currentlyFeatured = editModal.item?.is_featured;
                      if (e.target.checked && !currentlyFeatured && featuredCount >= MAX_FEATURED) {
                        alert(`Maximum ${MAX_FEATURED} news items can be featured.`);
                        return;
                      }
                      setEditForm({ ...editForm, is_featured: e.target.checked });
                    }}
                    className="w-4 h-4 text-[#c41e3a] border-gray-300 rounded focus:ring-[#c41e3a]"
                  />
                  <label htmlFor="edit_is_featured" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Feature on Landing Page
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditModal({ show: false, item: null })}
                    disabled={editing}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editing}
                    className="px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {editing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Pencil className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New News Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#c41e3a]" />
          Add News / Event
        </h3>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            {form.image ? (
              <div className="relative">
                <img src={URL.createObjectURL(form.image)} alt="Preview" className="max-w-sm max-h-48 object-contain rounded-lg" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: null })}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400" />
                <p className="text-gray-600">Upload a cover image (optional)</p>
              </>
            )}
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-[#c41e3a] text-white text-sm rounded-lg hover:bg-[#a81832] inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Choose File
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setForm({ ...form, image: e.target.files[0] });
                }}
              />
            </label>
            <p className="text-xs text-gray-500">JPG, PNG or WebP. Will be compressed to 1200px width</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                placeholder="Enter news title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
              placeholder="Brief description (shown in listings)"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Content (optional)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
              placeholder="Detailed content for the news article"
              rows={4}
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_featured"
              checked={form.is_featured}
              onChange={(e) => {
                if (e.target.checked && featuredCount >= MAX_FEATURED) {
                  alert(`Maximum ${MAX_FEATURED} news items can be featured.`);
                  return;
                }
                setForm({ ...form, is_featured: e.target.checked });
              }}
              disabled={featuredCount >= MAX_FEATURED && !form.is_featured}
              className="w-4 h-4 text-[#c41e3a] border-gray-300 rounded focus:ring-[#c41e3a] disabled:opacity-50"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              Feature on Landing Page ({featuredCount}/{MAX_FEATURED})
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setForm({ title: "", description: "", content: "", category: "Events", is_featured: false, image: null })}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add News
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* News List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h4 className="font-semibold text-gray-900">All News & Events ({news.length})</h4>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as Category | "All")}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c41e3a]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            {filterCategory === "All" ? "No news added yet. Add your first news above." : `No news in ${filterCategory} category.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map((item) => (
              <div key={item.id} className={`rounded-lg border overflow-hidden flex flex-col ${item.is_active ? "bg-white border-gray-200" : "bg-gray-50 border-gray-200 opacity-60"}`}>
                {item.image_path ? (
                  <img src={getNewsImageUrl(item.image_path)} alt={item.title} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                    <Newspaper className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-medium text-[#c41e3a] bg-[#c41e3a]/10 px-2 py-0.5 rounded">{item.category}</span>
                    {item.is_featured && (
                      <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500" />
                        Featured
                      </span>
                    )}
                    {!item.is_active && <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Hidden</span>}
                  </div>
                  <h5 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h5>
                  <p className="text-sm text-gray-500 line-clamp-2 flex-1 mt-1">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(item.published_at)}</p>
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`p-2 rounded-lg transition-colors ${item.is_active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                      title={item.is_active ? "Hide" : "Show"}
                    >
                      {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className={`p-2 rounded-lg transition-colors ${item.is_featured ? "text-yellow-500 hover:bg-yellow-50" : "text-gray-400 hover:bg-gray-100"}`}
                      title={item.is_featured ? "Unfeature" : "Feature"}
                    >
                      <Star className={`w-4 h-4 ${item.is_featured ? "fill-yellow-500" : ""}`} />
                    </button>
                    <button onClick={() => setDeleteModal({ show: true, item })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
