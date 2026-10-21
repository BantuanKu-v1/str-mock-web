import type {
  Application,
  ApplicationStatus,
} from "../types/applications";

const API_BASE_URL = "/api/v1/admin";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getApplications(): Promise<Application[]> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve applications.");
  }

  const result: ApiResponse<Application[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "Failed to retrieve applications.");
  }

  return result.data;
}

export async function updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
): Promise<Application> {
  const response = await fetch(
      `${API_BASE_URL}/applications/${encodeURIComponent(applicationId)}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
  );

  const result: ApiResponse<Application> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
        result.message || "Failed to update application status."
    );
  }

  return result.data;
}
