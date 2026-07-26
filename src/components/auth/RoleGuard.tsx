"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export default function RoleGuard({ children, allowedRoles }: Props) {

  const router = useRouter();
  const { user, token, hydrated } = useAuthStore();

  useEffect(() => {

    if (!hydrated) return;

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.push("/login");
    }

  }, [user, token, hydrated, router, allowedRoles]);

  if (!hydrated || !token || !user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}