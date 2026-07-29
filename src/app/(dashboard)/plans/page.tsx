// app/plans/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
  Shield,
  Plus,
  Loader2,
  Pencil,
  X,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  coveragePercent: number;
  authorizationRequired: boolean;
  maxClaimAmount: number | null;
  active: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    name: "",
    coveragePercent: "",
    authorizationRequired: false,
    maxClaimAmount: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/insurance-Plan");
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    return {
      total: plans.length,
      active: plans.filter((p) => p.active).length,
      inactive: plans.filter((p) => !p.active).length,
      requireAuth: plans.filter((p) => p.authorizationRequired).length,
    };
  }, [plans]);

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      coveragePercent: "",
      authorizationRequired: false,
      maxClaimAmount: "",
    });
    setShowForm(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setForm({
      name: plan.name,
      coveragePercent: String(plan.coveragePercent),
      authorizationRequired: plan.authorizationRequired,
      maxClaimAmount:
        plan.maxClaimAmount != null ? String(plan.maxClaimAmount) : "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim() || !form.coveragePercent) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        coveragePercent: Number(form.coveragePercent),
        authorizationRequired: form.authorizationRequired,
        maxClaimAmount: form.maxClaimAmount
          ? Number(form.maxClaimAmount)
          : null,
      };

      if (editing) {
        await api.patch(`/insurance-Plan/${editing.id}`, payload);
      } else {
        await api.post("/insurance-Plan", payload);
      }

      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save plan.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: Plan) {
    try {
      await api.patch(`/insurance-Plan/${plan.id}`, {
        active: !plan.active,
      });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update plan.");
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Shield size={14} strokeWidth={2.5} />
            Policy Management
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage coverage plans and authorization rules
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Plans"
          value={stats.total}
          icon={<Shield size={18} strokeWidth={2} />}
          gradient="from-blue-500 to-blue-600"
          shadow="shadow-blue-500/20"
          badge={`${stats.active} active`}
          badgeColor="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<CheckCircle2 size={18} strokeWidth={2} />}
          gradient="from-emerald-500 to-green-500"
          shadow="shadow-emerald-500/20"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={<AlertCircle size={18} strokeWidth={2} />}
          gradient="from-amber-400 to-amber-500"
          shadow="shadow-amber-500/20"
        />
        <StatCard
          label="Require Auth"
          value={stats.requireAuth}
          icon={<Lock size={18} strokeWidth={2} />}
          gradient="from-violet-500 to-purple-500"
          shadow="shadow-violet-500/20"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm font-medium">Loading plans...</p>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold text-sm">No plans yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Create your first coverage plan to get started.
          </p>
          <button
            onClick={openCreate}
            className="mt-5 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
          >
            <Plus size={14} />
            Create a plan
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Coverage</th>
                  <th className="px-6 py-4">Prior Auth</th>
                  <th className="px-6 py-4">Claim Limit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className={`hover:bg-blue-50/40 transition-colors group ${
                      !plan.active ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                            plan.active
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {getInitials(plan.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {plan.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            #{plan.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              plan.active
                                ? "bg-gradient-to-r from-blue-500 to-green-400"
                                : "bg-gradient-to-r from-blue-300 to-green-300 opacity-50"
                            }`}
                            style={{ width: `${plan.coveragePercent}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            plan.active ? "text-slate-700" : "text-slate-500"
                          }`}
                        >
                          {plan.coveragePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {plan.authorizationRequired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Lock size={10} strokeWidth={2.5} />
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                          <Eye size={10} strokeWidth={2.5} />
                          Not Required
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium tabular-nums ${
                          plan.active ? "text-slate-700" : "text-slate-500"
                        }`}
                      >
                        {plan.maxClaimAmount != null
                          ? `₦${plan.maxClaimAmount.toLocaleString()}`
                          : "No limit"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(plan)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer active:scale-95 ${
                          plan.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            plan.active ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {plan.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(plan)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit plan"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowForm(false)
          }
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    editing
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {editing ? (
                    <Pencil size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editing ? "Edit Plan" : "New Plan"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editing
                      ? "Update coverage plan details"
                      : "Create a new coverage plan"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Plan Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. Gold HMO Plan"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Coverage %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.coveragePercent}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          coveragePercent: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all pr-8"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Max Claim (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxClaimAmount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maxClaimAmount: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="No limit"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.authorizationRequired}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        authorizationRequired: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="w-10 h-6 bg-slate-300 rounded-full peer-checked:bg-blue-500 transition-colors relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Requires prior authorization
                  </p>
                  <p className="text-xs text-slate-500">
                    Claims under this plan need approval before processing
                  </p>
                </div>
              </label>
            </div>
            <div className="border-t border-slate-100 px-6 py-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={
                  saving || !form.name.trim() || !form.coveragePercent
                }
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {editing ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
  shadow,
  badge,
  badgeColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  shadow: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} text-white`}
        >
          {icon}
        </div>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 mt-3">
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}