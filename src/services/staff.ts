import api from "@/lib/api";

export interface InsuranceStaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const InsuranceStaffAPI = {
  getAll: (): Promise<InsuranceStaffMember[]> =>
    api.get("/insurance-staff").then((r) => r.data),

  create: (data: { firstName: string; lastName: string; email: string; password: string; role: string }) =>
    api.post("/insurance-staff", data).then((r) => r.data),

  disable: (id: string) =>
    api.patch(`/insurance-staff/${id}/disable`).then((r) => r.data),
};