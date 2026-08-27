/**
 * Access token lives in localStorage (sent as Bearer header).
 * Refresh token lives in httpOnly cookie (browser sends it automatically).
 */

const ACCESS_KEY = "token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_KEY);
}

let refreshPromise = null;

/**
 * Ask backend for a new access token using the httpOnly refresh cookie.
 * Deduplicates concurrent refresh calls into one request.
 */
export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        clearAccessToken();
        throw new Error("Session expired");
      }

      const data = await res.json();
      if (!data.accessToken) {
        clearAccessToken();
        throw new Error("Session expired");
      }

      setAccessToken(data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (_) {
    // Still clear local state even if network fails
  } finally {
    clearAccessToken();
  }
}

export function decodeAccessToken(token = getAccessToken()) {
  if (!token) return null;
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload;
}

export function isAccessTokenExpired(token = getAccessToken()) {
  if (!token) return true;
  try {
    const payload = decodeAccessToken(token);
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
