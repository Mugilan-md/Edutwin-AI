import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { signInUser } from "../services/authService";
import { getProfile } from "../services/profileService";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  Award,
  TrendingUp,
  Brain,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

// ─── Network Block Diagram Component ──────────────────────────────────────────
function BlockDiagram() {
  return (
    <div className="relative w-[340px] h-[340px] mx-auto flex items-center justify-center my-6 animate-float shrink-0">
      
      {/* Center Brain Hub */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 flex flex-col items-center justify-center p-1 border border-red-300/40 shadow-[0_0_30px_rgba(229,57,53,0.35)] relative z-20 animate-pulse-ring">
        <Brain className="w-9 h-9 text-white animate-bounce-soft" />
        <span className="text-[9px] font-black tracking-wider uppercase mt-1 text-red-50">EDUTWIN AI</span>
      </div>

      {/* Connecting paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 320">
        <line x1="60" y1="60" x2="160" y2="160" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="8 8" style={{ animation: "line-flow 4s linear infinite" }} />
        <line x1="260" y1="60" x2="160" y2="160" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8 8" style={{ animation: "line-flow 4s linear infinite" }} />
        <line x1="40" y1="160" x2="160" y2="160" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="8 8" style={{ animation: "line-flow 4s linear infinite" }} />
        <line x1="280" y1="160" x2="160" y2="160" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="8 8" style={{ animation: "line-flow 4s linear infinite" }} />
        <line x1="160" y1="270" x2="160" y2="160" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="8 8" style={{ animation: "line-flow 4s linear infinite" }} />
      </svg>

      {/* 5 Nodes */}
      {/* Node 1: Top Left */}
      <div className="absolute top-[20px] left-[15px] z-20 flex flex-col items-center group cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
          <GraduationCap className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-bold mt-1 text-slate-700 bg-white/95 border border-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-sm">Academic Details</span>
      </div>

      {/* Node 2: Top Right */}
      <div className="absolute top-[20px] right-[15px] z-20 flex flex-col items-center group cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
          <Award className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-bold mt-1 text-slate-700 bg-white/95 border border-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-sm">Co-Curricular Activities</span>
      </div>

      {/* Node 3: Left Center */}
      <div className="absolute left-[-20px] top-[140px] z-20 flex flex-col items-center group cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-bold mt-1 text-slate-700 bg-white/95 border border-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-sm">Skills & OCR Parsing</span>
      </div>

      {/* Node 4: Right Center */}
      <div className="absolute right-[-20px] top-[140px] z-20 flex flex-col items-center group cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
          <Briefcase className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-bold mt-1 text-slate-700 bg-white/95 border border-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-sm">Internships & Projects</span>
      </div>

      {/* Node 5: Bottom Center */}
      <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center group cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300 shadow-sm">
          <TrendingUp className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-bold mt-1 text-slate-700 bg-white/95 border border-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-sm">Placement Prediction</span>
      </div>
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showUI, setShowUI]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowUI(true), 150);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await signInUser(email, password);
      if (authError) { setError(authError.message || "Invalid credentials."); setLoading(false); return; }

      let retries = 0;
      const tryGetProfile = async () => {
        const { data: prof } = await getProfile();
        if (prof?.role) {
          if (prof.role === "faculty") navigate("/faculty");
          else if (prof.role === "admin") navigate("/admin");
          else navigate("/student");
        } else if (retries < 8) {
          retries++;
          setTimeout(tryGetProfile, 300);
        } else {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) navigate("/student");
          else { setError("Login succeeded but profile not found. Try again."); setLoading(false); }
        }
      };
      await tryGetProfile();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/student",
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F2E7] flex flex-col overflow-hidden relative">

      {/* ── Premium Marketing Navbar ── */}
      <header className="w-full z-50 bg-[#E53935] shadow-lg shadow-red-900/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-start">
          {/* Brand Only — clean, centred on identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C62828] flex items-center justify-center shadow-md">
              <Sparkles className="w-4.5 h-4.5 text-[#FFF8E7]" />
            </div>
            <div>
              <span
                className="font-black text-[#FFF8E7] block"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: '1.55rem',
                  letterSpacing: '0.06em',
                  textShadow: '0 0 14px rgba(255,248,231,0.7), 0 2px 4px rgba(0,0,0,0.15)',
                  lineHeight: 1.1,
                }}
              >
                Edutwin AI
              </span>
              <span className="text-[9px] text-[#FFF8E7]/65 font-semibold uppercase tracking-[0.18em]">
                Smart Education Platform
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content: split panels ── */}
      <div className="flex flex-col md:flex-row flex-1 relative">

      {/* ── Background decorative blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-rose-200/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl" />
      </div>

      {/* ─── LEFT: Brand Panel & Motion Block Diagram ────────── */}
      <div className="hidden md:flex flex-col justify-between w-full md:w-[52%] p-10 lg:p-12 relative z-10 border-r border-red-100/40 bg-white/40 backdrop-blur-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 flex items-center justify-center shadow-md shadow-red-500/25">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-black text-base" style={{color:'#E53935', textShadow:'0 0 8px rgba(229,57,53,0.15)'}}>Edutwin AI</span>
            <span className="block text-[9px] font-bold uppercase tracking-widest -mt-0.5" style={{color:'#C62828'}}>Smart Education Platform</span>
          </div>
        </div>

        {/* Content Heading */}
        <div className={`space-y-3 my-3 transition-all duration-700 ${showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className="text-3xl lg:text-4xl font-black leading-tight" style={{color:'#2C2C2C', fontFamily:'"Cormorant Garamond", Georgia, serif', fontWeight:700, letterSpacing:'0.01em'}}>
            Centralised Digital Platform<br />
            <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
              for Student Activity Records
            </span>
          </h1>

          <p className="text-slate-500 text-xs lg:text-sm leading-relaxed max-w-md">
            Streamlining campus achievements. Automate credential auditing, extract metadata with Gemini AI OCR, and match skills to career placements in one workspace.
          </p>

          {/* ── Stats Row ── */}
          <div className="flex items-center gap-4 pt-1">
            {[
              { value: '5,000+', label: 'Students' },
              { value: '98%',    label: 'AI Accuracy' },
              { value: '50+',    label: 'Colleges' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-black" style={{color:'#E53935', fontFamily:'"Cormorant Garamond", Georgia, serif', letterSpacing:'0.02em'}}>{s.value}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
            <div className="w-px h-8 bg-slate-200 mx-1" />
            <div className="flex flex-col gap-1">
              {['Gemini AI Powered', 'NAAC Compliant', 'Supabase Secured'].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>

          {/* ── Feature Pills ── */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { icon: GraduationCap, text: 'Academic Records' },
              { icon: Award,         text: 'Co-Curricular Tracking' },
              { icon: TrendingUp,    text: 'Placement Matching' },
              { icon: Briefcase,     text: 'Internship Logging' },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{background:'rgba(229,57,53,0.08)', color:'#C62828', border:'1px solid rgba(229,57,53,0.18)'}}
              >
                <Icon className="w-3 h-3" />{text}
              </span>
            ))}
          </div>
        </div>

        {/* Restored Network Block Diagram */}
        <BlockDiagram />

        {/* Footer Details */}
        <div className="border-t border-slate-200/60 pt-4 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Real-time Gemini Verification</span>
          <span>·</span>
          <span>NAAC Accreditations Ready</span>
          <span>·</span>
          <span>Supabase Protected</span>
        </div>
      </div>

      {/* ─── RIGHT: Login Card ──────────────────────────────── */}
      <div className="flex flex-col justify-center items-center w-full md:w-[48%] min-h-screen p-4 md:p-8 relative z-10">

        {/* Mobile Logo */}
        <div className="flex items-center gap-2 mb-6 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center shadow-md shadow-red-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-base" style={{color:'#E53935'}}>Edutwin AI</span>
        </div>

        <div
          className={`w-full max-w-sm bg-white rounded-3xl border border-red-100 shadow-xl shadow-red-900/8 py-6 px-6 md:px-8 transition-all duration-700 ${
            showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{boxShadow: '0 20px 60px rgba(229,57,53,0.06), 0 4px 16px rgba(229,57,53,0.04)'}}
        >
          {/* Card Header */}
          <div className="mb-4">
            <h2 className="text-xl font-black" style={{color:'#E53935', textShadow:'0 0 6px rgba(229,57,53,0.12)', fontFamily:'"Cormorant Garamond", Georgia, serif', fontSize:'1.6rem', fontWeight:700, letterSpacing:'0.03em'}}>Sign in</h2>
            <p className="text-[11px] text-slate-400">Access your institutional student activity portal</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Mail className="w-3 h-3" style={{color:'#E53935'}} />
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="saas-input py-2 px-3.5 text-xs"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Lock className="w-3 h-3" style={{color:'#E53935'}} />
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="saas-input py-2 pl-3.5 pr-10 text-xs"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Role Hint */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {[
                { role: "Student", color: "bg-red-50 border-red-200 text-red-700" },
                { role: "Faculty", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                { role: "Admin",   color: "bg-amber-50  border-amber-200  text-amber-700" },
              ].map((r) => (
                <div key={r.role} className={`text-center text-[9px] font-bold py-1.5 rounded-lg border ${r.color}`}>
                  {r.role}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 text-center -mt-1.5">Roles are auto-detected upon login authentication</p>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5 disabled:opacity-60 mt-1"
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Authenticating...</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Sign In to Dashboard</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-2.5">
            <div className="flex-grow border-t border-slate-100" />
            <span className="mx-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-slate-100" />
          </div>

          {/* Google Login button restored at the bottom */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all duration-200 cursor-pointer text-slate-600 hover:text-slate-800 font-bold text-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z" />
              <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.6z" />
              <path fill="#fbbc05" d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.95C.5 8.75 0 10.79 0 12.91s.5 4.16 1.39 5.96l3.85-2.95z" />
              <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.36 0-5.86-1.81-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              New to Edutwin?{" "}
              <Link to="/register" className="font-bold transition-colors hover:underline" style={{color:'#E53935'}}>
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom credibility */}
        <div className="mt-4 flex items-center gap-3 text-[10px] text-slate-400 font-bold tracking-wide">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Supabase Protected
          </span>
          <span>·</span>
          <span>Role-Based Guards</span>
          <span>·</span>
          <span>Accreditation Ready</span>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Login;