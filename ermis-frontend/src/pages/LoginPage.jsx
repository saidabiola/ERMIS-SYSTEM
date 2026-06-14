import LoginForm from "../components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-4-4h8" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-slate-100">ExamTrack</h1>
          <p className="text-sm text-slate-400 mt-1">Examination & Records Management</p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-slate-600 mt-5">
          © 2026 ExamTrack · For authorized personnel only
        </p>
      </div>
    </div>
  );
}