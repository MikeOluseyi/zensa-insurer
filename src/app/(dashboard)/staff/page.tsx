"use client";

import { useEffect, useState } from "react";
import { InsuranceStaffAPI, InsuranceStaffMember } from "@/services/staff";
import { useAuthStore } from "@/store/authStore";
import { Users, Plus, X, Loader2, UserX } from "lucide-react";

const ROLES = ["MANAGER", "CLAIMS_OFFICER", "REVIEWER", "FINANCE"];

export default function StaffPage() {
  const user = useAuthStore((state) => state.user);
  const isManager = user?.role === "MANAGER";

  const [staff, setStaff] = useState<InsuranceStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "CLAIMS_OFFICER" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await InsuranceStaffAPI.getAll();
      setStaff(data);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await InsuranceStaffAPI.create(form);
      setShowModal(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", role: "CLAIMS_OFFICER" });
      load();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to create staff member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisable(id: string) {
    if (!confirm("Disable this staff member? They will no longer be able to log in.")) return;
    try {
      await InsuranceStaffAPI.disable(id);
      load();
    } catch {
      alert("Failed to disable staff member.");
    }
  }

  if (!isManager) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-slate-500">Only account managers can view staff management.</p>
      </div>
    );
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Staff
          </h1>
          <p className="text-sm text-slate-500 mt-1">{staff.length} team member{staff.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-slate-400" />
          </div>
        ) : staff.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">No staff members yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-900">{member.firstName} {member.lastName}</td>
                  <td className="px-6 py-3 text-slate-600">{member.email}</td>
                  <td className="px-6 py-3 text-slate-600">{member.role.replaceAll("_", " ")}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${member.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {member.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {member.isActive && (
                      <button
                        onClick={() => handleDisable(member.id)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        <UserX size={12} />
                        Disable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} required />
                <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} required />
              </div>
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required />
              <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} required />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.replaceAll("_", " ")}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}