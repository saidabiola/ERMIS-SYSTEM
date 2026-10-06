import { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
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
 * Audit trail — sidebar /dashboard/admin/audit
 * API: GET /api/audit (admin + supervisor)
 */
export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = decodeAccessToken();

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/audit?page=${pageNum}&limit=${PAGE_SIZE}`);
      setLogs(data.logs || []);
      setTodayCount(data.todayCount ?? 0);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <Sidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">Audit trail</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            System actions by officers — create, update, delete, and restores.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 max-w-md">
          <div className="bg-surface border border-line shadow-panel rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">Actions today</p>
            <p className="text-2xl font-medium text-amber-600">
              {loading ? '…' : todayCount}
            </p>
          </div>
          <div className="bg-surface border border-line shadow-panel rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">Total logged</p>
            <p className="text-2xl font-medium text-slate-800">
              {loading ? '…' : total}
            </p>
          </div>
        </div>

        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="text-[14px] font-medium text-slate-800">Activity log</h2>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center py-4">{error}</p>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm text-center py-8">Loading activity...</p>
          ) : logs.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No activity logged yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                    <i
                      className="ti ti-history text-teal-600"
                      style={{ fontSize: 13 }}
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
                          {log.metadata.schoolCode
                            ? ` (${log.metadata.schoolCode})`
                            : ''}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {log.actorName}
                      {log.actorRole ? ` · ${log.actorRole}` : ''}
                      {' · '}
                      {formatTime(log.createdAt)}
                    </p>
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
