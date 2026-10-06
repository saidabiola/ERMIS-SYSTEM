import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../utils/auth';

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', icon: 'ti-layout-dashboard', path: '/dashboard/admin' },
    { label: 'User management', icon: 'ti-users', path: '/dashboard/admin/users' },
    { label: 'System settings', icon: 'ti-settings', path: '/dashboard/admin/settings' },
  ];

  const reportItems = [
    { label: 'Audit trail', icon: 'ti-file-analytics', path: '/dashboard/admin/audit' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard/admin') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'AD';

  return (
    <div
      className="relative w-56 min-h-screen flex flex-col px-3 py-5 shrink-0 overflow-hidden border-r border-teal-800/30"
      style={{ backgroundColor: 'var(--ermis-brand-teal)' }}
    >
      {/* Soft glow — same feel as records / login left panel */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_15%,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_95%,rgba(13,148,136,0.4),transparent_50%)]" />

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
            <i className="ti ti-school text-white" style={{ fontSize: 16 }} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">ExamTrack</p>
            <p className="text-[11px] text-teal-50/85">Admin panel</p>
          </div>
        </div>

        {/* Main nav */}
        <p className="text-[10px] text-teal-100/70 uppercase tracking-widest px-3 mb-1.5">
          Main
        </p>
        {navItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] mb-0.5 w-full text-left transition
              ${
                isActive(item.path)
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-teal-50/90 hover:bg-white/10 hover:text-white'
              }`}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}

        {/* Reports nav */}
        <p className="text-[10px] text-teal-100/70 uppercase tracking-widest px-3 mt-4 mb-1.5">
          Reports
        </p>
        {reportItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] mb-0.5 w-full text-left transition
              ${
                isActive(item.path)
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-teal-50/90 hover:bg-white/10 hover:text-white'
              }`}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </button>
        ))}

        {/* User + logout */}
        <div className="mt-auto pt-4 border-t border-white/15">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-medium text-white shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-teal-50/75 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] w-full text-left text-red-100 hover:bg-white/10 transition"
          >
            <i className="ti ti-logout" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
