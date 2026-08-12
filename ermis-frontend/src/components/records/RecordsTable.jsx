function RecordsTable({ records, onView }) {
  if (!records.length) {
    return (
      <div className = "text-center py-12">
        <i className = "ti ti-files text-slate-700" style = {{fontSize: 40}} aria-hidden = "true"></i>
        <p className = "text-slate-500 text-sm mt-3">No records found.</p>
      </div>
    );
  }

  return (
    <div className = "overflow-x-auto">
      <table className = "w-full text-sm">
        <thead>
          <tr className = "text-[11px] text-slate-600 uppercase tracking-wider border-b border-white/[0.06]">
            <th className = "text-left px-4 py-3 font-medium">School name</th>
            <th className = "text-left px-4 py-3 font-medium">School code</th>
            <th className = "text-left px-4 py-3 font-medium">Year</th>
            <th className = "text-left px-4 py-3 font-medium">File</th>
            <th className = "text-left px-4 py-3 font-medium">Uploaded</th>
            <th className = "text-left px-4 py-3 font-medium">Actions</th>

          </tr>
        </thead>

        <tbody>
          {records.map(record => (
            <tr 
            key = {record._id}
            className = "border-b border-white/[0.04] hover:bg-white/[0.02] transition"
            >
              <td className = "px-4 py-3 text-slate-300  text-[13px]">
                  {record.nameOfSchool}
              </td>

              <td className = "px-4 py-3 text-slate-400 text-[13px]">
                  {record.schoolCode}
              </td>

              <td className = "px-4 py-3 text-slate-400 text-[13px]">
                  {record.yearOfGraduation}
              </td>

              <td className = "px-4 py-3">
                  {record.file? (
                    <span className = "inline-flex items-center gap-1.5 text-teal-400 text-[12px]">
                      <i className = "ti ti-paperclip" style = {{fontSize: 13}} aria-hidden = "true"></i>
                      Attached
                    </span>
                  ) : (
                    <span className = "text-slate-600 text-[12px]">No file</span>
                  )}
              </td>

              <td className = "px-4 py-3">
                <button
                  onClick = {() => onView(record)}
                  className = "text-slate-500 hover:text-teal-400 transition"
                  title = "View record"
                >
                  <i className = "ti ti-eye" style = {{fontSize:15}} aria-hidden = "true"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecordsTable;