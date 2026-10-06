import { useState, useEffect } from 'react';
import RecordsSidebar from '../../components/records/RecordsSidebar';
import RecordsTable from '../../components/records/RecordsTable';
import EditRecordModal from '../../components/records/EditRecordModal';
import RecordFileLink from '../../components/records/RecordFileLink';
import { api } from '../../utils/api';
import { decodeAccessToken } from '../../utils/auth';

const PAGE_SIZE = 13;

/**
 * All records page — same API as Overview (GET /api/records),
 */
function AllRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
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

  const handleEdit = async (id, formData) => {
    await api.put(`/records/${id}`, formData);
    fetchRecords(search, page);
  };

  const handleDelete = async (record) => {
    const ok = window.confirm(
      `Delete record for "${record.nameOfSchool}" (${record.schoolCode})? This cannot be undone.`
    );
    if (!ok) return;

    try {
      await api.delete(`/records/${record._id}`);
      fetchRecords(search, page);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <RecordsSidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">All records</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse every academic record in the system.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-surface border border-line rounded-lg px-3 h-10 mb-4 focus-within:border-teal-500/50 transition">
          <i className="ti ti-search text-slate-500" style={{ fontSize: 15 }} aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Filter by school name, code or year..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="text-slate-500 hover:text-slate-700 transition"
            >
              <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true"></i>
            </button>
          )}
        </div>

        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium text-slate-800">Records list</h2>
            <p className="text-[12px] text-slate-500 shrink-0">
              {total === 0
                ? 'No records'
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center py-4">{error}</p>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm text-center py-8">Loading records...</p>
          ) : (
            <RecordsTable
              records={records}
              onView={setViewingRecord}
              onEdit={setEditingRecord}
              onDelete={handleDelete}
            />
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-line">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-9 px-3 rounded-lg border border-line text-[13px] text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <p className="text-[13px] text-slate-600">
                Page <span className="font-medium text-slate-800">{page}</span> of {totalPages}
              </p>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 px-3 rounded-lg border border-line text-[13px] text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {viewingRecord && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-surface shadow-modal border border-line rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-medium text-slate-800">Record details</h3>
                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="text-slate-500 hover:text-slate-700 transition"
                >
                  <i className="ti ti-x" style={{ fontSize: 18 }} aria-hidden="true"></i>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'School name', value: viewingRecord.nameOfSchool },
                  { label: 'School code', value: viewingRecord.schoolCode },
                  { label: 'Year of graduation', value: viewingRecord.yearOfGraduation },
                  {
                    label: 'Uploaded on',
                    value: new Date(viewingRecord.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    }),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center py-2 border-b border-line-subtle"
                  >
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className="text-sm text-slate-700">{item.value}</span>
                  </div>
                ))}

                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-500">Attachment</span>
                  <RecordFileLink record={viewingRecord} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="w-full h-10 mt-5 border border-line rounded-lg text-sm text-slate-400 hover:text-slate-800 hover:border-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}

export default AllRecordsPage;
