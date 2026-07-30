import api from "@/lib/api";

export interface CPTCode { id: string; code: string; name: string; }
export interface ICD10Code { id: string; code: string; description: string; }

export interface CoverageRule {
  id: string;
  covered: boolean;
  requiresAuthorization: boolean;
  cptCode: CPTCode | null;
  icd10: ICD10Code | null;
}

export interface Plan {
  id: string;
  name: string;
  scope: "GENERAL" | "CONDITION_SPECIFIC";
  coveragePercent: number;
  authorizationRequired: boolean;
  maxClaimAmount: number | null;
  active: boolean;
}

export const PlanAPI = {
  getAll: (): Promise<Plan[]> => api.get("/insurance-Plan").then((r) => r.data),

  create: (data: Partial<Plan>) => api.post("/insurance-Plan", data).then((r) => r.data),

  update: (id: string, data: Partial<Plan>) =>
    api.patch(`/insurance-Plan/${id}`, data).then((r) => r.data),

  getRules: (planId: string): Promise<CoverageRule[]> =>
    api.get(`/insurance-Plan/${planId}/rules`).then((r) => r.data),

  addRule: (planId: string, data: { cptCodeId?: string; icd10Id?: string; covered: boolean; requiresAuthorization: boolean }) =>
    api.post(`/insurance-Plan/${planId}/rules`, data).then((r) => r.data),

  deleteRule: (ruleId: string) => api.delete(`/insurance-Plan/rules/${ruleId}`).then((r) => r.data),

  searchCPT: (search: string): Promise<CPTCode[]> =>
    api.get(`/insurance-Plan/lookup/cpt?search=${encodeURIComponent(search)}`).then((r) => r.data),

  searchICD10: (search: string): Promise<ICD10Code[]> =>
    api.get(`/insurance-Plan/lookup/icd10?search=${encodeURIComponent(search)}`).then((r) => r.data),
};