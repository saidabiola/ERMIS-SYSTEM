import { useNavigate, useLocation } from "react-router-dom";
import {
    IconLayoutDashboard,
    IconClipboardCheck,
    IconHistory,
    IconFiles,
    IconSchool,
    IconLogout,
} from "@tabler/icons-react";
import { logout } from "../../utils/auth";

function SupervisorSidebar({ user }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navItems = [
        { label: 'Overview', icon: IconLayoutDashboard, path: '/dashboard/supervisor' },
        { label: 'Pending approvals', icon: IconClipboardCheck, path: '/dashboard/supervisor/approvals' },
        { label: 'Audit logs', icon: IconHistory, path: '/dashboard/supervisor/audit' },
        { label: 'View records', icon: IconFiles, path: '/dashboard/supervisor/records' },
    ];

    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || 'SV';

        return (
            <div className = "w-56 min-h-screen bg-surface border-r border-line flex flex-col px-3 py-5 shrink-0">

                {/* Logo */}
                <div className = "flex items-center gap-2.5 px-2 mb-6">
                    <div className = "w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <IconSchool size = {16} className = "text-amber-600" />
                    </div>

                    <div>
                        <p className = "text-sm font-medium text-slate-900">ExamTrack</p>
                        <p className = "text-[11px] text-slate-600">Supervisor Portal</p>
                    </div>

                </div>

                {/* Nav */}
                <p className = "text-[10px] text-slate-400 uppercase track-widest px-3 mb-1.5">Supervisor</p>

                {navItems.map(item => {
                    const Icon = item.icon
                    return (
                        <button
                            key = {item.path}
                            onClick = {() => navigate(item.path)}
                            className = {`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] mb-0.5 w-full text-left transition
                            ${location.pathname === item.path
                            ? 'bg-amber-50 text-amber-700'
                            : 'text-slate-400 hover:bg-muted hover:text-slate-800'
                    }`}
                        >
                            <Icon size = {15} />
                            {item.label}

                        </button>
                    );
                })}

                {/* Logout */}

                <div className = "mt-auto pt-4 border-t border-line">
                    <div className = "flex items-center gap-2.5 px-3 py-2 mb-1">
                        <div className = "w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-[11px] font-medium text-amber-600 shrink-0">
                            {initials}

                        </div>

                        <div className = "overflow-hidden">
                            <p className = "text-[12px] text-slate-700 truncate">{user?.name}</p>
                            <p className = "text-[11px] text-slate-600 truncate">{user?.email}</p>

                        </div>

                    </div>

                    <button
                        onClick = {handleLogout}
                        className = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] w-full text-left  text-red-600  hover:bg-red-50"
                    >
                        <IconLogout size = {15} />
                        Logout

                    </button>

                </div>

            </div>
        )
}

export default SupervisorSidebar;