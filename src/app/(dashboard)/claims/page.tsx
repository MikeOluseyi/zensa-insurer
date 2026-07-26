"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClaimAPI, Claim } from "@/services/claims";
import ClaimStatusBadge from "@/components/claims/ClaimStatusBadge";
import { FileText, Search, Loader2, AlertCircle, ChevronRight } from "lucide-react";

const FILTER_TABS = [
  { value: "ALL", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAID", label: "Paid" },
];

export default function ClaimsListPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await ClaimAPI.getAll();
      setClaims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    return {
      submitted: claims.filter((c) => c.status === "SUBMITTED").length,
      underReview: claims.filter((c) => c.status === "UNDER_REVIEW").length,
      approved: claims.filter((c) => c.status === "APPROVED" || c.status === "PARTIALLY_APPROVED").length,
      paid: claims.filter((c) => c.status === "PAID").length,
    };
  }, [claims]);

  const filtered = useMemo(() => {
    let result = claims;

    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          (c.claimNumber ?? "").toLowerCase().includes(q) ||
          `${c.patient.firstName} ${c.patient.lastName}`.toLowerCase().includes(q) ||
          c.patient.patientNumber.toLowerCase().includes(q) ||
          (c.invoice.hospital?.name ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [claims, statusFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={24} className="text-blue-600" />
          Claims
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {claims.length} claim{claims.length !== 1 ? "s" : ""} received from hospitals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Awaiting Review" value={stats.submitted} color="blue" />
        <StatCard label="Under Review" value={stats.underReview} color="violet" />
        <StatCard label="Approved" value={stats.approved} color="emerald" />
        <StatCard label="Paid" value={stats.paid} color="purple" />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by claim #, patient, or hospital..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Loading claims...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {search || statusFilter !== "ALL" ? "No claims match your filters" : "No claims yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Claim</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Hospital</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {claim.claimNumber ?? claim.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {claim.patient.firstName} {claim.patient.lastName}
                      <p className="text-xs text-slate-400">{claim.patient.patientNumber}</p>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{claim.invoice.hospital?.name ?? "-"}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">
                      ₦{claim.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <ClaimStatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/claims/${claim.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-xs"
                      >
                        Review
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: "blue" | "violet" | "emerald" | "purple" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}