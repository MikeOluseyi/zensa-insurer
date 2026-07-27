"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClaimAPI, Claim } from "@/services/claims";
import { useAuthStore } from "@/store/authStore";
import { FileText, Clock, CheckCircle2, Wallet, ChevronRight, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ClaimAPI.getAll()
      .then(setClaims)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    awaitingReview: claims.filter((c) => c.status === "SUBMITTED").length,
    underReview: claims.filter((c) => c.status === "UNDER_REVIEW").length,
    approvedThisMonth: claims.filter((c) => c.status === "APPROVED" || c.status === "PARTIALLY_APPROVED").length,
    totalPending: claims
      .filter((c) => ["SUBMITTED", "UNDER_REVIEW"].includes(c.status))
      .reduce((sum, c) => sum + c.totalAmount, 0),
  }), [claims]);

  const recentClaims = useMemo(
    () => [...claims].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [claims]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.firstName}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {user?.insuranceProviderName ? `${user.insuranceProviderName} · ` : ""}Here's your claims overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Awaiting Review" value={stats.awaitingReview} color="blue" href="/claims" />
        <StatCard icon={Clock} label="Under Review" value={stats.underReview} color="violet" href="/claims" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approvedThisMonth} color="emerald" href="/claims" />
        <StatCard icon={Wallet} label="Pending Value" value={`₦${stats.totalPending.toLocaleString()}`} color="amber" href="/claims" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Claims</h2>
          <Link href="/claims" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {recentClaims.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No claims yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentClaims.map((claim) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {claim.claimNumber ?? claim.id.slice(0, 8)} · {claim.patient.firstName} {claim.patient.lastName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{claim.invoice.hospital?.name ?? "-"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">₦{claim.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{claim.status.replaceAll("_", " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color, href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  color: "blue" | "violet" | "emerald" | "amber";
  href: string;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <Link href={href} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]} mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </Link>
  );
}