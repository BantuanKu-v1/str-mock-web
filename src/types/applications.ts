import type {
  DbApplication,
  StrApplicationStatus,
} from "../../worker/types/application";

import type {
  StrApplicationData,
  SupportingDocumentData,
  PreliminaryEligibilityData,
  PreliminaryEligibilityStatus,
} from "../../worker/schemas/applicationSchema";

export type Application = DbApplication;

export type ApplicationStatus = StrApplicationStatus;

export type {
  StrApplicationData,
  SupportingDocumentData,
  PreliminaryEligibilityData,
  PreliminaryEligibilityStatus,
};

export type ApplicationDetailsTab =
    | "personal"
    | "residence"
    | "household"
    | "documents"
    | "eligibility";

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export const preliminaryEligibilityStatusLabels: Record<
    PreliminaryEligibilityStatus,
    string
> = {
  potentially_eligible: "Potentially Eligible",
  potentially_ineligible: "Potentially Ineligible",
  insufficient_information: "Insufficient Information",
  manual_verification: "Manual Verification Required",
};

export const applicationDetailsTabLabels: Record<
    ApplicationDetailsTab,
    string
> = {
  personal: "Personal",
  residence: "Residence",
  household: "Household",
  documents: "Documents",
  eligibility: "Eligibility",
};
