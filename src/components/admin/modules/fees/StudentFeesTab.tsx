"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Loader2,
  IndianRupee,
  Plus,
  Edit,
  Eye,
  Search,
  Calendar,
} from "lucide-react";
import {
  FeeStructure,
  FeeRecord,
  FeeStatus,
  FeeAssignmentInput,
  getFeeStructures,
  getFeeRecords,
  assignFeeToStudent,
  updateFeeRecord,
} from "@/supabase/fees";
import { getStudents, Student } from "@/supabase/students";
import { logStudentAudit } from "@/supabase/studentAudit";
import AdminPopup, {
  PopupPrimaryButton,
  PopupSecondaryButton,
  PopupSection,
} from "../../AdminPopup";
import { formatCurrency, formatDate, StatusBadge, inputClass, selectClass, classOptions } from "./shared";

interface StudentFeesTabProps {
  academicYear: string;
  userId: string | null;
}

export default function StudentFeesTab({ academicYear, userId }: StudentFeesTabProps) {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "all">("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [assignData, setAssignData] = useState<FeeAssignmentInput>({
    student_id: "",
    fee_structure_id: "",
    academic_year: academicYear,
    total_fees: 0,
    due_date: "",
    tuition_fee: 0,
    lab_fee: 0,
    library_fee: 0,
    sports_fee: 0,
    exam_fee: 0,
    other_fee: 0,
    notes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [recordsRes, studentsRes, structuresRes] = await Promise.all([
      getFeeRecords({ academic_year: academicYear }),
      getStudents(),
      getFeeStructures({ academic_year: academicYear, is_active: true }),
    ]);
    setFeeRecords(recordsRes.data);
    setStudents(studentsRes.data);
    setStructures(structuresRes.data);
    setLoading(false);
  }, [academicYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter records
  const filteredRecords = feeRecords.filter((record) => {
    if (classFilter !== "all" && record.student?.class !== classFilter) return false;
    if (statusFilter !== "all" && record.fee_status !== statusFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const studentName = `${record.student?.first_name || ""} ${record.student?.last_name || ""}`.toLowerCase();
      const studentId = record.student?.student_id?.toLowerCase() || "";
      if (!studentName.includes(search) && !studentId.includes(search)) return false;
    }
    return true;
  });

  // Get students without fee records for this academic year
  const studentsWithoutFees = students.filter(
    (student) => !feeRecords.some((record) => record.student_id === student.id)
  );

  const handleStructureSelect = (structureId: string) => {
    const structure = structures.find((s) => s.id === structureId);
    if (structure) {
      setAssignData({
        ...assignData,
        fee_structure_id: structureId,
        total_fees: structure.total_fee,
        tuition_fee: structure.tuition_fee,
        lab_fee: structure.lab_fee,
        library_fee: structure.library_fee,
        sports_fee: structure.sports_fee,
        exam_fee: structure.exam_fee,
        other_fee: structure.other_fee,
      });
    }
  };

  const handleAssign = async () => {
    if (!userId || !assignData.student_id) return;
    setSaving(true);
    const { error } = await assignFeeToStudent(assignData, userId);
    if (error) {
      alert("Error: " + error);
    } else {
      setShowAssignModal(false);
      setAssignData({
        student_id: "",
        fee_structure_id: "",
        academic_year: academicYear,
        total_fees: 0,
        due_date: "",
        tuition_fee: 0,
        lab_fee: 0,
        library_fee: 0,
        sports_fee: 0,
        exam_fee: 0,
        other_fee: 0,
        notes: "",
      });
      fetchData();
    }
    setSaving(false);
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;
    setSaving(true);

    // Track fee amount change for audit
    const oldTotal = selectedRecord.total_fees;
    const newTotal = assignData.total_fees || oldTotal;
    const adjustment = newTotal - oldTotal;

    const { error } = await updateFeeRecord(selectedRecord.id, {
      total_fees: newTotal,
      due_fees: selectedRecord.due_fees + adjustment,
      due_date: assignData.due_date,
      notes: assignData.notes,
      tuition_fee: assignData.tuition_fee,
      lab_fee: assignData.lab_fee,
      library_fee: assignData.library_fee,
      sports_fee: assignData.sports_fee,
      exam_fee: assignData.exam_fee,
      other_fee: assignData.other_fee,
    });
    if (error) {
      alert("Error: " + error);
    } else {
      // Log fee adjustment to student audit
      if (adjustment !== 0) {
        await logStudentAudit(selectedRecord.student_id, 'fee_update', {
          fieldChanged: 'total_fees',
          oldValue: String(oldTotal),
          newValue: String(newTotal),
          description: adjustment > 0
            ? `Increased fees by ₹${Math.abs(adjustment)}`
            : `Reduced fees by ₹${Math.abs(adjustment)}`,
        });
      }
      setShowEditModal(false);
      setSelectedRecord(null);
      fetchData();
    }
    setSaving(false);
  };

  const openEditModal = (record: FeeRecord) => {
    setSelectedRecord(record);
    setAssignData({
      ...assignData,
      total_fees: record.total_fees,
      tuition_fee: record.tuition_fee,
      lab_fee: record.lab_fee,
      library_fee: record.library_fee,
      sports_fee: record.sports_fee,
      exam_fee: record.exam_fee,
      other_fee: record.other_fee,
      due_date: record.due_date,
      notes: record.notes || "",
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] w-64"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
          >
            <option value="all">All Classes</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FeeStatus | "all")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          disabled={studentsWithoutFees.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Assign Fees
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a] mx-auto" />
            <p className="text-gray-500 mt-2">Loading student fees...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No fee records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Student</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Class</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Paid</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Due</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Due Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-gray-50 ${record.fee_status === "Overdue" ? "bg-red-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {record.student?.first_name} {record.student?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{record.student?.student_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.student?.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(record.total_fees)}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right">{formatCurrency(record.paid_fees)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600 text-right">{formatCurrency(record.due_fees)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(record.due_date)}</td>
                    <td className="px-6 py-4"><StatusBadge status={record.fee_status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedRecord(record); setShowViewModal(true); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => openEditModal(record)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
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

      {/* Assign Fee Modal */}
      <AdminPopup
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Fee to Student"
        size="full"
        headerIcon={<Plus className="w-5 h-5" />}
        footer={
          <>
            <PopupSecondaryButton onClick={() => setShowAssignModal(false)} disabled={saving}>
              Cancel
            </PopupSecondaryButton>
            <PopupPrimaryButton
              onClick={handleAssign}
              loading={saving}
              disabled={!assignData.student_id || !assignData.total_fees || !assignData.due_date}
            >
              {saving ? "Assigning..." : "Assign Fee"}
            </PopupPrimaryButton>
          </>
        }
      >
        <div className="space-y-6">
          <PopupSection title="Student Selection" icon={<Users className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student *</label>
                <select
                  value={assignData.student_id}
                  onChange={(e) => setAssignData({ ...assignData, student_id: e.target.value })}
                  className={selectClass}
                >
                  <option value="">Select a student</option>
                  {studentsWithoutFees.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.student_id}) - {student.class}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure (Optional)</label>
                <select
                  value={assignData.fee_structure_id || ""}
                  onChange={(e) => handleStructureSelect(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a structure (or enter manually)</option>
                  {structures.map((structure) => (
                    <option key={structure.id} value={structure.id}>
                      {structure.name} - {structure.applicable_class} ({formatCurrency(structure.total_fee)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </PopupSection>

          <PopupSection title="Fee Details" icon={<IndianRupee className="w-4 h-4" />}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fee</label>
                <input
                  type="number"
                  min="0"
                  value={assignData.tuition_fee || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const total = val + (assignData.lab_fee || 0) + (assignData.library_fee || 0) +
                      (assignData.sports_fee || 0) + (assignData.exam_fee || 0) + (assignData.other_fee || 0);
                    setAssignData({ ...assignData, tuition_fee: val, total_fees: total });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Fee</label>
                <input
                  type="number"
                  min="0"
                  value={assignData.lab_fee || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const total = (assignData.tuition_fee || 0) + val + (assignData.library_fee || 0) +
                      (assignData.sports_fee || 0) + (assignData.exam_fee || 0) + (assignData.other_fee || 0);
                    setAssignData({ ...assignData, lab_fee: val, total_fees: total });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Library Fee</label>
                <input
                  type="number"
                  min="0"
                  value={assignData.library_fee || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const total = (assignData.tuition_fee || 0) + (assignData.lab_fee || 0) + val +
                      (assignData.sports_fee || 0) + (assignData.exam_fee || 0) + (assignData.other_fee || 0);
                    setAssignData({ ...assignData, library_fee: val, total_fees: total });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sports Fee</label>
                <input
                  type="number"
                  min="0"
                  value={assignData.sports_fee || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const total = (assignData.tuition_fee || 0) + (assignData.lab_fee || 0) + (assignData.library_fee || 0) +
                      val + (assignData.exam_fee || 0) + (assignData.other_fee || 0);
                    setAssignData({ ...assignData, sports_fee: val, total_fees: total });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Fee</label>
                <input
                  type="number"
                  min="0"
                  value={assignData.exam_fee || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const total = (assignData.tuition_fee || 0) + (assignData.lab_fee || 0) + (assignData.library_fee || 0) +
                      (assignData.sports_fee || 0) + val + (assignData.other_fee || 0);
                    setAssignData({ ...assignData, exam_fee: val, total_fees: total });
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Fee</label>
                <input
                  type="number"
                  min="0"
                  value={assignData.other_fee || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    const total = (assignData.tuition_fee || 0) + (assignData.lab_fee || 0) + (assignData.library_fee || 0) +
                      (assignData.sports_fee || 0) + (assignData.exam_fee || 0) + val;
                    setAssignData({ ...assignData, other_fee: val, total_fees: total });
                  }}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total Fee:</span>
              <span className="text-2xl font-bold text-[#c41e3a]">{formatCurrency(assignData.total_fees)}</span>
            </div>
          </PopupSection>

          <PopupSection title="Due Date & Notes" icon={<Calendar className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={assignData.due_date}
                  onChange={(e) => setAssignData({ ...assignData, due_date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={assignData.notes || ""}
                  onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
                  placeholder="Optional notes"
                  className={inputClass}
                />
              </div>
            </div>
          </PopupSection>
        </div>
      </AdminPopup>

      {/* Edit Fee Record Modal */}
      <AdminPopup
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Fee Record"
        size="md"
        headerIcon={<Edit className="w-5 h-5" />}
        footer={
          <>
            <PopupSecondaryButton onClick={() => setShowEditModal(false)} disabled={saving}>
              Cancel
            </PopupSecondaryButton>
            <PopupPrimaryButton onClick={handleUpdateRecord} loading={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </PopupPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Fee</label>
              <input
                type="number"
                min="0"
                value={assignData.tuition_fee || 0}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  const total = val + (assignData.lab_fee || 0) + (assignData.library_fee || 0) +
                    (assignData.sports_fee || 0) + (assignData.exam_fee || 0) + (assignData.other_fee || 0);
                  setAssignData({ ...assignData, tuition_fee: val, total_fees: total });
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lab Fee</label>
              <input
                type="number"
                min="0"
                value={assignData.lab_fee || 0}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  const total = (assignData.tuition_fee || 0) + val + (assignData.library_fee || 0) +
                    (assignData.sports_fee || 0) + (assignData.exam_fee || 0) + (assignData.other_fee || 0);
                  setAssignData({ ...assignData, lab_fee: val, total_fees: total });
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Library Fee</label>
              <input
                type="number"
                min="0"
                value={assignData.library_fee || 0}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  const total = (assignData.tuition_fee || 0) + (assignData.lab_fee || 0) + val +
                    (assignData.sports_fee || 0) + (assignData.exam_fee || 0) + (assignData.other_fee || 0);
                  setAssignData({ ...assignData, library_fee: val, total_fees: total });
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sports Fee</label>
              <input
                type="number"
                min="0"
                value={assignData.sports_fee || 0}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  const total = (assignData.tuition_fee || 0) + (assignData.lab_fee || 0) + (assignData.library_fee || 0) +
                    val + (assignData.exam_fee || 0) + (assignData.other_fee || 0);
                  setAssignData({ ...assignData, sports_fee: val, total_fees: total });
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Fee</label>
              <input
                type="number"
                min="0"
                value={assignData.exam_fee || 0}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  const total = (assignData.tuition_fee || 0) + (assignData.lab_fee || 0) + (assignData.library_fee || 0) +
                    (assignData.sports_fee || 0) + val + (assignData.other_fee || 0);
                  setAssignData({ ...assignData, exam_fee: val, total_fees: total });
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Fee</label>
              <input
                type="number"
                min="0"
                value={assignData.other_fee || 0}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  const total = (assignData.tuition_fee || 0) + (assignData.lab_fee || 0) + (assignData.library_fee || 0) +
                    (assignData.sports_fee || 0) + (assignData.exam_fee || 0) + val;
                  setAssignData({ ...assignData, other_fee: val, total_fees: total });
                }}
                className={inputClass}
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Total Fees</span>
              <span className="text-xl font-bold text-[#c41e3a]">{formatCurrency(assignData.total_fees || 0)}</span>
            </div>
            {selectedRecord && (
              <p className="text-xs text-gray-500 text-right">
                Paid: <span className="text-green-600">{formatCurrency(selectedRecord.paid_fees)}</span> |
                Due: <span className="text-red-600">
                  {formatCurrency((assignData.total_fees || 0) - selectedRecord.paid_fees)}
                </span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={assignData.due_date}
              onChange={(e) => setAssignData({ ...assignData, due_date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={assignData.notes || ""}
              onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>
        </div>
      </AdminPopup>

      {/* View Fee Details Modal */}
      <AdminPopup
        isOpen={showViewModal && !!selectedRecord}
        onClose={() => setShowViewModal(false)}
        title="Fee Details"
        subtitle={selectedRecord?.student?.student_id}
        size="md"
        headerIcon={<Eye className="w-5 h-5" />}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">
                {selectedRecord.student?.first_name} {selectedRecord.student?.last_name}
              </p>
              <p className="text-sm text-gray-500">{selectedRecord.student?.class}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Tuition Fee</p>
                <p className="font-medium">{formatCurrency(selectedRecord.tuition_fee)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Lab Fee</p>
                <p className="font-medium">{formatCurrency(selectedRecord.lab_fee)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Library Fee</p>
                <p className="font-medium">{formatCurrency(selectedRecord.library_fee)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Sports Fee</p>
                <p className="font-medium">{formatCurrency(selectedRecord.sports_fee)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Exam Fee</p>
                <p className="font-medium">{formatCurrency(selectedRecord.exam_fee)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Other Fee</p>
                <p className="font-medium">{formatCurrency(selectedRecord.other_fee)}</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fees:</span>
                <span className="font-semibold">{formatCurrency(selectedRecord.total_fees)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid:</span>
                <span className="font-semibold text-green-600">{formatCurrency(selectedRecord.paid_fees)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due:</span>
                <span className="font-semibold text-red-600">{formatCurrency(selectedRecord.due_fees)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <StatusBadge status={selectedRecord.fee_status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{formatDate(selectedRecord.due_date)}</span>
              </div>
            </div>
          </div>
        )}
      </AdminPopup>
    </div>
  );
}
