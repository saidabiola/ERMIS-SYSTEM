import { useNavigate, useLocation } from "react-router-dom";
import {
    IconLayoutDashboard,
    IconClipboardCheck,
    IconHistory,
    IconFiles,
    IconSchool,
    IconLogout,
} from "@tabler/icons-react";

function SupervisorSidebar({ user }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
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
            <div className = "w-56 min-h-screen bg-slate-950 border-r border-white/[0.06] flex flex-col px-3 py-5 shrink-0">

                {/* Logo */}
                <div className = "flex items-center gap-2.5 px-2 mb-6">
                    <div className = "w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <IconSchool size = {16} className = "text-amber-400" />
                    </div>

                    <div>
                        <p className = "text-sm font-medium text-slate-100">ExamTrack</p>
                        <p className = "text-[11px] text-slate-600">Supervisor Portal</p>
                    </div>

                </div>

                {/* Nav */}
                <p className = "text-[10px] text-slate-700 uppercase track-widest px-3 mb-1.5">Supervisor</p>

                {navItems.map(item => {
                    const Icon = item.icon
                    return (
                        <button
                            key = {item.path}
                            onClick = {() => navigate(item.path)}
                            className = {`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] mb-0.5 w-full text-left transition
                            ${location.pathname === item.path
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                    }`}
                        >
                            <Icon size = {15} />
                            {item.label}

                        </button>
                    );
                })}

                {/* Logout */}

                <div className = "mt-auto pt-4 border-t border-white/[0.06]">
                    <div className = "flex items-center gap-2.5 px-3 py-2 mb-1">
                        <div className = "w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] font-medium text-amber-400 shrink-0">
                            {initials}

                        </div>

                        <div className = "overflow-hidden">
                            <p className = "text-[12px] text-slate-300 truncate">{user?.name}</p>
                            <p className = "text-[11px] text-slate-600 truncate">{user?.email}</p>

                        </div>

                    </div>

                    <button
                        onClick = {handleLogout}
                        className = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] w-full text-left  text-red-400  hover:bg-red-500/10"
                    >
                        <IconLogout size = {15} />
                        Logout

                    </button>

                </div>

            </div>
        )
}

export default SupervisorSidebar;