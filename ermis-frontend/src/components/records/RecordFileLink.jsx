import { api } from '../../utils/api';
import { decodeAccessToken } from '../../utils/auth';

/**
 * Authenticated attachment download.
 * Backend enforces: officers only after approval; supervisor/admin can always open.
 */
export default function RecordFileLink({ record, className = '' }) {
  if (!record?.file) {
    return <span className="text-slate-600 text-sm">No file attached</span>;
  }

  const user = decodeAccessToken();
  const role = user?.role;
  const status = record.status || 'approved';
  const isReviewer = role === 'supervisor' || role === 'admin';
  const officerBlocked = !isReviewer && status !== 'approved';

  if (officerBlocked) {
    return (
      <span className="text-[12px] text-amber-700" title="Supervisor must approve first">
        {status === 'rejected'
          ? 'Rejected — download locked'
          : 'Awaiting approval — download locked'}
      </span>
    );
  }

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      await api.downloadRecordFile(record._id, record.file);
    } catch (err) {
      window.alert(err.message || 'Download failed');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={
        className ||
        'flex items-center gap-1.5 text-teal-600 text-sm hover:text-teal-700 transition'
      }
    >
      <i className="ti ti-download" style={{ fontSize: 14 }} aria-hidden="true" />
      {isReviewer && status !== 'approved' ? 'Review file' : 'Download file'}
    </button>
  );
}
