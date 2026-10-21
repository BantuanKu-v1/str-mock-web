const API_BASE_URL = "/api/v1/admin/auth";

type AuthResponse = {
  success: boolean;
  message?: string;
};

type SessionResponse = AuthResponse & {
  data?: {
    username: string;
  };
};

export async function login(
    username: string,
    password: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const result: AuthResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Login failed.");
  }
}

export async function checkSession(): Promise<string | null> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to verify administrator session.");
  }

  const result: SessionResponse = await response.json();

  if (!result.success || !result.data?.username) {
    throw new Error("Invalid administrator session response.");
  }

  return result.data.username;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  const result: AuthResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to log out.");
  }
}
