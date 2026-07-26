const STATUS_MAP: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-violet-50 text-violet-700 border-violet-200" },
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PARTIALLY_APPROVED: { label: "Partially Approved", className: "bg-amber-50 text-amber-700 border-amber-200" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
  PAID: { label: "Paid", className: "bg-purple-50 text-purple-700 border-purple-200" },
  PAYMENT_IN_PROGRESS: { label: "Payment In Progress", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function ClaimStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status.replaceAll("_", " "), className: "bg-slate-100 text-slate-600 border-slate-200" };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}