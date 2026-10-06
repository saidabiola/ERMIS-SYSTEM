export default function StatsRow({
  totalUsers,
  activeUsers,
  totalRecords,
  todayActions,
}) {
  const stats = [
    {
      label: 'Total users',
      value: totalUsers,
      sub: 'All accounts',
      icon: 'ti-users',
    },
    {
      label: 'Active users',
      value: activeUsers,
      sub: 'Can sign in',
      icon: 'ti-user-check',
    },
    {
      label: 'Total records',
      value: totalRecords,
      sub: 'In the system',
      icon: 'ti-files',
    },
    {
      label: 'Actions today',
      value: todayActions,
      sub: 'Audit events',
      icon: 'ti-activity',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-xl px-5 py-4 min-h-[108px] shadow-sm"
          style={{ backgroundColor: 'var(--ermis-brand-teal)' }}
        >
          {/* Diagonal sheen — same glossy cut as records */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, transparent 48%, rgba(255,255,255,0.14) 48%, rgba(255,255,255,0.22) 62%, transparent 62%)',
            }}
          />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-white leading-none tracking-tight">
                {stat.value == null ? '…' : stat.value}
              </p>
              <p className="mt-2 text-[14px] font-medium text-white">{stat.label}</p>
              <p className="mt-0.5 text-[12px] text-white/70">{stat.sub}</p>
            </div>
            <i
              className={`ti ${stat.icon} text-white/90 shrink-0 mt-0.5`}
              style={{ fontSize: 20 }}
              aria-hidden="true"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
