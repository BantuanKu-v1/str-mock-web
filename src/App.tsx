import { useEffect, useState } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";
import type { SidebarPage } from "./components/layout/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import LoginPage from "./pages/LoginPage";
import { checkSession } from "./services/authService";
import {
  getApplications,
  updateApplicationStatus,
} from "./services/applicationService";
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

function App() {
  const [activePage, setActivePage] = useState<SidebarPage>("dashboard");

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");

  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  // Check administrator session when the application starts
  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        const username = await checkSession();

        if (!cancelled) {
          setAdminUsername(username);
        }
      } catch (error) {
        if (!cancelled) {
          setSessionError(
              error instanceof Error
                  ? error.message
                  : "Unable to verify session."
          );
        }
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    };

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Retrieve applications after administrator authentication
  useEffect(() => {
    if (!adminUsername) return;

    let cancelled = false;

    const loadApplications = async () => {
      setIsLoadingApplications(true);
      setApplicationsError("");

      try {
        const data = await getApplications();

        if (!cancelled) {
          setApplications(data);
        }
      } catch (error) {
        if (!cancelled) {
          setApplicationsError(
              error instanceof Error
                  ? error.message
                  : "Failed to load applications."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingApplications(false);
        }
      }
    };

    void loadApplications();

    return () => {
      cancelled = true;
    };
  }, [adminUsername]);

  // Handle successful administrator login
  const handleLoginSuccess = async () => {
    const username = await checkSession();

    if (!username) {
      throw new Error(
          "Login succeeded, but the session could not be verified."
      );
    }

    setAdminUsername(username);
    setSessionError("");
  };

  // Update application status through Hono API
  const handleUpdateStatus = async (
      applicationId: string,
      newStatus: ApplicationStatus
  ): Promise<void> => {
    const updatedApplication = await updateApplicationStatus(
        applicationId,
        newStatus
    );

    setApplications((previousApplications) =>
        previousApplications.map((application) =>
            application.id === applicationId
                ? updatedApplication
                : application
        )
    );
  };

  // Display loading state while checking session
  if (isCheckingSession) {
    return (
        <div className="app-layout__content">
          Checking administrator session...
        </div>
    );
  }

  // Display session verification error
  if (sessionError) {
    return (
        <div className="app-layout__content">
          <p>{sessionError}</p>

          <button
              type="button"
              onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
    );
  }

  // Display login page when administrator is not authenticated
  if (!adminUsername) {
    return (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
    );
  }

  const currentPage = pageInfo[activePage];

  return (
      <DashboardLayout
          activePage={activePage}
          onNavigate={setActivePage}
          title={currentPage.title}
          description={currentPage.description}
      >
        {isLoadingApplications ? (
            <div className="applications-page">
              <p>Loading applications...</p>
            </div>
        ) : applicationsError ? (
            <div className="applications-page" role="alert">
              <p>{applicationsError}</p>

              <button
                  type="button"
                  onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
        ) : activePage === "dashboard" ? (
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
