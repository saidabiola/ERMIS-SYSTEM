import { useState, useEffect } from 'react'
import RecordsSidebar from '../../components/records/RecordsSidebar';
import RecordsTable from '../../components/records/RecordsTable';
import UploadRecordModal from '../../components/records/UploadRecordModal';
import EditRecordModal from '../../components/records/EditRecordModal';
import RecordFileLink from '../../components/records/RecordFileLink';
import { api } from '../../utils/api';
import { decodeAccessToken } from '../../utils/auth';

const PAGE_SIZE = 10;

function RecordsDashboard(){
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [error, setError] = useState('');

    const currentUser = decodeAccessToken();

    // Re-fetch whenever page or search changes
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

            // api.get → /api/records?... (+ Bearer + refresh on 401)
            const data = await api.get(`/records?${params.toString()}`);

            setRecords(data.records || []);
            setTotal(data.total ?? 0);
            setTotalPages(data.totalPages ?? 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false)
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        setPage(1);
    };

    const handleUpload = async (formData) => {
        await api.post('/records', formData);
        setPage(1);
        fetchRecords(search, 1);
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

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-medium text-slate-900">
              Records management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Search, view and upload academic records.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition shadow-sm shadow-teal-700/20"
          >
            <i className="ti ti-upload" style={{fontSize: 14}} aria-hidden="true"></i>
            Upload record
          </button>
        </div>

        {/* Stats — total comes from API (all matching rows), not just this page */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              value: total,
              label: 'Total Records',
              sub: 'All matching records',
              icon: 'ti-files',
            },
            {
              value: records.filter(r => r.file).length,
              label: 'With Attachments',
              sub: 'On this page',
              icon: 'ti-paperclip',
            },
            {
              value: search ? total : '—',
              label: 'Search Results',
              sub: search ? 'Matching query' : 'No active search',
              icon: 'ti-search',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-xl px-5 py-4 min-h-[108px] shadow-sm"
              style={{ backgroundColor: 'var(--ermis-brand-teal)' }}
            >
              {/* Diagonal sheen — same glossy cut as reference */}
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
                ></i>
              </div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2.5 bg-surface border border-line rounded-lg px-3 h-10 mb-4 focus-within:border-teal-500/50 transition">
          <i className="ti ti-search text-slate-500" style={{fontSize: 15}} aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search by school name, code or year..."
            value={search}
            onChange={handleSearch}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="text-slate-500 hover:text-slate-700 transition"
            >
              <i className="ti ti-x" style={{fontSize: 14}} aria-hidden="true"></i>
            </button>
          )}
        </div>

        {/* Records table */}
        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium text-slate-800">
              {search ? `Results for "${search}"` : 'All records'}
            </h2>
            <p className="text-[12px] text-slate-500 shrink-0">
              {total === 0
                ? 'No records'
                : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`}
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

          {/* Pagination controls */}
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

        {/* View record detail */}
        {viewingRecord && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-surface shadow-modal border border-line rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-medium text-slate-800">Record details</h3>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="text-slate-500 hover:text-slate-700 transition"
                >
                  <i className="ti ti-x" style={{fontSize: 18}} aria-hidden="true"></i>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'School name',       value: viewingRecord.nameOfSchool },
                  { label: 'School code',       value: viewingRecord.schoolCode },
                  { label: 'Year of graduation',value: viewingRecord.yearOfGraduation },
                  { label: 'Uploaded on',       value: new Date(viewingRecord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-line-subtle">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className="text-sm text-slate-700">{item.value}</span>
                  </div>
                ))}

                {/* File download — gated until supervisor approval */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-500">Attachment</span>
                  <RecordFileLink record={viewingRecord} />
                </div>
              </div>

              <button
                onClick={() => setViewingRecord(null)}
                className="w-full h-10 mt-5 border border-line rounded-lg text-sm text-slate-400 hover:text-slate-800 hover:border-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>

      {showUploadModal && (
        <UploadRecordModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUpload}
        />
      )}

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

export default RecordsDashboard;