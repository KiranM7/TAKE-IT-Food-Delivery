const API_BASE_URL = "http://localhost:8080/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Read the response as text first so plain-text responses also work.
  const responseText = await response.text();

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Please log in to continue.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to perform this action.");
    }

    if (response.status === 404) {
      throw new Error("The requested resource was not found.");
    }

    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}
