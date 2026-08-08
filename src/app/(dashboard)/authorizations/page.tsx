// app/authorizations/page.tsx (insurer app)
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, Building2 } from "lucide-react";

interface AuthRequest {
  id: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  patientInsurance: {
    policyNumber: string;
    patient: { firstName: string; lastName: string; patientNumber: string };
  };
  hospital: { name: string };
}

export default function AuthorizationsPage() {
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get("/insurance-Authorization");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load authorization requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    setProcessingId(id);
    try {
      await api.patch(`/insurance-Authorization/${id}/approve`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  }

  async function reject(id: string) {
    if (!rejectionReason.trim()) return;
    setProcessingId(id);
    try {
      await api.patch(`/insurance-Authorization/${id}/reject`, { rejectionReason: rejectionReason.trim() });
      setRejectingId(null);
      setRejectionReason("");
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to reject request.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck size={24} className="text-blue-600" />
          Prior Authorization Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">{requests.length} pending review</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-slate-400" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No pending authorization requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {r.patientInsurance.patient.firstName} {r.patientInsurance.patient.lastName}
                    <span className="text-xs text-slate-400 ml-2 font-normal">{r.patientInsurance.patient.patientNumber}</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{r.reason}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Building2 size={12} /> {r.hospital.name}</span>
                    <span>Policy: {r.patientInsurance.policyNumber}</span>
                    <span>{new Date(r.requestedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {rejectingId === r.id ? (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => reject(r.id)}
                      disabled={processingId === r.id || !rejectionReason.trim()}
                      className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                      className="px-3 py-1.5 text-xs text-slate-500 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => approve(r.id)}
                    disabled={processingId === r.id}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {processingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(r.id)}
                    className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50"
                  >
                    <XCircle size={12} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}