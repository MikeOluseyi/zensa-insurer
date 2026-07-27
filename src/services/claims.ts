import api from "@/lib/api";

export interface ClaimCharge {
  id: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ClaimPatient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
  gender: string;
  dateOfBirth: string;
}

export interface ClaimPayment {
  id: string;
  amount: number;
  paymentReference: string | null;
  createdAt: string;
}

export interface Claim {
  id: string;
  claimNumber: string | null;
  status: string;
  totalAmount: number;
  approvedAmount: number | null;
  rejectionReason: string | null;
  createdAt: string;
  submittedAt: string | null;
  processedAt: string | null;
  patient: ClaimPatient;
  invoice: {
    id: string;
    invoiceNumber: string;
    subtotal: number;
    charges: ClaimCharge[];
    hospital: { name: string } | null;
  };
  attachments: any[];
  messages: any[];
  payments?: ClaimPayment[];
}

export const ClaimAPI = {
  getAll: (): Promise<Claim[]> =>
    api.get("/insurance-Claims").then((r) => r.data),

  getOne: (id: string): Promise<Claim> =>
    api.get(`/insurance-Claims/${id}`).then((r) => r.data),

  review: (id: string) =>
    api.patch(`/insurance-Claims/${id}/review`).then((r) => r.data),

  approve: (id: string, approvedAmount: number) =>
    api.patch(`/insurance-Claims/${id}/approve`, { approvedAmount }).then((r) => r.data),

  reject: (id: string, rejectionReason: string) =>
    api.patch(`/insurance-Claims/${id}/reject`, { rejectionReason }).then((r) => r.data),

  markPaid: (id: string) =>
    api.patch(`/insurance-Claims/${id}/pay`).then((r) => r.data),

  update: (id: string, data: { fileName?: string }) =>
    api.patch(`/insurance-Claims/${id}`, data).then((r) => r.data),

  getAttachments: (id: string) =>
    api.get(`/insurance-Claims/${id}/attachments`).then((r) => r.data),

  addAttachment: (id: string, data: { fileName: string; fileUrl: string; type?: string }) =>
    api.post(`/insurance-Claims/${id}/attachments`, data).then((r) => r.data),

  getMessages: (id: string) =>
    api.get(`/insurance-Claims/${id}/messages`).then((r) => r.data),

  sendMessage: (id: string, message: string) =>
    api.post(`/insurance-Claims/${id}/messages`, { message }).then((r) => r.data),

  getTimeline: (id: string) =>
    api.get(`/insurance-Claims/${id}/timeline`).then((r) => r.data),
};