import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../utils/auth";

export default function RecordsSidebar({ user }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navItems = [
        { label: 'Overview', icon: 'ti-layout-dashboard', path: '/dashboard/records' },
        { label: 'All records', icon: 'ti-files', path: '/dashboard/records/all' },
        { label: 'Upload record', icon: 'ti-upload', path: '/dashboard/records/upload' },
        { label: 'Search records', icon: 'ti-search', path: '/dashboard/records/search' },
    ];

    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || 'RD';

        return (
            <div className ="w-56 min-h-screen bg-surface border-r border-line flex flex-col px-3 py-5 shrink-0">

                {/* Logo */}
                <div className ="flex items-center gap-2.5 px-2 mb-6">
                    <div className ="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                        <i className ="ti ti-school text-indigo-600" style ={{fontSize: 16}} aria-hidden = "true"></i>

                    </div>

                    <div>
                        <p className ="text-sm font-medium text-slate-900">Exam Track</p>
                        <p className ="text-[11px] text-slate-600">Records Portal</p>
                    </div>

                </div>

                {/* nav */}
                <p className ="text-[10px] text-slate-400 uppercase tracking-widest px-3 mb-1.5">Records</p>

                {navItems.map(item => (
                    <button key ={item.path}
                    onClick ={() => navigate(item.path)}
                    className ={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] mb-0.5 w-full text-left transition
                    ${location.pathname === item.path
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}

                    >
                        <i className ={`ti ${item.icon}`} aria-hidden = "true"></i> 
                            
                        {item.label}

                    </button>
                ))}

                {/* logout button */}
                <div className = "mt-auto pt-4 border-t border-line">
                    <div className = "flex items-center gap-2.5 px-3 py-2 mb-1 ">
                        <div className = "w-7 h-7 rounded-full bg-indigo-50 flex items-center  justify-center text-[11px] font-medium text-indigo-600 shrink-0">
                            {initials}
                        </div>

                        <div className = "overflow-hidden">
                            <p className = "text-[12px] text-slate-700 truncate">{user?.name}</p>
                            <p className = "text-[11px] text-slate-500 truncate">{user?.email}</p>

                        </div>
                    </div>

                    <button 
                        onClick = {handleLogout}
                        className = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] w-full text-left text-red-600 hover:bg-red-50 transition"
                    >
                        <i className ="ti ti-logout" aria-hidden = "true"></i>
                        Sign Out

                    </button>

                </div>

            </div>
        );
}