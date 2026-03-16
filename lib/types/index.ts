// Type definitions for LowFi.app
export interface User {
  id: string;
  email: string;
  createdAt: string;
  companyName: string;
}

export interface Invoice {
  id: string;
  userId: string;
  filename: string;
  originalText: string;
  extractedData: Record<string, any>;
  status: "pending" | "reviewed" | "approved";
  createdAt: string;
}

export interface FollowUp {
  id: string;
  userId: string;
  invoiceId: string;
  customerId: string;
  draftEmail: string;
  status: "draft" | "sent" | "replied";
  sentAt?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  emailFrom: string;
  subject: string;
  body: string;
  category: "billing" | "technical" | "feature_request" | "bug" | "other";
  aiResponse?: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export interface Company {
  id: string;
  ownerId: string;
  name: string;
  settings: Record<string, any>;
  createdAt: string;
}
