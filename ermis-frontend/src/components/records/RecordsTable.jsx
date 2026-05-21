function RecordsTable({ records, onDelete, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full text-sm text-left">

        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">School</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Year</th>
            <th className="px-4 py-3">File</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record._id} className="border-t hover:bg-gray-50">

              <td className="px-4 py-3">{record.nameOfSchool}</td>
              <td className="px-4 py-3">{record.schoolCode}</td>
              <td className="px-4 py-3">{record.yearOfGraduation}</td>

              <td className="px-4 py-3">
                {record.file ? (
                  <a
                    href={`http://localhost:5000/uploads/${record.file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                ) : "No file"}
              </td>

              <td className="px-4 py-3 flex gap-2">

                <button
                  onClick={() => onEdit(record)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(record._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
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