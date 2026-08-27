import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAccessToken } from "../../utils/auth";

export default function LoginForm({ embedded = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(15000),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid response from server');
      }

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      if (!data.accessToken || !data.role) {
        setError('Login response was incomplete. Please try again.');
        return;
      }

      // Access token in localStorage; refresh token is httpOnly cookie
      setAccessToken(data.accessToken);

      const routes = {
        admin: '/dashboard/admin',
        records_officer: '/dashboard/records',
        supervisor: '/dashboard/supervisor',
        ict_officer: '/dashboard/ict',
      };

      const dest = routes[data.role];
      if (!dest) {
        setError('Unknown user role. Contact an administrator.');
        return;
      }

      navigate(dest);
    } catch (err) {
      console.error('Login error:', err);
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError('Server took too long to respond. Check that the backend can reach the database.');
      } else {
        setError('Server error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const body = (
    <>
      {!embedded && (
        <h2 className="text-[15px] font-medium text-slate-800 mb-5">
          Sign in to your account
        </h2>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5 tracking-wide">
            Email address
          </label>
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 h-10
                          focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition">
            <MailIcon />
            <input
              type="email"
              placeholder="you@institution.edu"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setError('');
              }}
              required
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-slate-500 tracking-wide">Password</label>
            <button type="button" className="text-xs text-teal-700 hover:text-teal-800 transition">
              Forgot password?
            </button>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 h-10
                          focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition">
            <LockIcon />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setError('');
              }}
              required
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-700 transition"
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-xs text-center -mt-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-teal-600 hover:bg-teal-500 disabled:opacity-60
                     rounded-lg text-sm font-semibold text-white shadow-md shadow-teal-700/20
                     transition flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Spinner /> : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-5">
        Secured by ExamTrack · Authorized users only
      </p>
    </>
  );

  if (embedded) {
    return <div>{body}</div>;
  }

  return (
    <div className="bg-white rounded-2xl p-7 shadow-2xl border border-slate-100">
      {body}
    </div>
  );
}

const MailIcon = () => (
  <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0S4 12 4 12a8 8 0 0016 0s-5 0-5 0" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.168-3.168M6.343 6.343A9.97 9.97 0 0112 5c5 0 9 4 9 7a9.77 9.77 0 01-1.512 2.488M3 3l18 18" />
  </svg>
);
const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);
