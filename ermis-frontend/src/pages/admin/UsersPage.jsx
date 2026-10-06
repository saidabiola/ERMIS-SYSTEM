import { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import UserTable from '../../components/admin/UserTable';
import AddUserModal from '../../components/admin/AddUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import { api } from '../../utils/api';
import { decodeAccessToken } from '../../utils/auth';

/**
 * User management — sidebar /dashboard/admin/users
 * API: GET/POST/PUT/DELETE /api/admin/users
 */
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const currentUser = decodeAccessToken();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
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

  const handleUpdate = async (id, form) => {
    await api.put(`/admin/users/${id}`, form);
    fetchUsers();
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <Sidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">User management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create accounts, assign roles, and activate or deactivate access.
          </p>
        </div>

        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
            <h2 className="text-[14px] font-medium text-slate-800">
              All users
              <span className="ml-2 text-[12px] font-normal text-slate-500">
                {filteredUsers.length}
                {search ? ` matching` : ''}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <i
                  className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ fontSize: 14 }}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search by name, email, role…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 h-9 w-56 bg-muted border border-line rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500/50 transition"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[13px] font-medium px-3 py-1.5 rounded-lg transition shadow-sm shadow-teal-700/20"
              >
                <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
                Add user
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center py-4">{error}</p>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm text-center py-8">Loading users...</p>
          ) : (
            <UserTable
              users={filteredUsers}
              onEdit={setEditingUser}
              onDeactivate={handleDeactivate}
            />
          )}
        </div>
      </div>

      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSubmit={handleAddUser}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
