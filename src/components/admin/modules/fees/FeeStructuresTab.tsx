"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Loader2,
  AlertCircle,
  IndianRupee,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  FeeStructure,
  FeeStructureInput,
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} from "@/firebase/fees";
import AdminPopup, {
  PopupPrimaryButton,
  PopupSecondaryButton,
  PopupDangerButton,
  PopupSection,
} from "../../AdminPopup";
import { formatCurrency, inputClass, selectClass, classOptions } from "./shared";

interface FeeStructuresTabProps {
  academicYear: string;
  userId: string | null;
}

interface FeeStructureFormProps {
  formData: FeeStructureInput;
  setFormData: (data: any) => void;
}

const FeeStructureForm = ({ formData, setFormData }: FeeStructureFormProps) => (
  <div className="space-y-6">
    <PopupSection title="Basic Information" icon={<FileText className="w-4 h-4" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Structure Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Class 10 Regular Fees"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Class *</label>
          <select
            value={formData.applicable_class}
            onChange={(e) => setFormData({ ...formData, applicable_class: e.target.value })}
            className={selectClass}
          >
            <option value="">Select Class</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <input
            type="text"
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-[#c41e3a] rounded focus:ring-[#c41e3a]"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
        </div>
      </div>
    </PopupSection>

    <PopupSection title="Fee Components" icon={<IndianRupee className="w-4 h-4" />}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fee</label>
          <input
            type="number"
            min="0"
            value={formData.tuition_fee || ""}
            onChange={(e) => setFormData({ ...formData, tuition_fee: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lab Fee</label>
          <input
            type="number"
            min="0"
            value={formData.lab_fee || ""}
            onChange={(e) => setFormData({ ...formData, lab_fee: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Library Fee</label>
          <input
            type="number"
            min="0"
            value={formData.library_fee || ""}
            onChange={(e) => setFormData({ ...formData, library_fee: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sports Fee</label>
          <input
            type="number"
            min="0"
            value={formData.sports_fee || ""}
            onChange={(e) => setFormData({ ...formData, sports_fee: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Fee</label>
          <input
            type="number"
            min="0"
            value={formData.exam_fee || ""}
            onChange={(e) => setFormData({ ...formData, exam_fee: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Other Fee</label>
          <input
            type="number"
            min="0"
            value={formData.other_fee || ""}
            onChange={(e) => setFormData({ ...formData, other_fee: Number(e.target.value) || 0 })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">Total Fee:</span>
          <span className="text-2xl font-bold text-[#c41e3a]">{formatCurrency(formData.total_fee)}</span>
        </div>
      </div>
    </PopupSection>
  </div>
);

export default function FeeStructuresTab({ academicYear, userId }: FeeStructuresTabProps) {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<FeeStructureInput>({
    name: "",
    academic_year: academicYear,
    applicable_class: "",
    tuition_fee: 0,
    lab_fee: 0,
    library_fee: 0,
    sports_fee: 0,
    exam_fee: 0,
    other_fee: 0,
    total_fee: 0,
    is_active: true,
  });

  const fetchStructures = useCallback(async () => {
    setLoading(true);
    const { data } = await getFeeStructures({ academic_year: academicYear }, true);
    setStructures(data);
    setLoading(false);
  }, [academicYear]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  // Calculate total fee when components change
  useEffect(() => {
    const total =
      (formData.tuition_fee || 0) +
      (formData.lab_fee || 0) +
      (formData.library_fee || 0) +
      (formData.sports_fee || 0) +
      (formData.exam_fee || 0) +
      (formData.other_fee || 0);
    setFormData((prev) => ({ ...prev, total_fee: total }));
  }, [formData.tuition_fee, formData.lab_fee, formData.library_fee, formData.sports_fee, formData.exam_fee, formData.other_fee]);

  const resetForm = () => {
    setFormData({
      name: "",
      academic_year: academicYear,
      applicable_class: "",
      tuition_fee: 0,
      lab_fee: 0,
      library_fee: 0,
      sports_fee: 0,
      exam_fee: 0,
      other_fee: 0,
      total_fee: 0,
      is_active: true,
    });
  };

  const handleCreate = async () => {
    if (!userId) {
      alert("Unable to create: User session not loaded. Please try again.");
      return;
    }
    setSaving(true);
    const { error } = await createFeeStructure(formData, userId);
    if (error) {
      alert("Error: " + error);
    } else {
      setShowCreateModal(false);
      resetForm();
      fetchStructures();
    }
    setSaving(false);
  };

  const handleEdit = (structure: FeeStructure) => {
    setSelectedStructure(structure);
    setFormData({
      name: structure.name,
      academic_year: structure.academic_year,
      applicable_class: structure.applicable_class,
      tuition_fee: structure.tuition_fee,
      lab_fee: structure.lab_fee,
      library_fee: structure.library_fee,
      sports_fee: structure.sports_fee,
      exam_fee: structure.exam_fee,
      other_fee: structure.other_fee,
      total_fee: structure.total_fee,
      is_active: structure.is_active,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedStructure || !userId) return;
    setSaving(true);
    const { error } = await updateFeeStructure(selectedStructure.id, formData, userId);
    if (error) {
      alert("Error: " + error);
    } else {
      setShowEditModal(false);
      setSelectedStructure(null);
      resetForm();
      fetchStructures();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedStructure) return;
    setDeleting(true);
    const { error } = await deleteFeeStructure(selectedStructure.id);
    if (error) {
      alert("Error: " + error);
    } else {
      setShowDeleteModal(false);
      setSelectedStructure(null);
      fetchStructures();
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{structures.length} fee structure(s) found</p>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          disabled={!userId}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            userId ? "bg-[#c41e3a] text-white hover:bg-[#a81832]" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title={!userId ? "Loading user session..." : "Add a new fee structure"}
        >
          {!userId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Structure
        </button>
      </div>

      {/* Structures List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a] mx-auto" />
            <p className="text-gray-500 mt-2">Loading fee structures...</p>
          </div>
        ) : structures.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No fee structures found</p>
            <p className="text-sm text-gray-400 mt-1">Create a fee structure to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Class</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Total Fee</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {structures.map((structure) => (
                  <tr key={structure.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{structure.name}</p>
                      <p className="text-xs text-gray-500">{structure.academic_year}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{structure.applicable_class}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(structure.total_fee)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          structure.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {structure.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(structure)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStructure(structure);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 hover:bg-red-100 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AdminPopup
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Fee Structure"
        size="full"
        headerIcon={<Plus className="w-5 h-5" />}
        footer={
          <>
            <PopupSecondaryButton onClick={() => setShowCreateModal(false)} disabled={saving}>
              Cancel
            </PopupSecondaryButton>
            <PopupPrimaryButton
              onClick={handleCreate}
              loading={saving}
              disabled={!formData.name || !formData.applicable_class || !userId}
            >
              {saving ? "Creating..." : "Create Structure"}
            </PopupPrimaryButton>
          </>
        }
      >
        <FeeStructureForm formData={formData} setFormData={setFormData} />
      </AdminPopup>

      {/* Edit Modal */}
      <AdminPopup
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Fee Structure"
        size="full"
        headerIcon={<Edit className="w-5 h-5" />}
        footer={
          <>
            <PopupSecondaryButton onClick={() => setShowEditModal(false)} disabled={saving}>
              Cancel
            </PopupSecondaryButton>
            <PopupPrimaryButton onClick={handleUpdate} loading={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </PopupPrimaryButton>
          </>
        }
      >
        <FeeStructureForm formData={formData} setFormData={setFormData} />
      </AdminPopup>

      {/* Delete Confirmation Modal */}
      <AdminPopup
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Fee Structure"
        size="sm"
        headerIcon={<Trash2 className="w-5 h-5" />}
        footer={
          <>
            <PopupSecondaryButton onClick={() => setShowDeleteModal(false)} disabled={deleting}>
              Cancel
            </PopupSecondaryButton>
            <PopupDangerButton onClick={handleDelete} loading={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </PopupDangerButton>
          </>
        }
      >
        <div className="text-center py-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{selectedStructure?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone. Fee structures assigned to students cannot be deleted.
          </p>
        </div>
      </AdminPopup>
    </div>
  );
}
