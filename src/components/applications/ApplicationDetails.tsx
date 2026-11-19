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
      if (key === "assessedAt") {
        return formatDate(value);
      }

      if (key === "status" || key === "employmentStatus") {
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
          {Object.entries(data).map(([key, value]) => (
              <div
                  key={key}
                  className="application-details__field"
              >
                <span>{formatLabel(key)}</span>
                <strong>{formatValue(key, value)}</strong>
              </div>
          ))}
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
                <p className="application-details__empty">
                  Application details are unavailable or do not match
                  the supported STR application schema.
                </p>
            ) : (
                <>
                  {activeTab === "personal" && (
                      <div className="application-details__sections">
                        <div className="application-details__section">
                          <h3>Personal Information</h3>
                          {renderFields(applicationData.applicant)}
                        </div>

                        <div className="application-details__section">
                          <h3>Contact Information</h3>
                          {renderFields(applicationData.contact)}
                        </div>

                        <div className="application-details__section">
                          <h3>Employment Information</h3>
                          {renderFields(applicationData.employment)}
                        </div>
                      </div>
                  )}

                  {activeTab === "residence" && (
                      <div className="application-details__section">
                        <h3>Residence Information</h3>
                        {renderFields(applicationData.address)}
                      </div>
                  )}

                  {activeTab === "household" && (
                      <div className="application-details__sections">
                        <div className="application-details__section">
                          <h3>Financial Information</h3>
                          {renderFields(applicationData.financial)}
                        </div>

                        <div className="application-details__section">
                          <h3>Household Information</h3>

                          <div className="application-details__field">
                            <span>Total Household Members</span>
                            <strong>
                              {applicationData.household.members.length}
                            </strong>
                          </div>

                          {applicationData.household.members.length === 0 ? (
                              <p className="application-details__empty">
                                No household members recorded.
                              </p>
                          ) : (
                              <div className="application-details__records">
                                {applicationData.household.members.map(
                                    (member, index) => (
                                        <div
                                            key={index}
                                            className="application-details__record"
                                        >
                                          <h4>Household Member {index + 1}</h4>
                                          {renderFields(member)}
                                        </div>
                                    )
                                )}
                              </div>
                          )}
                        </div>
                      </div>
                  )}

                  {activeTab === "eligibility" && (
                      <div className="application-details__section">
                        <h3>Preliminary Eligibility</h3>

                        {applicationData.preliminaryEligibility ? (
                            <>
                              <p className="application-details__notice">
                                This is a preliminary assessment and does
                                not represent final STR approval.
                              </p>

                              {renderFields(
                                  applicationData.preliminaryEligibility
                              )}
                            </>
                        ) : (
                            <p className="application-details__empty">
                              No preliminary eligibility assessment
                              was submitted.
                            </p>
                        )}
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
