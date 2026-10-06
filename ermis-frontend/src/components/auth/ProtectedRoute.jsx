import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  getAccessToken,
  clearAccessToken,
  refreshAccessToken,
  isAccessTokenExpired,
  decodeAccessToken,
} from "../../utils/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [status, setStatus] = useState("checking"); // checking | ok | deny | unauthorized

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      try {
        let token = getAccessToken();

        // No access token, or expired (try refresh cookie once)
        if (!token || isAccessTokenExpired(token)) {
          token = await refreshAccessToken();
        }

        if (cancelled) return;

        const payload = decodeAccessToken(token);
        if (allowedRoles && !allowedRoles.includes(payload.role)) {
          setStatus("unauthorized");
          return;
        }

        setStatus("ok");
      } catch {
        if (!cancelled) {
          clearAccessToken();
          setStatus("deny");
        }
      }
    }

    ensureSession();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking session...
      </div>
    );
  }

  if (status === "deny") {
    return <Navigate to="/" replace />;
  }

  if (status === "unauthorized") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
