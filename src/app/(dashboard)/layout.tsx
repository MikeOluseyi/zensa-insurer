"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ShieldCheck, LayoutDashboard, FileText, Users } from "lucide-react";
import Link from "next/link";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <RoleGuard allowedRoles={["MANAGER", "CLAIMS_OFFICER", "REVIEWER", "FINANCE"]}>
      <div className="flex h-screen bg-slate-50">

        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-100">
            <ShieldCheck className="text-blue-600" size={20} />
            <span className="font-bold text-slate-900">Zensa Insurer</span>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link href="/claims" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <FileText size={16} />
              Claims
            </Link>
          </nav>
          {user?.role === "MANAGER" && (
  <Link href="/staff" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
    <Users size={16} />
    Staff
  </Link>
)}

          <div className="p-3 border-t border-slate-100">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase().replace("_", " ")}</p>
              {user?.insuranceProviderName && (
                <p className="text-xs text-slate-400 mt-0.5">{user.insuranceProviderName}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
