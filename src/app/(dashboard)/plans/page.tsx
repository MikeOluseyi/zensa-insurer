"use client";

import { useEffect, useState } from "react";
import { Shield, Plus, Loader2, Settings } from "lucide-react";
import { PlanAPI, Plan } from "@/services/plans";
import PlanRulesModal from "@/components/plans/PlanRulesModal";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [rulesFor, setRulesFor] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    name: "", scope: "GENERAL" as "GENERAL" | "CONDITION_SPECIFIC",
    coveragePercent: "", authorizationRequired: false, maxClaimAmount: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setPlans(await PlanAPI.getAll()); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", scope: "GENERAL", coveragePercent: "", authorizationRequired: false, maxClaimAmount: "" });
    setShowForm(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setForm({
      name: plan.name,
      scope: plan.scope,
      coveragePercent: String(plan.coveragePercent),
      authorizationRequired: plan.authorizationRequired,
      maxClaimAmount: plan.maxClaimAmount != null ? String(plan.maxClaimAmount) : "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim() || !form.coveragePercent) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        scope: form.scope,
        coveragePercent: Number(form.coveragePercent),
        authorizationRequired: form.authorizationRequired,
        maxClaimAmount: form.maxClaimAmount ? Number(form.maxClaimAmount) : null,
      };
      if (editing) await PlanAPI.update(editing.id, payload);
      else await PlanAPI.create(payload);
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save plan.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: Plan) {
    try { await PlanAPI.update(plan.id, { active: !plan.active }); load(); }
    catch (err: any) { alert(err.response?.data?.error || "Failed to update plan."); }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Shield size={20} className="text-white" />
            </div>
            Plans
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 ml-0.5">Manage coverage plans and authorization rules</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Plan
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-300 mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
            <Shield size={28} className="text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No plans yet</h3>
          <p className="text-sm text-gray-500 max-w-xs">Get started by creating your first coverage plan for patients.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Plan</th>
                  <th className="px-6 py-3.5">Scope</th>
                  <th className="px-6 py-3.5">Coverage</th>
                  <th className="px-6 py-3.5">Prior Auth</th>
                  <th className="px-6 py-3.5">Claim Limit</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {plans.map((plan) => (
                  <tr key={plan.id} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{plan.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        plan.scope === "CONDITION_SPECIFIC"
                          ? "bg-violet-50 text-violet-700 border-violet-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>
                        {plan.scope === "CONDITION_SPECIFIC" ? "Condition-specific" : "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg text-xs border border-gray-100">
                        {plan.coveragePercent}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {plan.authorizationRequired ? (
                        <span className="text-amber-600 font-medium text-xs">Required</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not required</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {plan.maxClaimAmount != null ? (
                        <span className="text-gray-900">₦{plan.maxClaimAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">No limit</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(plan)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          plan.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {plan.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setRulesFor(plan)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                          title="Manage coverage rules"
                        >
                          <Settings size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(plan)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Shield size={16} className="text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">{editing ? "Edit Plan" : "New Plan"}</h2>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Plan Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. Maternity Care Plan"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scope</label>
                <div className="space-y-2.5">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50 has-[:checked]:shadow-sm">
                    <input
                      type="radio"
                      checked={form.scope === "GENERAL"}
                      onChange={() => setForm({ ...form, scope: "GENERAL" })}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">General</p>
                      <p className="text-xs text-gray-500 mt-0.5">Covers everything by default</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50 has-[:checked]:shadow-sm">
                    <input
                      type="radio"
                      checked={form.scope === "CONDITION_SPECIFIC"}
                      onChange={() => setForm({ ...form, scope: "CONDITION_SPECIFIC" })}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Condition-specific</p>
                      <p className="text-xs text-gray-500 mt-0.5">Only covers what's explicitly listed</p>
                    </div>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Coverage %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.coveragePercent}
                    onChange={(e) => setForm({ ...form, coveragePercent: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Claim (₦)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxClaimAmount}
                    onChange={(e) => setForm({ ...form, maxClaimAmount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="No limit"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={form.authorizationRequired}
                  onChange={(e) => setForm({ ...form, authorizationRequired: e.target.checked })}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700 font-medium">Plan-wide prior authorization required</span>
              </label>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim() || !form.coveragePercent}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Save Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rulesFor && (
        <PlanRulesModal plan={rulesFor} onClose={() => setRulesFor(null)} />
      )}
    </div>
  );
}