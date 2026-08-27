import { useState, useEffect } from "react";
import SupervisorSidebar from '../../components/supervisor/SupervisorSidebar';
import {
    IconClipboardCheck,
    IconFiles,
    IconHistory,
    IconCheck,
    IconX
} from "@tabler/icons-react";

function SupervisorDashboard() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const currentUser = token
        ? JSON.parse(atob(token.split('.')[1]))
        : null;

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/records', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setRecords(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

        // Placeholder for the approval action, to be implemented later
        const pendingApprovals = [
            { id: 1, requestedBy: 'Kennedy Ouma', action: 'View transcript', school: 'Agoro High', date: '06/04/2026'},
            { id: 2, requestedBy: 'Kennedy Ouma', action: 'Download record', school: 'Agoro High', date: '06/04/2026'},
        ];

        // Placeholder audit logs, to be implemented later
        const auditLogs = [
        { id: 1, user: 'Jane Odhiambo',    action: 'Uploaded record',  target: 'Oriwo Boys High School', time: '10:32 AM' },
        { id: 2, user: 'System Admin',      action: 'Created user',     target: 'Said Benson',            time: '09:15 AM' },
        { id: 3, user: 'Jane Odhiambo',    action: 'Viewed record',    target: 'Kwoyo Oyugis Mixed',     time: '08:50 AM' },
        { id: 4, user: 'Kennedy Ouma',     action: 'Searched records', target: 'query: 417103004',       time: '08:30 AM' },
  ];

    return (
        <div className = "min-h-screen bg-canvas flex overflow-hidden">
            <SupervisorSidebar user = {currentUser} />
            
            <div className = "flex-1 p-6 overflow-y-auto">

                {/* Header */}
                <div className = "mb-6">
                    <h1 className = "text-lg font-medium text-slate-900">
                        Good Morning, {currentUser?.name} 👋
                    </h1>

                    <p className = "text-sm text-slate-500 mt-0.5">
                        Review pending approvals and monitor system activity.

                    </p>
                </div>

                {/* Statistics */}
                <div className = "grid grid-cols-3 gap-3 mb-6">
                    <div className = "bg-surface border border-line shadow-panel rounded-xl p-4">
                        <p className = "text-[11px] text-slate-500 mb-1.5">Total Records</p>
                        <p className = "text-2xl font-medium text-slate-800">
                            {loading ? '...' : records.length}
                        </p>

                    </div>
                    <div className = "bg-surface border border-line shadow-panel rounded-xl px-4">
                        <p className = "text-[11px] text-slate-500 mb-1.5">Pending Approvals</p>
                    
                        <p className = "text-2xl font-medium text-amber-600">
                        {pendingApprovals.length}
                        </p>
                    </div>

                    <div className = "bg-surface border border-line shadow-panel rounded-xl px-4">
                        <p className = "text-[11px] text-slate-500 mb-1.5">Actions today</p>
                        <p className = "text-2xl font-medium text-indigo-600">
                            {auditLogs.length}
                        </p>
                    </div>

                </div>

                <div className = "grid grid-cols-2 gap-4">

                    {/* Pending Approvals */}
                    <div className = "bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
                        <div className = "flex items-center gap-2 px-5 py-4 border-b border-line">
                            <IconClipboardCheck size = {15} className = "text-amber-600" />
                            <h2 className = "text-[14px] font-medium text-slate-800">
                                Pending Approvals
                            </h2>

                            <span className = "ml-auto text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                {pendingApprovals.length}
                            </span>

                        </div>

                        <div className = "divide-y divide-slate-100">
                            {pendingApprovals.map(item => (
                                <div key = {item.id} className = "px-5 py-3.5">
                                    <div className = "flex items-start justify-between gap-3">
                                        <div>
                                            <p className = "text-[13px] text-slate-700">{item.action}</p>
                                            <p className = "text-[11px] text-slate-500 mt-0.5">{item.school}</p>
                                            <p className = "text-[11px] text-slate-600 mt-0.5">
                                                by {item.requestedBy} on {item.date}
                                            </p>
                                        </div>

                                        <div className = "flex gap-2 shrink-0">
                                            <button 
                                            className = "w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition"
                                            title = "Approve"
                                            >
                                                <IconCheck size = {13} />
                                            </button>

                                            <button
                                            className = "w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition"
                                            title = "Reject">
                                                <IconX size = {13} />
                                            </button>

                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>

                    </div>

                    {/* Audit Logs */}
                    <div className = "bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
                            <div className = "flex items-center gap-2 px-5 py-4 border-b border-line">
                                <IconHistory size = {15} className = "text-indigo-600" />
                                <h2 className = "text-[14px] font-medium text-slate-800">
                                    Recent Activity
                                </h2>
                                <span className = "ml-auto text-[11px] text-slate-600">Today</span>
                            </div>

                            <div className = "divide-y divide-slate-100">
                                {auditLogs.map(log => (
                                    <div key = {log.id} className = "px-5 py-3.5 flex items-start gap-3">
                                        <div className = "w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                                            <IconHistory size = {11} className = "text-indigo-600" />

                                        </div>

                                        <div className = "flex-1 min-w-0">
                                            <p className = "text-[13px] text-slate-700">
                                                {log.action}
                                                <span className = "text-slate-500"> - {log.target}</span>

                                            </p>
                                            <p className = "text-[11px] text-slate-600 mt-0.5">
                                                {log.user} at {log.time}
                                            </p>
                                            



                                        </div>

                                    </div>
                                ))}

                            </div>

                    </div>

                </div>

                {/* Records Table */}

                <div className = "bg-surface border border-line shadow-panel rounded-xl overflow-hidden mt-4">
                    <div className = "flex items-center gap-2 px-5 py-4 border-b border-line">
                        <IconFiles size = {15} className = "text-teal-600" />
                        <h2 className = "text-[14px] font-medium text-slate-800">All Records</h2>
                        <span className = "ml-auto text-[11px] text-slate-600">Read Only</span>

                    </div>

                    {error && (
                        <p className = "text-red-600 text-sm text-center py-4">{error}</p>
                    )}

                    {loading ? (
                        <p className = "text-slate-500 text-sm text-center py-8">Loading...</p>
                    ) : (
                        <div className = "overflow-x-auto">
                            <table className = "w-full text-sm">
                                <thead>
                                    <tr className = "text-[11px] text-slate-600 uppercase tracking-wider border-b border-line">
                                        <th className = "text-left px-4 py-3 font-medium">School Name</th>
                                        <th className = "text-left px-4 py-3 font-medium">School Code</th>
                                        <th className = "text-left px-4 py-3 font-medium">Year</th>
                                        <th className = "text-left px-4 py-3 font-medium">File</th>
                                        <th className = "text-left px-4 py-3 font-medium">Uploaded</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {records.map(record => (
                                        <tr
                                            key = {record.id}
                                            className = "border-b border-line-subtle hover:bg-slate-50 transition"
                                        >
                                            <td className = "px-4 py-3 text-slate-700 text-[13px]">{record.nameOfSchool}</td>
                                            <td className = "px-4 py-3 text-slate-400 text-[13px]">{record.schoolCode}</td>
                                            <td className = "px-4 py-3 text-slate-400 text-[13px]">{record.yearOfGraduation}</td>
                                            <td className = "px-4 py-3">
                                                {record.file ?
                                                (
                                                    <span className = "text-teal-600 text-[12px]">Attached</span>
                                                ) : (
                                                    <span className = "text-slate-600 text-[12px]">No File</span>
                                                )}
                                            </td>

                                            <td className = "px-4 py-3 text-slate-500 text-[12px]">
                                                {new Date(record.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit', 
                                                    month: 'short', 
                                                    year: 'numeric'
                                                })}

                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default SupervisorDashboard;