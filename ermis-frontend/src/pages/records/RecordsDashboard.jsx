import { useState, useEffect } from 'react'
import RecordsSidebar from '../../components/records/RecordsSidebar';
import RecordsTable from '../../components/records/RecordsTable';
import UploadRecordModal from '../../components/records/UploadRecordModal';

function RecordsDashboard(){
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [viewingRecord, setViewingRecord] = useState(null);
    const [error, setError] = useState('');

    //read logged in user from the token
    const token = localStorage.getItem('token');
    const currentUser = token ?
        JSON.parse(atob(token.split('.')[1]))
        : null;

    useEffect(() => {
      
        fetchRecords();
    }, []);

    const fetchRecords = async (searchTerm = '') => {
        try {
            setLoading(true);
            const query = searchTerm ? `?search=${searchTerm}` : '';
            const res = await fetch(`/api/records${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setRecords(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false)
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        fetchRecords(value);
    };

    const handleUpload = async (formData) => {
        const res = await fetch('/api/records', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        fetchRecords();
    };

    return (
        
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">

      <RecordsSidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-medium text-slate-100">
              Records management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Search, view and upload academic records.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition"
          >
            <i className="ti ti-upload" style={{fontSize: 14}} aria-hidden="true"></i>
            Upload record
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">Total records</p>
            <p className="text-2xl font-medium text-slate-200">{records.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">With attachments</p>
            <p className="text-2xl font-medium text-teal-400">
              {records.filter(r => r.file).length}
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">Search results</p>
            <p className="text-2xl font-medium text-indigo-400">
              {search ? records.length : '—'}
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 h-10 mb-4 focus-within:border-teal-500/50 transition">
          <i className="ti ti-search text-slate-500" style={{fontSize: 15}} aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search by school name, code or year..."
            value={search}
            onChange={handleSearch}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); fetchRecords(); }}
              className="text-slate-500 hover:text-slate-300 transition"
            >
              <i className="ti ti-x" style={{fontSize: 14}} aria-hidden="true"></i>
            </button>
          )}
        </div>

        {/* Records table */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-[14px] font-medium text-slate-200">
              {search ? `Results for "${search}"` : 'All records'}
            </h2>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center py-4">{error}</p>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm text-center py-8">Loading records...</p>
          ) : (
            <RecordsTable
              records={records}
              onView={setViewingRecord}
            />
          )}
        </div>

        {/* View record detail */}
        {viewingRecord && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-medium text-slate-200">Record details</h3>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="text-slate-500 hover:text-slate-300 transition"
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
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className="text-sm text-slate-300">{item.value}</span>
                  </div>
                ))}

                {/* File download */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-500">Attachment</span>
                  {viewingRecord.file ? (
                    <a
                      href={`/uploads/${viewingRecord.file}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-teal-400 text-sm hover:text-teal-300 transition"
                    >
                      <i className="ti ti-download" style={{fontSize: 14}} aria-hidden="true"></i>
                      Download file
                    </a>
                  ) : (
                    <span className="text-slate-600 text-sm">No file attached</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setViewingRecord(null)}
                className="w-full h-10 mt-5 border border-white/10 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition"
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

    </div>
  );
    
}

export default RecordsDashboard;