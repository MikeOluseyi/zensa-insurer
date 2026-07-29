"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClaimAPI, Claim } from "@/services/claims";
import { useAuthStore } from "@/store/authStore";
import {
  FileText,
  Clock,
  CheckCircle2,
  Wallet,
  ChevronRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Send,
  Search,
  TrendingUp,
  Receipt,
  UserRound,
  Building2,
} from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ClaimAPI.getAll()
      .then(setClaims)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => ({
      awaitingReview: claims.filter((c) => c.status === "SUBMITTED").length,
      underReview: claims.filter((c) => c.status === "UNDER_REVIEW").length,
      approvedThisMonth: claims.filter(
        (c) => c.status === "APPROVED" || c.status === "PARTIALLY_APPROVED"
      ).length,
      totalPending: claims
        .filter((c) => ["SUBMITTED", "UNDER_REVIEW"].includes(c.status))
        .reduce((sum, c) => sum + c.totalAmount, 0),
    }),
    [claims]
  );

  const recentClaims = useMemo(
    () =>
      [...claims]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 6),
    [claims]
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return {
          label: "Submitted",
          color: "text-blue-700",
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: <Send className="w-3 h-3" />,
        };
      case "UNDER_REVIEW":
        return {
          label: "Under Review",
          color: "text-violet-700",
          bg: "bg-violet-50",
          border: "border-violet-200",
          icon: <Search className="w-3 h-3" />,
        };
      case "APPROVED":
        return {
          label: "Approved",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          icon: <CheckCircle2 className="w-3 h-3" />,
        };
      case "PARTIALLY_APPROVED":
        return {
          label: "Partial",
          color: "text-orange-700",
          bg: "bg-orange-50",
          border: "border-orange-200",
          icon: <TrendingUp className="w-3 h-3" />,
        };
      case "REJECTED":
        return {
          label: "Rejected",
          color: "text-rose-700",
          bg: "bg-rose-50",
          border: "border-rose-200",
          icon: <AlertCircle className="w-3 h-3" />,
        };
      case "PAID":
        return {
          label: "Paid",
          color: "text-purple-700",
          bg: "bg-purple-50",
          border: "border-purple-200",
          icon: <Wallet className="w-3 h-3" />,
        };
      default:
        return {
          label: status.replaceAll("_", " "),
          color: "text-gray-700",
          bg: "bg-gray-100",
          border: "border-gray-200",
          icon: <Clock className="w-3 h-3" />,
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, {user?.firstName}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {user?.insuranceProviderName
                ? `${user.insuranceProviderName} · `
                : ""}
              Here's your claims overview
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Total Claims
            </p>
            <p className="text-xl font-bold text-slate-900">{claims.length}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Awaiting Review"
            value={stats.awaitingReview}
            subtitle="New submissions"
            color="bg-blue-50"
            iconColor="text-blue-600"
            href="/claims"
          />
          <StatCard
            icon={Search}
            label="Under Review"
            value={stats.underReview}
            subtitle="In progress"
            color="bg-violet-50"
            iconColor="text-violet-600"
            href="/claims"
          />
          <StatCard
            icon={CheckCircle2}
            label="Approved"
            value={stats.approvedThisMonth}
            subtitle="This month"
            color="bg-emerald-50"
            iconColor="text-emerald-600"
            href="/claims"
          />
          <StatCard
            icon={Wallet}
            label="Pending Value"
            value={formatCurrency(stats.totalPending)}
            subtitle="Total exposure"
            color="bg-amber-50"
            iconColor="text-amber-600"
            href="/claims"
            isCurrency
          />
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Recent Claims</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Latest {recentClaims.length} claim
                  {recentClaims.length !== 1 ? "s" : ""} submitted
                </p>
              </div>
            </div>
            <Link
              href="/claims"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentClaims.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <ShieldCheck className="w-12 h-12 stroke-1" />
                <p className="text-sm font-medium">No claims yet</p>
                <p className="text-xs">Claims will appear here once submitted by hospitals</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentClaims.map((claim) => {
                const status = getStatusConfig(claim.status);
                return (
                  <Link
                    key={claim.id}
                    href={`/claims/${claim.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {claim.patient.firstName[0]}
                        {claim.patient.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {claim.claimNumber ?? claim.id.slice(0, 8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <UserRound className="w-3 h-3" />
                            {claim.patient.firstName} {claim.patient.lastName}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {claim.invoice?.hospital?.name ?? "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div className="hidden sm:block">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(claim.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(claim.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  iconColor,
  href,
  isCurrency,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
  iconColor: string;
  href: string;
  isCurrency?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p
            className={`text-2xl font-bold text-gray-900 mt-1 ${
              isCurrency ? "text-lg sm:text-xl md:text-2xl" : ""
            }`}
          >
            {value}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </Link>
  );
}