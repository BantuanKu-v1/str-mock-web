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

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

async function parseResponse<T>(
    response: Response
): Promise<T> {
  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success || result.data == null) {
    throw new ApiError(
        result.message || "API request failed",
        response.status
    );
  }

  return result.data;
}

export async function getApplications(): Promise<Application[]> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<Application[]>(response);
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

  return parseResponse<Application>(response);
}
