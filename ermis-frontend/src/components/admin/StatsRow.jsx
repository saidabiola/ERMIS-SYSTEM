export default function StatsRow({ totalUsers, activeUsers, totalRecords, pendingApprovals}) {
    const stats = [
        { label: 'Total Users', value: totalUsers, color: 'text-slate-200' },
        { label: 'Active Users', value: activeUsers, color: 'text-green-400' },
        { label: 'Total Records', value: totalRecords, color: 'text-indigo-400' },
        { label: 'Pending Approvals', value: pendingApprovals, color: 'text-amber-400' }
     ];

     return (
        <div className = "grid grid-cols-4 gap-3 mb-6">
            {stats.map(stat => (
                <div
                    key = {stat.label}
                    className = "bg-white/[0.03] border border-white/[0.07] rounded-xl p-4"
                >
                    <p className = "text-[11px] text-slate-500 mb-1.5">{stat.label}</p>
                    <p className = {'text-2xl font-medium ${stat.color}'}>
                        {stat.value ?? '_'}
                    
                    </p>
                </div>
            ))}
        </div>
     );
}