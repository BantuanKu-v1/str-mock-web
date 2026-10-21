import type { Application } from "../../types/applications";
import StatusBadge from "../ui/StatusBadge";

type ApplicationTableProps = {
  applications: Application[];
  title?: string;
  onUpdateStatus?: (application: Application) => void;
};

export default function ApplicationTable({
  applications,
  title = "Applications",
  onUpdateStatus,
}: ApplicationTableProps) {
  const formatDate = (date: string) => {
    return new Date(date.replace(" ", "T") + "Z").toLocaleString(
        "en-MY",
        {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Kuala_Lumpur",
        }
    );
  };

  return (
      <div className="application-table">
        <div className="application-table__header">
          <h2>{title}</h2>
        </div>

        <div className="application-table__wrapper">
          <table>
            <thead>
            <tr>
              <th>Reference No.</th>
              <th>Applicant</th>
              <th>Application Year</th>
              <th>Submitted At</th>
              <th>Status</th>
              {onUpdateStatus && <th>Action</th>}
            </tr>
            </thead>

            <tbody>
            {applications.length === 0 ? (
                <tr>
                  <td
                      colSpan={onUpdateStatus ? 6 : 5}
                      className="application-table__empty"
                  >
                    No applications found.
                  </td>
                </tr>
            ) : (
                applications.map((application) => (
                    <tr key={application.id}>
                      <td className="application-table__reference">
                        {application.reference_no}
                      </td>

                      <td>{application.applicant_name}</td>

                      <td>{application.application_year}</td>

                      <td>{formatDate(application.submitted_at)}</td>

                      <td>
                        <StatusBadge status={application.status} />
                      </td>

                      {onUpdateStatus && (
                          <td>
                            {application.status === "approved" ||
                            application.status === "rejected" ? (
                                <span className="application-table__final">
                                  Finalized
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="application-table__action"
                                    onClick={() => onUpdateStatus(application)}
                                >
                                  Update Status
                                </button>
                            )}
                          </td>
                      )}
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
}
