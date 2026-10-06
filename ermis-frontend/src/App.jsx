import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import AuditPage from "./pages/admin/AuditPage";
import SettingsPage from "./pages/admin/SettingsPage";
import RecordsDashboard from "./pages/records/RecordsDashboard";
import AllRecordsPage from "./pages/records/AllRecordsPage";
import UploadRecordPage from "./pages/records/UploadRecordPage";
import SearchRecordsPage from "./pages/records/SearchRecordsPage";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SupervisorApprovalsPage from "./pages/supervisor/SupervisorApprovalsPage";
import SupervisorRecordsPage from "./pages/supervisor/SupervisorRecordsPage";
import SupervisorAuditPage from "./pages/supervisor/SupervisorAuditPage";
import ICTDashboard from "./pages/ict/ICTDashboard";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="Unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes — each locked to its role */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/audit"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AuditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/records"
        element={
          <ProtectedRoute allowedRoles={["records_officer"]}>
            <RecordsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/records/all"
        element={
          <ProtectedRoute allowedRoles={["records_officer"]}>
            <AllRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/records/upload"
        element={
          <ProtectedRoute allowedRoles={["records_officer"]}>
            <UploadRecordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/records/search"
        element={
          <ProtectedRoute allowedRoles={["records_officer"]}>
            <SearchRecordsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/supervisor"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <SupervisorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/supervisor/approvals"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <SupervisorApprovalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/supervisor/records"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <SupervisorRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/supervisor/audit"
        element={
          <ProtectedRoute allowedRoles={["supervisor"]}>
            <SupervisorAuditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/ict"
        element={
          <ProtectedRoute allowedRoles={["ict_officer"]}>
            <ICTDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
