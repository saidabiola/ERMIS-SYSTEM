import { useState, useEffect } from "react";
import ICTSidebar from "../../components/ict/ICTSidebar";
import {
    IconDatabaseExport,
    IconServer,
    IconCircleCheck,
    IconAlertTriangle,
    IconRefresh,
    IconDownload,
    IconHistory
} from '@tabler/icons-react'

function ICTDashboard() {
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupSuccess, setBackupSuccess] = useState(false);
    const [dbStatus, setDbStatus] = useState('checking');
    const [serverStatus, setServerStatus] = useState('Checking');
    const [records, setRecords] = useState(0);
    const [users, setUsers] = useState(0);

    const token = localStorage.getItem('token');
    const currentUser = token
        ? JSON.parse(atob(token.split('.')[1]))
        :null

        useEffect(() => {
            checkSystemHealth();
        }, []);

        const checkSystemHealth = async () => {
            try {
                setDbStatus('checking');
                setServerStatus('checking');

                // check server and DB by hitting the records end point

                const res = await fetch('/api/records', {
                    headers: { 'Authorization': `Bearer ${token}`}
                });

                if (res.ok) {
                    const data = await res.json();
                    setDbStatus('online');
                    setServerStatus('online');
                    setRecords(data.length)
                } else {
                    setDbStatus('error');
                    setServerStatus('error')
                }
            } catch (_) {
                setDbStatus('error');
                setServerStatus('error');
            }
        };

        const handleBackup = async () => {
            setBackupLoading(true);
            setBackupSuccess(false);

            //Add to backup history

            setBackupHistory(prev => [{
                id: Date.now(),
                date: new Date().toDateString('en-GB',
                    {   day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }),
                time: new Date().toDateString('en-GB',
                    {   hour: '2-digit',
                        minute: '2-digit'
                    }

                ),
                
                status: 'success',
                size: '2.4 MB'
            }, ...prev])

            //React suucess state after 3 seconds

            setTimeout(() => setBackupSuccess(false), 3000)
        };

        const [backupHistory, setBackupHistory] = useState([
            { id: 1, date: '10 Aug 2026', time: '06: 14 AM', status: 'success', size: '2.1 MB' },
            { id: 2, date: '04 Aug 2026', time: '08:00 AM', status: 'success', size: '2.0 MB' },
            { id: 3, date: '03 Aug 2026', time: '08:00 AM', status: 'failed',  size: '—'      },
            { id: 4, date: '02 Aug 2026', time: '08:00 AM', status: 'success', size: '1.9 MB' },

            ]);

            const StatusBadge = ({ status }) => {
                if (status === 'online')
                    return (
                <span className = "flex items-center gap-1.5 text-green-400 text-[12px]">
                    <IconCircleCheck size = {13} /> Online
                </span>
            );

            if (status === 'error')
                return (
                    <span className = "flex items-center gap-1.5 text-red-400 text-[12px]">
                        <IconAlertTriangle size = {13} /> Error
                    </span>
                );

                return (
                    <span className = "text-slate-500 text-[12px]">Checking...</span>
                );
            };
        
            return (
                <div className = "min-h-screen bg-slate-950 flex overflow-hidden">

                    <ICTSidebar user = {currentUser} />

                    <div className = "flex-1 p-6 overflow-y-auto">

                        {/* Header */}

                        <div className = "mb-6">
                            <h1 text-lg font-medium text-slate-100>
                                Good morning, {currentUser?.name} 👋 
                            </h1>

                            <p className = "text-sm text-slate-500 mt-0.5">
                                Monitor system health and manage backups.
                            </p>

                        </div>

                        {/* Stats */}

                        <div className = "grid grid-cols-4 gap-3 mb-6">
                            <div className = "bg-white/[0.03] border-white/0.07] rounded-xl p-4">
                                <p className="text-[11px] text-slate-500 mb-1.5">Server</p>

                                    <StatusBadge status = {serverStatus} />

                            </div>

                            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                                <p className="text-[11px] text-slate-500 mb-1.5">Database</p>
                                    <StatusBadge status = {dbStatus} />
                            </div>

                            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                                <p className="text-[11px] text-slate-500 mb-1.5">Total reocords</p>
                                <p className="text-2xl font-medium text-slate-200">{records}</p>
                            </div>

                            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                                <p className="text-[11px] text-slate-500 mb-1.5">Last backup</p>
                                <p className="text-[13px] font-medium text-pink-400">10 Aug 2026</p>
                            </div>
                        </div>

                        <div className = "grid grid-col-2 gap-4">

                            {/* Backup control */}

                            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
                                    <IconDatabaseExport size = {15} className = "text-pink-400" />
                                    <h2 className = "text-[14px]" font-medium text-slate-200>
                                        Database backup
                                    </h2>

                                </div>

                                <div className = "p-5">
                                    <p className = "text-[13px] text-slate-400 mb-5">
                                        Create a full backup of the MongoDB database including all records, users and system data.
                                    </p>

                                    {/* Backup button */}

                                    <button
                                        onClick = {handleBackup}
                                        disabled = {backupLoading}
                                        className = {`w-full h-11 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition
                                            ${backupSuccess
                                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                                : 'bg-pink-600 hover:bg-pink-500 disabled:opacity-60 text-white'
                                            }`}
                                    >

                                            {backupLoading ? (
                                                <>
                                                <IconRefresh size = {15} className = "animate-spin" />
                                                    Creating backup...
                                                </>
                                            ) : backupSuccess ? (
                                                <>
                                                    <IconCircleCheck size = {15} />
                                                    Backup complete!
                                                </>
                                            ) : (
                                                <>
                                                    <IconDatabaseExport size = {15} />
                                                    Create backup now
                                                </>
                                            )
                                        }
                                    </button>

                                    {/* System health refresh */}
                                    
                                    <button
                                        onClick = {checkSystemHealth}
                                        className = "w-full h-10 mt-3 border border-white/10 rounded-lg text-[13px] text-slate-400 hover:text-slate-200 hover:border-white/20 flex items-center justify-center gap-2 transition"
                                    >
                                        <IconRefresh size = {14} />
                                        Refresh system status

                                    </button>

                                    {/* System Info */}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            )
        
}

export default ICTDashboard