import { useState } from "react";

function UploadRecordModal({ onClose, onSubmit }) {
    const [form, setForm] = useState({
        nameOfSchool: '',
        schoolCode: '',
        yearOfGraduation: '',
    });

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('nameOfSchool', form.nameOfSchool);
            formData.append('schoolCode', form.schoolCode);
            formData.append('yearOfGraduation', form.yearOfGraduation);
            if (file) formData.append('file', file);

            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // click outside is not required; X / Cancel closes the upload modal
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
           
            <div
                className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="upload-record-title"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h3 id="upload-record-title" className="text-[15px] font-medium text-slate-800">
                        Upload new record
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-500 transition hover:text-slate-700"
                    >
                        <i className="ti ti-x" style={{ fontSize: 18 }} aria-hidden="true"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">School name</label>
                        <input
                            type="text"
                            placeholder="Oriwo Boys High School"
                            value={form.nameOfSchool}
                            onChange={(e) => setForm({ ...form, nameOfSchool: e.target.value })}
                            required
                            className="h-10 w-full rounded-lg border border-line bg-muted px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">School code</label>
                        <input
                            type="text"
                            placeholder="417103001"
                            value={form.schoolCode}
                            onChange={(e) => setForm({ ...form, schoolCode: e.target.value })}
                            required
                            className="h-10 w-full rounded-lg border border-line bg-muted px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">Year of graduation</label>
                        <input
                            type="number"
                            placeholder="2007"
                            min="1990"
                            max="2099"
                            value={form.yearOfGraduation}
                            onChange={(e) => setForm({ ...form, yearOfGraduation: e.target.value })}
                            required
                            className="h-10 w-full rounded-lg border border-line bg-muted px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">
                            Attach file <span className="text-slate-400">(optional)</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full cursor-pointer rounded-lg border border-line bg-muted px-3 py-2 text-sm text-slate-500 outline-none file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-xs file:text-teal-700"
                        />
                        {file && (
                            <p className="mt-1 text-[11px] text-teal-700">Selected: {file.name}</p>
                        )}
                    </div>

                    {error && (
                        <p className="text-center text-xs text-red-600">{error}</p>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 flex-1 rounded-lg border border-line text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-10 flex-1 rounded-lg bg-teal-600 text-sm font-medium text-white transition hover:bg-teal-500 disabled:opacity-60"
                        >
                            {loading ? 'Uploading...' : 'Upload record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadRecordModal;
