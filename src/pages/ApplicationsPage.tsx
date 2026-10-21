import { useState } from "react";
import ApplicationTable from "../components/applications/ApplicationTable";
import UpdateStatusModal from "../components/applications/UpdateStatusModal";
import type {
  Application,
  ApplicationStatus,
} from "../types/applications";

type ApplicationsPageProps = {
  applications: Application[];
  onUpdateStatus: (applicationId: string, status: ApplicationStatus) => void;
};

export default function ApplicationsPage({
  applications,
  onUpdateStatus,
}: ApplicationsPageProps) {
  const [selectedApplication, setSelectedApplication] =
      useState<Application | null>(null);

  const handleSaveStatus = (
      applicationId: string,
      status: ApplicationStatus
  ) => {
    onUpdateStatus(applicationId, status);
    setSelectedApplication(null);
  };

  return (
      <div className="applications-page">
        <ApplicationTable
            applications={applications}
            onUpdateStatus={setSelectedApplication}
        />

        {selectedApplication && (
            <UpdateStatusModal
                key={selectedApplication.id}
                application={selectedApplication}
                onClose={() => setSelectedApplication(null)}
                onSave={handleSaveStatus}
            />
        )}
      </div>
  );
}
