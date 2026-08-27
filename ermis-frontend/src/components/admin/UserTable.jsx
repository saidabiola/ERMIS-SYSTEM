const roleBadge = {
    admin: 'bg-indigo-50 text-indigo-700',
    records_officer: 'bg-teal-50 text-teal-700',
    supervisor: 'bg-amber-50 text-amber-700',
    ict_officer: 'bg-pink-50 text-pink-700'
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
                    <tr className = "text-[11px] text-slate-600 uppercase tracking-wider border-b border-line">
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
                            <tr key = {user._id} className = "border-b border-line-subtle hover:bg-slate-50 transition">
                                <td className = "px-4 py-3">
                                    <div className = "flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[11px] font-medium text-indigo-600 shrink-0">
                                            {initials}

                                        </div>
                                        <span className="text-slate-700 text-[13px] capitalize">{user.name.toLowerCase()}</span>

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
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                        }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}

                                    </span>

                                </td>

                                <td className = "px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick = {() => onEdit(user)}
                                            className = "text-slate-500 hover:text-indigo-600 transition"
                                            title = "Edit User"
                                            >
                                                <i className = "ti ti-edit" style={{ fontSize: 15}} aria-hidden = "true"></i>
                                        </button>

                                        <button 
                                            onClick = {() => onDeactivate(user._id)}
                                            disabled = {!user.isActive}
                                            className = "text-slate-500 hover:text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
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