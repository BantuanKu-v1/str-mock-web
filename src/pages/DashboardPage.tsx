import StatCard from "../components/ui/StatCard";
import ApplicationTable from "../components/applications/ApplicationTable";
import type { Application } from "../types/applications";

type DashboardPageProps = {
  applications: Application[];
};

export default function DashboardPage({
    applications
}: DashboardPageProps) {
  const statistics = {
    total: applications.length,
    submitted: applications.filter(
        (application) => application.status === "submitted"
    ).length,
    underReview: applications.filter(
        (application) => application.status === "under_review"
    ).length,
    approved: applications.filter(
        (application) => application.status === "approved"
    ).length,
    rejected: applications.filter(
        (application) => application.status === "rejected"
    ).length,
  };

  const recentApplications = [...applications]
      .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
      .slice(0, 5);

  return (
      <div className="dashboard-page">
        <div className="dashboard-page__section">
          <div className="dashboard-page__section-header">
            <h2>Application Overview</h2>
            <p>
              Summary of STR applications submitted through third-party systems.
            </p>
          </div>

          <div className="dashboard-page__stats">
            <StatCard
                title="Total Applications"
                value={statistics.total}
                variant="default"
            />

            <StatCard
                title="Submitted"
                value={statistics.submitted}
                variant="info"
            />

            <StatCard
                title="Under Review"
                value={statistics.underReview}
                variant="warning"
            />

            <StatCard
                title="Approved"
                value={statistics.approved}
                variant="success"
            />

            <StatCard
                title="Rejected"
                value={statistics.rejected}
                variant="danger"
            />
          </div>
        </div>

        <div className="dashboard-page__section">
          <ApplicationTable
              applications={recentApplications}
              title="Recent Applications"
          />
        </div>
      </div>
  );
}
