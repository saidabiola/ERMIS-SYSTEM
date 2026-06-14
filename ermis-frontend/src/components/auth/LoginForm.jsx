import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function LoginForm() {1
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    // TODO: connect to your Express /api/auth/login endpoint
     
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      //Store Token

      localStorage.setItem('token', data.token);

      //Role-based redirect lives here

      const routes = {
        admin: '/dashboard/admin',
        records_officer: '/dashboard/records',
        supervisor: '/dashboard/supervisor',
        ict_officer: '/dashboard/ict',
      };

      navigate(routes[data.role]);

    } catch (err) {
      console.error('Login error:', err)
      setError('Server error. Please try again');

    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7">
      <h2 className="text-[15px] font-medium text-slate-200 mb-5">
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 tracking-wide">
            Email address
          </label>
          <div className="flex items-center gap-2.5 bg-white/[0.06] border border-white/10 rounded-lg px-3 h-10
                          focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition">
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
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-slate-400 tracking-wide">Password</label>
            <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
              Forgot password?
            </button>
          </div>
          <div className="flex items-center gap-2.5 bg-white/[0.06] border border-white/10 rounded-lg px-3 h-10
                          focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition">
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
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300 transition">
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>

            
          </div>
        </div>

            {error && (
              <p className="text-red-400 text-xs text-center -mt-2">
                {error}
              </p>
            )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60
                     rounded-lg text-sm font-medium text-white transition flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Spinner /> : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-5">
        Secured by ExamTrack · Authorized users only
      </p>
    </div>
  );
}

// --- Inline icon components ---
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