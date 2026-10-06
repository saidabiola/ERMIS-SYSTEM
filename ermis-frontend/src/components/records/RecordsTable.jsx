function RecordsTable({ records, onView, onEdit, onDelete }) {
  if (!records.length) {
    return (
      <div className="text-center py-12">
        <i className="ti ti-files text-slate-700" style={{ fontSize: 40 }} aria-hidden="true"></i>
        <p className="text-slate-500 text-sm mt-3">No records found.</p>
      </div>
    );
  }

  return (
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
            <th className="text-left px-4 py-3.5 text-[12px] font-semibold text-slate-800 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr
              key={record._id}
              className="border-b border-line-subtle hover:bg-slate-50 transition"
            >
              <td className="px-4 py-3 text-slate-700 text-[13px] font-normal">
                {record.nameOfSchool}
              </td>

              <td className="px-4 py-3 text-slate-500 text-[13px] font-normal">
                {record.schoolCode}
              </td>

              <td className="px-4 py-3 text-slate-500 text-[13px] font-normal">
                {record.yearOfGraduation}
              </td>

              <td className="px-4 py-3">
                {record.file ? (
                  <span className="inline-flex items-center gap-1.5 text-teal-600 text-[12px]">
                    <i className="ti ti-paperclip" style={{ fontSize: 13 }} aria-hidden="true"></i>
                    Attached
                  </span>
                ) : (
                  <span className="text-slate-500 text-[12px]">No file</span>
                )}
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={record.status} />
              </td>

              <td className="px-4 py-3 text-slate-500 text-[13px] font-normal">
                {record.createdAt
                  ? new Date(record.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {onView && (
                    <button
                      type="button"
                      onClick={() => onView(record)}
                      className="text-slate-500 hover:text-teal-600 transition"
                      title="View record"
                    >
                      <i className="ti ti-eye" style={{ fontSize: 15 }} aria-hidden="true"></i>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="text-slate-500 hover:text-teal-600 transition"
                      title="Edit record"
                    >
                      <i className="ti ti-pencil" style={{ fontSize: 15 }} aria-hidden="true"></i>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(record)}
                      className="text-slate-500 hover:text-red-600 transition"
                      title="Delete record"
                    >
                      <i className="ti ti-trash" style={{ fontSize: 15 }} aria-hidden="true"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const key = status || "approved";
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-teal-50 text-teal-700",
    rejected: "bg-red-50 text-red-700",
  };
  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[key] || styles.approved}`}
    >
      {labels[key] || "Approved"}
    </span>
  );
}

export default RecordsTable;
