import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  refreshAccessToken,
} from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Build auth headers.
 * For FormData uploads we must NOT set Content-Type — the browser
 * sets multipart/form-data with the correct boundary.
 */
function buildHeaders(body, extra = {}) {
  const headers = {
    Authorization: `Bearer ${getAccessToken()}`,
    ...extra,
  };

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function request(path, options = {}, retry = true) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: buildHeaders(options.body, options.headers),
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

function encodeBody(body) {
  if (body == null) return undefined;
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  return JSON.stringify(body);
}

export const api = {
  get: (path) => request(path, { method: "GET" }),

  post: (path, body) =>
    request(path, {
      method: "POST",
      body: encodeBody(body),
    }),

  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: encodeBody(body),
    }),

  delete: (path) => request(path, { method: "DELETE" }),

  /**
   * Download a record attachment via authenticated API.
   * Officers are blocked until the supervisor approves the record.
   */
  downloadRecordFile: async (recordId, suggestedName = "record-file") => {
    const doFetch = async (retry = true) => {
      const res = await fetch(`${BASE_URL}/records/${recordId}/file`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });

      if (res.status === 401 && retry) {
        await refreshAccessToken();
        return doFetch(false);
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Download failed");
      }

      return res;
    };

    const res = await doFetch();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export { setAccessToken, clearAccessToken, refreshAccessToken };
