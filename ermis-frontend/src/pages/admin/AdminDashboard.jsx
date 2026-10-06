import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import StatsRow from '../../components/admin/StatsRow';
import UserTable from '../../components/admin/UserTable';
import AddUserModal from '../../components/admin/AddUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import { api } from '../../utils/api';
import { decodeAccessToken } from '../../utils/auth';

const ACTION_LABELS = {
  RECORD_CREATED: 'Uploaded record',
  RECORD_UPDATED: 'Updated record',
  RECORD_DELETED: 'Deleted record',
  RECORD_APPROVED: 'Approved record',
  RECORD_REJECTED: 'Rejected record',
  BACKUP_RESTORED: 'Restored backup',
};

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [totalRecords, setTotalRecords] = useState(null);
  const [todayActions, setTodayActions] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  const currentUser = decodeAccessToken();

  useEffect(() => {
    fetchUsers();
    fetchOverviewStats();
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

  const fetchOverviewStats = async () => {
    try {
      const [recordsData, auditData] = await Promise.all([
        api.get('/records?page=1&limit=1'),
        api.get('/audit?limit=5'),
      ]);
      setTotalRecords(recordsData.total ?? 0);
      setTodayActions(auditData.todayCount ?? 0);
      setRecentLogs(auditData.logs || []);
    } catch (err) {
      // Overview still useful if records/audit fail
      console.error(err);
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

  const activeUsers = users.filter((u) => u.isActive).length;

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <Sidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">
            Good morning, {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage users and monitor what is happening across ExamTrack.
          </p>
        </div>

        <StatsRow
          totalUsers={users.length}
          activeUsers={activeUsers}
          totalRecords={totalRecords}
          todayActions={todayActions}
        />

        {/* Recent activity preview */}
        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="text-[14px] font-medium text-slate-800">Recent activity</h2>
            <button
              type="button"
              onClick={() => navigate('/dashboard/admin/audit')}
              className="text-[12px] text-teal-600 hover:text-teal-500 transition"
            >
              View audit trail
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentLogs.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">
                No activity logged yet.
              </p>
            )}
            {recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ti ti-history text-teal-600" style={{ fontSize: 11 }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-700">
                    {ACTION_LABELS[log.action] || log.summary}
                    {log.metadata?.nameOfSchool && (
                      <span className="text-slate-500">
                        {' '}
                        — {log.metadata.nameOfSchool}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {log.actorName} · {formatTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users preview */}
        <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
            <h2 className="text-[14px] font-medium text-slate-800">System users</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <i
                  className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ fontSize: 14 }}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search users…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 h-9 w-48 bg-muted border border-line rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500/50 transition"
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
            <p className="text-slate-500 text-sm text-center py-6">Loading users...</p>
          ) : (
            <UserTable
              users={filteredUsers}
              onEdit={handleEdit}
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
