import type { ApplicationStatus } from "../../types/applications";

type StatusBadgeProps = {
  status: ApplicationStatus;
};

const statusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function StatusBadge({
    status
}: StatusBadgeProps) {
  return (
      <span className={`status-badge status-badge--${status}`}>
        {statusLabels[status]}
      </span>
  );
}
