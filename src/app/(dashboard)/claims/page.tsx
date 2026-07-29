"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClaimAPI, Claim } from "@/services/claims";
import ClaimStatusBadge from "@/components/claims/ClaimStatusBadge";
import {
  FileText,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
  Clock,
  Eye,
  CheckCircle,
  Banknote,
  Download,
  X,
} from "lucide-react";

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
      approved: claims.filter(
        (c) => c.status === "APPROVED" || c.status === "PARTIALLY_APPROVED"
      ).length,
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
          `${c.patient.firstName} ${c.patient.lastName}`
            .toLowerCase()
            .includes(q) ||
          c.patient.patientNumber.toLowerCase().includes(q) ||
          (c.invoice.hospital?.name ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [claims, statusFilter, search]);

  const totalClaims = claims.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <FileText size={14} strokeWidth={2.5} />
            Claims Management
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Claims
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalClaims.toLocaleString()} claim
            {totalClaims !== 1 ? "s" : ""} received from hospitals
          </p>
        </div>
        <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center gap-2">
          <Download size={16} strokeWidth={2.5} />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Awaiting Review"
          value={stats.submitted}
          icon={<Clock size={18} strokeWidth={2} />}
          gradient="from-blue-500 to-blue-600"
          shadow="shadow-blue-500/20"
          barColor="from-blue-500 to-blue-400"
          percent={totalClaims ? (stats.submitted / totalClaims) * 100 : 0}
        />
        <StatCard
          label="Under Review"
          value={stats.underReview}
          icon={<Eye size={18} strokeWidth={2} />}
          gradient="from-amber-400 to-amber-500"
          shadow="shadow-amber-500/20"
          barColor="from-amber-400 to-amber-300"
          percent={totalClaims ? (stats.underReview / totalClaims) * 100 : 0}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={<CheckCircle size={18} strokeWidth={2} />}
          gradient="from-emerald-500 to-green-500"
          shadow="shadow-emerald-500/20"
          barColor="from-emerald-500 to-green-400"
          percent={totalClaims ? (stats.approved / totalClaims) * 100 : 0}
        />
        <StatCard
          label="Paid"
          value={stats.paid}
          icon={<Banknote size={18} strokeWidth={2} />}
          gradient="from-green-600 to-emerald-600"
          shadow="shadow-green-500/20"
          barColor="from-green-600 to-emerald-400"
          percent={totalClaims ? (stats.paid / totalClaims) * 100 : 0}
        />
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full max-w-lg">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by claim #, patient, or hospital..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                statusFilter === tab.value
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-sm font-medium">Loading claims...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold text-sm">
              {search || statusFilter !== "ALL"
                ? "No claims match your filters"
                : "No claims yet"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your search or filters"
                : "Claims will appear here once submitted"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4">Claim</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Hospital</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((claim) => (
                    <tr
                      key={claim.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {claim.claimNumber ?? claim.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          #{claim.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {claim.patient.firstName} {claim.patient.lastName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {claim.patient.patientNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {claim.invoice.hospital?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900">
                          ₦{claim.totalAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ClaimStatusBadge status={claim.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {claim.submittedAt
                          ? new Date(claim.submittedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/claims/${claim.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs group-hover:translate-x-0.5 transition-transform"
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

            {/* Footer / Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-xs text-slate-500">
                Showing {filtered.length} of {totalClaims.toLocaleString()}{" "}
                claim{totalClaims !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-slate-200 bg-white cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 border border-blue-600 shadow-sm">
                  1
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                  2
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
  shadow,
  barColor,
  percent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  shadow: string;
  barColor: string;
  percent: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} group-hover:scale-105 transition-transform text-white`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mt-3">
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
        {label}
      </p>
      <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}