const roleBadge = {
    admin: 'bg-indigo-500/15 text-indigo-400',
    records_officer: 'bg-teal-500/15 text-teal-400',
    supervisor: 'bg-amber-500/15 text-amber-400',
    ict_officer: 'bg-pink-500/15 text-pink-400'
};

const roleLabel = {
    admin: 'Admin',
    records_officer: 'Records Officer',
    supervisor: 'Supervisor',
    ict_officer: 'ICT Officer'
};

export default function UserTable({ users, onEdit, onDeactivate }) {
    if (!users.length) {
        return (
            <p className = "text-sm text-slate-500 text-center py-8">
                No users found.
            </p>
        );
    }

    return (
        <div className = "overflow-x-auto">
            <table className = "w-full text-sm">
                <thead>
                    <tr className = "text-[11px] text-slate-600 uppercase tracking-wider border-b border-white/[0.06]">
                        <th className = "text-left px-4 py-3 font-medium">Name</th>
                        <th className = "text-left px-4 py-3 font-medium">Email</th>
                        <th className = "text-left px-4 py-3 font-medium">Role</th>
                        <th className = "text-left px-4 py-3 font-medium">Status</th>
                        <th className = "text-left px-4 py-3 font-medium">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(user => {
                        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

                        return (
                            <tr key = {user._id} className = "border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                                <td className = "px-4 py-3">
                                    <div className = "flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px] font-medium text-indigo-400 shrink-0">
                                            {initials}

                                        </div>
                                        <span className="text-slate-300 text-[13px] capitalize">{user.name.toLowerCase()}</span>

                                    </div>

                                </td>

                                <td className = "px-4 py-3 text-slate-500 text-[13px]">{user.email}</td>
                                <td className = "px-4 py-3">
                                    <span className = {`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${roleBadge[user.role]}`}>
                                        {roleLabel[user.role]}

                                    </span>

                                </td>

                                <td className = "px-4 py-3">
                                    <span className = {`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium
                                        ${user.isActive 
                                            ? 'bg-green-500/15 text-green-400'
                                            : 'bg-red-500/15 text-red-400'
                                        }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}

                                    </span>

                                </td>

                                <td className = "px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick = {() => onEdit(user)}
                                            className = "text-slate-500 hover:text-indigo-400 transition"
                                            title = "Edit User"
                                            >
                                                <i className = "ti ti-edit" style={{ fontSize: 15}} aria-hidden = "true"></i>
                                        </button>

                                        <button 
                                            onClick = {() => onDeactivate(user._id)}
                                            disabled = {!user.isActive}
                                            className = "text-slate-500 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            title = "Deactivate User"
                                        >
                                            <i className = "ti ti-user-off" style = {{ fontSize: 15}} aria-hidden = "true"></i>

                                        </button>

                                    </div>

                                </td>
                                        
                            </tr>
                        );
                    })}
                </tbody>

            </table>

        </div>
    );

}