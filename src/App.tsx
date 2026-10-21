import { useState } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";
import type { SidebarPage } from "./components/layout/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import { mockApplications } from "./services/mockApplicationService";
import type {
  Application,
  ApplicationStatus,
} from "./types/applications";

const pageInfo: Record<
    SidebarPage,
    {
      title: string;
      description: string;
    }
> = {
  dashboard: {
    title: "Dashboard",
    description: "Overview of STR applications and their processing status.",
  },
  applications: {
    title: "Applications",
    description: "View and manage submitted STR applications.",
  },
  "api-docs": {
    title: "API Documentation",
    description: "Integration guidelines for third-party systems.",
  },
};

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ["under_review"],
  under_review: ["approved", "rejected"],
  approved: [],
  rejected: [],
};

function App() {
  const [activePage, setActivePage] = useState<SidebarPage>("dashboard");

  const [applications, setApplications] = useState<Application[]>(
      mockApplications
  );

  const currentPage = pageInfo[activePage];

  const handleUpdateStatus = (
      applicationId: string,
      newStatus: ApplicationStatus
  ) => {
    setApplications((previousApplications) =>
        previousApplications.map((application) => {
          if (application.id !== applicationId) {
            return application;
          }

          if (!allowedTransitions[application.status].includes(newStatus)) {
            return application;
          }

          return {
            ...application,
            status: newStatus,
            updated_at: new Date().toISOString(),
          };
        })
    );
  };

  return (
      <DashboardLayout
          activePage={activePage}
          onNavigate={setActivePage}
          title={currentPage.title}
          description={currentPage.description}
      >
        {activePage === "dashboard" ? (
            <DashboardPage applications={applications} />
        ) : activePage === "applications" ? (
            <ApplicationsPage
                applications={applications}
                onUpdateStatus={handleUpdateStatus}
            />
        ) : (
            <div className="page-placeholder">
              <h2>API Documentation</h2>
              <p>
                API integration documentation will be implemented later.
              </p>
            </div>
        )}
      </DashboardLayout>
  );
}

export default App;
