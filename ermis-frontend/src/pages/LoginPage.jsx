import LoginForm from "../components/auth/LoginForm"

function BrandMark({ tone = "light" }) {
  const isLight = tone === "light";

  return (
    <div
      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl border backdrop-blur-sm ${
        isLight
          ? "bg-white/20 border-white/30"
          : "bg-teal-50 border-teal-100"
      }`}
    >
      <svg
        className={`w-7 h-7 ${isLight ? "text-white" : "text-teal-600"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-4-4h8"
        />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left — crystal teal brand panel */}
      <div
        className="relative lg:w-[46%] min-h-[28vh] lg:min-h-screen flex items-center justify-center px-8 py-12 overflow-hidden"
        style={{ backgroundColor: "#0D9488" }}
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_90%,rgba(13,148,136,0.35),transparent_50%)]" />

        <div className="relative z-10 text-center max-w-sm mx-auto">
          <BrandMark tone="light" />
          <h1 className="text-3xl font-semibold tracking-tight text-white mt-5">ExamTrack</h1>
          <p className="text-teal-50/90 mt-3 text-sm leading-relaxed">
            Examination &amp; records management for your institution.
          </p>
        </div>
      </div>

      {/* Right — floating login form */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Centered header above the form */}
          <div className="text-center mb-7">
            <BrandMark tone="dark" />
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mt-4">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Sign in to continue to ExamTrack
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18),0_8px_20px_-8px_rgba(15,23,42,0.12)]">
            <LoginForm embedded />
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 ExamTrack · For authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
