import { useMemo, useState } from "react";

import type {
  Application,
  ApplicationDetailsTab,
  PreliminaryEligibilityStatus,
} from "../../types/applications.ts";

import {
  applicationStatusLabels,
  applicationDetailsTabLabels,
  preliminaryEligibilityStatusLabels,
} from "../../types/applications.ts";

import { strApplicationDataSchema } from "../../../worker/schemas/applicationSchema";

type ApplicationDetailsProps = {
  application: Application;
  onBack: () => void;
  onUpdateStatus: (application: Application) => void;
};

const preliminaryEligibilityDescriptions: Record<
    PreliminaryEligibilityStatus,
    string
> = {
  potentially_eligible:
      "The applicant appears to satisfy the preliminary eligibility criteria based on the information available at the time of assessment.",

  potentially_ineligible:
      "The applicant appears not to satisfy one or more preliminary eligibility criteria based on the information available at the time of assessment.",

  insufficient_information:
      "There is insufficient information to determine whether the applicant satisfies the preliminary eligibility criteria.",

  manual_verification:
      "Further verification by an authorised officer is required before the applicant's eligibility can be determined.",
};

export default function ApplicationDetails({
  application,
  onBack,
  onUpdateStatus,
}: ApplicationDetailsProps) {
  const [activeTab, setActiveTab] = useState<ApplicationDetailsTab>("personal");

  const formatStatus = (status: string) => {
    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "Not provided";
    }

    const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? `${date}T00:00:00Z`
        : /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(date)
            ? `${date.replace(" ", "T")}Z`
            : date;

    const parsedDate = new Date(normalizedDate);

    return Number.isNaN(parsedDate.getTime())
        ? date
        : parsedDate.toLocaleDateString("en-MY", {
          timeZone: "Asia/Kuala_Lumpur",
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];

    const unitIndex = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    const size = bytes / Math.pow(1024, unitIndex);

    return `${size.toLocaleString("en-MY", {
      maximumFractionDigits: 2,
    })} ${units[unitIndex]}`;
  };

  const formatLabel = (key: string) => {
    const labels: Record<string, string> = {
      identificationNo: "Identification Number",
      dateOfBirth: "Date of Birth",
      stateTerritory: "State / Territory",
      countryCode: "Country Code",
      monthlyPersonalIncome: "Monthly Personal Income",
      monthlyHouseholdIncome: "Monthly Household Income",
      monthlyIncome: "Monthly Income",
      isOku: "Person with Disabilities (OKU)",
      okuRegistered: "Registered OKU",
      isStudent: "Student",
      isDependent: "Dependent",
      criteriaVersion: "Criteria Version",
      assessedAt: "Assessment Date",
      informationComplete: "Information Complete",

      // Supporting document fields.
      documentId: "Document ID",
      requirementType: "Requirement Type",
      documentType: "Document Type",
      originalFilename: "Original Filename",
      mimeType: "File Format",
      fileSizeBytes: "File Size",
      issuedAt: "Issue Date",
      expiresAt: "Expiry Date",
    };

    return labels[key] ?? key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const formatValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "number") {
      if (
          key === "monthlyPersonalIncome" ||
          key === "monthlyHouseholdIncome" ||
          key === "monthlyIncome"
      ) {
        return `RM ${value.toLocaleString("en-MY", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      if (key === "fileSizeBytes") {
        return formatFileSize(value);
      }

      return String(value);
    }

    if (typeof value === "string") {
      if (
          key === "assessedAt" ||
          key === "dateOfBirth" ||
          key === "issuedAt" ||
          key === "expiresAt"
      ) {
        return formatDate(value);
      }

      if (
          key === "status" ||
          key === "employmentStatus" ||
          key === "requirementType" ||
          key === "documentType"
      ) {
        return formatStatus(value);
      }

      return value;
    }

    return "Not provided";
  };

  const applicationData = useMemo(() => {
    if (!application.application_data) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(
          application.application_data
      );

      const result = strApplicationDataSchema.safeParse(parsed);

      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }, [application.application_data]);

  const supportingDocuments =
      applicationData?.supportingDocuments ?? [];

  const preliminaryEligibility =
      applicationData?.preliminaryEligibility;

  const renderFields = (data: Record<string, unknown>) => {
    return (
        <div className="application-details__grid">
          {Object.entries(data).map(([key, value]) => {
            const isMissing =
                value === null ||
                value === undefined ||
                value === "";

            const isBoolean = typeof value === "boolean";

            const isIncome =
                key === "monthlyPersonalIncome" ||
                key === "monthlyHouseholdIncome" ||
                key === "monthlyIncome";

            return (
                <div
                    key={key}
                    className={`application-details__field-card ${
                        isIncome
                            ? "application-details__field-card--income"
                            : ""
                    }`}
                >
                  <span className="application-details__field-label">
                    {formatLabel(key)}
                  </span>

                  {isBoolean && !isMissing ? (
                      <span
                          className={`application-details__value-badge ${
                              value
                                  ? "application-details__value-badge--yes"
                                  : "application-details__value-badge--no"
                          }`}
                      >
                        {formatValue(key, value)}
                      </span>
                  ) : (
                      <strong
                          className={`application-details__field-value ${
                              isMissing
                                  ? "application-details__field-value--missing"
                                  : ""
                          }`}
                      >
                        {formatValue(key, value)}
                      </strong>
                  )}
                </div>
            );
          })}
        </div>
    );
  };

  const tabs: ApplicationDetailsTab[] = [
    "personal",
    "residence",
    "household",
    "documents",
    "eligibility",
  ];

  return (
      <div className="application-details">
        <div className="application-details__header">
          <div>
            <h2>Application Details</h2>

            <p className="application-details__reference">
              {application.reference_no}
            </p>
          </div>

          <span
              className={`application-details__status application-details__status--${application.status}`}
              aria-label={`STR application status: ${
                  applicationStatusLabels[application.status]
              }`}
          >
            {applicationStatusLabels[application.status]}
          </span>
        </div>

        <div className="application-details__overview">
          <div className="application-details__grid">
            <div className="application-details__field">
              <span>Applicant</span>

              <strong>
                {application.applicant_name}
              </strong>
            </div>

            <div className="application-details__field">
              <span>Submitted</span>

              <strong>
                {formatDate(application.submitted_at)}
              </strong>
            </div>

            <div className="application-details__field">
              <span>Application Type</span>

              <strong>STR Assistance</strong>
            </div>

            <div className="application-details__field">
              <span>Application Status</span>

              <strong>
                {applicationStatusLabels[application.status]}
              </strong>
            </div>
          </div>
        </div>

        <div className="application-details__content">
          <div
              className="application-details__tabs"
              role="tablist"
              aria-label="Application information"
          >
            {tabs.map((tab) => (
                <button
                    key={tab}
                    id={`application-details-tab-${tab}`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    aria-controls={`application-details-panel-${tab}`}
                    className={`application-details__tab ${
                        activeTab === tab
                            ? "application-details__tab--active"
                            : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                >
                  {applicationDetailsTabLabels[tab]}
                </button>
            ))}
          </div>

          <div
              key={`${application.id}-${activeTab}`}
              id={`application-details-panel-${activeTab}`}
              className="application-details__panel"
              role="tabpanel"
              aria-labelledby={`application-details-tab-${activeTab}`}
              tabIndex={0}
          >
            {!applicationData && activeTab !== "eligibility" ? (
                <div className="application-details__empty-state">
                  <h3>Application Information Unavailable</h3>

                  <p>
                    The submitted application data is unavailable or does
                    not match the supported STR application schema.
                  </p>
                </div>
            ) : (
                <>
                  {/* Personal information */}
                  {activeTab === "personal" && applicationData && (
                      <div className="application-details__sections">
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Personal Information</h3>

                              <p>
                                Applicant identity and demographic details.
                              </p>
                            </div>
                          </div>

                          {renderFields(applicationData.applicant)}
                        </div>

                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Contact Information</h3>

                              <p>
                                Contact details provided by the applicant.
                              </p>
                            </div>
                          </div>

                          {renderFields(applicationData.contact)}
                        </div>

                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Employment Information</h3>

                              <p>
                                Employment and education-related details.
                              </p>
                            </div>
                          </div>

                          {renderFields(applicationData.employment)}
                        </div>
                      </div>
                  )}

                  {/* Residential information */}
                  {activeTab === "residence" && applicationData && (
                      <div className="application-details__sections">
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Registered Address</h3>

                              <p>
                                Residential address submitted with this
                                application.
                              </p>
                            </div>
                          </div>

                          <div className="application-details__address">
                            <span>Full Address</span>

                            <strong>
                              {[
                                applicationData.address.addressLine1,
                                applicationData.address.addressLine2,
                                applicationData.address.postcode,
                                applicationData.address.city,
                                applicationData.address.stateTerritory,
                                applicationData.address.countryCode,
                              ]
                                  .filter(Boolean)
                                  .join(", ") || "Not provided"}
                            </strong>
                          </div>

                          {renderFields(applicationData.address)}
                        </div>
                      </div>
                  )}

                  {/* Household and financial information */}
                  {activeTab === "household" && applicationData && (
                      <div className="application-details__sections">
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Financial Information</h3>

                              <p>
                                Declared personal and household financial
                                information.
                              </p>
                            </div>
                          </div>

                          {renderFields(applicationData.financial)}
                        </div>

                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Household Members</h3>

                              <p>
                                Individuals recorded in the applicant's
                                household.
                              </p>
                            </div>

                            <span className="application-details__count">
                              {applicationData.household.members.length}{" "}
                              {applicationData.household.members.length === 1
                                  ? "Member"
                                  : "Members"}
                            </span>
                          </div>

                          {applicationData.household.members.length === 0 ? (
                              <div className="application-details__empty-state">
                                <p>No household members recorded.</p>
                              </div>
                          ) : (
                              <div className="application-details__records">
                                {applicationData.household.members.map(
                                    (member, index) => (
                                        <div
                                            key={index}
                                            className="application-details__record"
                                        >
                                          <div className="application-details__record-heading">
                                            <div className="application-details__record-avatar">
                                              {index + 1}
                                            </div>

                                            <div>
                                              <h4>
                                                {member.fullName ||
                                                    `Household Member ${index + 1}`}
                                              </h4>

                                              <p>
                                                {formatValue(
                                                    "relationship",
                                                    member.relationship
                                                )}
                                              </p>
                                            </div>
                                          </div>

                                          {renderFields(member)}
                                        </div>
                                    )
                                )}
                              </div>
                          )}
                        </div>

                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Household Declaration</h3>

                              <p>
                                Completeness of the submitted household
                                information.
                              </p>
                            </div>
                          </div>

                          {renderFields({
                            informationComplete:
                            applicationData.household.informationComplete,
                          })}
                        </div>
                      </div>
                  )}

                  {/* Supporting documents */}
                  {activeTab === "documents" && applicationData && (
                      <div className="application-details__sections">
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Supporting Documents</h3>

                              <p>
                                Supporting document information submitted
                                with this STR application.
                              </p>
                            </div>

                            <span className="application-details__count">
                              {supportingDocuments.length}{" "}
                              {supportingDocuments.length === 1
                                  ? "Document"
                                  : "Documents"}
                            </span>
                          </div>

                          {supportingDocuments.length === 0 ? (
                              <div className="application-details__empty-state">
                                <h3>No Supporting Documents</h3>

                                <p>
                                  No supporting document metadata was
                                  submitted with this application.
                                </p>
                              </div>
                          ) : (
                              <>
                                <p className="application-details__notice">
                                  Only supporting document metadata is
                                  available in the STR mock system.
                                  Original files are not transferred or
                                  stored in this application record.
                                </p>

                                <div className="application-details__records">
                                  {supportingDocuments.map(
                                      (document, index) => (
                                          <div
                                              key={`${document.documentId}-${index}`}
                                              className="application-details__record application-details__record--document"
                                          >
                                            <div className="application-details__record-heading">
                                              <div className="application-details__record-avatar">
                                                {index + 1}
                                              </div>

                                              <div className="application-details__document-heading">
                                                <h4>
                                                  {document.originalFilename}
                                                </h4>

                                                <p>
                                                  {formatValue(
                                                      "documentType",
                                                      document.documentType
                                                  )}
                                                </p>
                                              </div>
                                            </div>

                                            {renderFields({
                                              documentId:
                                              document.documentId,

                                              requirementType:
                                              document.requirementType,

                                              documentType:
                                              document.documentType,

                                              originalFilename:
                                              document.originalFilename,

                                              mimeType:
                                              document.mimeType,

                                              fileSizeBytes:
                                              document.fileSizeBytes,

                                              issuedAt:
                                              document.issuedAt,

                                              expiresAt:
                                              document.expiresAt,
                                            })}
                                          </div>
                                      )
                                  )}
                                </div>
                              </>
                          )}
                        </div>
                      </div>
                  )}

                  {/* Eligibility and application processing */}
                  {activeTab === "eligibility" && (
                      <div className="application-details__sections">

                        {/* BantuanKu preliminary assessment */}
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Preliminary Eligibility Assessment</h3>

                              <p>
                                Eligibility screening performed by
                                BantuanKu before application submission.
                              </p>
                            </div>

                            <span className="application-details__count">
                              BantuanKu
                            </span>
                          </div>

                          {preliminaryEligibility ? (
                              <>
                                <div
                                    className={`application-details__eligibility-result application-details__eligibility-result--${preliminaryEligibility.status}`}
                                >
                                  <span>
                                    Preliminary Assessment Result
                                  </span>

                                  <strong>
                                    {
                                      preliminaryEligibilityStatusLabels[
                                          preliminaryEligibility.status
                                          ]
                                    }
                                  </strong>

                                  <p>
                                    {
                                      preliminaryEligibilityDescriptions[
                                          preliminaryEligibility.status
                                          ]
                                    }
                                  </p>
                                </div>

                                <p className="application-details__notice">
                                  This assessment is provided for officer
                                  reference only. It does not represent a
                                  final STR approval or rejection decision.
                                </p>

                                {renderFields({
                                  criteriaVersion:
                                  preliminaryEligibility.criteriaVersion,

                                  assessedAt:
                                  preliminaryEligibility.assessedAt,
                                })}
                              </>
                          ) : (
                              <div className="application-details__empty-state">
                                <h3>
                                  {applicationData
                                      ? "No Assessment Available"
                                      : "Assessment Information Unavailable"}
                                </h3>

                                <p>
                                  {applicationData
                                      ? "No preliminary eligibility assessment was submitted with this application."
                                      : "The submitted application data is unavailable or does not match the supported STR application schema."}
                                </p>
                              </div>
                          )}
                        </div>

                        {/* STR administrative processing status */}
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>STR Application Processing</h3>

                              <p>
                                Current administrative processing status
                                recorded by the STR mock system.
                              </p>
                            </div>

                            <span className="application-details__count">
                              STR
                            </span>
                          </div>

                          <div className="application-details__processing-result">
                            <span className="application-details__processing-label">
                              Current Application Status
                            </span>

                            <span
                                className={`application-details__status application-details__status--${application.status}`}
                            >
                              {applicationStatusLabels[application.status]}
                            </span>

                            <p>
                              {application.status === "submitted" &&
                                  "The application has been received by the STR mock system and is awaiting administrative review."}

                              {application.status === "under_review" &&
                                  "The application is currently being reviewed by the STR administration."}

                              {application.status === "approved" &&
                                  "The application has been approved through the simulated STR administrative review process."}

                              {application.status === "rejected" &&
                                  "The application has been rejected through the simulated STR administrative review process."}
                            </p>
                          </div>

                          <div className="application-details__grid">
                            <div className="application-details__field-card">
                              <span className="application-details__field-label">
                                Reference Number
                              </span>

                              <strong className="application-details__field-value">
                                {application.reference_no}
                              </strong>
                            </div>

                            <div className="application-details__field-card">
                              <span className="application-details__field-label">
                                Application Year
                              </span>

                              <strong className="application-details__field-value">
                                {application.application_year}
                              </strong>
                            </div>

                            <div className="application-details__field-card">
                              <span className="application-details__field-label">
                                Submitted Date
                              </span>

                              <strong className="application-details__field-value">
                                {formatDate(application.submitted_at)}
                              </strong>
                            </div>

                            <div className="application-details__field-card">
                              <span className="application-details__field-label">
                                Last Updated
                              </span>

                              <strong className="application-details__field-value">
                                {formatDate(application.updated_at)}
                              </strong>
                            </div>
                          </div>

                          <p className="application-details__notice">
                            STR application processing status is
                            independent of BantuanKu's preliminary
                            eligibility assessment. A potentially eligible
                            applicant is not automatically approved, and
                            a preliminary assessment does not replace
                            administrative review.
                          </p>
                        </div>
                      </div>
                  )}
                </>
            )}
          </div>
        </div>

        <div className="application-details__footer">
          <button
              type="button"
              className="application-details__back"
              onClick={onBack}
          >
            Back to Overview
          </button>

          <button
              type="button"
              className="application-details__update"
              onClick={() => onUpdateStatus(application)}
          >
            Update Status
          </button>
        </div>
      </div>
  );
}
