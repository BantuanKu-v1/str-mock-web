import { useState } from "react";
import type {
  Application,
  ApplicationStatus,
} from "../../types/applications";
import StatusBadge from "../ui/StatusBadge";

type UpdateStatusModalProps = {
  application: Application;
  onClose: () => void;
  onSave: (
      applicationId: string,
      status: ApplicationStatus
  ) => Promise<void>;
  isSaving: boolean;
  error: string;
};

const statusOptions: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ["under_review"],
  under_review: ["approved", "rejected"],
  approved: [],
  rejected: [],
};

const statusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function UpdateStatusModal({
  application,
  onClose,
  onSave,
  isSaving,
  error,
}: UpdateStatusModalProps) {
  const availableStatuses = statusOptions[application.status];

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "">(
      availableStatuses[0] ?? ""
  );

  // Handle saving the selected status
  const handleSave = () => {
    if (!selectedStatus || isSaving) return;

    if (!availableStatuses.includes(selectedStatus)) return;

    void onSave(application.id, selectedStatus);
  };

  // Prevent closing the modal while saving
  const handleClose = () => {
    if (isSaving) return;

    onClose();
  };

  return (
      <div
          className="status-modal__overlay"
          onClick={handleClose}
      >
        <div
            className="status-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
            onClick={(event) => event.stopPropagation()}
        >
          <div className="status-modal__header">
            <h2 id="status-modal-title">
              Update Application Status
            </h2>

            <button
                type="button"
                className="status-modal__close"
                onClick={handleClose}
                disabled={isSaving}
                aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="status-modal__body">
            <div className="status-modal__info">
              <div className="status-modal__info-item">
                <span>Reference Number</span>

                <strong>{application.reference_no}</strong>
              </div>

              <div className="status-modal__info-item">
                <span>Applicant</span>

                <strong>{application.applicant_name}</strong>
              </div>

              <div className="status-modal__info-item">
                <span>Current Status</span>

                <StatusBadge status={application.status} />
              </div>
            </div>

            {availableStatuses.length > 0 ? (
                <div className="status-modal__field">
                  <label htmlFor="application-status">
                    New Status
                  </label>

                  <select
                      id="application-status"
                      value={selectedStatus}
                      onChange={(event) =>
                          setSelectedStatus(
                              event.target.value as ApplicationStatus
                          )
                      }
                      disabled={isSaving}
                  >
                    {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                    ))}
                  </select>
                </div>
            ) : (
                <p className="status-modal__notice">
                  This application has reached its final status and cannot
                  be updated.
                </p>
            )}

            {error && (
                <div
                    className="login-page__error"
                    role="alert"
                >
                  {error}
                </div>
            )}
          </div>

          <div className="status-modal__footer">
            <button
                type="button"
                className="status-modal__cancel"
                onClick={handleClose}
                disabled={isSaving}
            >
              Cancel
            </button>

            {availableStatuses.length > 0 && (
                <button
                    type="button"
                    className="status-modal__save"
                    onClick={handleSave}
                    disabled={!selectedStatus || isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
            )}
          </div>
        </div>
      </div>
  );
}
