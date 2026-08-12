
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RecordsDashboard from "./pages/records/RecordsDashboard";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import ICTDashboard from "./pages/ict/ICTDashboard";






function App(){
  return (
    

      <Routes>
        { /* Public routes */ }
        <Route path = "/" element = {<LoginPage />} />
        <Route path = "Unauthorized" element = {<UnauthorizedPage />} />

        {/* protected routes, each locked to its specific role */}

        <Route path = "/dashboard/admin" element = {
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path = "/dashboard/records" element = {
          <ProtectedRoute allowedRoles={['records_officer']}>
            <RecordsDashboard />
          </ProtectedRoute>
        } />
        <Route path = "/dashboard/supervisor" element = {
          <ProtectedRoute allowedRoles={['supervisor']}>
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        <Route path = "/dashboard/ict" element = {
          <ProtectedRoute allowedRoles={['ict_officer']}>
            <ICTDashboard />
          </ProtectedRoute>
        } />

      </Routes>

  );
}

export default App;





