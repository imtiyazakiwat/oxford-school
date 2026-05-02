"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Receipt,
  Loader2,
  Plus,
  Search,
  Printer,
} from "lucide-react";
import {
  FeeRecord,
  FeePayment,
  PaymentInput,
  getFeeRecords,
  recordPayment,
  getPaymentsByDateRange,
} from "@/firebase/fees";
import AdminPopup, {
  PopupPrimaryButton,
  PopupSecondaryButton,
} from "../../AdminPopup";
import { formatCurrency, formatDate, inputClass, selectClass } from "./shared";

interface PaymentsTabProps {
  academicYear: string;
  userId: string | null;
}

export default function PaymentsTab({ academicYear, userId }: PaymentsTabProps) {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentInput>({
    fee_record_id: "",
    student_id: "",
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
    payment_method: "cash",
    receipt_number: `RCP-${Date.now().toString().slice(-6)}`,
    academic_year: academicYear,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Default to showing payments from the start of the academic year
    // Academic year format is "YYYY-YYYY", extract start year
    const academicYearStart = academicYear.split("-")[0];
    const defaultStartDate = `${academicYearStart}-04-01`; // April 1st of academic year start

    const [recordsRes, paymentsRes] = await Promise.all([
      getFeeRecords({ academic_year: academicYear }),
      dateFrom && dateTo
        ? getPaymentsByDateRange(dateFrom, dateTo)
        : getPaymentsByDateRange(
          defaultStartDate,
          new Date().toISOString().split("T")[0]
        ),
    ]);
    setFeeRecords(recordsRes.data.filter((r) => r.due_fees > 0));
    setPayments(paymentsRes.data);
    setLoading(false);
  }, [academicYear, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter payments by search
  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const studentName = `${payment.student?.first_name || ""} ${payment.student?.last_name || ""}`.toLowerCase();
    const receiptNum = payment.receipt_number.toLowerCase();
    return studentName.includes(search) || receiptNum.includes(search);
  });

  const [studentSearch, setStudentSearch] = useState("");

  const handleSelectStudent = (recordId: string) => {
    const record = feeRecords.find((r) => r.id === recordId);
    if (record) {
      setSelectedRecord(record);
      setPaymentData({
        ...paymentData,
        fee_record_id: recordId,
        student_id: record.student_id,
        amount: 0,
      });
      setStudentSearch(""); // Clear search
    }
  };

  const handleClearSelection = () => {
    setSelectedRecord(null);
    setPaymentData({
      ...paymentData,
      fee_record_id: "",
      student_id: "",
      amount: 0,
    });
  };

  const filteredStudentOptions = feeRecords.filter((record) => {
    if (!studentSearch) return false; // Show nothing initially or show all? Better show nothing or top 5
    const search = studentSearch.toLowerCase();
    const name = `${record.student?.first_name} ${record.student?.last_name}`.toLowerCase();
    const id = (record.student?.student_id || "").toLowerCase();
    const cls = (record.student?.class || "").toLowerCase();
    return name.includes(search) || id.includes(search) || cls.includes(search);
  });




  const handleRecordPayment = async () => {
    if (!userId || !paymentData.fee_record_id || paymentData.amount <= 0) return;
    setSaving(true);
    const { data, error } = await recordPayment(paymentData, userId);
    if (error) {
      alert("Error: " + error);
    } else if (data) {
      // Add student info for receipt display
      const paymentWithStudent = {
        ...data,
        student: selectedRecord?.student
      };
      setSelectedPayment(paymentWithStudent);
      setShowRecordModal(false);
      setShowReceiptModal(true);
      setPaymentData({
        fee_record_id: "",
        student_id: "",
        amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
        notes: "",
        payment_method: "cash",
        receipt_number: `RCP-${Date.now().toString().slice(-6)}`,
        academic_year: academicYear,
      });
      setSelectedRecord(null);
      fetchData();
    }
    setSaving(false);
  };

  const handlePrintReceipt = () => {
    window.print();
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
              placeholder="Search by name or receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a] w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
            />
          </div>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          disabled={feeRecords.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a81832] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a] mx-auto" />
            <p className="text-gray-500 mt-2">Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payments found</p>
            <p className="text-sm text-gray-400 mt-1">Adjust filters or record a new payment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Receipt #</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Student</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Class</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-gray-900">{payment.receipt_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {payment.student?.first_name} {payment.student?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{payment.student?.student_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.student?.class}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600 text-right">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.payment_date)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize">
                        {payment.payment_method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <AdminPopup
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        title="Record Payment"
        size="md"
        headerIcon={<Receipt className="w-5 h-5" />}
        footer={
          <>
            <PopupSecondaryButton onClick={() => setShowRecordModal(false)} disabled={saving}>
              Cancel
            </PopupSecondaryButton>
            <PopupPrimaryButton
              onClick={handleRecordPayment}
              loading={saving}
              disabled={!paymentData.fee_record_id || paymentData.amount <= 0}
            >
              {saving ? "Recording..." : "Record Payment"}
            </PopupPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          {!selectedRecord ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Search Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type name, ID, or class..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#c41e3a]"
                  autoFocus
                />
              </div>

              {studentSearch && (
                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {filteredStudentOptions.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">No students found</div>
                  ) : (
                    filteredStudentOptions.map((record) => (
                      <button
                        key={record.id}
                        onClick={() => handleSelectStudent(record.id)}
                        className="w-full text-left p-3 hover:bg-gray-50 flex justify-between items-center border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.student?.first_name} {record.student?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {record.student?.student_id} • Class: {record.student?.class}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                            Due: {formatCurrency(record.due_fees)}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              {!studentSearch && (
                <p className="text-xs text-gray-400">Start typing to search for a student with pending fees.</p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-blue-900">
                    {selectedRecord.student?.first_name} {selectedRecord.student?.last_name}
                  </h4>
                  <p className="text-xs text-blue-600">
                    ID: {selectedRecord.student?.student_id} • Class: {selectedRecord.student?.class}
                  </p>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Change Student
                </button>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Total Fees:</span>
                <span className="font-medium">{formatCurrency(selectedRecord.total_fees)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Already Paid:</span>
                <span className="font-medium text-green-600">{formatCurrency(selectedRecord.paid_fees)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="text-sm font-semibold text-gray-700">Due Amount:</span>
                <span className="font-bold text-red-600">{formatCurrency(selectedRecord.due_fees)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
            <input
              type="number"
              min="1"
              max={selectedRecord?.due_fees || 0}
              value={paymentData.amount || ""}
              onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) || 0 })}
              className={inputClass}
              placeholder="Enter amount"
            />
            {selectedRecord && paymentData.amount > selectedRecord.due_fees && (
              <p className="text-sm text-red-500 mt-1">Amount cannot exceed due fees</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number *</label>
              <input
                type="text"
                value={paymentData.receipt_number}
                onChange={(e) => setPaymentData({ ...paymentData, receipt_number: e.target.value })}
                className={inputClass}
                placeholder="RCP-123456"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                className={selectClass}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentData.payment_date}
              onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={paymentData.notes || ""}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              rows={2}
              className={inputClass}
              placeholder="Optional notes"
            />
          </div>
        </div>
      </AdminPopup>

      {/* Receipt Modal */}
      <AdminPopup
        isOpen={showReceiptModal && !!selectedPayment}
        onClose={() => setShowReceiptModal(false)}
        title="Payment Receipt"
        size="md"
        headerIcon={<Receipt className="w-5 h-5" />}
        footer={
          <PopupPrimaryButton onClick={handlePrintReceipt}>
            <Printer className="w-4 h-4" /> Print Receipt
          </PopupPrimaryButton>
        }
      >
        {selectedPayment && (
          <div className="space-y-6 print:p-8" id="receipt-content">
            {/* Receipt Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Sarvodaya College</h2>
              <p className="text-sm text-gray-500">Fee Payment Receipt</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt Number:</span>
                <span className="font-mono font-semibold">{selectedPayment.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(selectedPayment.payment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Student Name:</span>
                <span className="font-medium">
                  {selectedPayment.student?.first_name} {selectedPayment.student?.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Student ID:</span>
                <span className="font-medium">{selectedPayment.student?.student_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium">{selectedPayment.student?.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{selectedPayment.payment_method}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</p>
            </div>

            {/* Notes */}
            {selectedPayment.notes && (
              <div className="text-sm text-gray-500">
                <span className="font-medium">Notes:</span> {selectedPayment.notes}
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 border-t pt-4">
              <p>This is a computer-generated receipt.</p>
              <p>Generated on {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </AdminPopup>
    </div>
  );
}
