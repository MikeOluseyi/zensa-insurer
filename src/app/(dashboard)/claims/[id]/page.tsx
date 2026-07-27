"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ClaimAPI, Claim } from "@/services/claims";
import ClaimStatusBadge from "@/components/claims/ClaimStatusBadge";
import {
  ArrowLeft, User, Building2, Receipt, Loader2, AlertCircle,
  CheckCircle2, XCircle, ClipboardCheck, Wallet, X,
  Paperclip, MessageSquare, Activity, HeartPulse, Stethoscope,
  FlaskConical, Pill, BedDouble, ClipboardList, LogOut
} from "lucide-react";

const EVENT_ICONS: Record<string, any> = {
  VITALS: HeartPulse,
  CONSULTATION: Stethoscope,
  DIAGNOSIS: Stethoscope,
  PROCEDURE_ORDER: FlaskConical,
  PROCEDURE_RESULT: FlaskConical,
  PRESCRIPTION: Pill,
  DISPENSED: Pill,
  ADMISSION: BedDouble,
  DOCTOR_REVIEW: Stethoscope,
  NURSING_NOTE: ClipboardList,
  MEDICATION_ORDER: Pill,
  MEDICATION_ADMINISTERED: Pill,
  DISCHARGE: LogOut,
};

export default function ClaimDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [dto, setDto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [attachments, setAttachments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    load();
    loadDTO();
    loadAttachments();
    loadMessages();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await ClaimAPI.getOne(id as string);
      setClaim(data);
      setApprovedAmount(data.totalAmount.toString());
    } catch (err) {
      console.error(err);
      setClaim(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadDTO() {
    try {
      const res = await api.get(`/claims/${id}/full`);
      setDto(res.data);
    } catch (err) {
      console.error("Failed to fetch claim detail:", err);
      setDto(null);
    }
  }

  async function loadAttachments() {
    try {
      const data = await ClaimAPI.getAttachments(id as string);
      setAttachments(data);
    } catch {
      setAttachments([]);
    }
  }

  async function loadMessages() {
    try {
      const data = await ClaimAPI.getMessages(id as string);
      setMessages(data);
    } catch {
      setMessages([]);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      await ClaimAPI.sendMessage(id as string, newMessage.trim());
      setNewMessage("");
      loadMessages();
    } catch {
      alert("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleReview() {
    setActionLoading(true);
    setError("");
    try {
      await ClaimAPI.review(id as string);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to start review.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    const amount = Number(approvedAmount);
    if (!amount || amount <= 0) return;

    setActionLoading(true);
    setError("");
    try {
      await ClaimAPI.approve(id as string, amount);
      setShowApproveModal(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to approve claim.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) return;

    setActionLoading(true);
    setError("");
    try {
      await ClaimAPI.reject(id as string, rejectionReason.trim());
      setShowRejectModal(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to reject claim.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkPaid() {
    if (!confirm("Mark this claim as paid?")) return;

    setActionLoading(true);
    setError("");
    try {
      await ClaimAPI.markPaid(id as string);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to mark claim as paid.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-600">Claim not found</p>
        <Link href="/claims" className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium inline-block">
          Back to claims
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/claims")} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt size={22} className="text-blue-600" />
              {claim.claimNumber ?? claim.id.slice(0, 8)}
            </h1>
            <div className="mt-1">
              <ClaimStatusBadge status={claim.status} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {claim.status === "SUBMITTED" && (
              <button
                onClick={handleReview}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
                Start Review
              </button>
            )}

            {claim.status === "UNDER_REVIEW" && (
              <>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle2 size={16} />
                  Approve
                </button>
              </>
            )}

            {(claim.status === "APPROVED" || claim.status === "PARTIALLY_APPROVED") && (
              <button
                onClick={handleMarkPaid}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {claim.status === "REJECTED" && claim.rejectionReason && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Rejection Reason</p>
            <p className="mt-0.5">{claim.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Claimed Amount" value={`₦${claim.totalAmount.toLocaleString()}`} />
        <SummaryCard
          title="Approved Amount"
          value={claim.approvedAmount != null ? `₦${claim.approvedAmount.toLocaleString()}` : "—"}
          accent="emerald"
        />
        <SummaryCard title="Submitted" value={claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : "-"} />
      </div>

      {/* Patient & Hospital */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            Patient
          </h2>
          <p className="text-sm text-slate-700">{claim.patient.firstName} {claim.patient.lastName}</p>
          <p className="text-xs text-slate-500 mt-1">{claim.patient.patientNumber} · {claim.patient.gender}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Building2 size={18} className="text-slate-500" />
            Hospital
          </h2>
          <p className="text-sm text-slate-700">{claim.invoice.hospital?.name ?? "-"}</p>
          <p className="text-xs text-slate-500 mt-1">Invoice: {claim.invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Encounter & Clinical Timeline */}
      {dto && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-rose-600" />
            Encounter & Clinical Timeline
          </h2>

          <div className="flex items-center gap-6 text-sm text-slate-600 mb-5 pb-5 border-b border-slate-100">
            <span>Check-In: {dto.encounter.checkIn ? new Date(dto.encounter.checkIn).toLocaleString() : "-"}</span>
            <span>Check-Out: {dto.encounter.checkOut ? new Date(dto.encounter.checkOut).toLocaleString() : "-"}</span>
          </div>

          {dto.timeline.length === 0 ? (
            <p className="text-sm text-slate-400">No clinical activity recorded for this visit.</p>
          ) : (
            <div className="space-y-3">
              {dto.timeline.map((event: any, i: number) => {
                const Icon = EVENT_ICONS[event.type] ?? Activity;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon size={13} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{event.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(event.time).toLocaleString()}
                        {event.actor && ` · ${event.actorRole}: ${event.actor}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Charges */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Charges</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3">Unit Price</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(dto?.invoice.charges ?? claim.invoice.charges).map((c: any) => (
              <tr key={c.id}>
                <td className="px-6 py-3 text-slate-700">{c.description ?? "-"}</td>
                <td className="px-6 py-3">
                  {c.code && (
                    <span className="font-mono text-xs bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 text-blue-700">
                      CPT {c.code}
                    </span>
                  )}
                  {c.sku && (
                    <span className="ml-1 font-mono text-xs bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-amber-700">
                      SKU {c.sku}
                    </span>
                  )}
                  {!c.code && !c.sku && <span className="text-xs text-slate-400">-</span>}
                </td>
                <td className="px-6 py-3 text-slate-600">{c.quantity}</td>
                <td className="px-6 py-3 text-slate-600">₦{(c.unitPrice ?? 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-right font-medium text-slate-900">
                  ₦{(c.total ?? c.totalPrice ?? 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payments (if any recorded by the hospital) */}
      {claim.payments && claim.payments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Payment Records</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {claim.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="text-sm text-slate-500">{p.paymentReference ?? "-"}</span>
                <span className="text-sm font-medium text-emerald-700">₦{p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Paperclip size={18} className="text-slate-500" /> Attachments
          </h2>
        </div>
        {attachments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No attachments from the hospital yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {attachments.map((a) => (
              <a
                key={a.id}
                href={a.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors"
              >
                <Paperclip size={14} className="text-slate-400" />
                <div>
                  <p className="text-sm text-slate-800">{a.fileName}</p>
                  <p className="text-xs text-slate-400">{a.type} · {new Date(a.attachedAt).toLocaleDateString()}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-slate-500" /> Messages
          </h2>
        </div>

        <div className="p-6 space-y-3 max-h-72 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No messages yet.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`p-3 rounded-lg max-w-md ${m.senderType === "INSURER" ? "bg-blue-50 ml-auto" : "bg-slate-50"}`}>
                <p className="text-sm text-slate-700">{m.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {m.senderType === "INSURER"
                    ? (m.senderInsuranceStaff ? `${m.senderInsuranceStaff.firstName} ${m.senderInsuranceStaff.lastName}` : "You")
                    : (m.senderStaff ? `${m.senderStaff.firstName} ${m.senderStaff.lastName} (Hospital)` : "Hospital")}
                  {" · "}
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 p-4 flex items-center gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Reply to the hospital..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={sendingMessage || !newMessage.trim()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {sendingMessage ? <Loader2 size={14} className="animate-spin" /> : "Send"}
          </button>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowApproveModal(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Approve Claim</h2>
              <button onClick={() => setShowApproveModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-slate-500">
                Claimed amount: ₦{claim.totalAmount.toLocaleString()}
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Approved Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Approving less than the full amount marks this claim as "Partially Approved".
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
              <button onClick={() => setShowApproveModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading || !approvedAmount}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowRejectModal(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Reject Claim</h2>
              <button onClick={() => setShowRejectModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Rejection Reason <span className="text-red-500">*</span></label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                rows={4}
                placeholder="Explain why this claim is being rejected..."
                autoFocus
              />
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, accent }: { title: string; value: string; accent?: "emerald" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${accent === "emerald" ? "text-emerald-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}