import { useState, useEffect } from 'react';
import SupervisorSidebar from '../../components/supervisor/SupervisorSidebar';
import RecordFileLink from '../../components/records/RecordFileLink';
import { api } from '../../utils/api';
import { decodeAccessToken } from '../../utils/auth';

const PAGE_SIZE = 10;

/**
 * View records — sidebar /dashboard/supervisor/records
 * Read-only: supervisors can search and browse; no create/edit/delete.
 * API: GET /api/records
 */
export default function SupervisorRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const currentUser = decodeAccessToken();

  useEffect(() => {
    fetchRecords(search, page);
  }, [page, search]);

  const fetchRecords = async (searchTerm = '', pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', String(PAGE_SIZE));
      if (searchTerm) params.set('search', searchTerm);

      const data = await api.get(`/records?${params.toString()}`);
      setRecords(data.records || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <SupervisorSidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">View records</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse and search academic records. Changes are made by records officers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-surface border border-line rounded-lg px-3 h-10 mb-4 focus-within:border-teal-500/50 transition">
          <i className="ti ti-search text-slate-500" style={{ fontSize: 15 }} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by school name, code or year..."
            value={search}
            onChange={handleSearch}
            className="flex-1 bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="text-[14px] font-medium text-slate-800">
              {search ? `Results for "${search}"` : 'All records'}
            </h2>
            <span className="text-[12px] text-slate-500">
              {loading
                ? '…'
                : `${total} record${total === 1 ? '' : 's'}`}
              <span className="ml-2 text-[11px] text-slate-400">Read only</span>
            </span>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center py-4">{error}</p>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm text-center py-8">Loading records...</p>
          ) : records.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-line">
                    <th className="text-left px-4 py-3.5 text-[12px] font-semibold text-slate-800 uppercase tracking-wide">
                      School name
                    </th>
                    <th className="text-left px-4 py-3.5 text-[12px] font-semibold text-slate-800 uppercase tracking-wide">
                      School code
                    </th>
                    <th className="text-left px-4 py-3.5 text-[12px] font-semibold text-slate-800 uppercase tracking-wide">
                      Year
                    </th>
                    <th className="text-left px-4 py-3.5 text-[12px] font-semibold text-slate-800 uppercase tracking-wide">
                      File
                    </th>
                    <th className="text-left px-4 py-3.5 text-[12px] font-semibold text-slate-800 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-3.5 text-[12px] font-semibold text-slate-800 uppercase tracking-wide">
                      Uploaded
                    </th>
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
                        <RecordFileLink
                          record={record}
                          className="text-teal-600 hover:text-teal-500 text-[12px] transition"
                        />
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
