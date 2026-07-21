import { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import StatsRow from '../../components/admin/StatsRow';
import UserTable from '../../components/admin/UserTable';
import AddUserModal from '../../components/admin/AddUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import { api } from '../../utils/api';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [error, setError] = useState('');

    // Read logged in users from local storage (token)
    const token = localStorage.getItem('token');
    const currentUser = token
        ? JSON.parse(atob(token.split('.')[1]))
        : null;

        // Fetch users from the API
        useEffect(() => {
            fetchUsers();
        }, []);

        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await api.get('/admin/users');
                setUsers(data);
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false);
            }
        };

        const handleAddUser = async (form) => {
            await api.post('/admin/users', form);
            fetchUsers();
        };

        const handleDeactivate = async (id) => {
            if (!window.confirm('Deactivate this user?')) return;
            try {
                await api.delete(`/admin/users/${id}`);
                fetchUsers();
            } catch (err) {
                setError(err.message);
            }
        };

        const handleEdit = (user) => {
            setEditingUser(user);

        };

        const handleUpdate = async (id, form) => {
            await api.put(`/admin/users/${id}`, form);
            fetchUsers();
        }

        const activeUsers = users.filter(u => u.isActive).length;

        return (
            <div className = "min-h-screen bg-slate-950 flex">
                <Sidebar user = {currentUser} />

                <div className = "flex-1 p-6 overflow-y-auto">

                    {/* Header */}
                    <div className = "mb-6">
                        <h1 className = "text-lg font-medium text-slate-100">
                            Good Morning, {currentUser?.name}

                        </h1>

                        <p className = "text-sm text-slate-500 mt-0.5">
                            Here's what's happening in your system today.
                        </p>

                    </div>

                    {/*  stats row */}
                    <StatsRow 
                         totalUsers = {users.length}
                         activeUsers = {activeUsers}
                         totalRecords = {null}
                         pendingApprovals = {null}
                    
                    />

                    {/* User Table */}
                    <div className = "bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
                        <div className = "flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                            <h2 className = "text-[14px] font-medium text-slate-200">System Users</h2>

                            <button
                                onClick = {() => setShowAddUserModal(true)}
                                className = "flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium px-3 py-1.5 rounded-lg transition"
                            >
                                <i className = "ti ti-plus" style = {{fontSize: 14}} aria-hidden = "true"></i>
                                Add User

                            </button>

                        </div>

                        {error && (
                            <p className = "text-red-400 text-sm text-center py-4">{error}</p>
                        )}

                        {loading ? (
                            <p className = "text-slate-500 text-sm text-center py-6">Loading users...</p>
                        ) : (
                            <UserTable
                                users = {users}
                                onEdit = {handleEdit}
                                onDeactivate = {handleDeactivate}
                            />
                        )}

                    </div>

                </div>

                {showAddUserModal && (
                    <AddUserModal
                        onClose = {() => setShowAddUserModal(false)}
                        onSubmit = {handleAddUser}
                    />
                )}

                {editingUser && (
                    <EditUserModal 
                        user = {editingUser}
                        onClose = {() => setEditingUser(null)}
                        onSubmit = {handleUpdate}
                    />
                )}

            </div>
        );
}