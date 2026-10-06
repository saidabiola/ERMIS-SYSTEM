import { useState, useEffect } from 'react';
import SupervisorSidebar from '../../components/supervisor/SupervisorSidebar';
import { api } from '../../utils/api';
import { decodeAccessToken } from '../../utils/auth';

const PAGE_SIZE = 20;

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Pending approvals — sidebar /dashboard/supervisor/approvals
 * API: GET /api/approvals, POST .../approve, POST .../reject
 */
export default function SupervisorApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const currentUser = decodeAccessToken();

  useEffect(() => {
    fetchApprovals(page);
  }, [page]);

  const fetchApprovals = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(
        `/approvals?status=pending&page=${pageNum}&limit=${PAGE_SIZE}`
      );
      setApprovals(data.approvals || []);
      setPendingCount(data.pendingCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setBusyId(id);
      setError('');
      await api.post(`/approvals/${id}/approve`, {});
      await fetchApprovals(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    const note = window.prompt('Optional reason for rejection (or leave blank):') ?? null;
    if (note === null) return; // cancelled

    try {
      setBusyId(id);
      setError('');
      await api.post(`/approvals/${id}/reject`, { reviewNote: note });
      await fetchApprovals(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const stats = [
    {
      value: loading ? '…' : pendingCount,
      label: 'Pending approvals',
      sub: 'Awaiting your review',
      icon: 'ti-clipboard-check',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <SupervisorSidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">Pending approvals</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review new records uploaded by officers before they are marked official.
          </p>
        </div>

        <div className="grid grid-cols-1 max-w-xs gap-3 mb-6">
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

        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="text-[14px] font-medium text-slate-800">Queue</h2>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center py-4">{error}</p>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm text-center py-8">Loading approvals...</p>
          ) : approvals.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No pending approvals. New uploads from records officers will appear here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {approvals.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-800">
                      Publish record — {item.nameOfSchool}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {item.schoolCode}
                      {item.yearOfGraduation ? ` · ${item.yearOfGraduation}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Requested by {item.requestedByName} · {formatTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => handleApprove(item.id)}
                      className="h-8 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-[12px] font-medium transition"
                    >
                      {busyId === item.id ? '…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => handleReject(item.id)}
                      className="h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-700 text-[12px] font-medium transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-line">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-[13px] text-slate-600 hover:text-slate-900 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <span className="text-[12px] text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-[13px] text-slate-600 hover:text-slate-900 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
