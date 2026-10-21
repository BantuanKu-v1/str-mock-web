import { useState } from "react";
import ApplicationTable from "../components/applications/ApplicationTable";
import UpdateStatusModal from "../components/applications/UpdateStatusModal";
import type {
  Application,
  ApplicationStatus,
} from "../types/applications";

type ApplicationsPageProps = {
  applications: Application[];
  onUpdateStatus: (
      applicationId: string,
      status: ApplicationStatus
  ) => Promise<void>;
};

export default function ApplicationsPage({
  applications,
  onUpdateStatus,
}: ApplicationsPageProps) {
  const [selectedApplication, setSelectedApplication] =
      useState<Application | null>(null);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Open the Update Status modal
  const handleOpenModal = (application: Application) => {
    setError("");
    setSelectedApplication(application);
  };

  // Close the Update Status modal
  const handleCloseModal = () => {
    if (isSaving) return;

    setSelectedApplication(null);
    setError("");
  };

  // Save the new status through the backend API
  const handleSaveStatus = async (
      applicationId: string,
      status: ApplicationStatus
  ): Promise<void> => {
    if (isSaving) return;

    setError("");
    setIsSaving(true);

    try {
      await onUpdateStatus(applicationId, status);

      setSelectedApplication(null);
    } catch (error) {
      setError(
          error instanceof Error
              ? error.message
              : "Failed to update application status."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
      <div className="applications-page">
        <ApplicationTable
            applications={applications}
            onUpdateStatus={handleOpenModal}
        />

        {selectedApplication && (
            <UpdateStatusModal
                key={selectedApplication.id}
                application={selectedApplication}
                onClose={handleCloseModal}
                onSave={handleSaveStatus}
                isSaving={isSaving}
                error={error}
            />
        )}
      </div>
  );
}
