import { useState, useEffect } from "react";
import ICTSidebar from "../../components/ict/ICTSidebar";
import { api } from "../../utils/api";
import { decodeAccessToken } from "../../utils/auth";
import {
  IconDatabaseExport,
  IconCircleCheck,
  IconAlertTriangle,
  IconRefresh,
  IconHistory,
  IconDatabaseImport,
} from "@tabler/icons-react";

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ICTDashboard() {
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState("");
  const [dbStatus, setDbStatus] = useState("checking");
  const [serverStatus, setServerStatus] = useState("checking");
  const [records, setRecords] = useState(0);
  const [lastBackupLabel, setLastBackupLabel] = useState("—");
  const [latestBackupId, setLatestBackupId] = useState(null);
  const [backups, setBackups] = useState([]);

  const currentUser = decodeAccessToken();

  useEffect(() => {
    checkSystemHealth();
    loadLatestBackup();
    loadBackups();
  }, []);

  const formatBackupDate = (isoDate) => {
    if (!isoDate) return "—";
    return new Date(isoDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const checkSystemHealth = async () => {
    try {
      setDbStatus("checking");
      setServerStatus("checking");
      const data = await api.get("/ict/health");
      setServerStatus(data.server || "online");
      setDbStatus(data.database || "error");
      setRecords(data.stats?.records ?? 0);
    } catch (_) {
      setDbStatus("error");
      setServerStatus("error");
    }
  };

  const loadLatestBackup = async () => {
    try {
      const latest = await api.get("/ict/backups/latest");
      setLastBackupLabel(
        latest?.createdAt ? formatBackupDate(latest.createdAt) : "—"
      );
      setLatestBackupId(latest?.id || null);
    } catch (_) {
      setLastBackupLabel("—");
      setLatestBackupId(null);
    }
  };

  const loadBackups = async () => {
    try {
      const list = await api.get("/ict/backups");
      setBackups((list || []).filter((b) => b.status === "success").slice(0, 5));
    } catch (_) {
      setBackups([]);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupSuccess(false);
    setRestoreMessage("");
    try {
      await api.post("/ict/backups");
      setBackupSuccess(true);
      await loadLatestBackup();
      await loadBackups();
      setTimeout(() => setBackupSuccess(false), 3000);
    } catch (_) {
      setBackupSuccess(false);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (backupId) => {
    if (!backupId) return;

    const ok = window.confirm(
      "Restore this backup?\n\n" +
        "• All current records will be replaced\n" +
        "• Users will be upserted from the backup\n" +
        "• Uploaded files on disk are NOT restored\n\n" +
        "This cannot be undone (unless you restore another backup)."
    );
    if (!ok) return;

    setRestoreLoading(true);
    setRestoreMessage("");
    try {
      const result = await api.post(`/ict/backups/${backupId}/restore`);
      setRestoreMessage(
        `Restored ${result.recordsRestored} records, ${result.usersUpserted} users` +
          (result.usersSkipped ? ` (${result.usersSkipped} users skipped — old backup without passwords)` : "")
      );
      await checkSystemHealth();
      await loadLatestBackup();
    } catch (err) {
      setRestoreMessage(err.message || "Restore failed");
    } finally {
      setRestoreLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === "online") {
      return (
        <span className="flex items-center gap-1.5 text-green-600 text-[12px]">
          <IconCircleCheck size={13} /> Online
        </span>
      );
    }
    if (status === "error") {
      return (
        <span className="flex items-center gap-1.5 text-red-600 text-[12px]">
          <IconAlertTriangle size={13} /> Error
        </span>
      );
    }
    return <span className="text-slate-500 text-[12px]">Checking...</span>;
  };

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <ICTSidebar user={currentUser} />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-lg font-medium text-slate-900">
            Good morning, {currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor system health and manage backups.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-surface border border-line shadow-panel rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">Server</p>
            <StatusBadge status={serverStatus} />
          </div>
          <div className="bg-surface border border-line shadow-panel rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">Database</p>
            <StatusBadge status={dbStatus} />
          </div>
          <div className="bg-surface border border-line shadow-panel rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">Total records</p>
            <p className="text-2xl font-medium text-slate-800">{records}</p>
          </div>
          <div className="bg-surface border border-line shadow-panel rounded-xl p-4">
            <p className="text-[11px] text-slate-500 mb-1.5">Last backup</p>
            <p className="text-[13px] font-medium text-pink-600">{lastBackupLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Backup */}
          <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-line">
              <IconDatabaseExport size={15} className="text-pink-600" />
              <h2 className="text-[14px] font-medium text-slate-800">
                Database backup
              </h2>
            </div>
            <div className="p-5">
              <p className="text-[13px] text-slate-500 mb-5">
                Create a JSON backup of users and records. New backups include
                password hashes so restore can recreate logins.
              </p>

              <button
                type="button"
                onClick={handleBackup}
                disabled={backupLoading}
                className={`w-full h-11 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition
                  ${
                    backupSuccess
                      ? "bg-green-600 hover:bg-green-500 text-white"
                      : "bg-pink-600 hover:bg-pink-500 disabled:opacity-60 text-white"
                  }`}
              >
                {backupLoading ? (
                  <>
                    <IconRefresh size={15} className="animate-spin" />
                    Creating backup...
                  </>
                ) : backupSuccess ? (
                  <>
                    <IconCircleCheck size={15} />
                    Backup complete!
                  </>
                ) : (
                  <>
                    <IconDatabaseExport size={15} />
                    Create backup now
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={checkSystemHealth}
                className="w-full h-10 mt-3 border border-line rounded-lg text-[13px] text-slate-400 hover:text-slate-800 hover:border-slate-300 flex items-center justify-center gap-2 transition"
              >
                <IconRefresh size={14} />
                Refresh system status
              </button>
            </div>
          </div>

          {/* Restore */}
          <div className="bg-surface border border-line shadow-panel rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-line">
              <IconDatabaseImport size={15} className="text-indigo-600" />
              <h2 className="text-[14px] font-medium text-slate-800">
                Restore from backup
              </h2>
            </div>
            <div className="p-5">
              <p className="text-[13px] text-slate-500 mb-4">
                Replaces all records with the chosen backup. Users are merged by
                email. Uploaded files on disk are not restored.
              </p>

              <button
                type="button"
                onClick={() => handleRestore(latestBackupId)}
                disabled={!latestBackupId || restoreLoading}
                className="w-full h-11 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white"
              >
                {restoreLoading ? (
                  <>
                    <IconRefresh size={15} className="animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <IconDatabaseImport size={15} />
                    Restore latest backup
                  </>
                )}
              </button>

              {restoreMessage && (
                <p className="mt-3 text-[12px] text-slate-600 text-center">
                  {restoreMessage}
                </p>
              )}

              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconHistory size={14} className="text-slate-500" />
                  <p className="text-[12px] font-medium text-slate-700">
                    Recent successful backups
                  </p>
                </div>

                {backups.length === 0 ? (
                  <p className="text-[12px] text-slate-500">No backups yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {backups.map((b) => (
                      <li
                        key={b.id}
                        className="flex items-center justify-between gap-2 text-[12px]"
                      >
                        <span className="text-slate-600 truncate">
                          {formatBackupDate(b.createdAt)} · {formatBytes(b.sizeBytes)}
                        </span>
                        <button
                          type="button"
                          disabled={restoreLoading}
                          onClick={() => handleRestore(b.id)}
                          className="shrink-0 text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                        >
                          Restore
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ICTDashboard;
