import { useState } from "react";

const ROLES = [
    { value : 'records_officer', label : 'Records officer'},
    { value : 'supervisor', label : 'Supervisor' },
    { value : 'ict_officer', label : 'ICT officer' },
    { value : 'admin', label : 'Admin' }    
];

export default function EditUserModal({ user, onClose, onSubmit }){
    const [form, setForm] = useState({
        name : user.name,
        email : user.email,
        role : user.role,
        isActive : user.isActive,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit(user._id, form);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className = "fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className ="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6">

                <div className = "flex items-center justify-between mb-5">
                    <h3 className = "text-[15px] font-medium text-slate-200">Edit User</h3>
                    <button onClick = {onClose} className = "text-slate-500 hover:text-slate-300 transition">
                        <i className = "ti ti-x" style = {{ fontsize: 18 }} aria-hidden = "true"></i>
                    </button>
                </div>

                <form onSubmit = {handleSubmit} className = "space-y-4">

                    {/* Name input */}
                    <div>
                        <label className = "block text-xs text-slate-400 mb-1.5">Full Name</label>
                        <input 
                            type = "text"
                            value = {form.name}
                            onChange = {e => setForm({ ...form, name : e.target.value })}
                            required
                            className = "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 h-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
                        />
                    </div>

                    {/* Email input */}
                    <div>
                        <label className = "block text-xs text-slate-400 mb-1.5">Email Address</label>
                        <input 
                            type = "email"
                            value = {form.email}
                            onChange = {e => setForm({ ...form, email : e.target.value})}
                            className = "w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 h-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className = "block text-xs text-slate-400 mb-1.5">Role</label>
                        <select
                            value = {form.role}
                            onChange = {e => setForm({ ...form, role : e.target.value })}
                            className = "w-full bg-slate-800 border border-white/10 rounded-lg px-3 h-10 text-sm text-slate-200 outline-none focus:border-indigo-500/60 transition"
                        >
                            {ROLES.map(role => (
                                <option key = {role.value} value = {role.value}>{role.label}</option>
                            ) )}

                        </select>
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className = "block text-xs text-slate-400 mb-1.5">Status</label>
                        <select
                            value = {form.isActive.toString()}
                            onChange = {e => setForm({ ...form, isActive: e.target.value === 'true' })}
                            className = "w-full bg-slate-800 border border-white/10 rounded-lg px-3 h-10 text-sm text-slate-200 outline-none focus:border-indigo-500/60 transition"
                        >
                            <option value = "true">Active</option>
                            <option value = "false">Inactive</option>


                        </select>
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
                            {loading ? 'Saving...' : 'Save Changes'}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );

}