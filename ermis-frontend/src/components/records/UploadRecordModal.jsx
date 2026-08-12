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
    } setLoading(false);
};

return (
    <div className = "fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div className = "bg-slate-900 border border-white/10 rounded-2xl w-full mx-w-md p-6">

        <div className = "flex items-center justify-between mb-5">
            <h3 className = "text-[15px] font-medium text-slate-200">Upload new record</h3>
            <button
                onClick = {onClose} className = "text-slate-500 hover:text-slate-300 transition"
            >
                <i className = "ti ti-x" style = {{fontSize: 18}} aria-hidden = "true"></i>

            </button>

        </div>

        <form onSubmit = {handleSubmit} className = "space-y-4">

            <div>
                <label className = "block text-xs text-slate-400 mb-1.5">School name</label>
                <input 
                type = "text"
                placeholder = "Oriwo Boys High School"
                value = {form.nameOfSchool}
                onChange = {e => setForm({ ...form, nameOfSchool: e.target.value })}
                required
                className = "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 h-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-teal-500/60 focus:ring-1 focus-ring-teal-500/30 transition"
                
                />
            </div>

            <div>
                <label className = "block text-xs text-slate-400 mb-1.5">School code</label>
                <input 
                type="text"
                placeholder = "417103001"
                value = {form.schoolCode}
                onChange = {e => setForm({ ...form, schoolCode: e.target.value })}
                required
                className = "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 h-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-teal-500/60 focus:ring-teal-500/30 transition"
                />
            </div>

            <div>
                <label className = "block text-xs text-slate-400 mb-1.5">Year of Graduation</label>
                <input 
                type = "text"
                type = "number"
                placeholder = "2007"
                min = "1990"
                max = "2099"
                value = {form.yearOfGraduation}
                onChange = {e => setForm({ ...form, yearOfGraduation: e.target.value })}
                required
                className = "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 h-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition"
                />
            </div>

            <div>
                <label className = "block text-xs text-slate-400 mb-1.5">
                    Attach file <span className = "text-slate-600">(optional)</span>
                </label>

                <div className = "relative">
                    <input 
                    type="file"
                    accept = ".pdf, .doc, .jpg, .png"
                    onChange = {e => setFile(e.target.files[0])}
                    className = "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-teal-500/20 file:text-teal-400 file:text-xs file:cursor-pointer cursor-pointer outline-none"
                     />

                </div>

                {file && (
                    <p className = "text-[11px] text-indigo-400 mt-1">
                        selected: {file.name}
                    </p>
                )}
            </div>

            {error && (
                <p className = "text-red-400 text-xs text-center">{error}</p>
            )}

            <div className = "flex gap-3 pt-1">
                <button
                    type = "button"
                    onClick = {onClose}
                    className = "flex-1 h-10 border border-white/10 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition"
                >
                    Cancel
                </button>

                <button
                    type = "submit"
                    disabled = {loading}
                    className = "flex-1 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-lg text-sm font-medium text-white transition"
                >
                    {loading ? 'Uploading...' : 'Upload record'}
                </button>

            </div>
        </form>

        </div>

    </div>
)
}
export default UploadRecordModal;