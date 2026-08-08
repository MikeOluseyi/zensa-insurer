"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  ChevronRight,
  Shield, ShieldUser,
} from "lucide-react";
import Link from "next/link";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = useMemo(() => {
    if (!user) return "";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  }, [user]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/claims", label: "Claims", icon: FileText },
    { href: "/plans", label: "Policy Management", icon: FileText },
    { href: "/authorizations", label: "Authorization Requests", icon: ShieldUser },
    ...(user?.role === "MANAGER"
      ? [{ href: "/staff", label: "Staff", icon: Users }]
      : []),
  ];

  return (
    <RoleGuard
      allowedRoles={["MANAGER", "CLAIMS_OFFICER", "REVIEWER", "FINANCE"]}
    >
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)]">
          {/* Header */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <img
                src="/zensalogo.png"
                alt="Zensa"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Zensa
              </span>
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-md border border-green-200 tracking-wider uppercase">
                Beta
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-transparent text-blue-700 font-semibold shadow-sm shadow-blue-500/5"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight size={14} className="text-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-3 border-t border-slate-100">
            <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {initials || <Shield size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md uppercase tracking-wide">
                      {user?.role?.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {user?.insuranceProviderName && (
                <p className="text-[11px] text-slate-400 pl-[52px]">
                  {user.insuranceProviderName}
                </p>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-[0.98]"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}