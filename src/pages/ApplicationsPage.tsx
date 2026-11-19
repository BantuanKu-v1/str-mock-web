import ApplicationTable from "../components/applications/ApplicationTable";
import type { Application } from "../types/applications";

type ApplicationsPageProps = {
  applications: Application[];
  onViewDetails: (application: Application) => void;
};

export default function ApplicationsPage({
  applications,
  onViewDetails,
}: ApplicationsPageProps) {
  return (
      <div className="applications-page">
        <ApplicationTable
            applications={applications}
            onViewDetails={onViewDetails}
        />
      </div>
  );
}
