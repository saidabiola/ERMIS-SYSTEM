import Sidebar from '../../components/admin/Sidebar';
import { decodeAccessToken } from '../../utils/auth';

/**
 * System settings — placeholder until production toggles (S3, retention, etc.)
 * Sidebar: /dashboard/admin/settings
 */
export default function SettingsPage() {
  const currentUser = decodeAccessToken();

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <Sidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">System settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Global configuration for ExamTrack.
          </p>
        </div>

        <div className="bg-surface border border-line shadow-panel rounded-xl p-8 max-w-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <i className="ti ti-settings text-slate-500" style={{ fontSize: 18 }} aria-hidden="true" />
            </div>
            <h2 className="text-[14px] font-medium text-slate-800">Coming next</h2>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Settings such as storage (S3), backup retention, and password policy
            will live here. User management and the audit trail are ready on the
            other sidebar pages.
          </p>
        </div>
      </div>
    </div>
  );
}
