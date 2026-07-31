"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ClaimAPI, Claim } from "@/services/claims";
import ClaimStatusBadge from "@/components/claims/ClaimStatusBadge";
import {
  ArrowLeft,
  User,
  Building2,
  Receipt,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Wallet,
  X,
  Paperclip,
  MessageSquare,
  Activity,
  HeartPulse,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  ClipboardList,
  LogOut,
  Send,
  Clock,
  Calendar,
  Banknote,
  FileText,
  ShieldCheck,
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
  const [rules, setRules] = useState<any>(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [attachments, setAttachments] = useState<any[]>([]);
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState("OTHER");
  const [addingAttachment, setAddingAttachment] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    load();
    loadDTO();
    loadRules();
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
      const res = await api.get(`/insurance-Claim/${id}/full`);
      setDto(res.data);
    } catch (err) {
      console.error("Failed to fetch claim detail:", err);
      setDto(null);
    }
  }

  async function loadRules() {
    try {
      const data = await ClaimAPI.getRules(id as string);
      setRules(data);
    } catch {
      setRules(null);
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
  async function handleAddAttachment(e: React.FormEvent) {
  e.preventDefault();
  if (!attachmentFile) return;

  setAddingAttachment(true);
  try {
    await ClaimAPI.addAttachment(id as string, attachmentFile, attachmentType);
    setAttachmentFile(null);
    setAttachmentType("OTHER");
    setShowAddAttachment(false);
    loadAttachments();
  } catch (err: any) {
    alert(err?.response?.data?.error || "Failed to add attachment.");
  } finally {
    setAddingAttachment(false);
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
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={32} className="text-slate-400" />
        </div>
        <p className="text-lg font-bold text-slate-700">Claim not found</p>
        <p className="text-sm text-slate-400 mt-1">
          The claim you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/claims"
          className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
        >
          <ArrowLeft size={16} />
          Back to claims
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/claims"
          className="mt-1 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-md transition-all active:scale-95 shrink-0"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {claim.claimNumber ?? claim.id.slice(0, 8).toUpperCase()}
                </h1>
                <ClaimStatusBadge status={claim.status} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Receipt size={12} />
                  Invoice {claim.invoice.invoiceNumber}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {claim.submittedAt
                    ? new Date(claim.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not submitted"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {claim.status === "SUBMITTED" && (
                <button
                  onClick={handleReview}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ClipboardCheck size={16} />
                  )}
                  Start Review
                </button>
              )}

              {claim.status === "UNDER_REVIEW" && (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                </>
              )}

              {(claim.status === "APPROVED" ||
                claim.status === "PARTIALLY_APPROVED") && (
                <button
                  onClick={handleMarkPaid}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Wallet size={16} />
                  )}
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200 rounded-2xl text-sm text-red-700 shadow-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Rejection Notice */}
      {claim.status === "REJECTED" && claim.rejectionReason && (
        <div className="flex items-start gap-3 p-5 bg-red-50/60 border border-red-200 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <XCircle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-800">Rejection Reason</p>
            <p className="text-sm text-red-700 mt-1 leading-relaxed">
              {claim.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Claimed Amount"
          value={`₦${claim.totalAmount.toLocaleString()}`}
          icon={<Banknote size={18} />}
          gradient="from-blue-500 to-blue-600"
          shadow="shadow-blue-500/20"
        />
        <SummaryCard
          title="Approved Amount"
          value={
            claim.approvedAmount != null
              ? `₦${claim.approvedAmount.toLocaleString()}`
              : "—"
          }
          icon={<ShieldCheck size={18} />}
          gradient="from-emerald-500 to-green-500"
          shadow="shadow-emerald-500/20"
          accent
        />
        <SummaryCard
          title="Submitted On"
          value={
            claim.submittedAt
              ? new Date(claim.submittedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "-"
          }
          icon={<Clock size={18} />}
          gradient="from-slate-500 to-slate-600"
          shadow="shadow-slate-500/20"
        />
      </div>

      {/* Patient & Hospital */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <User size={18} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-900">Patient</h2>
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-800">
              {claim.patient.firstName} {claim.patient.lastName}
            </p>
            <p className="text-sm text-slate-500">
              {claim.patient.patientNumber} · {claim.patient.gender}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Building2 size={18} className="text-green-600" />
            </div>
            <h2 className="font-bold text-slate-900">Hospital</h2>
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-800">
              {claim.invoice.hospital?.name ?? "—"}
            </p>
            <p className="text-sm text-slate-500">
              Invoice #{claim.invoice.invoiceNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Encounter & Clinical Timeline */}
      {dto && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <Activity size={18} className="text-rose-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Encounter & Clinical Timeline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {dto.encounter.checkIn
                  ? new Date(dto.encounter.checkIn).toLocaleDateString()
                  : "No check-in"}{" "}
                —{" "}
                {dto.encounter.checkOut
                  ? new Date(dto.encounter.checkOut).toLocaleDateString()
                  : "Active"}
              </p>
            </div>
          </div>

          {dto.timeline.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Activity size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">
                No clinical activity recorded for this visit.
              </p>
            </div>
          ) : (
            <div className="relative pl-4">
              <div className="absolute left-[22px] top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-5">
                {dto.timeline.map((event: any, i: number) => {
                  const Icon = EVENT_ICONS[event.type] ?? Activity;
                  return (
                    <div key={i} className="relative flex gap-4">
                      <div className="relative z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-slate-500" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-medium text-slate-800">
                          {event.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(event.time).toLocaleString()}
                          {event.actor &&
                            ` · ${event.actorRole}: ${event.actor}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Automated Rules */}
      {rules && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <ClipboardCheck size={18} className="text-violet-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Automated Rules</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  System validation checks
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                rules.allPassed
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {rules.allPassed
                ? "All Checks Passed"
                : "Some Checks Failed"}
            </span>
          </div>

          <div className="space-y-3">
            {rules.results.map((r: any) => (
              <div
                key={r.rule}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                {r.passed ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle size={14} className="text-red-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {r.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {!rules.allPassed && (
            <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
              These checks are informational only and do not block approval or
              payment.
            </p>
          )}
        </div>
      )}

      {/* Charges */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Charges</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {(dto?.invoice.charges ?? claim.invoice.charges).length} line
              item
              {(dto?.invoice.charges ?? claim.invoice.charges).length !== 1
                ? "s"
                : ""}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Qty</th>
                <th className="px-6 py-3.5">Unit Price</th>
                <th className="px-6 py-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(dto?.invoice.charges ?? claim.invoice.charges).map(
                (c: any) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-slate-700 font-medium">
                      {c.description ?? "-"}
                    </td>
                    <td className="px-6 py-3.5">
                      {c.code && (
                        <span className="font-mono text-[11px] bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 text-blue-700 font-semibold">
                          CPT {c.code}
                        </span>
                      )}
                      {c.sku && (
                        <span className="ml-1.5 font-mono text-[11px] bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 text-amber-700 font-semibold">
                          SKU {c.sku}
                        </span>
                      )}
                      {!c.code && !c.sku && (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 tabular-nums">
                      {c.quantity}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 tabular-nums">
                      ₦{(c.unitPrice ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-900 tabular-nums">
                      ₦{(c.total ?? c.totalPrice ?? 0).toLocaleString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments */}
      {claim.payments && claim.payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Wallet size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Payment Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {claim.payments.length} payment
                {claim.payments.length !== 1 ? "s" : ""} recorded
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {claim.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {p.paymentReference ?? "Payment"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 tabular-nums">
                  ₦{p.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Paperclip size={18} className="text-slate-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Attachments</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Documents from the hospital
            </p>
          </div>
        </div>
        {attachments.length === 0 ? (
          <div className="text-center py-12">
            <Paperclip size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">
              No attachments from the hospital yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
           {attachments.map((a) => (
            <a
    key={a.id}
    href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${a.fileUrl}`}
    target="_blank"
    rel="noreferrer"
    className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
  >
    <div className="flex items-center gap-3">
      <Paperclip size={14} className="text-slate-400" />
      <div>
        <p className="text-sm text-slate-800">{a.fileName}</p>
        <p className="text-xs text-slate-400">{a.type} · {new Date(a.attachedAt).toLocaleDateString()}</p>
      </div>
    </div>
  </a>
))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <MessageSquare size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Messages</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Communication with the hospital
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-80 overflow-y-auto bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No messages yet.</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Start the conversation below.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isInsurer = m.senderType === "INSURER";
              return (
                <div
                  key={m.id}
                  className={`flex ${isInsurer ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl ${
                      isInsurer
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-md shadow-md shadow-blue-500/10"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{m.message}</p>
                    <p
                      className={`text-[11px] mt-1.5 ${
                        isInsurer ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {isInsurer
                        ? m.senderInsuranceStaff
                          ? `${m.senderInsuranceStaff.firstName} ${m.senderInsuranceStaff.lastName}`
                          : "You"
                        : m.senderStaff
                        ? `${m.senderStaff.firstName} ${m.senderStaff.lastName} (Hospital)`
                        : "Hospital"}
                      {" · "}
                      {new Date(m.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-100 p-4 flex items-center gap-3 bg-white">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Reply to the hospital..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={sendingMessage || !newMessage.trim()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
          >
            {sendingMessage ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Send
          </button>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowApproveModal(false)
          }
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Approve Claim
                  </h2>
                  <p className="text-xs text-slate-500">
                    Claimed: ₦{claim.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Approved Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Approving less than the full amount marks this claim as
                  &quot;Partially Approved&quot;.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading || !approvedAmount}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowRejectModal(false)
          }
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Reject Claim
                  </h2>
                  <p className="text-xs text-slate-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Rejection Reason{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white outline-none transition-all resize-none"
                rows={4}
                placeholder="Explain why this claim is being rejected..."
                autoFocus
              />
            </div>
            <div className="border-t border-slate-100 px-6 py-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  gradient,
  shadow,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  shadow: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} text-white`}
        >
          {icon}
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
      </div>
      <p
        className={`text-2xl font-bold ${
          accent ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}