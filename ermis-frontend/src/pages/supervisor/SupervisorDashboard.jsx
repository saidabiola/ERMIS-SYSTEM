import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorSidebar from '../../components/supervisor/SupervisorSidebar';
import { api } from '../../utils/api';
import { decodeAccessToken } from '../../utils/auth';

const ACTION_LABELS = {
  RECORD_CREATED: 'Uploaded record',
  RECORD_UPDATED: 'Updated record',
  RECORD_DELETED: 'Deleted record',
  RECORD_APPROVED: 'Approved record',
  RECORD_REJECTED: 'Rejected record',
  BACKUP_RESTORED: 'Restored backup',
};

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Supervisor overview — pending approvals queue + recent activity + records preview.
 */
export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [approvalsLoading, setApprovalsLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const currentUser = decodeAccessToken();

  useEffect(() => {
    fetchRecords();
    fetchApprovals();
    fetchAuditLogs();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/records?page=1&limit=10');
      setRecords(data.records || []);
      setRecordsTotal(data.total ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovals = async () => {
    try {
      setApprovalsLoading(true);
      const data = await api.get('/approvals?status=pending&page=1&limit=5');
      setPendingApprovals(data.approvals || []);
      setPendingCount(data.pendingCount ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setApprovalsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const data = await api.get('/audit?limit=8');
      setAuditLogs(data.logs || []);
      setTodayCount(data.todayCount ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setBusyId(id);
      await api.post(`/approvals/${id}/approve`, {});
      await Promise.all([fetchApprovals(), fetchRecords(), fetchAuditLogs()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    const note = window.prompt('Optional reason for rejection (or leave blank):') ?? null;
    if (note === null) return;

    try {
      setBusyId(id);
      await api.post(`/approvals/${id}/reject`, { reviewNote: note });
      await Promise.all([fetchApprovals(), fetchRecords(), fetchAuditLogs()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const stats = [
    {
      value: loading ? '…' : recordsTotal,
      label: 'Total records',
      sub: 'In the system',
      icon: 'ti-files',
    },
    {
      value: approvalsLoading ? '…' : pendingCount,
      label: 'Pending approvals',
      sub: 'Awaiting review',
      icon: 'ti-clipboard-check',
    },
    {
      value: auditLoading ? '…' : todayCount,
      label: 'Actions today',
      sub: 'Audit events',
      icon: 'ti-activity',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <SupervisorSidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">
            Good morning, {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review pending uploads and monitor system activity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-xl px-5 py-4 min-h-[108px] shadow-sm"
              style={{ backgroundColor: 'var(--ermis-brand-teal)' }}
            >
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
                    {stat.value}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Pending approvals */}
          <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-medium text-slate-800">Pending approvals</h2>
                <span className="text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard/supervisor/approvals')}
                className="text-[12px] text-teal-600 hover:text-teal-500 transition"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {approvalsLoading && (
                <p className="text-slate-500 text-sm text-center py-8">Loading...</p>
              )}
              {!approvalsLoading && pendingApprovals.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">
                  No pending approvals.
                </p>
              )}
              {!approvalsLoading &&
                pendingApprovals.map((item) => (
                  <div key={item.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] text-slate-700">
                          Publish — {item.nameOfSchool}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.schoolCode}
                          {item.yearOfGraduation ? ` · ${item.yearOfGraduation}` : ''}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          by {item.requestedByName} · {formatTime(item.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => handleApprove(item.id)}
                          className="w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center transition disabled:opacity-50"
                          title="Approve"
                        >
                          <i className="ti ti-check" style={{ fontSize: 14 }} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => handleReject(item.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition disabled:opacity-50"
                          title="Reject"
                        >
                          <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="text-[14px] font-medium text-slate-800">Recent activity</h2>
              <button
                type="button"
                onClick={() => navigate('/dashboard/supervisor/audit')}
                className="text-[12px] text-teal-600 hover:text-teal-500 transition"
              >
                View audit trail
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {auditLoading && (
                <p className="text-slate-500 text-sm text-center py-8">Loading activity...</p>
              )}
              {!auditLoading && auditLogs.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">
                  No activity logged yet.
                </p>
              )}
              {!auditLoading &&
                auditLogs.map((log) => (
                  <div key={log.id} className="px-5 py-3.5 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                      <i
                        className="ti ti-history text-teal-600"
                        style={{ fontSize: 11 }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-700">
                        {ACTION_LABELS[log.action] || log.summary}
                        {log.metadata?.nameOfSchool && (
                          <span className="text-slate-500">
                            {' '}
                            — {log.metadata.nameOfSchool}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {log.actorName} · {formatTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Records preview */}
        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-medium text-slate-800">Records</h2>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Read only
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/supervisor/records')}
              className="text-[12px] text-teal-600 hover:text-teal-500 transition"
            >
              View all records
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center py-4">{error}</p>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm text-center py-8">Loading records...</p>
          ) : records.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-600 uppercase tracking-wider border-b border-line">
                    <th className="text-left px-4 py-3 font-medium">School name</th>
                    <th className="text-left px-4 py-3 font-medium">School code</th>
                    <th className="text-left px-4 py-3 font-medium">Year</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record._id}
                      className="border-b border-line-subtle hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3 text-slate-700 text-[13px]">
                        {record.nameOfSchool}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[13px]">
                        {record.schoolCode}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[13px]">
                        {record.yearOfGraduation}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[12px]">
                        {new Date(record.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
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

function StatusBadge({ status }) {
  const key = status || 'approved';
  const styles = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-teal-50 text-teal-700',
    rejected: 'bg-red-50 text-red-700',
  };
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[key] || styles.approved}`}
    >
      {labels[key] || 'Approved'}
    </span>
  );
}
