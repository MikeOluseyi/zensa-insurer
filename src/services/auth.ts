import api from "@/lib/api";

export interface InsuranceLoginResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    insuranceProviderId: string;
    insuranceProviderName: string | null;
  };
}

export async function login(email: string, password: string): Promise<InsuranceLoginResponse> {
  const res = await api.post("/insurance-staff/login", { email, password });
  return res.data;
}