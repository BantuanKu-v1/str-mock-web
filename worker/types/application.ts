export type StrApplicationStatus = "submitted" | "under_review" | "approved" | "rejected";

// Application submission request from a third-party system
export interface CreateApplicationRequest {
  externalApplicationId: string;
  applicantName: string;
  applicationYear: number;
}

// API-facing application record
export interface StrApplication {
  id: string;
  clientId: string;
  externalApplicationId: string;
  referenceNo: string;
  applicantName: string;
  applicationYear: number;
  status: StrApplicationStatus;
  submittedAt: string;
  updatedAt: string;
}

// Application submission response
export interface CreateApplicationResponse {
  id: string;
  referenceNo: string;
  status: StrApplicationStatus;
  submittedAt: string;
}

// Application status response
export interface ApplicationStatusResponse {
  id: string;
  referenceNo: string;
  status: StrApplicationStatus;
  updatedAt: string;
}

// Database application record (Cloudflare D1)
export interface DbApplication {
  id: string;
  client_id: string;
  external_application_id: string;
  reference_no: string;
  applicant_name: string;
  application_year: number;
  status: StrApplicationStatus;
  submitted_at: string;
  updated_at: string;
}

// Application creation payload
export type CreateApplicationPayload = CreateApplicationRequest;

// Application creation result
export type CreateApplicationResult = DbApplication;

// Backward-compatible alias for existing service imports
export type ApplicationStatus = StrApplicationStatus;
