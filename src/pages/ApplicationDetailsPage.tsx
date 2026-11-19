import ApplicationDetails from "../components/applications/ApplicationDetails";
import UpdateStatusModal from "../components/applications/UpdateStatusModal";
import useUpdateApplicationStatus from "../hooks/useUpdateApplicationStatus";
import type {
  Application,
  ApplicationStatus,
} from "../types/applications";

type ApplicationDetailsPageProps = {
  application: Application;
  onBack: () => void;
  onUpdateStatus: (
      applicationId: string,
      status: ApplicationStatus
  ) => Promise<void>;
};

export default function ApplicationDetailsPage({
    application,
    onBack,
    onUpdateStatus
}: ApplicationDetailsPageProps) {
  const {
    selectedApplication,
    error,
    isSaving,
    handleOpenModal,
    handleCloseModal,
    handleSaveStatus,
  } = useUpdateApplicationStatus(onUpdateStatus);

  return (
      <div className="application-details-page">
        <ApplicationDetails
            application={application}
            onBack={onBack}
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
