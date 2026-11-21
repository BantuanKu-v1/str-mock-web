import { useMemo, useState } from "react";
import type { Application } from "../../types/applications.ts";
import { strApplicationDataSchema } from "../../../worker/schemas/applicationSchema";

type ApplicationDetailsProps = {
  application: Application;
  onBack: () => void;
  onUpdateStatus: (application: Application) => void;
};

type DetailsTab = "personal" | "residence" | "household" | "eligibility";

export default function ApplicationDetails({
  application,
  onBack,
  onUpdateStatus,
}: ApplicationDetailsProps) {
  const [activeTab, setActiveTab] = useState<DetailsTab>("personal");

  const formatStatus = (status: string) => {
    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
        ? date
        : parsedDate.toLocaleDateString("en-MY", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
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

      return String(value);
    }

    if (typeof value === "string") {
      if (
          key === "assessedAt" ||
          key === "dateOfBirth"
      ) {
        return formatDate(value);
      }

      if (
          key === "status" ||
          key === "employmentStatus"
      ) {
        return formatStatus(value);
      }

      return value;
    }

    return "Not provided";
  };

  const applicationData = useMemo(() => {
    if (!application.application_data) return null;

    try {
      const parsed: unknown = JSON.parse(application.application_data);
      const result = strApplicationDataSchema.safeParse(parsed);

      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }, [application.application_data]);

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

  const tabs: { id: DetailsTab; label: string }[] = [
    { id: "personal", label: "Personal" },
    { id: "residence", label: "Residence" },
    { id: "household", label: "Household" },
    { id: "eligibility", label: "Eligibility" },
  ];

  return (
      <div className="application-details">
        <div className="application-details__header">
          <div>
            {/*<p className="application-details__breadcrumb">*/}
            {/*  Applications / Application Details*/}
            {/*</p>*/}

            <h2>Application Details</h2>

            <p className="application-details__reference">
              {application.reference_no}
            </p>
          </div>

          <span
              className={`application-details__status application-details__status--${application.status}`}
          >
            {formatStatus(application.status)}
          </span>
        </div>

        <div className="application-details__overview">
          <div className="application-details__grid">
            <div className="application-details__field">
              <span>Applicant</span>
              <strong>{application.applicant_name}</strong>
            </div>

            <div className="application-details__field">
              <span>Submitted</span>
              <strong>{formatDate(application.submitted_at)}</strong>
            </div>

            <div className="application-details__field">
              <span>Application Type</span>
              <strong>STR Assistance</strong>
            </div>

            <div className="application-details__field">
              <span>Status</span>
              <strong>{formatStatus(application.status)}</strong>
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
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`application-details__tab ${
                        activeTab === tab.id
                            ? "application-details__tab--active"
                            : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
            ))}
          </div>

          <div
              className="application-details__panel"
              role="tabpanel"
          >
            {!applicationData ? (
                <div className="application-details__empty-state">
                  <h3>Application Information Unavailable</h3>
                  <p>
                    The submitted application data is unavailable or does
                    not match the supported STR application schema.
                  </p>
                </div>
            ) : (
                <>
                  {activeTab === "personal" && (
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

                  {activeTab === "residence" && (
                      <div className="application-details__sections">
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Registered Address</h3>
                              <p>
                                Residential address submitted with this application.
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

                  {activeTab === "household" && (
                      <div className="application-details__sections">
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Financial Information</h3>
                              <p>
                                Declared personal and household financial information.
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
                                Individuals recorded in the applicant's household.
                              </p>
                            </div>

                            <span className="application-details__count">
                              {applicationData.household.members.length} Members
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
                                Completeness of the submitted household information.
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

                  {activeTab === "eligibility" && (
                      <div className="application-details__sections">
                        <div className="application-details__section-card">
                          <div className="application-details__section-heading">
                            <div>
                              <h3>Preliminary Eligibility Assessment</h3>
                              <p>
                                Screening information submitted by BantuanKu.
                              </p>
                            </div>
                          </div>

                          {applicationData.preliminaryEligibility ? (
                              <>
                                <div
                                    className={`application-details__eligibility-result application-details__eligibility-result--${applicationData.preliminaryEligibility.status}`}
                                >
                                  <span>Preliminary Assessment Result</span>

                                  <strong>
                                    {formatStatus(
                                        applicationData.preliminaryEligibility.status
                                    )}
                                  </strong>

                                  <p>
                                    This result is provided for officer review
                                    and is not a final STR approval decision.
                                  </p>
                                </div>

                                <p className="application-details__notice">
                                  The preliminary eligibility assessment is
                                  separate from the official STR application
                                  processing status.
                                </p>

                                {renderFields({
                                  criteriaVersion:
                                  applicationData.preliminaryEligibility.criteriaVersion,
                                  assessedAt:
                                  applicationData.preliminaryEligibility.assessedAt,
                                })}
                              </>
                          ) : (
                              <div className="application-details__empty-state">
                                <h3>No Assessment Available</h3>
                                <p>
                                  No preliminary eligibility assessment
                                  was submitted with this application.
                                </p>
                              </div>
                          )}
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
