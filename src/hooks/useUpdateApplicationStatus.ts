import { useState } from "react";
import type { Application, ApplicationStatus } from "../types/applications";

type UpdateStatusHandler = (
    applicationId: string,
    status: ApplicationStatus
) => Promise<void>;

export default function useUpdateApplicationStatus(
    onUpdateStatus: UpdateStatusHandler
) {
  const [selectedApplication, setSelectedApplication] =
      useState<Application | null>(null);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenModal = (application: Application) => {
    setError("");
    setSelectedApplication(application);
  };

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

  return {
    selectedApplication,
    error,
    isSaving,
    handleOpenModal,
    handleCloseModal,
    handleSaveStatus,
  };
}
