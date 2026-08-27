import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  refreshAccessToken,
} from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAccessToken()}`,
});

async function request(path, options = {}, retry = true) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  // Access token expired/invalid → try refresh once, then retry
  if (res.status === 401 && retry) {
    try {
      await refreshAccessToken();
      return request(path, options, false);
    } catch {
      clearAccessToken();
      throw new Error("Session expired. Please sign in again.");
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),

  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (path) => request(path, { method: "DELETE" }),
};

export { setAccessToken, clearAccessToken, refreshAccessToken };
