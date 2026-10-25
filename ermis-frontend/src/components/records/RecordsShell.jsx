import { useState } from "react";
import RecordsSidebar from "./RecordsSidebar";

/**
 * Records portal frame.
 * Desktop: sidebar stays open.
 * Phone: sidebar is a drawer so the page can use the full width.
 */
export default function RecordsShell({ user, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas flex overflow-hidden">
      <RecordsSidebar
        user={user}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-hidden">
        <div className="md:hidden flex items-center gap-3 h-14 px-4 border-b border-line bg-surface shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 rounded-lg border border-line text-slate-700 flex items-center justify-center"
            aria-label="Open menu"
          >
            <i className="ti ti-menu-2" style={{ fontSize: 18 }} aria-hidden="true"></i>
          </button>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 leading-tight">ExamTrack</p>
            <p className="text-[11px] text-slate-500 leading-tight">Records Portal</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
